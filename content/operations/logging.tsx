import { Code } from "@/components/Code";

export default function LoggingPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục logging cơ bản">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#lg-why"><span>01</span>Log để làm gì</a></li>
          <li><a href="#lg-levels"><span>02</span>Log level</a></li>
          <li><a href="#lg-what"><span>03</span>Nên log gì</a></li>
          <li><a href="#lg-not"><span>04</span>Không được log gì</a></li>
          <li><a href="#lg-error"><span>05</span>Log lỗi đúng cách</a></li>
          <li><a href="#lg-where"><span>06</span>Log đi đâu</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">vận hành · logging</div>
          <h1>Logging: nhật ký của hệ thống</h1>
          <p className="lede">Log là bản ghi những gì ứng dụng đã làm. Khi có sự cố lúc 2 giờ sáng trên production, log tốt cho bạn biết chuyện gì xảy ra trong vài phút; log tệ (hoặc không có) bắt bạn đoán mò hàng giờ.</p>
          <div className="tape" aria-hidden="true">
            <div>trace</div>
            <div>debug</div>
            <div>info</div>
            <div className="hw">warn</div>
            <div className="leo">error</div>
            <div className="leo">fatal</div>
          </div>
        </header>
        <section id="lg-why">
          <h2><span className="n">01</span>Log để làm gì</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Mục đích</th>
                  <th>Ví dụ câu hỏi log trả lời được</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Debug sự cố</b></td>
                  <td>Vì sao đơn 42 bị trừ tiền mà không tạo vận đơn?</td>
                </tr>
                <tr>
                  <td><b>Theo dõi hoạt động</b></td>
                  <td>Hôm nay có bao nhiêu lần thanh toán thất bại, ở cổng nào?</td>
                </tr>
                <tr>
                  <td><b>Kiểm toán (audit)</b></td>
                  <td>Ai đã đổi quyền của user 7, lúc nào?</td>
                </tr>
                <tr>
                  <td><b>Bảo mật</b></td>
                  <td>Có IP nào đăng nhập sai 100 lần trong một phút không?</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="lg-levels">
          <h2><span className="n">02</span>Log level</h2>
          <p>Mỗi dòng log có một mức độ. Production thường bật từ <code>info</code> trở lên; khi điều tra thì tạm hạ xuống <code>debug</code>.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Số (pino)</th>
                  <th>Khi nào dùng</th>
                  <th>Ví dụ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">trace</td>
                  <td className="n">10</td>
                  <td>Chi tiết từng bước, chỉ bật khi debug sâu</td>
                  <td>Giá trị biến trong vòng lặp</td>
                </tr>
                <tr>
                  <td className="m">debug</td>
                  <td className="n">20</td>
                  <td>Thông tin cho developer</td>
                  <td>Câu SQL đã chạy, cache hit/miss</td>
                </tr>
                <tr>
                  <td className="m">info</td>
                  <td className="n">30</td>
                  <td>Sự kiện nghiệp vụ bình thường, đáng ghi lại</td>
                  <td>Đơn hàng được tạo, server khởi động</td>
                </tr>
                <tr>
                  <td className="m">warn</td>
                  <td className="n">40</td>
                  <td>Bất thường nhưng hệ thống tự xử lý được</td>
                  <td>Retry lần 2, gần hết quota, dùng giá trị mặc định</td>
                </tr>
                <tr>
                  <td className="m">error</td>
                  <td className="n">50</td>
                  <td>Một thao tác thất bại, cần người xem</td>
                  <td>Gọi cổng thanh toán lỗi sau mọi lần retry</td>
                </tr>
                <tr>
                  <td className="m">fatal</td>
                  <td className="n">60</td>
                  <td>Ứng dụng không thể chạy tiếp</td>
                  <td>Không kết nối được database lúc khởi động</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Mẹo chọn level:</b> nếu dòng log này xuất hiện lúc 2 giờ sáng, có cần đánh thức ai không? Có thì <code>error</code>. Cần xem trong giờ làm việc thì <code>warn</code>. Chỉ để tra cứu thì <code>info</code>. Lỗi do người dùng nhập sai (400, 404) thường là <code>info</code> hoặc <code>warn</code>, không phải <code>error</code>.</div>
        </section>
        <section id="lg-what">
          <h2><span className="n">03</span>Nên log gì</h2>
          <ul className="plain">
            <li><b>Ranh giới hệ thống</b>: request đến và response đi (method, path, status, thời gian), lời gọi sang service khác, message nhận từ Kafka/RabbitMQ.</li>
            <li><b>Sự kiện nghiệp vụ</b>: tạo đơn, thanh toán thành công, đổi trạng thái.</li>
            <li><b>Quyết định quan trọng</b>: vì sao từ chối đơn, nhánh fallback nào được chọn.</li>
            <li><b>Lỗi và retry</b>: kèm nguyên nhân, số lần thử.</li>
            <li><b>Khởi động và cấu hình</b>: version, môi trường, cấu hình đã nạp (đã che bí mật).</li>
            <li>Mỗi dòng có đủ ngữ cảnh: <b>ai</b> (userId), <b>cái gì</b> (orderId), <b>request nào</b> (requestId, traceId).</li>
          </ul>
        </section>
        <section id="lg-not">
          <h2><span className="n">04</span>Không được log gì</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>Ví dụ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Bí mật</b></td>
                  <td>Mật khẩu, token, API key, header <code>Authorization</code>, cookie phiên</td>
                </tr>
                <tr>
                  <td><b>Dữ liệu thanh toán</b></td>
                  <td>Số thẻ, CVV</td>
                </tr>
                <tr>
                  <td><b>Dữ liệu cá nhân</b></td>
                  <td>Số CCCD, số điện thoại, địa chỉ, email đầy đủ (che bớt: <code>a***@gmail.com</code>)</td>
                </tr>
                <tr>
                  <td><b>Body lớn</b></td>
                  <td>Cả request/response dài, file, ảnh base64</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Log thường được lưu lâu và nhiều người đọc được, nên lộ bí mật qua log là lỗi bảo mật phổ biến. Dùng tính năng <b>redact</b> của thư viện để tự che các trường nhạy cảm, thay vì nhớ từng chỗ.</p>
        </section>
        <section id="lg-error">
          <h2><span className="n">05</span>Log lỗi đúng cách</h2>
          <Code lang="ts">{`// Bad: loses stack trace and context, and logs the same error at every layer
catch (e) {
  console.log("error: " + e);
  throw e;
}

// Good: wrap with context once, keep the original as "cause"
async function chargeOrder(orderId: string) {
  try {
    await paymentClient.charge(orderId);
  } catch (e) {
    throw new Error(\`Charge failed for order \${orderId}\`, { cause: e });
  }
}

// Log once, at the boundary that decides what to do with the error
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  req.log.error({ err, orderId: req.params.id }, "request failed");  // pino serializes stack + cause
  res.status(500).json({ title: "Internal error", requestId: req.id });
});`}</Code>
          <ul className="plain">
            <li><b>Log một lần</b>, ở nơi quyết định xử lý lỗi. Log ở mọi tầng rồi ném tiếp sẽ tạo năm dòng cho cùng một lỗi.</li>
            <li>Luôn giữ <b>stack trace</b> và <b>nguyên nhân gốc</b> (<code>cause</code>).</li>
            <li>Trả cho người dùng <code>requestId</code> thay vì chi tiết lỗi, để họ báo lại và bạn tra log.</li>
          </ul>
        </section>
        <section id="lg-where">
          <h2><span className="n">06</span>Log đi đâu</h2>
          <ol className="steps">
            <li>
              <div><b>Ứng dụng ghi ra stdout</b><div className="d">Theo nguyên tắc 12-factor: ứng dụng không tự quản file log, chỉ in ra stdout dạng JSON.</div></div>
            </li>
            <li>
              <div><b>Bộ thu gom</b><div className="d">Docker, Kubernetes, Fluent Bit, Vector hoặc OpenTelemetry Collector đọc stdout của container và đẩy đi.</div></div>
            </li>
            <li>
              <div><b>Nơi lưu trữ và tìm kiếm</b><div className="d">Elasticsearch/OpenSearch + Kibana, Grafana Loki, Datadog, CloudWatch, Google Cloud Logging.</div></div>
            </li>
            <li>
              <div><b>Cảnh báo</b><div className="d">Đặt luật trên log: số dòng <code>error</code> tăng đột biến thì báo Slack hoặc gọi điện.</div></div>
            </li>
          </ol>
          <div className="note">Nếu buộc phải ghi file, cần <b>log rotation</b> (logrotate, hoặc tính năng xoay vòng của thư viện) để không đầy ổ đĩa.</div>
        </section>
      </main>
    </div>
  );
}
