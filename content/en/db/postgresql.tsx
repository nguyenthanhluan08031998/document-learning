import Link from "next/link";
import { Code } from "@/components/Code";

const Box = ({ x, y, w, h, lines, kind = "s-box" }: { x: number; y: number; w: number; h: number; lines: string[]; kind?: string }) => (
  <g>
    <rect className={kind} x={x} y={y} width={w} height={h} rx="7" />
    {lines.map((l, i) => (
      <text key={l} className={i === 0 ? "s-tb" : "s-tm"} x={x + 12} y={y + 22 + i * 18} style={i > 0 ? { fill: "var(--ink)" } : undefined}>{l}</text>
    ))}
  </g>
);

function MvccDiagram() {
  return (
    <svg viewBox="0 0 900 230" role="img" aria-label="MVCC: an UPDATE by transaction 105 creates a new version of order 42 with status paid while the old pending version remains; transaction 103 started earlier and still reads the old version, transaction 110 reads the new one; VACUUM removes the old version once nobody needs it">
      <defs>
        <marker id="pga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker>
      </defs>
      <Box x={30} y={30} w={270} h={84} lines={["orders id=42 · old version", "status = 'pending'", "xmin=100 · xmax=105"]} />
      <Box x={420} y={30} w={270} h={84} kind="s-hl" lines={["orders id=42 · new version", "status = 'paid'", "xmin=105 · xmax= –"]} />
      <path className="s-ln" d="M300 72 H418" markerEnd="url(#pga)" />
      <text className="s-tm" x="359" y="62" textAnchor="middle">UPDATE · tx 105</text>
      <Box x={30} y={160} w={270} h={56} lines={["tx 103 reads", "started before 105 → sees pending"]} />
      <Box x={420} y={160} w={270} h={56} lines={["tx 110 reads", "started after 105 → sees paid"]} />
      <path className="s-dl" d="M165 158 V116" markerEnd="url(#pga)" />
      <path className="s-dl" d="M555 158 V116" markerEnd="url(#pga)" />
      <Box x={720} y={30} w={160} h={84} kind="s-disk" lines={["VACUUM", "removes old versions", "nobody needs"]} />
    </svg>
  );
}

export default function PostgresPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="PostgreSQL contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#pg-what"><span>01</span>Characteristics</a></li>
          <li><a href="#pg-schema"><span>02</span>Shop schema</a></li>
          <li><a href="#pg-query"><span>03</span>Common queries</a></li>
          <li><a href="#pg-index"><span>04</span>Index</a></li>
          <li><a href="#pg-mvcc"><span>05</span>{"MVCC & transaction"}</a></li>
          <li><a href="#pg-scale"><span>06</span>Scale</a></li>
          <li><a href="#pg-when"><span>07</span>When to use</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">database · postgresql</div>
          <h1>PostgreSQL</h1>
          <p className="lede">An open-source relational database, strong on correctness and complex queries. In the shop it holds <b>orders and payments</b>: the data that must never be wrong.</p>
          <div className="tape" aria-hidden="true">
            <div>ACID</div>
            <div>JOIN</div>
            <div>JSONB</div>
            <div className="hw">MVCC</div>
            <div className="leo">extensions</div>
          </div>
        </header>

        <section id="pg-what">
          <h2><span className="n">01</span>Characteristics</h2>
          <ul className="plain">
            <li><b>Relational, strict schema:</b> tables, foreign keys, <code>CHECK</code>, <code>UNIQUE</code>; bad data is stopped at the database.</li>
            <li><b>Full ACID:</b> statements in a transaction either all succeed or are all rolled back.</li>
            <li><b>JSONB:</b> indexed JSON columns for product attributes that differ by category, without extra tables.</li>
            <li><b>Extensions:</b> PostGIS (maps, delivery), pgvector (AI similar-product search), pg_partman, TimescaleDB.</li>
          </ul>
        </section>

        <section id="pg-schema">
          <h2><span className="n">02</span>Shop schema</h2>
          <Code lang="sql">{`CREATE TABLE customers (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email       text NOT NULL UNIQUE,
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE products (
  sku         text PRIMARY KEY,
  name        text NOT NULL,
  price       numeric(12,0) NOT NULL CHECK (price >= 0),   -- VND, no decimals
  stock       int NOT NULL CHECK (stock >= 0),              -- can never go negative
  attributes  jsonb NOT NULL DEFAULT '{}'                   -- color, storage, size ...
);

CREATE TABLE orders (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id bigint NOT NULL REFERENCES customers(id),
  status      text NOT NULL CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
  total       numeric(12,0) NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  order_id    bigint REFERENCES orders(id) ON DELETE CASCADE,
  sku         text REFERENCES products(sku),
  qty         int NOT NULL CHECK (qty > 0),
  price       numeric(12,0) NOT NULL,                       -- price at purchase time
  PRIMARY KEY (order_id, sku)
);

CREATE TABLE payments (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id        bigint NOT NULL REFERENCES orders(id),
  provider        text NOT NULL,                            -- vnpay, momo, stripe
  idempotency_key text NOT NULL UNIQUE,                     -- webhook may arrive twice
  amount          numeric(12,0) NOT NULL,
  status          text NOT NULL
);`}</Code>
          <div className="note tip">Store <code>price</code> in <code>order_items</code> even though products have a price: prices change, but old orders must keep the price the customer paid.</div>
        </section>

        <section id="pg-query">
          <h2><span className="n">03</span>Common queries</h2>
          <Code lang="sql">{`-- Top 10 customers by revenue this month
SELECT c.name, sum(o.total) AS revenue
FROM orders o JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'paid' AND o.created_at >= date_trunc('month', now())
GROUP BY c.name
ORDER BY revenue DESC
LIMIT 10;

-- Best seller in each category (window function)
SELECT * FROM (
  SELECT p.attributes->>'category' AS category, p.sku, sum(i.qty) AS sold,
         rank() OVER (PARTITION BY p.attributes->>'category' ORDER BY sum(i.qty) DESC) AS rnk
  FROM order_items i JOIN products p USING (sku)
  GROUP BY 1, 2
) t
WHERE rnk = 1;

-- Filter by JSONB attributes
SELECT sku, name FROM products
WHERE attributes @> '{"color": "black", "storage": "256GB"}';

-- Insert once even if the payment webhook is delivered twice
INSERT INTO payments (order_id, provider, idempotency_key, amount, status)
VALUES (42, 'vnpay', 'vnp_9f2c', 1200000, 'succeeded')
ON CONFLICT (idempotency_key) DO NOTHING
RETURNING id;`}</Code>
        </section>

        <section id="pg-index">
          <h2><span className="n">04</span>Index</h2>
          <Code lang="sql">{`-- "My orders", newest first
CREATE INDEX orders_customer_created ON orders (customer_id, created_at DESC);

-- Partial index: only the small set of pending orders
CREATE INDEX orders_pending ON orders (created_at) WHERE status = 'pending';

-- GIN index for JSONB containment (@>)
CREATE INDEX products_attributes ON products USING gin (attributes);

-- Check that the planner actually uses the index
EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 7 ORDER BY created_at DESC LIMIT 20;`}</Code>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Kind</th>
                  <th>Used for</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="m">B-tree</td><td>Default: equality, ranges, sorting</td></tr>
                <tr><td className="m">GIN</td><td>JSONB, arrays, full-text search</td></tr>
                <tr><td className="m">BRIN</td><td>Huge time-ordered tables (logs, order history), a tiny index</td></tr>
                <tr><td className="m">GiST</td><td>Spatial data with PostGIS: find the warehouse nearest the customer</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="pg-mvcc">
          <h2><span className="n">05</span>{"MVCC & transaction"}</h2>
          <p>PostgreSQL does not overwrite rows: every <code>UPDATE</code> creates a <b>new version</b>. Readers see the version that matches their transaction's moment, so <b>reads don't block writes and writes don't block reads</b>.</p>
          <figure className="fig">
            <div className="scroll">
              <MvccDiagram />
            </div>
            <figcaption>xmin is the transaction that created a version, xmax the one that expired it. Old versions take space until VACUUM cleans them; autovacuum runs automatically.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Isolation level</th>
                  <th>Behavior</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="m">READ COMMITTED</td><td>Default. Each statement sees data committed when the statement started</td></tr>
                <tr><td className="m">REPEATABLE READ</td><td>The whole transaction sees one snapshot; overwriting a row someone just changed raises an error</td></tr>
                <tr><td className="m">SERIALIZABLE</td><td>As if run one by one; conflicts raise error <code>40001</code> and the app must retry</td></tr>
              </tbody>
            </table>
          </div>
          <p>Holding stock at checkout, row locks, deadlocks: see <Link className="plink" href="/en/concurrency/db-lock/">Locks in the DB</Link>.</p>
        </section>

        <section id="pg-scale">
          <h2><span className="n">06</span>Scale</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Approach</th>
                  <th>What it does</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>Read replica</b></td><td>Streaming replication to other machines; listing pages and reports read from replicas</td></tr>
                <tr><td><b>PgBouncer</b></td><td>Pools thousands of app connections into a few hundred real ones</td></tr>
                <tr><td><b>Partitioning</b></td><td>Split <code>orders</code> by month; this month's queries read one part, old data is dropped a whole partition at a time</td></tr>
                <tr><td><b>Sharding</b></td><td>Citus or your own split by <code>customer_id</code> when one machine cannot keep up with writes</td></tr>
                <tr><td><b>CDC</b></td><td>Logical replication, Debezium pushes changes to Kafka for search and analytics</td></tr>
              </tbody>
            </table>
          </div>
          <Code lang="sql">{`CREATE TABLE orders (
  id          bigint GENERATED ALWAYS AS IDENTITY,   -- identity on a partitioned table: PostgreSQL 17+
  customer_id bigint NOT NULL,
  status      text NOT NULL,
  total       numeric(12,0) NOT NULL,
  created_at  timestamptz NOT NULL,
  PRIMARY KEY (id, created_at)          -- must include the partition key
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2026_10 PARTITION OF orders
  FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');`}</Code>
        </section>

        <section id="pg-when">
          <h2><span className="n">07</span>When to use</h2>
          <div className="pp">
            <div><span className="pl">Good for</span>Orders, payments, stock, accounting: constraints, transactions and JOIN-heavy reports. A good default when unsure.</div>
            <div className="warnc"><span className="pl">Consider</span>Massive writes across regions need your own sharding or a distributed flavor (Citus, Aurora, Neon); keep an eye on VACUUM and bloat.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
