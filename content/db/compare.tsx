import Link from "next/link";

const ROWS: [string, string, string, string, string][] = [
  ["Mô hình", "Bảng quan hệ", "Bảng quan hệ", "Document JSON", "Key-value, document"],
  ["Schema", "Chặt, có ràng buộc", "Chặt, có ràng buộc", "Linh hoạt, validation tùy chọn", "Chỉ bắt buộc khóa"],
  ["Truy vấn", "SQL đầy đủ, JOIN, window function", "SQL, JOIN", "Query theo trường, aggregation pipeline", "Theo PK, SK và GSI; không JOIN"],
  ["Transaction", "ACID đầy đủ", "ACID (InnoDB)", "Một document luôn atomic; nhiều document qua session", "TransactWrite tối đa 100 item"],
  ["Scale ghi", "Một primary; shard bằng Citus hoặc tự chia", "Một primary; shard bằng Vitess", "Sharding có sẵn", "Tự động, gần như không giới hạn"],
  ["Vận hành", "Tự quản hoặc RDS, Aurora, Neon", "Tự quản hoặc RDS, Aurora, PlanetScale", "Tự quản hoặc Atlas", "AWS quản lý hoàn toàn"],
  ["Điểm mạnh", "Đúng đắn, truy vấn phức tạp, extension", "Phổ biến, đọc theo khóa chính rất nhanh", "Dữ liệu nhiều dạng, đọc theo cụm", "Độ trễ ổn định khi traffic tăng vọt"],
  ["Điểm yếu", "Phải lo VACUUM; scale ghi ngang khó", "Gap lock dễ gây chờ; JSON kém linh hoạt", "Dễ thiết kế tùy tiện; JOIN yếu", "Phải biết trước cách truy vấn; gắn với AWS"],
];

export default function DatabaseComparePage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục so sánh database">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#dbc-table"><span>01</span>Bảng so sánh</a></li>
          <li><a href="#dbc-shop"><span>02</span>Dùng gì trong sàn bán hàng</a></li>
          <li><a href="#dbc-choose"><span>03</span>Chọn nhanh</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">database · so sánh</div>
          <h1>PostgreSQL, MySQL, MongoDB, DynamoDB</h1>
          <p className="lede">Không có database tốt nhất, chỉ có database hợp với từng loại dữ liệu. Một hệ thống microservice thường dùng nhiều loại cùng lúc (polyglot persistence).</p>
        </header>

        <section id="dbc-table">
          <h2><span className="n">01</span>Bảng so sánh</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th />
                  <th><Link className="plink" href="/db/postgresql/">PostgreSQL</Link></th>
                  <th><Link className="plink" href="/db/mysql/">MySQL</Link></th>
                  <th><Link className="plink" href="/db/mongodb/">MongoDB</Link></th>
                  <th><Link className="plink" href="/db/dynamodb/">DynamoDB</Link></th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([label, ...cells]) => (
                  <tr key={label}>
                    <td><b>{label}</b></td>
                    {cells.map((c, i) => <td key={i}>{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="dbc-shop">
          <h2><span className="n">02</span>Dùng gì trong sàn bán hàng</h2>
          <p>Mỗi service chọn database hợp với dữ liệu của nó (xem sơ đồ ở <Link className="plink" href="/">Tổng quan</Link>):</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Dữ liệu</th>
                  <th>Chọn</th>
                  <th>Vì sao</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Đơn hàng, thanh toán, đối soát</td><td><b>PostgreSQL</b> hoặc <b>MySQL</b></td><td>Không được sai: cần transaction, ràng buộc, báo cáo JOIN</td></tr>
                <tr><td>Tài khoản khách hàng</td><td><b>PostgreSQL</b></td><td>Email duy nhất, quan hệ với đơn, địa chỉ</td></tr>
                <tr><td>Danh mục sản phẩm</td><td><b>MongoDB</b></td><td>Mỗi loại hàng một kiểu thuộc tính, đọc cả sản phẩm một lần</td></tr>
                <tr><td>Giỏ hàng, session</td><td><b>DynamoDB</b> hoặc Redis</td><td>Truy cập theo khóa, tự hết hạn (TTL), chịu traffic flash sale</td></tr>
                <tr><td>Tìm kiếm sản phẩm</td><td>Elasticsearch, OpenSearch</td><td>Tìm theo chữ, gợi ý, lọc nhiều chiều; đồng bộ từ DB chính qua CDC</td></tr>
                <tr><td>Báo cáo doanh thu lớn</td><td>Kho phân tích (BigQuery, ClickHouse)</td><td>Quét hàng trăm triệu dòng mà không làm chậm DB bán hàng</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="dbc-choose">
          <h2><span className="n">03</span>Chọn nhanh</h2>
          <ol className="steps">
            <li><div><b>Chưa chắc dùng gì</b><div className="d">Bắt đầu với PostgreSQL. Nó làm tốt phần lớn việc, kể cả JSON, và dễ đổi hướng sau này.</div></div></li>
            <li><div><b>Dữ liệu cần đúng tuyệt đối, nhiều quan hệ</b><div className="d">PostgreSQL hoặc MySQL; chọn cái team đã quen vận hành.</div></div></li>
            <li><div><b>Cấu trúc mỗi bản ghi khác nhau, đọc theo cụm</b><div className="d">MongoDB.</div></div></li>
            <li><div><b>Truy cập theo khóa, traffic khó đoán, chạy trên AWS</b><div className="d">DynamoDB; liệt kê access patterns trước khi thiết kế bảng.</div></div></li>
          </ol>
        </section>
      </main>
    </div>
  );
}
