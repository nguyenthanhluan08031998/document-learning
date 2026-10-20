import { Code } from "@/components/Code";

export default function DbLockPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Database lock contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#lk-atomic"><span>01</span>Atomic operation</a></li>
          <li><a href="#lk-pessimistic"><span>02</span>Pessimistic lock</a></li>
          <li><a href="#lk-skip"><span>03</span>{"NOWAIT & SKIP LOCKED"}</a></li>
          <li><a href="#lk-deadlock"><span>04</span>Deadlock</a></li>
          <li><a href="#lk-optimistic"><span>05</span>Optimistic lock</a></li>
          <li><a href="#lk-vs"><span>06</span>Pessimistic vs Optimistic</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">concurrency · database</div>
          <h1>Lock trong database</h1>
          <p className="lede">Three main ways to change data safely in one database: make the operation <b>atomic</b>, <b>lock first</b> (pessimistic), or <b>check the version when writing</b> (optimistic). Examples use PostgreSQL and the <code>pg</code> library.</p>
          <div className="tape" aria-hidden="true">
            <div>BEGIN</div>
            <div>FOR UPDATE</div>
            <div>UPDATE</div>
            <div className="hw">COMMIT</div>
            <div className="leo">version+1</div>
          </div>
        </header>
        <section id="lk-atomic">
          <h2><span className="n">01</span>Atomic operation: the simplest way</h2>
          <p>When you can, don't read then write. Put both the condition and the computation in <b>one statement</b>; the database guarantees that statement is not interleaved.</p>
          <Code lang="ts">{`async function buy(productId: string) {
  // Check and decrement in one statement: no read-modify-write gap
  const res = await db.query(
    "UPDATE products SET stock = stock - 1 WHERE id = $1 AND stock > 0 RETURNING stock",
    [productId],
  );
  if (res.rowCount === 0) throw new Error("Sold out");
  return res.rows[0].stock;
}

// Same idea elsewhere
await redis.decr(\`stock:\${productId}\`);                       // Redis atomic counter
await orders.updateOne({ _id: id }, { $inc: { views: 1 } });  // MongoDB $inc`}</Code>
          <div className="pp">
            <div><span className="pl">Good for</span>Counters, stock decrements, conditional status changes (<code>WHERE status = 'pending'</code>).</div>
            <div className="warnc"><span className="pl">Limits</span>Only works when the logic fits in one statement on one row or key. Complex, multi-table logic needs a lock.</div>
          </div>
        </section>
        <section id="lk-pessimistic">
          <h2><span className="n">02</span>Pessimistic lock: lock first, change later</h2>
          <p>Assume conflicts <b>will happen</b>, so lock the row as you read it. Another transaction wanting the same row must <b>wait</b> until the first commits or rolls back.</p>
          <Code lang="ts">{`// Checkout: reserve stock for every item in the cart at once
async function reserveStock(orderId: string, items: { sku: string; qty: number }[]) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Lock all product rows in a fixed order (by sku) to avoid deadlocks
    const skus = items.map(i => i.sku).sort();
    const { rows } = await client.query(
      "SELECT sku, stock FROM products WHERE sku = ANY($1) ORDER BY sku FOR UPDATE",
      [skus],
    );
    for (const item of items) {
      const row = rows.find(r => r.sku === item.sku)!;
      if (row.stock < item.qty) throw new Error(\`Out of stock: \${item.sku}\`);
    }

    for (const item of items) {
      await client.query("UPDATE products SET stock = stock - $1 WHERE sku = $2", [item.qty, item.sku]);
    }
    await client.query("UPDATE orders SET status = 'reserved' WHERE id = $1", [orderId]);
    await client.query("COMMIT");          // locks are released here
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}`}</Code>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Clause</th>
                  <th>Lock</th>
                  <th>Use when</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">FOR UPDATE</td>
                  <td>Exclusive row lock</td>
                  <td>You will update or delete the row</td>
                </tr>
                <tr>
                  <td className="m">FOR NO KEY UPDATE</td>
                  <td>As above, but other tables may still reference it by foreign key</td>
                  <td>Updating non-key columns; lighter than FOR UPDATE</td>
                </tr>
                <tr>
                  <td className="m">FOR SHARE</td>
                  <td>Shared lock: many may read, nobody may change</td>
                  <td>The row must not change while you use it</td>
                </tr>
                <tr>
                  <td className="m">LOCK TABLE</td>
                  <td>Locks the whole table</td>
                  <td>Rarely needed; avoid on live systems</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note">Locks only live inside a <b>transaction</b>. <code>FOR UPDATE</code> outside <code>BEGIN … COMMIT</code> releases right after the statement. Keep transactions short: no external API calls and no waiting for users while holding a lock.</div>
        </section>
        <section id="lk-skip">
          <h2><span className="n">03</span>{"NOWAIT & SKIP LOCKED: don't wait"}</h2>
          <p>By default <code>FOR UPDATE</code> <b>waits</b> on a locked row. Add a keyword at the end to change that:</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Approach</th>
                  <th>On a locked row it</th>
                  <th>Use when</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">FOR UPDATE</td>
                  <td><b>Waits</b> until the row is released</td>
                  <td>You must process that exact row (holding stock at checkout)</td>
                </tr>
                <tr>
                  <td className="m">FOR UPDATE NOWAIT</td>
                  <td><b>Fails immediately</b> (code <code>55P03</code>)</td>
                  <td>Tell the buyer “this flash sale item is being checked out by someone else”</td>
                </tr>
                <tr>
                  <td className="m">FOR UPDATE SKIP LOCKED</td>
                  <td><b>Skips it</b> and takes a free row</td>
                  <td>Any row will do as long as nobody has it: job queues, handing out vouchers</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Code lang="ts">{`// NOWAIT: fail immediately if someone else holds the lock
try {
  await client.query("SELECT * FROM flash_sale_slots WHERE id = $1 FOR UPDATE NOWAIT", [slotId]);
} catch (e: any) {
  if (e.code === "55P03") throw new Error("Item is being checked out by someone else");
  throw e;
}

// Bounded wait instead of waiting forever
await client.query("SET LOCAL lock_timeout = '2s'");`}</Code>
          <h3>SKIP LOCKED: many workers share one job table</h3>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 370" role="img" aria-label="Three workers run SELECT FOR UPDATE SKIP LOCKED LIMIT 3 on the jobs table: worker A gets jobs 1 to 3, worker B skips the locked rows and gets 4 to 6, worker C gets 7 to 9"> <defs><marker id="sk0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker><marker id="sk1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--new)" /></marker><marker id="sk2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker></defs> <rect className="s-box" x="330" y="14" width="240" height="342" rx="8" /> <text className="s-tb" x="344" y="38">jobs</text> <text className="s-tm" x="446" y="38">status = pending</text> <rect x="344" y="52" width="212" height="26" rx="4" style={{ fill: "var(--surface)", stroke: "var(--accent)", strokeWidth: "1.6" }} /> <text className="s-tm" x="356" y="69" style={{ fill: "var(--ink)" }}>job 1</text> <text className="s-tm" x="470" y="69" style={{ fill: "var(--accent)" }}>locked by A</text> <rect x="344" y="84" width="212" height="26" rx="4" style={{ fill: "var(--surface)", stroke: "var(--accent)", strokeWidth: "1.6" }} /> <text className="s-tm" x="356" y="101" style={{ fill: "var(--ink)" }}>job 2</text> <text className="s-tm" x="470" y="101" style={{ fill: "var(--accent)" }}>locked by A</text> <rect x="344" y="116" width="212" height="26" rx="4" style={{ fill: "var(--surface)", stroke: "var(--accent)", strokeWidth: "1.6" }} /> <text className="s-tm" x="356" y="133" style={{ fill: "var(--ink)" }}>job 3</text> <text className="s-tm" x="470" y="133" style={{ fill: "var(--accent)" }}>locked by A</text> <rect x="344" y="148" width="212" height="26" rx="4" style={{ fill: "var(--surface)", stroke: "var(--new)", strokeWidth: "1.6" }} /> <text className="s-tm" x="356" y="165" style={{ fill: "var(--ink)" }}>job 4</text> <text className="s-tm" x="470" y="165" style={{ fill: "var(--new)" }}>locked by B</text> <rect x="344" y="180" width="212" height="26" rx="4" style={{ fill: "var(--surface)", stroke: "var(--new)", strokeWidth: "1.6" }} /> <text className="s-tm" x="356" y="197" style={{ fill: "var(--ink)" }}>job 5</text> <text className="s-tm" x="470" y="197" style={{ fill: "var(--new)" }}>locked by B</text> <rect x="344" y="212" width="212" height="26" rx="4" style={{ fill: "var(--surface)", stroke: "var(--new)", strokeWidth: "1.6" }} /> <text className="s-tm" x="356" y="229" style={{ fill: "var(--ink)" }}>job 6</text> <text className="s-tm" x="470" y="229" style={{ fill: "var(--new)" }}>locked by B</text> <rect x="344" y="244" width="212" height="26" rx="4" style={{ fill: "var(--surface)", stroke: "var(--warn)", strokeWidth: "1.6" }} /> <text className="s-tm" x="356" y="261" style={{ fill: "var(--ink)" }}>job 7</text> <text className="s-tm" x="470" y="261" style={{ fill: "var(--warn)" }}>locked by C</text> <rect x="344" y="276" width="212" height="26" rx="4" style={{ fill: "var(--surface)", stroke: "var(--warn)", strokeWidth: "1.6" }} /> <text className="s-tm" x="356" y="293" style={{ fill: "var(--ink)" }}>job 8</text> <text className="s-tm" x="470" y="293" style={{ fill: "var(--warn)" }}>locked by C</text> <rect x="344" y="308" width="212" height="26" rx="4" style={{ fill: "var(--surface)", stroke: "var(--warn)", strokeWidth: "1.6" }} /> <text className="s-tm" x="356" y="325" style={{ fill: "var(--ink)" }}>job 9</text> <text className="s-tm" x="470" y="325" style={{ fill: "var(--warn)" }}>locked by C</text> <rect x="40" y="58" width="170" height="60" rx="7" style={{ fill: "var(--surface)", stroke: "var(--accent)", strokeWidth: "1.6" }} /> <text className="s-tb" x="54" y="84">Worker A</text> <text className="s-tm" x="54" y="103">LIMIT 3 SKIP LOCKED</text> <path d="M210 88 C270 88 280 97 342 97" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#sk0)" /> <rect x="690" y="154" width="170" height="60" rx="7" style={{ fill: "var(--surface)", stroke: "var(--new)", strokeWidth: "1.6" }} /> <text className="s-tb" x="704" y="180">Worker B</text> <text className="s-tm" x="704" y="199">LIMIT 3 SKIP LOCKED</text> <path d="M690 184 C630 184 620 193 558 193" style={{ stroke: "var(--new)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#sk1)" /> <rect x="40" y="250" width="170" height="60" rx="7" style={{ fill: "var(--surface)", stroke: "var(--warn)", strokeWidth: "1.6" }} /> <text className="s-tb" x="54" y="276">Worker C</text> <text className="s-tm" x="54" y="295">LIMIT 3 SKIP LOCKED</text> <path d="M210 280 C270 280 280 289 342 289" style={{ stroke: "var(--warn)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#sk2)" /> <text className="s-tm" x="690" y="300">B runs at the same time as A,</text> <text className="s-tm" x="690" y="318">sees jobs 1–3 locked</text> <text className="s-tm" x="690" y="336">so it skips them and takes 4–6</text> </svg>
            </div>
            <figcaption>Each worker only sees rows nobody has locked, so the work is split automatically without coordination.</figcaption>
          </figure>
          <p>Three workers run the same statement for 3 jobs. Worker A locks jobs 1–3; worker B finds 1–3 locked, skips them and takes 4–6; worker C takes 7–9. No duplicates, no waiting.</p>
          <h3>Option 1: keep the transaction open while processing</h3>
          <Code lang="ts">{`async function workOnce(): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: jobs } = await client.query(\`
      SELECT id, payload FROM jobs
      WHERE status = 'pending'
      ORDER BY created_at
      LIMIT 10
      FOR UPDATE SKIP LOCKED
    \`);
    for (const job of jobs) {
      await handle(job.payload);                        // must be short
      await client.query("UPDATE jobs SET status = 'done' WHERE id = $1", [job.id]);
    }
    await client.query("COMMIT");                       // locks released, rows done
    return jobs.length;
  } catch (e) {
    await client.query("ROLLBACK");                     // jobs go back to pending automatically
    throw e;
  } finally {
    client.release();
  }
}`}</Code>
          <p>Simple and safe: if the worker dies midway, the transaction rolls back and the jobs return to <code>pending</code>. The downside is holding a connection and locks for the whole processing time, so it suits short jobs only.</p>
          <h3>Option 2: claim quickly, process outside the transaction</h3>
          <Code lang="ts">{`// Claim a batch in one short statement, then process without holding locks
const { rows: jobs } = await pool.query(\`
  UPDATE jobs SET status = 'processing', locked_by = $1, locked_at = now()
  WHERE id IN (
    SELECT id FROM jobs
    WHERE status = 'pending'
    ORDER BY created_at
    LIMIT 10
    FOR UPDATE SKIP LOCKED
  )
  RETURNING id, payload
\`, [workerId]);

for (const job of jobs) {
  await handle(job.payload);                            // can be slow: no lock held now
  await pool.query("UPDATE jobs SET status = 'done' WHERE id = $1", [job.id]);
}

// Reaper: return jobs stuck in "processing" (worker crashed) to the queue
await pool.query(\`
  UPDATE jobs SET status = 'pending', locked_by = NULL
  WHERE status = 'processing' AND locked_at < now() - interval '5 minutes'
\`);`}</Code>
          <p>Suits long-running jobs. In exchange you need a process that reclaims stuck jobs, and processing should be idempotent because a job may run again after being returned.</p>
          <div className="pp">
            <div><span className="pl">Common uses</span>Job queues in PostgreSQL (pg-boss, Graphile Worker, Solid Queue), splitting orders across instances, handing out vouchers or limited flash sale slots, processing an outbox table with several relays.</div>
            <div className="warnc"><span className="pl">Note</span>Results intentionally skip locked rows: do not use it for reports or counts. Must run inside a transaction. Index the filter columns (<code>status, created_at</code>). Supported since PostgreSQL 9.5 and MySQL 8.0.</div>
          </div>
        </section>
        <section id="lk-deadlock">
          <h2><span className="n">04</span>Deadlock</h2>
          <p>Transaction A locks row 1 then waits for row 2; transaction B locks row 2 then waits for row 1. Both wait forever. PostgreSQL detects this after <code>deadlock_timeout</code> (1 second by default) and aborts one of them with error <code>40P01</code>.</p>
          <ul className="plain">
            <li><b>Lock in a fixed order</b>, for example always by ascending id, like the <code>reserveStock</code> function above (by sku).</li>
            <li>Lock as few rows as possible and keep transactions short.</li>
            <li>Catch deadlock errors and <b>retry</b> the whole transaction.</li>
          </ul>
        </section>
        <section id="lk-optimistic">
          <h2><span className="n">05</span>Optimistic lock: no lock, check when writing</h2>
          <p>Assume conflicts are <b>rare</b>. Each row has a <code>version</code> column. When writing, update only if the version is still what you read; if someone changed it first, no row is updated, so you know there was a conflict and try again.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 306" role="img" aria-label="Pessimistic lock: transaction 1 locks the row with FOR UPDATE, transaction 2 must wait until transaction 1 commits"> <defs><marker id="pea" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker><marker id="peb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker><marker id="pec" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--bad)" /></marker><marker id="ped" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker><marker id="pee" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--new)" /></marker></defs> <rect className="s-box" x="0.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="70.0" y="35" textAnchor="middle">Transaction 1</text> <text className="s-tm" x="70.0" y="52" textAnchor="middle">holds the lock</text> <path d="M70.0 62 V292" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-disk" x="380.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="450.0" y="35" textAnchor="middle">Database</text> <text className="s-tm" x="450.0" y="52" textAnchor="middle">products</text> <path d="M450.0 62 V292" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-box" x="760.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="830.0" y="35" textAnchor="middle">Transaction 2</text> <text className="s-tm" x="830.0" y="52" textAnchor="middle">arrives later</text> <path d="M830.0 62 V292" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <path d="M74.0 92 H444.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#pea)" /> <text className="s-tm" x="260.0" y="85" textAnchor="middle" style={{ fill: "var(--accent)" }}>BEGIN; SELECT … FOR UPDATE</text> <path d="M446.0 126 H76.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#peb)" /> <text className="s-tm" x="260.0" y="119" textAnchor="middle" style={{ fill: "var(--muted)" }}>row locked</text> <path d="M826.0 160 H456.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#pea)" /> <text className="s-tm" x="640.0" y="153" textAnchor="middle" style={{ fill: "var(--accent)" }}>SELECT … FOR UPDATE</text> <text className="s-tm" x="10.0" y="194" style={{ fill: "var(--warn)", fontWeight: "600" }}>Transaction 2 is blocked, waiting</text> <path d="M74.0 232 H444.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#pea)" /> <text className="s-tm" x="260.0" y="225" textAnchor="middle" style={{ fill: "var(--accent)" }}>UPDATE …; COMMIT</text> <path d="M454.0 266 H824.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#peb)" /> <text className="s-tm" x="640.0" y="259" textAnchor="middle" style={{ fill: "var(--muted)" }}>only now gets the lock, reads the new value</text> </svg>
            </div>
            <figcaption>Pessimistic: whoever arrives later waits; nobody fails, but time is spent waiting.</figcaption>
          </figure>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 340" role="img" aria-label="Optimistic lock: two transactions both read version 7, transaction 1 updates successfully, transaction 2 updates 0 rows and must retry"> <defs><marker id="opa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker><marker id="opb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker><marker id="opc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--bad)" /></marker><marker id="opd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker><marker id="ope" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--new)" /></marker></defs> <rect className="s-box" x="0.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="70.0" y="35" textAnchor="middle">Transaction 1</text> <text className="s-tm" x="70.0" y="52" textAnchor="middle">arrives first</text> <path d="M70.0 62 V326" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-disk" x="380.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="450.0" y="35" textAnchor="middle">Database</text> <text className="s-tm" x="450.0" y="52" textAnchor="middle">products</text> <path d="M450.0 62 V326" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-box" x="760.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="830.0" y="35" textAnchor="middle">Transaction 2</text> <text className="s-tm" x="830.0" y="52" textAnchor="middle">arrives later</text> <path d="M830.0 62 V326" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <path d="M74.0 92 H444.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#opa)" /> <text className="s-tm" x="260.0" y="85" textAnchor="middle" style={{ fill: "var(--accent)" }}>SELECT … (version = 7)</text> <path d="M826.0 126 H456.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#opa)" /> <text className="s-tm" x="640.0" y="119" textAnchor="middle" style={{ fill: "var(--accent)" }}>SELECT … (version = 7)</text> <path d="M74.0 160 H444.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#opa)" /> <text className="s-tm" x="260.0" y="153" textAnchor="middle" style={{ fill: "var(--accent)" }}>UPDATE … WHERE version = 7</text> <path d="M446.0 194 H76.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#opb)" /> <text className="s-tm" x="260.0" y="187" textAnchor="middle" style={{ fill: "var(--muted)" }}>1 row, version → 8</text> <path d="M826.0 228 H456.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#opa)" /> <text className="s-tm" x="640.0" y="221" textAnchor="middle" style={{ fill: "var(--accent)" }}>UPDATE … WHERE version = 7</text> <path d="M454.0 262 H824.0" style={{ stroke: "var(--bad)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#opc)" /> <text className="s-tm" x="640.0" y="255" textAnchor="middle" style={{ fill: "var(--bad)" }}>0 rows: someone changed it first</text> <text className="s-tm" x="10.0" y="296" style={{ fill: "var(--warn)", fontWeight: "600" }}>Transaction 2 rereads and retries</text> </svg>
            </div>
            <figcaption>Optimistic: nobody waits, but the loser must detect it (0 rows updated) and redo the work.</figcaption>
          </figure>
          <Code lang="ts">{`async function renameProduct(id: string, newName: string, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const { rows } = await db.query("SELECT name, version FROM products WHERE id = $1", [id]);
    const current = rows[0];

    // Write only if nobody changed the row since we read it
    const res = await db.query(
      "UPDATE products SET name = $1, version = version + 1 WHERE id = $2 AND version = $3",
      [newName, id, current.version],
    );
    if (res.rowCount === 1) return;        // success
    // rowCount 0: someone else won the race, read again and retry
  }
  throw new Error("Conflict: product was modified by someone else");
}`}</Code>
          <ul className="plain">
            <li><b>Over HTTP</b>: the server returns <code>ETag: "v7"</code>, the client sends <code>If-Match: "v7"</code> on PUT; on mismatch the server returns <b>412 Precondition Failed</b> (see the REST tab).</li>
            <li><b>ORMs</b>: JPA <code>@Version</code>, TypeORM <code>@VersionColumn</code>, Prisma with a <code>{"where: { id, version }"}</code> condition.</li>
            <li>You can use <code>updated_at</code> instead of a version, but two writes in the same millisecond can collide.</li>
          </ul>
        </section>
        <section id="lk-vs">
          <h2><span className="n">06</span>Pessimistic vs Optimistic</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th />
                  <th>Pessimistic</th>
                  <th>Optimistic</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Assumption</b></td>
                  <td>Frequent conflicts</td>
                  <td>Rare conflicts</td>
                </tr>
                <tr>
                  <td><b>On conflict</b></td>
                  <td>The later one waits</td>
                  <td>The later one fails and retries</td>
                </tr>
                <tr>
                  <td><b>Holds resources</b></td>
                  <td>Holds locks and a connection for the whole transaction</td>
                  <td>Holds nothing between read and write</td>
                </tr>
                <tr>
                  <td><b>Risks</b></td>
                  <td>Deadlocks, long waits, congestion under load</td>
                  <td>Constant retries under heavy contention</td>
                </tr>
                <tr>
                  <td><b>Long, user-driven edits</b></td>
                  <td>Unsuitable (you cannot hold a lock while a user edits a form)</td>
                  <td>A great fit</td>
                </tr>
                <tr>
                  <td><b>Example</b></td>
                  <td>Decrementing stock, holding items at checkout</td>
                  <td>Editing profiles, articles, settings</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
