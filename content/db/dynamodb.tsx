import Link from "next/link";
import { Code } from "@/components/Code";

// One partition of the single table: header is the partition key, rows are sort keys
const Partition = ({ x, pk, rows, hit = [] }: { x: number; pk: string; rows: string[]; hit?: number[] }) => (
  <g>
    <rect className="s-bg" x={x} y={40} width={270} height={34 + rows.length * 34} rx="8" />
    <text className="s-tb" x={x + 12} y={62}>{`PK = ${pk}`}</text>
    {rows.map((r, i) => (
      <g key={r}>
        <rect className={hit.includes(i) ? "s-hl" : "s-box"} x={x + 10} y={72 + i * 34} width={250} height={28} rx="5" />
        <text className="s-tm" x={x + 20} y={90 + i * 34} style={{ fill: "var(--ink)" }}>{r}</text>
      </g>
    ))}
  </g>
);

function SingleTableDiagram() {
  return (
    <svg viewBox="0 0 900 260" role="img" aria-label="Single-table design: partition CUSTOMER#7 chứa PROFILE và các mục ORDER theo ngày; partition ORDER#42 chứa META, các ITEM và PAYMENT; partition PRODUCT#PHONE-01 chứa META có tồn kho. Query PK bằng CUSTOMER#7 và SK bắt đầu bằng ORDER# lấy đúng các đơn của khách">
      <text className="s-lane" x="20" y="24">BẢNG shop · MỘT BẢNG CHO NHIỀU LOẠI DỮ LIỆU</text>
      <Partition x={20} pk="CUSTOMER#7" rows={["SK = PROFILE · name, email", "SK = ORDER#2026-10-19#42", "SK = ORDER#2026-10-20#57"]} hit={[1, 2]} />
      <Partition x={315} pk="ORDER#42" rows={["SK = META · status, total", "SK = ITEM#PHONE-01 · qty 1", "SK = ITEM#CASE-02 · qty 1", "SK = PAYMENT#vnp_9f2c"]} />
      <Partition x={610} pk="PRODUCT#PHONE-01" rows={["SK = META · price, stock"]} />
      <text className="s-tm" x="20" y="200" style={{ fill: "var(--accent)" }}>Query PK = CUSTOMER#7</text>
      <text className="s-tm" x="20" y="218" style={{ fill: "var(--accent)" }}>AND begins_with(SK, "ORDER#")</text>
      <text className="s-tm" x="20" y="236" style={{ fill: "var(--accent)" }}>→ các ô tô xanh, đã sắp theo ngày</text>
      <text className="s-tm" x="610" y="140" style={{ fill: "var(--muted)" }}>PK quyết định dữ liệu nằm ở</text>
      <text className="s-tm" x="610" y="158" style={{ fill: "var(--muted)" }}>partition nào; SK sắp xếp</text>
      <text className="s-tm" x="610" y="176" style={{ fill: "var(--muted)" }}>các mục trong partition đó</text>
    </svg>
  );
}

export default function DynamoPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục DynamoDB">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#dy-what"><span>01</span>Đặc điểm</a></li>
          <li><a href="#dy-key"><span>02</span>Partition key, sort key</a></li>
          <li><a href="#dy-single"><span>03</span>Single-table design</a></li>
          <li><a href="#dy-code"><span>04</span>Code</a></li>
          <li><a href="#dy-limit"><span>05</span>{"Consistency & giới hạn"}</a></li>
          <li><a href="#dy-when"><span>06</span>Khi nào dùng</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">database · dynamodb</div>
          <h1>DynamoDB</h1>
          <p className="lede">Cơ sở dữ liệu key-value của AWS, không có server để quản lý, tự scale và giữ độ trễ vài mili giây ở mọi quy mô. Đổi lại, bạn phải <b>biết trước sẽ truy vấn thế nào</b> rồi mới thiết kế bảng.</p>
          <div className="tape" aria-hidden="true">
            <div>partition key</div>
            <div>sort key</div>
            <div>GSI</div>
            <div className="hw">single table</div>
            <div className="leo">on-demand</div>
          </div>
        </header>

        <section id="dy-what">
          <h2><span className="n">01</span>Đặc điểm</h2>
          <ul className="plain">
            <li><b>Fully managed, serverless:</b> không cài, không vá, không lo replica; AWS tự nhân bản sang 3 vùng sẵn sàng (AZ).</li>
            <li><b>Tính tiền theo request</b> (on-demand) hoặc đặt trước năng lực (provisioned). Ít traffic thì gần như miễn phí.</li>
            <li><b>Không JOIN, không truy vấn tùy ý:</b> chỉ đọc nhanh theo khóa. Muốn lọc theo trường khác phải tạo index phụ (GSI).</li>
            <li>Mỗi item tối đa <b>400 KB</b>.</li>
          </ul>
        </section>

        <section id="dy-key">
          <h2><span className="n">02</span>Partition key, sort key</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Khóa</th>
                  <th>Vai trò</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>Partition key (PK)</b></td><td>Được băm để chọn partition (máy) chứa item. Đọc theo PK luôn chỉ chạm một partition.</td></tr>
                <tr><td><b>Sort key (SK)</b></td><td>Sắp xếp các item cùng PK. Cho phép lấy theo khoảng: <code>begins_with</code>, <code>between</code>, lớn hơn, nhỏ hơn.</td></tr>
                <tr><td><b>GSI</b></td><td>Index phụ với PK và SK khác, để truy vấn theo cách thứ hai (ví dụ theo trạng thái đơn).</td></tr>
              </tbody>
            </table>
          </div>
          <div className="note"><b>Hot partition:</b> mỗi partition chỉ chịu được khoảng 3.000 lượt đọc và 1.000 lượt ghi mỗi giây. Dùng PK là <code>STATUS#pending</code> cho mọi đơn thì flash sale sẽ dồn hết vào một partition. Chọn PK phân tán đều (theo khách, theo đơn).</div>
        </section>

        <section id="dy-single">
          <h2><span className="n">03</span>Single-table design</h2>
          <p>Thay vì mỗi loại dữ liệu một bảng như SQL, DynamoDB thường để <b>mọi thứ trong một bảng</b>, sắp xếp sao cho mỗi kiểu truy cập chỉ cần <b>một lệnh Query</b>.</p>
          <figure className="fig">
            <div className="scroll">
              <SingleTableDiagram />
            </div>
            <figcaption>Tiền tố như <code>CUSTOMER#</code>, <code>ORDER#</code> cho biết loại item. Ngày đặt nằm trong SK nên các đơn tự sắp theo thời gian.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Cần lấy</th>
                  <th>Cách lấy</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Thông tin khách</td><td><code>GetItem</code> PK = <code>CUSTOMER#7</code>, SK = <code>PROFILE</code></td></tr>
                <tr><td>Đơn của khách, mới nhất trước</td><td><code>Query</code> PK = <code>CUSTOMER#7</code>, SK bắt đầu <code>ORDER#</code>, đảo chiều</td></tr>
                <tr><td>Chi tiết đơn, dòng hàng, thanh toán</td><td><code>Query</code> PK = <code>ORDER#42</code> (một lệnh lấy hết)</td></tr>
                <tr><td>Đơn đang chờ xử lý</td><td>GSI1: GSI1PK = <code>STATUS#pending#{"{shard}"}</code>, GSI1SK = thời gian tạo</td></tr>
              </tbody>
            </table>
          </div>
          <div className="note tip">Thiết kế DynamoDB đi <b>ngược với SQL</b>: liệt kê các màn hình và câu hỏi trước (access patterns), rồi mới chọn PK, SK. Thêm kiểu truy vấn mới về sau thường phải thêm GSI hoặc chép dữ liệu lại.</div>
        </section>

        <section id="dy-code">
          <h2><span className="n">04</span>Code</h2>
          <Code lang="ts">{`import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";

const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "ap-southeast-1" }));

// Orders of customer 7, newest first
const { Items } = await db.send(new QueryCommand({
  TableName: "shop",
  KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
  ExpressionAttributeValues: { ":pk": "CUSTOMER#7", ":sk": "ORDER#" },
  ScanIndexForward: false,
  Limit: 20,
}));

// Place an order: decrement stock and write the order in one transaction
await db.send(new TransactWriteCommand({
  TransactItems: [
    { Update: {
        TableName: "shop",
        Key: { PK: "PRODUCT#PHONE-01", SK: "META" },
        UpdateExpression: "SET stock = stock - :qty",
        ConditionExpression: "stock >= :qty",            // not enough stock → whole transaction fails
        ExpressionAttributeValues: { ":qty": 1 },
    } },
    { Put: {
        TableName: "shop",
        Item: { PK: "ORDER#42", SK: "META", customerId: 7, status: "pending", total: 22990000 },
        ConditionExpression: "attribute_not_exists(PK)",  // never overwrite an existing order
    } },
    { Put: {
        TableName: "shop",
        Item: { PK: "CUSTOMER#7", SK: "ORDER#2026-10-19#42", orderId: 42, status: "pending", total: 22990000 },
    } },
  ],
}));`}</Code>
        </section>

        <section id="dy-limit">
          <h2><span className="n">05</span>{"Consistency & giới hạn"}</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Điểm</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>Đọc</b></td><td>Mặc định eventually consistent (có thể trễ dưới 1 giây). <code>ConsistentRead: true</code> cho đọc mới nhất, tốn gấp đôi, không dùng được trên GSI.</td></tr>
                <tr><td><b>Transaction</b></td><td>Tối đa 100 item mỗi transaction; tốn gấp đôi so với ghi thường.</td></tr>
                <tr><td><b>Scan</b></td><td>Đọc cả bảng, chậm và tốn tiền; chỉ dùng cho việc chạy một lần.</td></tr>
                <tr><td><b>Streams</b></td><td>Mọi thay đổi đẩy ra DynamoDB Streams → Lambda → Kafka, OpenSearch (giống CDC, outbox).</td></tr>
                <tr><td><b>TTL</b></td><td>Tự xóa item hết hạn: giỏ hàng bỏ dở, session, mã OTP.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="dy-when">
          <h2><span className="n">06</span>Khi nào dùng</h2>
          <div className="pp">
            <div><span className="pl">Hợp với</span>Giỏ hàng, session, lịch sử đơn của khách, đếm lượt xem: truy cập theo khóa, traffic lên xuống thất thường như flash sale; team chạy trên AWS và không muốn vận hành database.</div>
            <div className="warnc"><span className="pl">Cân nhắc</span>Báo cáo, lọc tùy ý, nhiều JOIN thì khó và tốn: đẩy dữ liệu sang kho phân tích hoặc dùng <Link className="plink" href="/db/postgresql/">PostgreSQL</Link>. Bị gắn chặt với AWS.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
