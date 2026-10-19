import Link from "next/link";
import { Code } from "@/components/Code";

export default function OverviewPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục đồng thời">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#cc-race"><span>01</span>Race condition</a></li>
          <li><a href="#cc-anomaly"><span>02</span>Các lỗi đồng thời</a></li>
          <li><a href="#cc-isolation"><span>03</span>Isolation level</a></li>
          <li><a href="#cc-blocking"><span>04</span>{"Blocking & non-blocking"}</a></li>
          <li><a href="#cc-map"><span>05</span>Bản đồ cơ chế</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">đồng thời · tổng quan</div>
          <h1>Khi hai request cùng sửa một dữ liệu</h1>
          <p className="lede">Server xử lý nhiều request song song, nhiều instance cùng chạy, nhiều consumer cùng đọc queue. Khi chúng chạm vào cùng một bản ghi (tồn kho, số dư ví, lượt dùng voucher), kết quả có thể sai mà không có lỗi nào được báo. Lock và các cơ chế liên quan sinh ra để ngăn điều đó.</p>
          <div className="tape" aria-hidden="true">
            <div>read</div>
            <div>read</div>
            <div>write</div>
            <div className="hw">write</div>
            <div className="leo">lost</div>
          </div>
        </header>
        <section id="cc-race">
          <h2><span className="n">01</span>Race condition: ví dụ mất cập nhật</h2>
          <p>Kho còn 10 chiếc áo. Hai khách bấm mua cùng lúc, mỗi request làm ba bước: đọc tồn kho, trừ 1, ghi lại.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 340" role="img" aria-label="Lost update: request A và B cùng đọc stock 10, cùng ghi 9, mất một lần trừ"> <defs><marker id="lua" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker><marker id="lub" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker><marker id="luc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--bad)" /></marker><marker id="lud" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker><marker id="lue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--new)" /></marker></defs> <rect className="s-box" x="0.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="70.0" y="35" textAnchor="middle">Request A</text> <text className="s-tm" x="70.0" y="52" textAnchor="middle">khách 1</text> <path d="M70.0 62 V326" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-disk" x="380.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="450.0" y="35" textAnchor="middle">Database</text> <text className="s-tm" x="450.0" y="52" textAnchor="middle">stock = 10</text> <path d="M450.0 62 V326" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-box" x="760.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="830.0" y="35" textAnchor="middle">Request B</text> <text className="s-tm" x="830.0" y="52" textAnchor="middle">khách 2</text> <path d="M830.0 62 V326" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <path d="M74.0 92 H444.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#lua)" /> <text className="s-tm" x="260.0" y="85" textAnchor="middle" style={{ fill: "var(--accent)" }}>SELECT stock</text> <path d="M446.0 126 H76.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#lub)" /> <text className="s-tm" x="260.0" y="119" textAnchor="middle" style={{ fill: "var(--muted)" }}>10</text> <path d="M826.0 160 H456.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#lua)" /> <text className="s-tm" x="640.0" y="153" textAnchor="middle" style={{ fill: "var(--accent)" }}>SELECT stock</text> <path d="M454.0 194 H824.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#lub)" /> <text className="s-tm" x="640.0" y="187" textAnchor="middle" style={{ fill: "var(--muted)" }}>10</text> <path d="M74.0 228 H444.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#lua)" /> <text className="s-tm" x="260.0" y="221" textAnchor="middle" style={{ fill: "var(--accent)" }}>UPDATE stock = 9</text> <path d="M826.0 262 H456.0" style={{ stroke: "var(--bad)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#luc)" /> <text className="s-tm" x="640.0" y="255" textAnchor="middle" style={{ fill: "var(--bad)" }}>UPDATE stock = 9</text> <text className="s-tm" x="10.0" y="296" style={{ fill: "var(--bad)", fontWeight: "600" }}>Bán 2 áo nhưng kho chỉ giảm 1: stock = 9 thay vì 8</text> </svg>
            </div>
            <figcaption>Cả hai đều đọc 10 trước khi bên kia kịp ghi, nên lần ghi sau đè lên lần ghi trước.</figcaption>
          </figure>
          <Code lang="ts">{`// Read-modify-write in application code: unsafe under concurrency
async function buy(productId: string) {
  const { rows } = await db.query("SELECT stock FROM products WHERE id = $1", [productId]);
  const stock = rows[0].stock;              // both requests may read 10 here
  if (stock <= 0) throw new Error("Sold out");
  await db.query("UPDATE products SET stock = $1 WHERE id = $2", [stock - 1, productId]);
}`}</Code>
          <div className="note">Lỗi này không phải do JavaScript đa luồng. Node.js chạy một luồng, nhưng mỗi <code>await</code> nhường chỗ cho request khác chen vào giữa bước đọc và bước ghi. Chạy nhiều instance hay nhiều pod thì càng dễ xảy ra.</div>
        </section>
        <section id="cc-anomaly">
          <h2><span className="n">02</span>Các lỗi đồng thời thường gặp</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Lỗi</th>
                  <th>Chuyện gì xảy ra</th>
                  <th>Ví dụ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Lost update</b></td>
                  <td>Hai bên đọc cùng giá trị cũ rồi cùng ghi đè, một thay đổi biến mất</td>
                  <td>Tồn kho 10 → 9 dù đã bán 2</td>
                </tr>
                <tr>
                  <td><b>Dirty read</b></td>
                  <td>Đọc dữ liệu của transaction khác chưa commit, sau đó nó bị rollback</td>
                  <td>Hiển thị số dư chưa chắc chắn</td>
                </tr>
                <tr>
                  <td><b>Non-repeatable read</b></td>
                  <td>Đọc cùng một dòng hai lần trong một transaction, ra hai giá trị khác nhau</td>
                  <td>Giá sản phẩm đổi giữa lúc kiểm tra và lúc tính tiền</td>
                </tr>
                <tr>
                  <td><b>Phantom read</b></td>
                  <td>Chạy cùng một truy vấn hai lần, lần sau có thêm hoặc mất dòng</td>
                  <td>Đếm số đơn đã bán thay đổi giữa chừng</td>
                </tr>
                <tr>
                  <td><b>Write skew</b></td>
                  <td>Hai transaction đọc cùng điều kiện, mỗi bên sửa một dòng khác nhau, kết quả chung vi phạm quy tắc</td>
                  <td>Đơn chỉ được giảm tối đa 50%: hai voucher áp cùng lúc, mỗi bên kiểm tra thấy “còn dư”, cộng lại giảm quá 50%</td>
                </tr>
                <tr>
                  <td><b>Double processing</b></td>
                  <td>Hai worker cùng nhận và xử lý một việc</td>
                  <td>Gửi email hai lần, trừ tiền hai lần</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="cc-isolation">
          <h2><span className="n">03</span>Isolation level của database</h2>
          <p>Database tự chống một phần các lỗi trên, tùy mức cô lập (isolation level) của transaction. Mức càng cao càng an toàn nhưng càng nhiều xung đột phải retry.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Mức</th>
                  <th>Dirty read</th>
                  <th>Non-repeatable</th>
                  <th>Phantom</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Read Uncommitted</b></td>
                  <td>Có thể</td>
                  <td>Có thể</td>
                  <td>Có thể</td>
                  <td>PostgreSQL xử lý như Read Committed</td>
                </tr>
                <tr>
                  <td><b>Read Committed</b></td>
                  <td>Không</td>
                  <td>Có thể</td>
                  <td>Có thể</td>
                  <td>Mặc định của PostgreSQL, SQL Server, Oracle</td>
                </tr>
                <tr>
                  <td><b>Repeatable Read</b></td>
                  <td>Không</td>
                  <td>Không</td>
                  <td>Tùy DB</td>
                  <td>Mặc định của MySQL InnoDB</td>
                </tr>
                <tr>
                  <td><b>Serializable</b></td>
                  <td>Không</td>
                  <td>Không</td>
                  <td>Không</td>
                  <td>Như chạy lần lượt; PostgreSQL báo lỗi serialization để bạn retry</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note tip">Ở mức mặc định Read Committed, ví dụ mua áo ở trên <b>vẫn bị lost update</b>. Muốn an toàn phải dùng thêm lock hoặc câu lệnh atomic, xem tab <b>Lock trong DB</b>.</div>
        </section>
        <section id="cc-blocking">
          <h2><span className="n">04</span>Blocking và non-blocking</h2>
          <div className="cmp">
            <div><h4>Blocking</h4>Gặp tài nguyên đang bị khóa thì <b>đứng chờ</b> tới khi được nhả. Đơn giản, đúng thứ tự, nhưng tốn kết nối và có nguy cơ deadlock, chờ lâu.</div>
            <div><h4>Non-blocking</h4>Không chờ: thử lấy khóa, không được thì <b>báo ngay</b> (<code>NOWAIT</code>, <code>tryLock</code>), <b>bỏ qua</b> (<code>SKIP LOCKED</code>) hoặc <b>làm rồi kiểm tra</b> (optimistic, CAS). Phản hồi nhanh, nhưng phải xử lý trường hợp thất bại.</div>
          </div>
          <p>Ở giữa là <b>chờ có giới hạn</b>: <code>lock_timeout</code> trong PostgreSQL, timeout khi lấy distributed lock. Gần như luôn nên đặt giới hạn này.</p>
        </section>
        <section id="cc-map">
          <h2><span className="n">05</span>Bản đồ các cơ chế</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Cơ chế</th>
                  <th>Ý tưởng</th>
                  <th>Phạm vi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><Link className="plink" href="/concurrency/db-lock/#lk-atomic">Atomic operation</Link></td>
                  <td>Gộp đọc, kiểm tra, ghi thành một lệnh duy nhất</td>
                  <td>Một dòng, một key</td>
                </tr>
                <tr>
                  <td><Link className="plink" href="/concurrency/db-lock/#lk-pessimistic">Pessimistic lock</Link></td>
                  <td>Khóa trước, sửa sau; người khác phải chờ</td>
                  <td>Trong database</td>
                </tr>
                <tr>
                  <td><Link className="plink" href="/concurrency/db-lock/#lk-optimistic">Optimistic lock</Link></td>
                  <td>Không khóa; lúc ghi kiểm tra phiên bản, lệch thì làm lại</td>
                  <td>Database, HTTP, cache</td>
                </tr>
                <tr>
                  <td><Link className="plink" href="/concurrency/distributed-lock/#dl-local">Mutex / Semaphore</Link></td>
                  <td>Khóa trong bộ nhớ của một tiến trình</td>
                  <td>Một instance</td>
                </tr>
                <tr>
                  <td><Link className="plink" href="/concurrency/distributed-lock/#dl-redis">Distributed lock</Link></td>
                  <td>Khóa đặt ở hệ thống chung (Redis, etcd, ZooKeeper, PostgreSQL)</td>
                  <td>Nhiều instance, nhiều service</td>
                </tr>
                <tr>
                  <td><Link className="plink" href="/concurrency/compare/#cmp-alt">Không cần lock</Link></td>
                  <td>Unique constraint, idempotency key, một consumer cho mỗi key</td>
                  <td>Thiết kế hệ thống</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
