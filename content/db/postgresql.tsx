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
    <svg viewBox="0 0 900 230" role="img" aria-label="MVCC: lệnh UPDATE của transaction 105 tạo bản mới của đơn 42 với status paid, bản cũ pending vẫn còn; transaction 103 bắt đầu trước nên vẫn đọc bản cũ, transaction 110 đọc bản mới; VACUUM dọn bản cũ khi không còn ai cần">
      <defs>
        <marker id="pga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker>
      </defs>
      <Box x={30} y={30} w={270} h={84} lines={["orders id=42 · bản cũ", "status = 'pending'", "xmin=100 · xmax=105"]} />
      <Box x={420} y={30} w={270} h={84} kind="s-hl" lines={["orders id=42 · bản mới", "status = 'paid'", "xmin=105 · xmax= –"]} />
      <path className="s-ln" d="M300 72 H418" markerEnd="url(#pga)" />
      <text className="s-tm" x="359" y="62" textAnchor="middle">UPDATE · tx 105</text>
      <Box x={30} y={160} w={270} h={56} lines={["tx 103 đọc", "bắt đầu trước 105 → thấy pending"]} />
      <Box x={420} y={160} w={270} h={56} lines={["tx 110 đọc", "bắt đầu sau 105 → thấy paid"]} />
      <path className="s-dl" d="M165 158 V116" markerEnd="url(#pga)" />
      <path className="s-dl" d="M555 158 V116" markerEnd="url(#pga)" />
      <Box x={720} y={30} w={160} h={84} kind="s-disk" lines={["VACUUM", "dọn bản cũ khi", "không ai cần nữa"]} />
    </svg>
  );
}

export default function PostgresPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục PostgreSQL">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#pg-what"><span>01</span>Đặc điểm</a></li>
          <li><a href="#pg-schema"><span>02</span>Schema bán hàng</a></li>
          <li><a href="#pg-query"><span>03</span>Truy vấn hay dùng</a></li>
          <li><a href="#pg-index"><span>04</span>Index</a></li>
          <li><a href="#pg-mvcc"><span>05</span>{"MVCC & transaction"}</a></li>
          <li><a href="#pg-scale"><span>06</span>Scale</a></li>
          <li><a href="#pg-when"><span>07</span>Khi nào dùng</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">database · postgresql</div>
          <h1>PostgreSQL</h1>
          <p className="lede">Cơ sở dữ liệu quan hệ mã nguồn mở, mạnh về tính đúng đắn và truy vấn phức tạp. Trong sàn bán hàng, đây là nơi giữ <b>đơn hàng và thanh toán</b>: những dữ liệu không được sai.</p>
          <div className="tape" aria-hidden="true">
            <div>ACID</div>
            <div>JOIN</div>
            <div>JSONB</div>
            <div className="hw">MVCC</div>
            <div className="leo">extensions</div>
          </div>
        </header>

        <section id="pg-what">
          <h2><span className="n">01</span>Đặc điểm</h2>
          <ul className="plain">
            <li><b>Quan hệ, schema chặt:</b> bảng, khóa ngoại, <code>CHECK</code>, <code>UNIQUE</code>; dữ liệu sai bị chặn ngay ở database.</li>
            <li><b>ACID đầy đủ:</b> nhiều câu lệnh trong một transaction hoặc cùng thành công, hoặc cùng hủy.</li>
            <li><b>JSONB:</b> cột JSON có index, dùng cho thuộc tính sản phẩm khác nhau theo danh mục mà không cần thêm bảng.</li>
            <li><b>Extension:</b> PostGIS (bản đồ, giao hàng), pgvector (tìm sản phẩm tương tự bằng AI), pg_partman, TimescaleDB.</li>
          </ul>
        </section>

        <section id="pg-schema">
          <h2><span className="n">02</span>Schema bán hàng</h2>
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
          <div className="note tip">Lưu <code>price</code> trong <code>order_items</code> dù sản phẩm đã có giá: giá có thể đổi, nhưng đơn cũ phải giữ đúng giá lúc khách mua.</div>
        </section>

        <section id="pg-query">
          <h2><span className="n">03</span>Truy vấn hay dùng</h2>
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
                  <th>Loại</th>
                  <th>Dùng cho</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="m">B-tree</td><td>Mặc định: so sánh bằng, khoảng, sắp xếp</td></tr>
                <tr><td className="m">GIN</td><td>JSONB, mảng, tìm kiếm full-text</td></tr>
                <tr><td className="m">BRIN</td><td>Bảng rất lớn ghi theo thời gian (log, lịch sử đơn), index cực nhỏ</td></tr>
                <tr><td className="m">GiST</td><td>Dữ liệu không gian với PostGIS: tìm kho gần khách</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="pg-mvcc">
          <h2><span className="n">05</span>{"MVCC & transaction"}</h2>
          <p>PostgreSQL không ghi đè dòng: mỗi lần <code>UPDATE</code> tạo một <b>phiên bản mới</b>. Người đọc thấy phiên bản phù hợp với thời điểm transaction của mình, nên <b>đọc không chặn ghi, ghi không chặn đọc</b>.</p>
          <figure className="fig">
            <div className="scroll">
              <MvccDiagram />
            </div>
            <figcaption>xmin là transaction tạo ra bản đó, xmax là transaction làm nó hết hạn. Bản cũ chiếm chỗ cho tới khi VACUUM dọn; autovacuum chạy tự động.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Isolation level</th>
                  <th>Hành vi</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="m">READ COMMITTED</td><td>Mặc định. Mỗi câu lệnh thấy dữ liệu đã commit tại lúc câu lệnh bắt đầu</td></tr>
                <tr><td className="m">REPEATABLE READ</td><td>Cả transaction thấy một ảnh chụp; ghi đè lên dòng người khác vừa sửa sẽ báo lỗi</td></tr>
                <tr><td className="m">SERIALIZABLE</td><td>Như chạy lần lượt; xung đột báo lỗi <code>40001</code>, ứng dụng phải retry</td></tr>
              </tbody>
            </table>
          </div>
          <p>Giữ hàng khi checkout, khóa dòng, deadlock: xem <Link className="plink" href="/concurrency/db-lock/">Lock trong DB</Link>.</p>
        </section>

        <section id="pg-scale">
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
                <tr><td><b>Read replica</b></td><td>Streaming replication sang máy khác; trang danh sách, báo cáo đọc từ replica</td></tr>
                <tr><td><b>PgBouncer</b></td><td>Gom hàng nghìn kết nối của app thành vài trăm kết nối thật</td></tr>
                <tr><td><b>Partitioning</b></td><td>Chia bảng <code>orders</code> theo tháng; truy vấn tháng này chỉ đọc một phần, xóa dữ liệu cũ bằng cách bỏ cả partition</td></tr>
                <tr><td><b>Sharding</b></td><td>Citus hoặc tự chia theo <code>customer_id</code> khi một máy ghi không kịp</td></tr>
                <tr><td><b>CDC</b></td><td>Logical replication, Debezium đẩy thay đổi sang Kafka cho search, analytics</td></tr>
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
          <h2><span className="n">07</span>Khi nào dùng</h2>
          <div className="pp">
            <div><span className="pl">Hợp với</span>Đơn hàng, thanh toán, tồn kho, kế toán: cần ràng buộc, transaction và báo cáo nhiều JOIN. Lựa chọn mặc định tốt khi chưa chắc dùng gì.</div>
            <div className="warnc"><span className="pl">Cân nhắc</span>Ghi cực lớn trên nhiều region thì phải tự shard hoặc dùng bản phân tán (Citus, Aurora, Neon); cần theo dõi VACUUM và bloat.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
