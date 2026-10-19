export default function ComparePage() {
  return (
    <div className="wrap single">
      <main>
        <header className="hero">
          <div className="eyebrow">đồng thời · so sánh</div>
          <h1>Chọn cơ chế nào</h1>
          <p className="lede">Đi từ đơn giản đến phức tạp: thử cách nhẹ nhất giải được bài toán trước, chỉ dùng distributed lock khi các cách khác không với tới.</p>
        </header>
        <section>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Cơ chế</th>
                  <th>Chờ hay không</th>
                  <th>Phạm vi</th>
                  <th>Chi phí</th>
                  <th>Hợp với</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Atomic update</b></td>
                  <td>Không đáng kể</td>
                  <td>Một dòng / một key</td>
                  <td>Thấp nhất</td>
                  <td>Đếm, trừ tồn kho, đổi trạng thái có điều kiện</td>
                </tr>
                <tr>
                  <td><b>Optimistic lock</b></td>
                  <td>Không chờ, thất bại thì retry</td>
                  <td>Một dòng, qua cả HTTP</td>
                  <td>Thấp</td>
                  <td>Sửa hồ sơ, bài viết; xung đột hiếm</td>
                </tr>
                <tr>
                  <td><b>Pessimistic lock</b></td>
                  <td>Chờ (hoặc NOWAIT / SKIP LOCKED)</td>
                  <td>Nhiều dòng trong một DB</td>
                  <td>Trung bình</td>
                  <td>Chuyển tiền, giữ ghế; xung đột thường xuyên</td>
                </tr>
                <tr>
                  <td><b>Serializable</b></td>
                  <td>Không chờ, lỗi thì retry</td>
                  <td>Cả transaction</td>
                  <td>Trung bình đến cao</td>
                  <td>Quy tắc trải trên nhiều dòng (write skew)</td>
                </tr>
                <tr>
                  <td><b>Mutex / Semaphore</b></td>
                  <td>Chờ</td>
                  <td>Một tiến trình</td>
                  <td>Thấp</td>
                  <td>Cache stampede, giới hạn gọi API trong một instance</td>
                </tr>
                <tr>
                  <td><b>Distributed lock</b></td>
                  <td>Thường thử rồi bỏ qua</td>
                  <td>Nhiều instance, nhiều service</td>
                  <td>Cao (thêm hạ tầng, nhiều lỗi khó)</td>
                  <td>Cron chạy một nơi, tài nguyên ngoài database</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2>Thứ tự nên thử</h2>
          <ol className="steps">
            <li>
              <div><b>Gộp được vào một câu lệnh?</b><div className="d">Dùng atomic update. Xong.</div></div>
            </li>
            <li>
              <div><b>Dữ liệu trong một database, xung đột hiếm?</b><div className="d">Optimistic lock với cột version.</div></div>
            </li>
            <li>
              <div><b>Dữ liệu trong một database, xung đột nhiều hoặc nhiều dòng?</b><div className="d">Pessimistic lock trong transaction ngắn, khóa theo thứ tự cố định.</div></div>
            </li>
            <li>
              <div><b>Chỉ cần tránh trùng trong một instance?</b><div className="d">Mutex hoặc semaphore trong bộ nhớ.</div></div>
            </li>
            <li>
              <div><b>Nhiều instance, tài nguyên ngoài database?</b><div className="d">Distributed lock có TTL, nhả đúng chủ, thêm fencing nếu dữ liệu quan trọng.</div></div>
            </li>
          </ol>
        </section>
        <section id="cmp-alt">
          <h2>Những cách tránh hẳn việc phải lock</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Cách</th>
                  <th>Ý tưởng</th>
                  <th>Ví dụ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Unique constraint</b></td>
                  <td>Để database từ chối bản ghi trùng</td>
                  <td><code>UNIQUE(seat_id, show_id)</code>: hai người đặt cùng ghế thì một người nhận lỗi</td>
                </tr>
                <tr>
                  <td><b>Idempotency key</b></td>
                  <td>Lưu khóa của mỗi yêu cầu, gặp lại thì trả kết quả cũ</td>
                  <td>Header <code>Idempotency-Key</code> khi thanh toán (tab REST)</td>
                </tr>
                <tr>
                  <td><b>Idempotent consumer</b></td>
                  <td>Ghi nhận message đã xử lý</td>
                  <td>Bảng <code>processed_messages</code> (tab Microservice)</td>
                </tr>
                <tr>
                  <td><b>Single writer theo key</b></td>
                  <td>Mọi thay đổi của một key đi qua đúng một consumer, tuần tự</td>
                  <td>Kafka partition theo <code>accountId</code>; RabbitMQ <code>x-single-active-consumer</code></td>
                </tr>
                <tr>
                  <td><b>Append-only</b></td>
                  <td>Không sửa, chỉ thêm bản ghi mới</td>
                  <td>Event sourcing, sổ cái giao dịch</td>
                </tr>
                <tr>
                  <td><b>Đặt chỗ có hạn</b></td>
                  <td>Giữ tạm có thời hạn, hết hạn tự nhả</td>
                  <td>Giữ ghế 10 phút khi thanh toán (cột <code>hold_until</code>)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Ghi nhớ:</b> lock là công cụ cuối cùng. Thiết kế để không có hai bên cùng ghi một chỗ thường bền vững hơn mọi loại lock.</div>
        </section>
      </main>
    </div>
  );
}
