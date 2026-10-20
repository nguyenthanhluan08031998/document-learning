import Link from "next/link";
import { Code } from "@/components/Code";

const Node = ({ x, y, w, label }: { x: number; y: number; w: number; label: string }) => (
  <g>
    <rect className="s-box" x={x} y={y} width={w} height={30} rx="5" />
    <text className="s-tm" x={x + w / 2} y={y + 19} textAnchor="middle" style={{ fill: "var(--ink)" }}>{label}</text>
  </g>
);
const Leaf = ({ x, y, w, lines, kind }: { x: number; y: number; w: number; lines: string[]; kind: string }) => (
  <g>
    <rect className={kind} x={x} y={y} width={w} height={64} rx="6" />
    {lines.map((l, i) => <text key={l} className="s-tm" x={x + 10} y={y + 20 + i * 17} style={{ fill: "var(--ink)" }}>{l}</text>)}
  </g>
);
const Edge = ({ d }: { d: string }) => <path d={d} style={{ stroke: "var(--muted)", strokeWidth: 1.3, fill: "none" }} />;

function ClusteredIndexDiagram() {
  return (
    <svg viewBox="0 0 900 270" role="img" aria-label="InnoDB: the clustered index on primary key id has leaves holding whole rows; the secondary index on customer_id has leaves holding only the primary key, so a lookup by customer_id needs a second lookup in the clustered index">
      <defs>
        <marker id="mya" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker>
      </defs>
      <text className="s-lane" x="20" y="18">CLUSTERED INDEX · PRIMARY KEY (id)</text>
      <Node x={170} y={32} w={110} label="[ 50 ]" />
      <Node x={60} y={96} w={130} label="[ 10 | 30 ]" />
      <Node x={260} y={96} w={130} label="[ 70 | 90 ]" />
      <Edge d="M210 62 L125 96 M240 62 L325 96" />
      <Leaf x={20} y={170} w={200} kind="s-hl" lines={["id 41 · customer 7", "total 350000 · paid", "← whole row in the leaf"]} />
      <Leaf x={240} y={170} w={200} kind="s-hl" lines={["id 42 · customer 7", "total 1200000 · pending", "← whole row in the leaf"]} />
      <Edge d="M110 126 L120 170 M150 126 L330 170" />

      <text className="s-lane2" x="480" y="18">SECONDARY INDEX · (customer_id)</text>
      <Node x={640} y={32} w={120} label="[ cust 8 ]" />
      <Leaf x={490} y={170} w={190} kind="s-disk" lines={["customer 7 → id 41", "customer 7 → id 42", "← primary key only"]} />
      <Leaf x={700} y={170} w={180} kind="s-disk" lines={["customer 9 → id 77", "customer 9 → id 80"]} />
      <Edge d="M680 62 L585 170 M720 62 L790 170" />
      <path d="M490 202 H444" style={{ stroke: "var(--warn)", strokeWidth: 1.8, strokeDasharray: "5 4", fill: "none" }} markerEnd="url(#mya)" />
      <text className="s-tm" x="467" y="258" textAnchor="middle" style={{ fill: "var(--warn)" }}>second lookup by id</text>
    </svg>
  );
}

export default function MysqlPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="MySQL contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#my-what"><span>01</span>Characteristics</a></li>
          <li><a href="#my-schema"><span>02</span>Shop schema</a></li>
          <li><a href="#my-index"><span>03</span>Clustered index</a></li>
          <li><a href="#my-syntax"><span>04</span>vs PostgreSQL</a></li>
          <li><a href="#my-lock"><span>05</span>{"Transaction & lock"}</a></li>
          <li><a href="#my-scale"><span>06</span>Scale</a></li>
          <li><a href="#my-when"><span>07</span>When to use</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">database · mysql</div>
          <h1>MySQL</h1>
          <p className="lede">The most popular relational database for the web. It can do PostgreSQL's job in the shop, but it stores data and locks rows differently, so primary key and index design differ too.</p>
          <div className="tape" aria-hidden="true">
            <div>InnoDB</div>
            <div>AUTO_INCREMENT</div>
            <div>binlog</div>
            <div className="hw">clustered index</div>
            <div className="leo">gap lock</div>
          </div>
        </header>

        <section id="my-what">
          <h2><span className="n">01</span>Characteristics</h2>
          <ul className="plain">
            <li><b>InnoDB</b> is the default storage engine: ACID, row-level locks, foreign keys.</li>
            <li><b>Tables are ordered by primary key</b> (clustered index), so primary key lookups are very fast.</li>
            <li><b>Binlog replication</b> is simple with plenty of familiar tooling; available on every cloud (RDS, Aurora, Cloud SQL, PlanetScale).</li>
            <li>Widely used by large e-commerce systems (Shopify, Magento, WooCommerce).</li>
          </ul>
        </section>

        <section id="my-schema">
          <h2><span className="n">02</span>Shop schema</h2>
          <Code lang="sql">{`CREATE TABLE orders (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id BIGINT UNSIGNED NOT NULL,
  status      ENUM('pending', 'paid', 'shipped', 'cancelled') NOT NULL,
  total       DECIMAL(12,0) NOT NULL,
  created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_customer_created (customer_id, created_at),
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE products (
  sku         VARCHAR(64) NOT NULL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  price       DECIMAL(12,0) NOT NULL,
  stock       INT UNSIGNED NOT NULL,
  attributes  JSON NOT NULL,
  -- JSON cannot be indexed directly: expose a field as a generated column
  color       VARCHAR(32) AS (attributes->>'$.color') STORED,
  KEY idx_color (color)
) ENGINE=InnoDB;`}</Code>
          <div className="note">Always use <code>utf8mb4</code>. MySQL's old <code>utf8</code> stores at most 3 bytes per character and loses the emoji in product reviews.</div>
        </section>

        <section id="my-index">
          <h2><span className="n">03</span>Clustered index</h2>
          <p>In InnoDB, <b>the table itself is a B+ tree on the primary key</b>: its leaves hold the whole row. Secondary index leaves hold only the primary key, so a lookup through a secondary index needs one more lookup.</p>
          <figure className="fig">
            <div className="scroll">
              <ClusteredIndexDiagram />
            </div>
            <figcaption>Finding customer 7's orders: walk the right tree to get ids 41 and 42, then walk the left tree to get the full rows.</figcaption>
          </figure>
          <ul className="plain">
            <li><b>Small, increasing primary keys</b> (<code>BIGINT AUTO_INCREMENT</code> or UUIDv7). Random UUIDv4 inserts new rows mid-tree, splitting pages constantly and slowing writes.</li>
            <li>A long primary key makes <b>every secondary index longer</b>, because each one stores the primary key.</li>
            <li><b>Covering index:</b> if a <code>SELECT</code> needs only columns in a secondary index, no second lookup is needed. For example <code>SELECT id, created_at FROM orders WHERE customer_id = 7</code> reads only <code>idx_customer_created</code>.</li>
          </ul>
        </section>

        <section id="my-syntax">
          <h2><span className="n">04</span>How it differs from PostgreSQL</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>MySQL</th>
                  <th>PostgreSQL</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Auto-increment id</td><td><code>AUTO_INCREMENT</code></td><td><code>GENERATED ALWAYS AS IDENTITY</code></td></tr>
                <tr><td>Upsert</td><td><code>ON DUPLICATE KEY UPDATE</code></td><td><code>ON CONFLICT … DO UPDATE</code></td></tr>
                <tr><td>Get the row just written</td><td>No <code>RETURNING</code>; use <code>LAST_INSERT_ID()</code></td><td><code>RETURNING *</code></td></tr>
                <tr><td>Indexing JSON</td><td>Via a generated column or functional index</td><td>GIN on JSONB</td></tr>
                <tr><td>Default isolation</td><td><code>REPEATABLE READ</code></td><td><code>READ COMMITTED</code></td></tr>
                <tr><td>Changing a large table's schema</td><td>Online DDL, or gh-ost, pt-online-schema-change</td><td>Many fast <code>ALTER</code>s, <code>CREATE INDEX CONCURRENTLY</code></td></tr>
              </tbody>
            </table>
          </div>
          <Code lang="sql">{`-- Add to cart: insert, or increase quantity if the row exists (MySQL 8.0.19+)
INSERT INTO cart_items (customer_id, sku, qty)
VALUES (7, 'PHONE-01', 1) AS new
ON DUPLICATE KEY UPDATE qty = cart_items.qty + new.qty;`}</Code>
        </section>

        <section id="my-lock">
          <h2><span className="n">05</span>{"Transaction & lock"}</h2>
          <p>The default is <code>REPEATABLE READ</code>: plain reads see a snapshot from the start of the transaction. Locking reads (<code>FOR UPDATE</code>) and <code>UPDATE</code>, however, make InnoDB lock the <b>gaps between rows</b> too (gap locks, next-key locks) so nobody can insert into that range.</p>
          <Code lang="sql">{`-- Workers claim pending orders without waiting for each other (MySQL 8.0+)
START TRANSACTION;
SELECT id FROM orders
WHERE status = 'pending'
ORDER BY id
LIMIT 10
FOR UPDATE SKIP LOCKED;
-- ... process, then UPDATE orders SET status = 'processing' WHERE id IN (...)
COMMIT;`}</Code>
          <div className="note"><b>Careful:</b> an <code>UPDATE … WHERE</code> on an unindexed column scans and locks a great many rows (gaps included), easily blocking others and causing deadlocks. Columns in the <code>WHERE</code> of write statements should be indexed. More on locking: <Link className="plink" href="/en/concurrency/db-lock/">Locks in the DB</Link>.</div>
        </section>

        <section id="my-scale">
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
                <tr><td><b>Replica</b></td><td>Replicas read the primary's binlog (async or semi-sync); GTID makes switching primaries easier</td></tr>
                <tr><td><b>ProxySQL</b></td><td>Splits automatically: writes to the primary, reads to replicas; pools connections</td></tr>
                <tr><td><b>Sharding</b></td><td>Vitess or PlanetScale split tables by <code>customer_id</code> across machines</td></tr>
                <tr><td><b>Aurora MySQL</b></td><td>A separate storage layer, up to 15 read replicas sharing one copy of the data</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="my-when">
          <h2><span className="n">07</span>When to use</h2>
          <div className="pp">
            <div><span className="pl">Good for</span>Read-heavy web apps with simple key lookups; teams that know MySQL; sharding needs met by mature tooling (Vitess).</div>
            <div className="warnc"><span className="pl">Consider</span>Complex analytical queries, heavy JSON, extensions (GIS, vectors): PostgreSQL is usually more comfortable.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
