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
    <svg viewBox="0 0 900 270" role="img" aria-label="InnoDB: clustered index theo khóa chính id có lá chứa toàn bộ dòng; secondary index theo customer_id có lá chỉ chứa khóa chính, nên tìm theo customer_id phải tra thêm lần hai vào clustered index">
      <defs>
        <marker id="mya" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker>
      </defs>
      <text className="s-lane" x="20" y="18">CLUSTERED INDEX · PRIMARY KEY (id)</text>
      <Node x={170} y={32} w={110} label="[ 50 ]" />
      <Node x={60} y={96} w={130} label="[ 10 | 30 ]" />
      <Node x={260} y={96} w={130} label="[ 70 | 90 ]" />
      <Edge d="M210 62 L125 96 M240 62 L325 96" />
      <Leaf x={20} y={170} w={200} kind="s-hl" lines={["id 41 · customer 7", "total 350000 · paid", "← cả dòng nằm ở lá"]} />
      <Leaf x={240} y={170} w={200} kind="s-hl" lines={["id 42 · customer 7", "total 1200000 · pending", "← cả dòng nằm ở lá"]} />
      <Edge d="M110 126 L120 170 M150 126 L330 170" />

      <text className="s-lane2" x="480" y="18">SECONDARY INDEX · (customer_id)</text>
      <Node x={640} y={32} w={120} label="[ cust 8 ]" />
      <Leaf x={490} y={170} w={190} kind="s-disk" lines={["customer 7 → id 41", "customer 7 → id 42", "← chỉ giữ khóa chính"]} />
      <Leaf x={700} y={170} w={180} kind="s-disk" lines={["customer 9 → id 77", "customer 9 → id 80"]} />
      <Edge d="M680 62 L585 170 M720 62 L790 170" />
      <path d="M490 202 H444" style={{ stroke: "var(--warn)", strokeWidth: 1.8, strokeDasharray: "5 4", fill: "none" }} markerEnd="url(#mya)" />
      <text className="s-tm" x="467" y="258" textAnchor="middle" style={{ fill: "var(--warn)" }}>tra lần 2 theo id</text>
    </svg>
  );
}

export default function MysqlPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục MySQL">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#my-what"><span>01</span>Đặc điểm</a></li>
          <li><a href="#my-schema"><span>02</span>Schema bán hàng</a></li>
          <li><a href="#my-index"><span>03</span>Clustered index</a></li>
          <li><a href="#my-syntax"><span>04</span>Khác PostgreSQL</a></li>
          <li><a href="#my-lock"><span>05</span>{"Transaction & lock"}</a></li>
          <li><a href="#my-scale"><span>06</span>Scale</a></li>
          <li><a href="#my-when"><span>07</span>Khi nào dùng</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">database · mysql</div>
          <h1>MySQL</h1>
          <p className="lede">Cơ sở dữ liệu quan hệ phổ biến nhất cho web. Cùng làm được việc của PostgreSQL trong sàn bán hàng, nhưng cách lưu dữ liệu và khóa dòng khác, nên thiết kế khóa chính và index cũng khác.</p>
          <div className="tape" aria-hidden="true">
            <div>InnoDB</div>
            <div>AUTO_INCREMENT</div>
            <div>binlog</div>
            <div className="hw">clustered index</div>
            <div className="leo">gap lock</div>
          </div>
        </header>

        <section id="my-what">
          <h2><span className="n">01</span>Đặc điểm</h2>
          <ul className="plain">
            <li><b>InnoDB</b> là storage engine mặc định: ACID, khóa theo dòng, khóa ngoại.</li>
            <li><b>Bảng được sắp theo khóa chính</b> (clustered index), nên tra theo khóa chính rất nhanh.</li>
            <li><b>Replication bằng binlog</b> đơn giản, nhiều công cụ quen thuộc; có sẵn trên mọi cloud (RDS, Aurora, Cloud SQL, PlanetScale).</li>
            <li>Dùng rộng rãi ở các hệ thống thương mại điện tử lớn (Shopify, Magento, WooCommerce).</li>
          </ul>
        </section>

        <section id="my-schema">
          <h2><span className="n">02</span>Schema bán hàng</h2>
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
          <div className="note">Luôn dùng <code>utf8mb4</code>. Bảng mã <code>utf8</code> cũ của MySQL chỉ lưu tối đa 3 byte mỗi ký tự, mất emoji trong đánh giá sản phẩm.</div>
        </section>

        <section id="my-index">
          <h2><span className="n">03</span>Clustered index</h2>
          <p>Trong InnoDB, <b>bảng chính là cây B+ theo khóa chính</b>: lá của cây chứa cả dòng dữ liệu. Index phụ thì lá chỉ chứa khóa chính, nên tìm theo index phụ phải tra thêm một lần.</p>
          <figure className="fig">
            <div className="scroll">
              <ClusteredIndexDiagram />
            </div>
            <figcaption>Tìm đơn của khách 7: đi cây bên phải lấy id 41, 42, rồi đi cây bên trái lấy cả dòng.</figcaption>
          </figure>
          <ul className="plain">
            <li><b>Khóa chính nhỏ và tăng dần</b> (<code>BIGINT AUTO_INCREMENT</code> hoặc UUIDv7). UUIDv4 ngẫu nhiên làm dòng mới chèn vào giữa cây, tách trang liên tục, ghi chậm.</li>
            <li>Khóa chính dài thì <b>mọi index phụ đều dài theo</b>, vì index phụ nào cũng chứa khóa chính.</li>
            <li><b>Covering index:</b> nếu câu <code>SELECT</code> chỉ cần các cột có trong index phụ thì không phải tra lần 2. Ví dụ <code>SELECT id, created_at FROM orders WHERE customer_id = 7</code> chỉ đọc <code>idx_customer_created</code>.</li>
          </ul>
        </section>

        <section id="my-syntax">
          <h2><span className="n">04</span>Khác PostgreSQL ở đâu</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Việc</th>
                  <th>MySQL</th>
                  <th>PostgreSQL</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Tự tăng id</td><td><code>AUTO_INCREMENT</code></td><td><code>GENERATED ALWAYS AS IDENTITY</code></td></tr>
                <tr><td>Upsert</td><td><code>ON DUPLICATE KEY UPDATE</code></td><td><code>ON CONFLICT … DO UPDATE</code></td></tr>
                <tr><td>Lấy dòng vừa ghi</td><td>Không có <code>RETURNING</code>; dùng <code>LAST_INSERT_ID()</code></td><td><code>RETURNING *</code></td></tr>
                <tr><td>Index JSON</td><td>Qua generated column hoặc functional index</td><td>GIN trên JSONB</td></tr>
                <tr><td>Isolation mặc định</td><td><code>REPEATABLE READ</code></td><td><code>READ COMMITTED</code></td></tr>
                <tr><td>Đổi schema bảng lớn</td><td>Online DDL, hoặc gh-ost, pt-online-schema-change</td><td>Nhiều lệnh <code>ALTER</code> nhanh, <code>CREATE INDEX CONCURRENTLY</code></td></tr>
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
          <p>Mặc định <code>REPEATABLE READ</code>: đọc thường thấy một ảnh chụp từ đầu transaction. Còn đọc có khóa (<code>FOR UPDATE</code>) hoặc <code>UPDATE</code> thì InnoDB khóa cả <b>khoảng trống giữa các dòng</b> (gap lock, next-key lock) để không ai chèn dòng mới vào khoảng đó.</p>
          <Code lang="sql">{`-- Workers claim pending orders without waiting for each other (MySQL 8.0+)
START TRANSACTION;
SELECT id FROM orders
WHERE status = 'pending'
ORDER BY id
LIMIT 10
FOR UPDATE SKIP LOCKED;
-- ... process, then UPDATE orders SET status = 'processing' WHERE id IN (...)
COMMIT;`}</Code>
          <div className="note"><b>Cẩn thận:</b> <code>UPDATE … WHERE</code> trên cột không có index sẽ quét và khóa rất nhiều dòng (cả khoảng trống), dễ chặn người khác và gây deadlock. Cột trong <code>WHERE</code> của lệnh ghi nên có index. Chi tiết về khóa: <Link className="plink" href="/concurrency/db-lock/">Lock trong DB</Link>.</div>
        </section>

        <section id="my-scale">
          <h2><span className="n">06</span>Scale</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Cách</th>
                  <th>Làm gì</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>Replica</b></td><td>Replica đọc binlog của primary (async hoặc semi-sync); dùng GTID để chuyển primary dễ hơn</td></tr>
                <tr><td><b>ProxySQL</b></td><td>Tự tách: câu ghi tới primary, câu đọc tới replica; gom kết nối</td></tr>
                <tr><td><b>Sharding</b></td><td>Vitess hoặc PlanetScale chia bảng theo <code>customer_id</code> sang nhiều máy</td></tr>
                <tr><td><b>Aurora MySQL</b></td><td>Tầng lưu trữ tách riêng, tới 15 replica đọc chung một bộ dữ liệu</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="my-when">
          <h2><span className="n">07</span>Khi nào dùng</h2>
          <div className="pp">
            <div><span className="pl">Hợp với</span>Web đọc nhiều, truy vấn đơn giản theo khóa; team đã quen MySQL; cần sharding đã có sẵn công cụ trưởng thành (Vitess).</div>
            <div className="warnc"><span className="pl">Cân nhắc</span>Truy vấn phân tích phức tạp, JSON nhiều, cần extension (GIS, vector): PostgreSQL thường thoải mái hơn.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
