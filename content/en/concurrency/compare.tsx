export default function ComparePage() {
  return (
    <div className="wrap single">
      <main>
        <header className="hero">
          <div className="eyebrow">concurrency · comparison</div>
          <h1>Which mechanism to choose</h1>
          <p className="lede">Go from simple to complex: try the lightest approach that solves the problem first, and reach for a distributed lock only when nothing else fits.</p>
        </header>
        <section>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Mechanism</th>
                  <th>Waits or not</th>
                  <th>Scope</th>
                  <th>Cost</th>
                  <th>Good for</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Atomic update</b></td>
                  <td>Negligible</td>
                  <td>One row / one key</td>
                  <td>Lowest</td>
                  <td>Counters, stock decrements, conditional status changes</td>
                </tr>
                <tr>
                  <td><b>Optimistic lock</b></td>
                  <td>No wait; retry on failure</td>
                  <td>One row, even over HTTP</td>
                  <td>Low</td>
                  <td>Editing profiles, articles; rare conflicts</td>
                </tr>
                <tr>
                  <td><b>Pessimistic lock</b></td>
                  <td>Waits (or NOWAIT / SKIP LOCKED)</td>
                  <td>Many rows in one DB</td>
                  <td>Medium</td>
                  <td>Stock decrements, flash sale holds; frequent conflicts</td>
                </tr>
                <tr>
                  <td><b>Serializable</b></td>
                  <td>No wait; retry on error</td>
                  <td>Whole transaction</td>
                  <td>Medium to high</td>
                  <td>Rules spanning several rows (write skew)</td>
                </tr>
                <tr>
                  <td><b>Mutex / Semaphore</b></td>
                  <td>Waits</td>
                  <td>One process</td>
                  <td>Low</td>
                  <td>Cache stampede, limiting API calls within one instance</td>
                </tr>
                <tr>
                  <td><b>Distributed lock</b></td>
                  <td>Usually try then skip</td>
                  <td>Many instances, many services</td>
                  <td>High (more infrastructure, subtle failures)</td>
                  <td>Run a cron in one place, resources outside the database</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2>What to try, in order</h2>
          <ol className="steps">
            <li>
              <div><b>Fits in a single statement?</b><div className="d">Use an atomic update. Done.</div></div>
            </li>
            <li>
              <div><b>Data in one database, rare conflicts?</b><div className="d">Optimistic lock with a version column.</div></div>
            </li>
            <li>
              <div><b>Data in one database, frequent conflicts or many rows?</b><div className="d">Pessimistic lock in a short transaction, locking in a fixed order.</div></div>
            </li>
            <li>
              <div><b>Only need to avoid duplicates within one instance?</b><div className="d">An in-memory mutex or semaphore.</div></div>
            </li>
            <li>
              <div><b>Many instances, resource outside the database?</b><div className="d">A distributed lock with TTL, released by its owner, plus fencing if the data matters.</div></div>
            </li>
          </ol>
        </section>
        <section id="cmp-alt">
          <h2>Ways to avoid locking altogether</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Approach</th>
                  <th>Idea</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Unique constraint</b></td>
                  <td>Let the database reject duplicates</td>
                  <td><code>UNIQUE(voucher_code, customer_id)</code>: a customer using the same voucher twice gets an error the second time</td>
                </tr>
                <tr>
                  <td><b>Idempotency key</b></td>
                  <td>Store a key per request; on repeat, return the stored result</td>
                  <td>The <code>Idempotency-Key</code> header at payment (REST tab)</td>
                </tr>
                <tr>
                  <td><b>Idempotent consumer</b></td>
                  <td>Record processed messages</td>
                  <td>A <code>processed_messages</code> table (Microservice tab)</td>
                </tr>
                <tr>
                  <td><b>Single writer theo key</b></td>
                  <td>Every change for a key goes through exactly one consumer, in order</td>
                  <td>Kafka partition theo <code>orderId</code>; RabbitMQ <code>x-single-active-consumer</code></td>
                </tr>
                <tr>
                  <td><b>Append-only</b></td>
                  <td>Never update, only append new records</td>
                  <td>Event sourcing, a transaction ledger</td>
                </tr>
                <tr>
                  <td><b>Time-limited reservation</b></td>
                  <td>Hold temporarily with an expiry; it releases itself</td>
                  <td>Hold cart items for 10 minutes during checkout (a <code>hold_until</code> column)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Remember:</b> locks are the last resort. Designing so that two parties never write to the same place is more robust than any lock.</div>
        </section>
      </main>
    </div>
  );
}
