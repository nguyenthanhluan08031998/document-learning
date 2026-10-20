import { Code } from "@/components/Code";

export default function DistributedLockPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Distributed lock contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#dl-local"><span>01</span>Locks inside one process</a></li>
          <li><a href="#dl-why"><span>02</span>Why distributed locks</a></li>
          <li><a href="#dl-redis"><span>03</span>Redis lock</a></li>
          <li><a href="#dl-fencing"><span>04</span>{"Expiring leases & fencing tokens"}</a></li>
          <li><a href="#dl-redlock"><span>05</span>Redlock</a></li>
          <li><a href="#dl-others"><span>06</span>etcd, ZooKeeper, PostgreSQL</a></li>
          <li><a href="#dl-rules"><span>07</span>Rules for safe use</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">concurrency · many instances</div>
          <h1>Distributed lock: locking across machines</h1>
          <p className="lede">When an application runs many instances, an in-memory lock in one instance does not stop the others. A distributed lock keeps the “key” in a system every instance can see. It is much harder than a normal lock, because networks are slow, processes pause midway and clocks drift.</p>
          <div className="tape" aria-hidden="true">
            <div>SET NX</div>
            <div>PX 30000</div>
            <div>token</div>
            <div className="hw">fencing</div>
            <div className="leo">release</div>
          </div>
        </header>
        <section id="dl-local">
          <h2><span className="n">01</span>{"Locks inside one process: mutex & semaphore"}</h2>
          <p>Node.js runs on one thread, but async functions still interleave at every <code>await</code>. To let a piece of async code run only once at a time within a process, use a mutex (for example the <code>async-mutex</code> library).</p>
          <Code lang="ts">{`import { Mutex, Semaphore } from "async-mutex";

// Mutex: only one refresh at a time inside this process
const tokenMutex = new Mutex();
let cachedToken: string | undefined;

async function getAccessToken() {
  return tokenMutex.runExclusive(async () => {
    if (!cachedToken) cachedToken = await fetchNewToken(); // other callers wait, then reuse
    return cachedToken;
  });
}

// Semaphore: at most 5 concurrent calls to a slow API (see Bulkhead pattern)
const apiSlots = new Semaphore(5);
await apiSlots.runExclusive(() => callSlowApi());`}</Code>
          <div className="note">An in-memory mutex <b>only works within one instance</b>. Three pods means three independent mutexes. That is when you need a distributed lock or, better, a mechanism in the database.</div>
        </section>
        <section id="dl-why">
          <h2><span className="n">02</span>When you need a distributed lock</h2>
          <ul className="plain">
            <li><b>Cron jobs on many instances</b>: only one instance should send the end-of-day report.</li>
            <li><b>Calling external systems without idempotency</b>: only one process should refresh a shared OAuth token.</li>
            <li><b>Resources outside a database</b>: files on S3 touched by several systems.</li>
            <li><b>Leader election</b>: one instance does background work, the others stand by.</li>
          </ul>
          <div className="note tip">If the data lives in <b>one database</b>, prefer an atomic update, <code>FOR UPDATE</code> or an optimistic lock from the previous tab. They run inside a transaction and are far safer than a distributed lock.</div>
        </section>
        <section id="dl-redis">
          <h2><span className="n">03</span>Redis lock: the most common approach</h2>
          <ol className="steps">
            <li>
              <div><b>Acquire</b><div className="d"><code>{"SET lock:report <token> NX PX 30000"}</code>: set only if absent (<code>NX</code>), expire after 30 seconds (<code>PX</code>) so it never sticks if the process dies.</div></div>
            </li>
            <li>
              <div><b>Work</b><div className="d">Finish before the lock expires, or extend it periodically.</div></div>
            </li>
            <li>
              <div><b>Release only your own lock</b><div className="d">Delete only if the value is still your token, using a Lua script so check-and-delete is atomic.</div></div>
            </li>
          </ol>
          <Code lang="ts">{`import Redis from "ioredis";
import { randomUUID } from "node:crypto";

const redis = new Redis(process.env.REDIS_URL!);

const RELEASE_SCRIPT = \`
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  end
  return 0
\`;

async function withLock<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T | null> {
  const token = randomUUID();                       // identifies the owner
  const ok = await redis.set(key, token, "PX", ttlMs, "NX");
  if (ok !== "OK") return null;                     // someone else holds it: non-blocking
  try {
    return await fn();
  } finally {
    // Never delete a lock that expired and now belongs to someone else
    await redis.eval(RELEASE_SCRIPT, 1, key, token);
  }
}

// Only one instance sends the daily report
await withLock("lock:daily-report", 60_000, () => sendDailyReport());`}</Code>
          <div className="pp">
            <div><span className="pl">Why the token</span>With a plain <code>DEL</code>: A holds the lock past its TTL, it expires, B acquires it; A finishes, calls <code>DEL</code> and deletes B's lock.</div>
            <div className="warnc"><span className="pl">Limits</span>A single Redis: if it dies or fails over to a replica that has not synced, the lock can be lost and two parties hold it.</div>
          </div>
        </section>
        <section id="dl-fencing">
          <h2><span className="n">04</span>{"Expiring leases & fencing tokens"}</h2>
          <p>Every distributed lock with a TTL is a <b>lease</b>. The problem: a process can pause (GC pause, frozen VM, slow network) longer than the TTL without knowing. When it wakes up, it believes it still holds the lock and overwrites someone else's work.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 408" role="img" aria-label="Fencing token: client A takes the lock with token 33 then pauses, the lock expires, client B gets token 34 and writes; A wakes up and writes with token 33, which storage rejects"> <defs><marker id="fea" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker><marker id="feb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker><marker id="fec" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--bad)" /></marker><marker id="fed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker><marker id="fee" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--new)" /></marker></defs> <rect className="s-box" x="0.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="70.0" y="35" textAnchor="middle">Client A</text> <text className="s-tm" x="70.0" y="52" textAnchor="middle">worker 1</text> <path d="M70.0 62 V394" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-hl" x="253.33333333333337" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="323.33333333333337" y="35" textAnchor="middle">Lock service</text> <text className="s-tm" x="323.33333333333337" y="52" textAnchor="middle">Redis · etcd</text> <path d="M323.33333333333337 62 V394" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-box" x="506.66666666666674" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="576.6666666666667" y="35" textAnchor="middle">Client B</text> <text className="s-tm" x="576.6666666666667" y="52" textAnchor="middle">worker 2</text> <path d="M576.6666666666667 62 V394" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-disk" x="760.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="830.0" y="35" textAnchor="middle">Storage</text> <text className="s-tm" x="830.0" y="52" textAnchor="middle">database</text> <path d="M830.0 62 V394" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <path d="M74.0 92 H317.33333333333337" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#fea)" /> <text className="s-tm" x="196.66666666666669" y="85" textAnchor="middle" style={{ fill: "var(--accent)" }}>acquire</text> <path d="M319.33333333333337 126 H76.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#feb)" /> <text className="s-tm" x="196.66666666666669" y="119" textAnchor="middle" style={{ fill: "var(--muted)" }}>OK, token 33</text> <text className="s-tm" x="10.0" y="160" style={{ fill: "var(--warn)", fontWeight: "600" }}>A pauses for 40 s of GC, the 30 s lease expires</text> <path d="M572.6666666666667 198 H329.33333333333337" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#fea)" /> <text className="s-tm" x="450.00000000000006" y="191" textAnchor="middle" style={{ fill: "var(--accent)" }}>acquire</text> <path d="M327.33333333333337 232 H570.6666666666667" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#feb)" /> <text className="s-tm" x="450.00000000000006" y="225" textAnchor="middle" style={{ fill: "var(--muted)" }}>OK, token 34</text> <path d="M580.6666666666667 266 H824.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#fea)" /> <text className="s-tm" x="703.3333333333334" y="259" textAnchor="middle" style={{ fill: "var(--accent)" }}>write (token 34)</text> <path d="M826.0 300 H582.6666666666667" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#feb)" /> <text className="s-tm" x="703.3333333333334" y="293" textAnchor="middle" style={{ fill: "var(--muted)" }}>OK, records 34</text> <path d="M74.0 334 H824.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#fea)" /> <text className="s-tm" x="450.0" y="327" textAnchor="middle" style={{ fill: "var(--accent)" }}>write (token 33)</text> <path d="M826.0 368 H76.0" style={{ stroke: "var(--bad)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#fec)" /> <text className="s-tm" x="450.0" y="361" textAnchor="middle" style={{ fill: "var(--bad)" }}>rejected: 33 is less than 34</text> </svg>
            </div>
            <figcaption>Without fencing, A's write would overwrite B's data. Storage accepts only tokens larger than the last one it saw, so the stale write is blocked.</figcaption>
          </figure>
          <Code lang="ts">{`// Each successful acquire returns a strictly increasing number
const fencingToken = await redis.incr("lock:invoice:fence");

// The storage accepts a write only if the token is newer than the last one it saw
const res = await db.query(
  "UPDATE invoices SET pdf_url = $1, fence = $2 WHERE id = $3 AND fence < $2",
  [url, fencingToken, invoiceId],
);
if (res.rowCount === 0) throw new Error("Stale lock holder, write rejected");`}</Code>
          <p>A lock <b>reduces</b> duplicates; a fencing token checked by the storage <b>guarantees correctness</b>. etcd (revision) and ZooKeeper (zxid) provide increasing numbers you can use as fencing tokens.</p>
        </section>
        <section id="dl-redlock">
          <h2><span className="n">05</span>Redlock</h2>
          <p>An algorithm from the Redis author that avoids depending on one node: use N <b>independent</b> Redis nodes (usually 5), acquire the lock on each, and succeed if a <b>majority</b> (at least 3) is acquired in less time than the TTL. Node.js library: <code>redlock</code>.</p>
          <div className="cmp">
            <div><h4>For</h4>Survives some Redis nodes dying; good enough when the lock only prevents duplicate work (efficiency), not when absolute correctness is required.</div>
            <div><h4>Criticism (Martin Kleppmann, 2016)</h4>Relies on timing and clock assumptions; without fencing tokens it still breaks when a process pauses for long. For absolute correctness use a consensus system (etcd, ZooKeeper) with fencing.</div>
          </div>
          <p>A practical view: a lock to <b>save effort</b> (two machines computing the same report) is fine on Redis; a lock to <b>keep data correct</b> (money, stock) should move the check into the database or use fencing.</p>
        </section>
        <section id="dl-others">
          <h2><span className="n">06</span>etcd, ZooKeeper, PostgreSQL advisory lock</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Tool</th>
                  <th>How it works</th>
                  <th>Strengths</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>etcd</b></td>
                  <td>A key bound to a lease; the client sends keep-alives; when they stop, the key is deleted. The increasing revision serves as a fencing token.</td>
                  <td>Raft consensus, strong consistency; Kubernetes uses it for leader election.</td>
                </tr>
                <tr>
                  <td><b>ZooKeeper</b></td>
                  <td>Create an ephemeral sequential znode; the lowest number holds the lock, others watch the node just before theirs.</td>
                  <td>Battle-tested for years (older Kafka, Hadoop); the lock recipe ships with Curator.</td>
                </tr>
                <tr>
                  <td><b>PostgreSQL advisory lock</b></td>
                  <td>A lock on an integer whose meaning the application chooses: <code>pg_try_advisory_xact_lock(hashtext('daily-report'))</code>.</td>
                  <td>No extra infrastructure if you already run PostgreSQL; the <code>_xact_</code> variant releases when the transaction ends.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Code lang="ts">{`// PostgreSQL advisory lock: one runner for a scheduled job across all instances
const client = await pool.connect();
try {
  await client.query("BEGIN");
  const { rows } = await client.query(
    "SELECT pg_try_advisory_xact_lock(hashtext($1)) AS ok", ["daily-report"],
  );
  if (rows[0].ok) await sendDailyReport(client);   // others skip immediately
  await client.query("COMMIT");                    // lock released with the transaction
} finally {
  client.release();
}`}</Code>
          <div className="note">Session advisory locks (<code>pg_advisory_lock</code>) are tied to a connection. Behind PgBouncer in transaction pooling mode connections are shared, so the lock may not behave as expected; use the <code>_xact_</code> variant inside a transaction.</div>
        </section>
        <section id="dl-rules">
          <h2><span className="n">07</span>Rules for using distributed locks safely</h2>
          <ol className="steps">
            <li>
              <div><b>Always set a TTL</b><div className="d">If the process dies, the lock must release itself.</div></div>
            </li>
            <li>
              <div><b>Release only your own lock</b><div className="d">Compare the token before deleting, atomically.</div></div>
            </li>
            <li>
              <div><b>Extend for long work</b><div className="d">Renew periodically (watchdog) and stop working if renewal fails.</div></div>
            </li>
            <li>
              <div><b>Bounded waiting</b><div className="d">Retry a few times with backoff, never wait forever.</div></div>
            </li>
            <li>
              <div><b>For important data, add fencing or check in the database</b><div className="d">Never rely only on “I am holding the lock”.</div></div>
            </li>
            <li>
              <div><b>Ask whether you need a lock at all</b><div className="d">A unique constraint, an idempotency key or one consumer per key is often simpler and safer.</div></div>
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}
