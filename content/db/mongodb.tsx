import Link from "next/link";
import { Code } from "@/components/Code";

const Mono = ({ x, y, children, color = "var(--ink)" }: { x: number; y: number; children: string; color?: string }) => (
  <text className="s-tm" x={x} y={y} style={{ fill: color }}>{children}</text>
);

function EmbedReferenceDiagram() {
  return (
    <svg viewBox="0 0 900 290" role="img" aria-label="Document đơn hàng nhúng sẵn danh sách sản phẩm đã mua và địa chỉ giao hàng, còn khách hàng và sản phẩm gốc chỉ được tham chiếu bằng id sang collection customers và products">
      <defs>
        <marker id="mga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker>
      </defs>
      <rect className="s-hl" x="20" y="14" width="470" height="262" rx="8" />
      <text className="s-tb" x="34" y="38">orders · một document</text>
      <Mono x={34} y={64}>{"{"}</Mono>
      <Mono x={48} y={84}>{"_id: \"ORD-42\","}</Mono>
      <Mono x={48} y={104}>{"customerId: 7,"}</Mono>
      <Mono x={300} y={104} color="var(--warn)">← tham chiếu</Mono>
      <Mono x={48} y={124}>{"status: \"paid\", total: 23040000,"}</Mono>
      <Mono x={48} y={144}>{"items: ["}</Mono>
      <Mono x={300} y={144} color="var(--accent)">← nhúng</Mono>
      <Mono x={62} y={164}>{"{ sku: \"PHONE-01\", name: \"iPhone 16\","}</Mono>
      <Mono x={76} y={184}>{"price: 22990000, qty: 1 },"}</Mono>
      <Mono x={62} y={204}>{"{ sku: \"CASE-02\", price: 50000, qty: 1 } ],"}</Mono>
      <Mono x={48} y={224}>{"shippingAddress: { city: \"HCM\", … }"}</Mono>
      <Mono x={360} y={224} color="var(--accent)">← nhúng</Mono>
      <Mono x={34} y={250}>{"}"}</Mono>

      <rect className="s-disk" x="600" y="40" width="280" height="70" rx="8" />
      <text className="s-tb" x="614" y="64">customers</text>
      <Mono x={614} y={88}>{"{ _id: 7, name: \"Lan\", email }"}</Mono>
      <rect className="s-disk" x="600" y="170" width="280" height="70" rx="8" />
      <text className="s-tb" x="614" y="194">products</text>
      <Mono x={614} y={218}>{"{ _id: \"PHONE-01\", price, stock }"}</Mono>
      <path d="M396 100 C500 100 500 75 598 75" style={{ stroke: "var(--warn)", strokeWidth: 1.6, strokeDasharray: "5 4", fill: "none" }} markerEnd="url(#mga)" />
      <path d="M396 160 C500 160 500 205 598 205" style={{ stroke: "var(--warn)", strokeWidth: 1.6, strokeDasharray: "5 4", fill: "none" }} markerEnd="url(#mga)" />
      <Mono x={600} y={270} color="var(--muted)">giá và tên đã chép vào đơn lúc mua</Mono>
    </svg>
  );
}

export default function MongoPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục MongoDB">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#mg-what"><span>01</span>Đặc điểm</a></li>
          <li><a href="#mg-model"><span>02</span>Nhúng hay tham chiếu</a></li>
          <li><a href="#mg-query"><span>03</span>Truy vấn</a></li>
          <li><a href="#mg-index"><span>04</span>Index</a></li>
          <li><a href="#mg-tx"><span>05</span>Transaction</a></li>
          <li><a href="#mg-scale"><span>06</span>Replica set, sharding</a></li>
          <li><a href="#mg-when"><span>07</span>Khi nào dùng</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">database · mongodb</div>
          <h1>MongoDB</h1>
          <p className="lede">Cơ sở dữ liệu dạng document: mỗi bản ghi là một object JSON, các document trong cùng collection không bắt buộc giống cấu trúc. Hợp với <b>danh mục sản phẩm</b>, nơi điện thoại, áo, sách có thuộc tính rất khác nhau.</p>
          <div className="tape" aria-hidden="true">
            <div>document</div>
            <div>collection</div>
            <div>aggregation</div>
            <div className="hw">replica set</div>
            <div className="leo">shard key</div>
          </div>
        </header>

        <section id="mg-what">
          <h2><span className="n">01</span>Đặc điểm</h2>
          <ul className="plain">
            <li><b>Document (BSON):</b> dữ liệu lồng nhau lưu chung một chỗ, đọc một lần là đủ, không cần JOIN.</li>
            <li><b>Schema linh hoạt:</b> thêm trường mới không cần migration; vẫn có thể bật schema validation khi cần chặt chẽ.</li>
            <li><b>Replica set và sharding có sẵn:</b> tự chuyển primary khi máy chết, chia dữ liệu nhiều máy theo shard key.</li>
            <li><b>Aggregation pipeline</b> cho báo cáo; MongoDB Atlas là bản managed trên cloud.</li>
          </ul>
        </section>

        <section id="mg-model">
          <h2><span className="n">02</span>Nhúng hay tham chiếu</h2>
          <p>Câu hỏi quan trọng nhất khi thiết kế MongoDB: dữ liệu liên quan nên <b>nhúng</b> vào cùng document hay <b>tham chiếu</b> bằng id sang collection khác.</p>
          <figure className="fig">
            <div className="scroll">
              <EmbedReferenceDiagram />
            </div>
            <figcaption>Đơn hàng nhúng sản phẩm đã mua và địa chỉ: mở đơn là có đủ, và giữ đúng giá lúc mua. Khách hàng và sản phẩm gốc chỉ tham chiếu vì thay đổi độc lập.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th />
                  <th>Nhúng</th>
                  <th>Tham chiếu</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>Khi</b></td><td>Luôn đọc cùng nhau, thuộc về document cha, số lượng có giới hạn</td><td>Dùng chung nhiều nơi, thay đổi độc lập, số lượng không giới hạn</td></tr>
                <tr><td><b>Ví dụ</b></td><td>Dòng sản phẩm trong đơn, địa chỉ giao hàng, biến thể màu của sản phẩm</td><td>Khách hàng của đơn, đánh giá của sản phẩm (có thể hàng chục nghìn)</td></tr>
              </tbody>
            </table>
          </div>
          <div className="note">Một document tối đa <b>16 MB</b>. Đừng nhúng mảng tăng mãi (toàn bộ review, lịch sử xem hàng) vào sản phẩm.</div>
        </section>

        <section id="mg-query">
          <h2><span className="n">03</span>Truy vấn</h2>
          <Code lang="ts">{`const orders = db.collection<Order>("orders");
const products = db.collection<Product>("products");

// My orders, newest first
await orders.find({ customerId: 7 }).sort({ createdAt: -1 }).limit(20).toArray();

// Each category has its own attributes, no extra tables needed
await products.find({ category: "phone", "attrs.storage": "256GB", price: { $lte: 25_000_000 } }).toArray();

// Decrement stock only if enough is left: atomic on a single document
const res = await products.updateOne({ _id: "PHONE-01", stock: { $gte: 1 } }, { $inc: { stock: -1 } });
if (res.modifiedCount === 0) throw new Error("Out of stock");

// Revenue per day (aggregation pipeline)
await orders.aggregate([
  { $match: { status: "paid", createdAt: { $gte: new Date("2026-10-01") } } },
  { $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      revenue: { $sum: "$total" },
      orders: { $sum: 1 },
  } },
  { $sort: { _id: 1 } },
]).toArray();`}</Code>
        </section>

        <section id="mg-index">
          <h2><span className="n">04</span>Index</h2>
          <Code lang="ts">{`await orders.createIndex({ customerId: 1, createdAt: -1 });   // "my orders"
await products.createIndex({ category: 1, price: 1 });        // filter by category, sort by price

// TTL index: abandoned carts are deleted automatically after 30 days
await db.collection("carts").createIndex({ updatedAt: 1 }, { expireAfterSeconds: 30 * 24 * 3600 });`}</Code>
          <div className="note tip"><b>Quy tắc ESR</b> cho index nhiều trường: trường so sánh <b>E</b>quality (bằng) trước, rồi trường <b>S</b>ort, cuối cùng trường <b>R</b>ange (khoảng). Ví dụ lọc <code>category</code>, sắp theo <code>price</code>, lọc khoảng <code>rating</code> → <code>{"{ category: 1, price: 1, rating: 1 }"}</code>.</div>
        </section>

        <section id="mg-tx">
          <h2><span className="n">05</span>Transaction</h2>
          <p>Ghi trên <b>một document</b> luôn atomic, nên thiết kế nhúng tốt thì ít khi cần transaction. Khi phải ghi nhiều document cùng lúc (trừ kho và tạo đơn), dùng transaction trên replica set:</p>
          <Code lang="ts">{`const session = client.startSession();
try {
  await session.withTransaction(async () => {
    const r = await products.updateOne(
      { _id: sku, stock: { $gte: qty } }, { $inc: { stock: -qty } }, { session },
    );
    if (r.modifiedCount === 0) throw new Error("Out of stock");   // aborts the transaction
    await orders.insertOne({ _id: orderId, customerId, items, status: "pending", createdAt: new Date() }, { session });
  }, { writeConcern: { w: "majority" } });
} finally {
  await session.endSession();
}`}</Code>
          <ul className="plain">
            <li><code>{"w: \"majority\""}</code>: chỉ báo thành công khi đa số máy trong replica set đã ghi, mất primary cũng không mất đơn.</li>
            <li>Đọc từ secondary (<code>readPreference: "secondary"</code>) giảm tải primary nhưng có thể thấy dữ liệu cũ vài trăm mili giây.</li>
          </ul>
        </section>

        <section id="mg-scale">
          <h2><span className="n">06</span>Replica set, sharding</h2>
          <ul className="plain">
            <li><b>Replica set:</b> 1 primary nhận ghi, 2 secondary sao chép. Primary chết thì các máy còn lại bầu primary mới trong vài giây.</li>
            <li><b>Sharding:</b> chia collection sang nhiều replica set theo <b>shard key</b>. Chọn sai shard key rất khó sửa.</li>
          </ul>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Shard key cho orders</th>
                  <th>Kết quả</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="m">{"{ createdAt: 1 }"}</td><td>Tệ: mọi đơn mới dồn vào shard cuối (hot shard)</td></tr>
                <tr><td className="m">{"{ customerId: \"hashed\" }"}</td><td>Ghi rải đều; “đơn của tôi” chỉ hỏi một shard</td></tr>
                <tr><td className="m">{"{ customerId: 1, createdAt: 1 }"}</td><td>Đơn của một khách nằm liền nhau, lấy theo khoảng thời gian nhanh</td></tr>
              </tbody>
            </table>
          </div>
          <Code lang="js">{`sh.shardCollection("shop.orders", { customerId: "hashed" })`}</Code>
        </section>

        <section id="mg-when">
          <h2><span className="n">07</span>Khi nào dùng</h2>
          <div className="pp">
            <div><span className="pl">Hợp với</span>Danh mục sản phẩm nhiều loại thuộc tính, nội dung (bài viết, banner), dữ liệu đọc theo cả cụm (một đơn kèm các dòng hàng), cần scale ghi ngang.</div>
            <div className="warnc"><span className="pl">Cân nhắc</span>Dữ liệu nhiều quan hệ chéo và báo cáo JOIN phức tạp (kế toán, đối soát) thì <Link className="plink" href="/db/postgresql/">PostgreSQL</Link> hợp hơn. Schema linh hoạt không có nghĩa là không cần thiết kế.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
