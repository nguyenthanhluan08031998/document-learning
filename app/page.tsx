import { AreaCards } from "@/components/AreaCards";
import Link from "next/link";
import { SystemDesign } from "@/components/SystemDesign";

export default function HomePage() {
  return (
    <div className="wrap single">
      <main>
        <header className="hero">
          <div className="eyebrow">sổ tay lập trình · tổng quan</div>
          <h1>Sổ tay lập trình</h1>
          <p className="lede">Ghi chú học chia theo năm mảng: Frontend, Backend, Database, CI/CD và Git. Mọi ví dụ đều xoay quanh một hệ thống <b>bán hàng và thanh toán</b> online như hình dưới.</p>
        </header>
        <section>
          <h2>Hệ thống ví dụ: sàn thương mại điện tử</h2>
          <figure className="fig">
            <div className="scroll">
              <SystemDesign />
            </div>
            <figcaption>System design chia theo tầng, đã tính cho flash sale 10 triệu user. Request đi từ trên xuống, mỗi tầng chặn bớt một phần tải; việc chờ được thì đẩy qua Kafka cho worker xử lý.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Tầng</th>
                  <th>Thành phần</th>
                  <th>Vai trò</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>1 · Client</b></td><td>Web, mobile, admin, seller center</td><td>Giao diện cho từng nhóm người dùng</td></tr>
                <tr><td><b>2 · Edge</b></td><td>GeoDNS, CDN, WAF, load balancer</td><td>Trả nội dung tĩnh, chặn bot, chia tải trước khi vào hệ thống</td></tr>
                <tr><td><b>3 · Gateway</b></td><td>API Gateway / BFF, waiting room</td><td>Một cửa vào: xác thực, rate limit, routing; xếp hàng khi quá tải</td></tr>
                <tr><td><b>4 · Service</b></td><td>user, catalog, cart, order, payment</td><td>Nghiệp vụ; stateless nên nhân bản theo tải</td></tr>
                <tr><td><b>5 · Cache</b></td><td>Redis Cluster</td><td>Đọc nhanh, giữ giỏ hàng, trừ tồn kho flash sale</td></tr>
                <tr><td><b>6 · Data</b></td><td>PgBouncer, DB riêng từng service, shard, replica</td><td>Lưu bền; chia ghi theo shard, chia đọc sang replica</td></tr>
                <tr><td><b>7 · Messaging</b></td><td>Kafka</td><td>Chuyển sự kiện giữa service, giữ lại khi bên nhận chậm</td></tr>
                <tr><td><b>8 · Worker</b></td><td>notification, search, inventory, shipping</td><td>Xử lý nền theo sự kiện, scale theo số partition</td></tr>
                <tr><td><b>Xuyên suốt</b></td><td>Observability, CI/CD, config, secrets</td><td>Dùng cho mọi tầng</td></tr>
                <tr><td><b>Bên ngoài</b></td><td>Cổng thanh toán, đơn vị vận chuyển</td><td>Dịch vụ của bên thứ ba, gọi qua API và webhook</td></tr>
              </tbody>
            </table>
          </div>
          <h3>Luồng một đơn hàng</h3>
          <ol className="steps">
            <li><div><b>Đặt hàng</b><div className="d">Web hoặc mobile gọi gateway; <code>order-svc</code> tạo đơn trạng thái <code>pending</code> và gọi <code>payment-svc</code>.</div></div></li>
            <li><div><b>Thanh toán</b><div className="d"><code>payment-svc</code> chuyển khách sang cổng VNPay, MoMo hoặc Stripe; kết quả trả về qua webhook.</div></div></li>
            <li><div><b>Phát sự kiện</b><div className="d">Thanh toán xong, <code>PaymentSucceeded</code> được đẩy lên Kafka; <code>order-svc</code> chuyển đơn sang <code>paid</code>.</div></div></li>
            <li><div><b>Xử lý sau</b><div className="d"><code>inventory-svc</code> trừ kho, <code>shipping-svc</code> tạo vận đơn với GHN, <code>notification-svc</code> gửi email xác nhận. Bên nào lỗi thì tự retry, không làm chậm khách.</div></div></li>
          </ol>
          <div className="note"><b>DB riêng hay DB chung?</b> Mỗi service một database là mặc định: đổi schema không ảnh hưởng ai. <code>inventory</code> và <code>shipping</code> dùng chung <code>warehouse_db</code> là ví dụ <b>shared database</b>: dễ làm lúc đầu, nhưng hai team bị buộc vào cùng một schema và khó tách sau này.</div>
        </section>
        <section id="scale">
          <h2>Chịu tải lớn: 10 triệu user, 100 triệu event</h2>
          <p>Sơ đồ trên đã gồm các thành phần cho flash sale. Nguyên tắc chung: <b>chặn bớt tải càng sớm càng tốt</b> (tầng 2, 3, 5), <b>service không giữ trạng thái</b> để nhân bản thoải mái (tầng 4), và <b>việc gì chờ được thì đẩy sang bất đồng bộ</b> (tầng 7, 8).</p>

          <h3>Kịch bản 1: 10 triệu user truy cập cùng lúc</h3>
          <p>Ước lượng: 10 triệu user, mỗi người khoảng 10 giây bấm một lần → <b>~1 triệu request/giây</b>, trong đó ~95% là đọc (xem sản phẩm, giá).</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Tầng</th>
                  <th>Cách làm</th>
                  <th>Tác dụng</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>2 · CDN</b></td><td>Cache ảnh, JS, trang sản phẩm dựng sẵn (SSG, ISR)</td><td>80–90% request không tới server</td></tr>
                <tr><td><b>2 · DNS, load balancer</b></td><td>GeoDNS đưa user tới region gần nhất; WAF chặn bot</td><td>Chia tải nhiều region, loại request rác</td></tr>
                <tr><td><b>3 · Waiting room</b></td><td>Lúc mở bán chỉ cho N người/giây vào checkout, còn lại xếp hàng</td><td>Backend chỉ nhận đúng sức chứa</td></tr>
                <tr><td><b>4 · Service</b></td><td>Stateless (session ở JWT hoặc Redis), Kubernetes HPA tự thêm pod</td><td>Thêm pod là tăng tải được ngay</td></tr>
                <tr><td><b>5 · Cache</b></td><td>Redis Cluster giữ sản phẩm, giá, giỏ hàng; tồn kho flash sale trừ bằng <code>DECR</code></td><td>DB không bị đọc dồn; không bán quá số lượng</td></tr>
                <tr><td><b>6 · Database</b></td><td>Read replica cho đọc, shard theo <code>customer_id</code> cho ghi, PgBouncer gom kết nối</td><td>Mỗi máy DB chỉ gánh một phần</td></tr>
                <tr><td><b>7 · Ghi đơn</b></td><td>Nhận đơn, đẩy sự kiện vào Kafka, trả “đang xử lý” ngay</td><td>Khách không phải chờ trừ kho, gửi email</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Kịch bản 2: 100 triệu event cùng lúc</h3>
          <p>Ước lượng: 100 triệu event trong 1 phút ≈ <b>1,7 triệu event/giây</b>. Một partition Kafka xử lý ổn định khoảng 10.000 event/giây (1 KB mỗi event) → cần ít nhất 170 partition; chọn <b>200</b> để dư. Các kỹ thuật dưới đây nằm ở tầng 7 (Kafka) và tầng 8 (worker).</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Kỹ thuật</th>
                  <th>Cách làm</th>
                  <th>Tác dụng</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>Partition</b></td><td>200 partition, key là <code>orderId</code></td><td>Xử lý song song; sự kiện của cùng một đơn vẫn đúng thứ tự</td></tr>
                <tr><td><b>Consumer group</b></td><td>Số consumer ≤ số partition; tự scale theo lag (KEDA)</td><td>Thêm consumer là đọc nhanh hơn</td></tr>
                <tr><td><b>Batch, nén</b></td><td>Producer gom lô (<code>linger.ms</code>, <code>batch.size</code>, lz4); consumer ghi DB theo lô</td><td>Giảm số lần gọi mạng và ghi đĩa</td></tr>
                <tr><td><b>Idempotent</b></td><td>Mỗi event có id; consumer bỏ qua id đã xử lý</td><td>Retry thoải mái, không trừ kho hai lần</td></tr>
                <tr><td><b>Backpressure, DLQ</b></td><td>Consumer chậm thì event nằm chờ (lag); event lỗi chuyển sang dead letter topic</td><td>Không mất event, không làm nghẽn cả hàng</td></tr>
                <tr><td><b>Retention</b></td><td>Giữ event 7 ngày</td><td>Sửa bug xong có thể chạy lại (replay)</td></tr>
              </tbody>
            </table>
          </div>
          <div className="note tip">Chi tiết từng phần: <Link className="plink" href="/messaging/kafka/">Kafka</Link> (partition, consumer group), <Link className="plink" href="/concurrency/distributed-lock/">Distributed lock</Link> và <Link className="plink" href="/concurrency/db-lock/">Lock trong DB</Link> (không bán quá tồn kho), <Link className="plink" href="/design/microservice/">Pattern microservice</Link> (Saga, Outbox, Circuit Breaker).</div>
        </section>
        <section>
          <h2>Năm mảng kiến thức</h2>
          <AreaCards />
        </section>
      </main>
    </div>
  );
}
