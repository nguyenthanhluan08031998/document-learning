import Link from "next/link";
import { Code } from "@/components/Code";

export default function OverviewPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Concurrency contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#cc-race"><span>01</span>Race condition</a></li>
          <li><a href="#cc-anomaly"><span>02</span>Concurrency anomalies</a></li>
          <li><a href="#cc-isolation"><span>03</span>Isolation level</a></li>
          <li><a href="#cc-blocking"><span>04</span>{"Blocking & non-blocking"}</a></li>
          <li><a href="#cc-map"><span>05</span>Map of mechanisms</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">concurrency · overview</div>
          <h1>When two requests change the same data</h1>
          <p className="lede">Servers handle many requests in parallel, many instances run at once, many consumers read the same queue. When they touch the same record (stock, wallet balance, voucher usage), the result can be wrong without any error being reported. Locks and related mechanisms exist to prevent that.</p>
          <div className="tape" aria-hidden="true">
            <div>read</div>
            <div>read</div>
            <div>write</div>
            <div className="hw">write</div>
            <div className="leo">lost</div>
          </div>
        </header>
        <section id="cc-race">
          <h2><span className="n">01</span>Race condition: a lost update</h2>
          <p>There are 10 shirts in stock. Two customers click buy at the same time, and each request does three steps: read stock, subtract 1, write back.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 340" role="img" aria-label="Lost update: requests A and B both read stock 10 and both write 9, losing one decrement"> <defs><marker id="lua" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker><marker id="lub" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker><marker id="luc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--bad)" /></marker><marker id="lud" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker><marker id="lue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--new)" /></marker></defs> <rect className="s-box" x="0.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="70.0" y="35" textAnchor="middle">Request A</text> <text className="s-tm" x="70.0" y="52" textAnchor="middle">customer 1</text> <path d="M70.0 62 V326" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-disk" x="380.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="450.0" y="35" textAnchor="middle">Database</text> <text className="s-tm" x="450.0" y="52" textAnchor="middle">stock = 10</text> <path d="M450.0 62 V326" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-box" x="760.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="830.0" y="35" textAnchor="middle">Request B</text> <text className="s-tm" x="830.0" y="52" textAnchor="middle">customer 2</text> <path d="M830.0 62 V326" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <path d="M74.0 92 H444.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#lua)" /> <text className="s-tm" x="260.0" y="85" textAnchor="middle" style={{ fill: "var(--accent)" }}>SELECT stock</text> <path d="M446.0 126 H76.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#lub)" /> <text className="s-tm" x="260.0" y="119" textAnchor="middle" style={{ fill: "var(--muted)" }}>10</text> <path d="M826.0 160 H456.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#lua)" /> <text className="s-tm" x="640.0" y="153" textAnchor="middle" style={{ fill: "var(--accent)" }}>SELECT stock</text> <path d="M454.0 194 H824.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#lub)" /> <text className="s-tm" x="640.0" y="187" textAnchor="middle" style={{ fill: "var(--muted)" }}>10</text> <path d="M74.0 228 H444.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#lua)" /> <text className="s-tm" x="260.0" y="221" textAnchor="middle" style={{ fill: "var(--accent)" }}>UPDATE stock = 9</text> <path d="M826.0 262 H456.0" style={{ stroke: "var(--bad)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#luc)" /> <text className="s-tm" x="640.0" y="255" textAnchor="middle" style={{ fill: "var(--bad)" }}>UPDATE stock = 9</text> <text className="s-tm" x="10.0" y="296" style={{ fill: "var(--bad)", fontWeight: "600" }}>2 shirts sold but stock dropped by 1: stock = 9 instead of 8</text> </svg>
            </div>
            <figcaption>Both read 10 before the other could write, so the later write overwrites the earlier one.</figcaption>
          </figure>
          <Code lang="ts">{`// Read-modify-write in application code: unsafe under concurrency
async function buy(productId: string) {
  const { rows } = await db.query("SELECT stock FROM products WHERE id = $1", [productId]);
  const stock = rows[0].stock;              // both requests may read 10 here
  if (stock <= 0) throw new Error("Sold out");
  await db.query("UPDATE products SET stock = $1 WHERE id = $2", [stock - 1, productId]);
}`}</Code>
          <div className="note">This is not caused by multithreaded JavaScript. Node.js runs one thread, but every <code>await</code> lets another request slip in between the read and the write. Running several instances or pods makes it even more likely.</div>
        </section>
        <section id="cc-anomaly">
          <h2><span className="n">02</span>Common concurrency anomalies</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Anomaly</th>
                  <th>What happens</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Lost update</b></td>
                  <td>Both sides read the same old value and both overwrite; one change disappears</td>
                  <td>Stock goes 10 → 9 even though 2 were sold</td>
                </tr>
                <tr>
                  <td><b>Dirty read</b></td>
                  <td>Reading another transaction's uncommitted data, which is then rolled back</td>
                  <td>Showing a balance that is not final</td>
                </tr>
                <tr>
                  <td><b>Non-repeatable read</b></td>
                  <td>Reading the same row twice in one transaction gives two different values</td>
                  <td>Product price changes between the check and the charge</td>
                </tr>
                <tr>
                  <td><b>Phantom read</b></td>
                  <td>Running the same query twice; the second time rows appear or vanish</td>
                  <td>The count of sold orders changes midway</td>
                </tr>
                <tr>
                  <td><b>Write skew</b></td>
                  <td>Two transactions read the same condition, each changes a different row, and together they break a rule</td>
                  <td>An order may be discounted at most 50%: two vouchers applied at once, each sees “room left”, together they exceed 50%</td>
                </tr>
                <tr>
                  <td><b>Double processing</b></td>
                  <td>Two workers pick up and process the same job</td>
                  <td>Email sent twice, money charged twice</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="cc-isolation">
          <h2><span className="n">03</span>Database isolation levels</h2>
          <p>The database prevents some of these anomalies itself, depending on the transaction's isolation level. Higher levels are safer but cause more conflicts that need retries.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Dirty read</th>
                  <th>Non-repeatable</th>
                  <th>Phantom</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Read Uncommitted</b></td>
                  <td>Possible</td>
                  <td>Possible</td>
                  <td>Possible</td>
                  <td>PostgreSQL treats it as Read Committed</td>
                </tr>
                <tr>
                  <td><b>Read Committed</b></td>
                  <td>No</td>
                  <td>Possible</td>
                  <td>Possible</td>
                  <td>Default in PostgreSQL, SQL Server, Oracle</td>
                </tr>
                <tr>
                  <td><b>Repeatable Read</b></td>
                  <td>No</td>
                  <td>No</td>
                  <td>Depends on the DB</td>
                  <td>Default in MySQL InnoDB</td>
                </tr>
                <tr>
                  <td><b>Serializable</b></td>
                  <td>No</td>
                  <td>No</td>
                  <td>No</td>
                  <td>As if run one by one; PostgreSQL raises a serialization error for you to retry</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note tip">At the default Read Committed level, the shirt example above <b>still loses updates</b>. To be safe you need a lock or an atomic statement; see the <b>Locks in the DB</b> tab.</div>
        </section>
        <section id="cc-blocking">
          <h2><span className="n">04</span>Blocking and non-blocking</h2>
          <div className="cmp">
            <div><h4>Blocking</h4>On a locked resource, <b>wait</b> until it is released. Simple and ordered, but it ties up connections and risks deadlocks and long waits.</div>
            <div><h4>Non-blocking</h4>Don't wait: try to take the lock and <b>fail immediately</b> (<code>NOWAIT</code>, <code>tryLock</code>), <b>skip</b> it (<code>SKIP LOCKED</code>) or <b>do it, then check</b> (optimistic, CAS). Fast to respond, but you must handle failure.</div>
          </div>
          <p>In between is <b>bounded waiting</b>: <code>lock_timeout</code> in PostgreSQL, a timeout when acquiring a distributed lock. You should almost always set one.</p>
        </section>
        <section id="cc-map">
          <h2><span className="n">05</span>Map of mechanisms</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Mechanism</th>
                  <th>Idea</th>
                  <th>Scope</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><Link className="plink" href="/en/concurrency/db-lock/#lk-atomic">Atomic operation</Link></td>
                  <td>Combine read, check and write into one statement</td>
                  <td>One row, one key</td>
                </tr>
                <tr>
                  <td><Link className="plink" href="/en/concurrency/db-lock/#lk-pessimistic">Pessimistic lock</Link></td>
                  <td>Lock first, change later; others wait</td>
                  <td>Trong database</td>
                </tr>
                <tr>
                  <td><Link className="plink" href="/en/concurrency/db-lock/#lk-optimistic">Optimistic lock</Link></td>
                  <td>No lock; check the version on write, redo on mismatch</td>
                  <td>Database, HTTP, cache</td>
                </tr>
                <tr>
                  <td><Link className="plink" href="/en/concurrency/distributed-lock/#dl-local">Mutex / Semaphore</Link></td>
                  <td>A lock in one process's memory</td>
                  <td>One instance</td>
                </tr>
                <tr>
                  <td><Link className="plink" href="/en/concurrency/distributed-lock/#dl-redis">Distributed lock</Link></td>
                  <td>A lock held in a shared system (Redis, etcd, ZooKeeper, PostgreSQL)</td>
                  <td>Many instances, many services</td>
                </tr>
                <tr>
                  <td><Link className="plink" href="/en/concurrency/compare/#cmp-alt">No lock needed</Link></td>
                  <td>Unique constraint, idempotency key, one consumer per key</td>
                  <td>System design</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
