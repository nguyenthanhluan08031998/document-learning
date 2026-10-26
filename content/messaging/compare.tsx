export default function ComparePage() {
  return (
    <div className="wrap single">
      <main>
        <header className="hero">
          <div className="eyebrow">kafka · rabbitmq · nats · sqs</div>
          <h1>Khác nhau ở đâu, khi nào chọn cái nào</h1>
          <p className="lede"><b>Kafka</b> là commit log phân tán: lưu message theo thứ tự, consumer tự đọc theo offset. <b>RabbitMQ</b> là message broker: định tuyến vào queue, xử lý xong thì xóa. <b>NATS</b> là hệ thống nhắn tin siêu nhẹ theo subject, thêm JetStream khi cần lưu trữ. <b>SQS</b> là hàng đợi managed của AWS: không cần vận hành, xử lý xong thì xóa.</p>
        </header>
        <section>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Tiêu chí</th>
                  <th>Kafka</th>
                  <th>RabbitMQ</th>
                  <th>NATS</th>
                  <th>SQS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Mô hình</b></td>
                  <td>Log chia partition</td>
                  <td>Exchange → queue</td>
                  <td>Subject pub/sub; JetStream là stream</td>
                  <td>Standard: hàng đợi, không chia partition. FIFO: nhóm theo MessageGroupId</td>
                </tr>
                <tr>
                  <td><b>Lưu message</b></td>
                  <td>Luôn lưu tới hết retention</td>
                  <td>Lưu trong queue tới khi ack</td>
                  <td>Core: không lưu. JetStream: có</td>
                  <td>Lưu tới khi xử lý xong hoặc hết retention (mặc định 4 ngày, tối đa 14)</td>
                </tr>
                <tr>
                  <td><b>Đọc lại</b></td>
                  <td>Có, theo offset</td>
                  <td>Không (trừ stream queue)</td>
                  <td>Có với JetStream, theo sequence</td>
                  <td>Không (xóa sau khi xử lý)</td>
                </tr>
                <tr>
                  <td><b>Cách giao</b></td>
                  <td>Pull</td>
                  <td>Push + prefetch</td>
                  <td>Core: push. JetStream: pull hoặc push</td>
                  <td>Pull (long polling)</td>
                </tr>
                <tr>
                  <td><b>Định tuyến</b></td>
                  <td>Topic, partition theo key</td>
                  <td>direct, fanout, topic, headers</td>
                  <td>Subject với wildcard <code>*</code> và <code>{">"}</code></td>
                  <td>Không định tuyến; muốn fan-out thì ghép SNS</td>
                </tr>
                <tr>
                  <td><b>Chia việc</b></td>
                  <td>Consumer group, tối đa = số partition</td>
                  <td>Nhiều consumer trên một queue</td>
                  <td>Queue group, không cần khai báo</td>
                  <td>Nhiều consumer trên một queue, không cần khai báo</td>
                </tr>
                <tr>
                  <td><b>Request–reply</b></td>
                  <td>Không có sẵn</td>
                  <td>Có, qua reply_to</td>
                  <td>Có sẵn, rất gọn</td>
                  <td>Không có sẵn</td>
                </tr>
                <tr>
                  <td><b>Đảm bảo giao</b></td>
                  <td>At-least-once, exactly-once với transactions</td>
                  <td>At-least-once</td>
                  <td>Core: at-most-once. JetStream: at-least-once, exactly-once với Msg-Id + double ack</td>
                  <td>Standard: at-least-once. FIFO: exactly-once xử lý (loại trùng 5 phút)</td>
                </tr>
                <tr>
                  <td><b>Nhân bản</b></td>
                  <td>Replica + ISR</td>
                  <td>Quorum queue (Raft)</td>
                  <td>Stream replicas (Raft)</td>
                  <td>AWS tự nhân bản qua nhiều AZ</td>
                </tr>
                <tr>
                  <td><b>Độ trễ</b></td>
                  <td>Thấp, ưu tiên thông lượng</td>
                  <td>Thấp</td>
                  <td>Rất thấp (micro giây với core)</td>
                  <td>Thấp tới vừa (hàng chục mili giây)</td>
                </tr>
                <tr>
                  <td><b>Vận hành</b></td>
                  <td>Nặng nhất, JVM</td>
                  <td>Trung bình, Erlang</td>
                  <td>Nhẹ nhất, một file Go</td>
                  <td>Không cần vận hành, AWS lo</td>
                </tr>
                <tr>
                  <td><b>Có thêm</b></td>
                  <td>Kafka Streams, Connect</td>
                  <td>TTL, DLX, priority, plugin</td>
                  <td>KV store, Object store, leaf node</td>
                  <td>SNS fan-out, DLQ, delay queue, tích hợp Lambda</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2>Khi nào chọn</h2>
          <div className="cmp four">
            <div>
              <h4>Kafka</h4>
              <ul className="plain">
                <li>Luồng sự kiện rất lớn: log, clickstream, CDC.</li>
                <li>Cần lưu lâu, nhiều hệ thống đọc lại theo tốc độ riêng.</li>
                <li>Xử lý luồng, event sourcing.</li>
              </ul>
            </div>
            <div>
              <h4>RabbitMQ</h4>
              <ul className="plain">
                <li>Hàng đợi công việc: email, PDF, xử lý ảnh.</li>
                <li>Định tuyến phức tạp, priority, delay, retry.</li>
                <li>Hệ sinh thái AMQP, MQTT, STOMP sẵn có.</li>
              </ul>
            </div>
            <div>
              <h4>NATS</h4>
              <ul className="plain">
                <li>Giao tiếp giữa microservice cần cực nhanh, request–reply.</li>
                <li>Edge và IoT, cụm phân tán nhiều vùng.</li>
                <li>Muốn một hệ thống gọn thay cho broker + KV đơn giản.</li>
              </ul>
            </div>
            <div>
              <h4>SQS</h4>
              <ul className="plain">
                <li>Đã chạy trên AWS, muốn hàng đợi việc không phải vận hành.</li>
                <li>Tách việc nặng khỏi request, kết hợp Lambda.</li>
                <li>Lưu lượng thất thường, không muốn đoán dung lượng.</li>
              </ul>
            </div>
          </div>
          <div className="note tip">Các hệ thống không loại trừ nhau. Một kiến trúc phổ biến: Kafka làm xương sống sự kiện, RabbitMQ hoặc NATS cho giao tiếp và hàng đợi giữa các service.</div>
        </section>
        <section>
          <h2>Thuật ngữ tương đương</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Kafka</th>
                  <th>RabbitMQ</th>
                  <th>NATS</th>
                  <th>SQS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Topic</td>
                  <td>Exchange + queue</td>
                  <td>Subject (+ Stream)</td>
                  <td>Queue (+ SNS topic)</td>
                </tr>
                <tr>
                  <td>Partition</td>
                  <td>Queue</td>
                  <td>Stream (hoặc subject trong stream)</td>
                  <td>Queue (một queue là một hàng đợi)</td>
                </tr>
                <tr>
                  <td>Offset</td>
                  <td>Không có (trừ stream queue)</td>
                  <td>Stream sequence</td>
                  <td>Không có (xóa sau khi xử lý)</td>
                </tr>
                <tr>
                  <td>Consumer group</td>
                  <td>Consumers trên cùng queue</td>
                  <td>Queue group / pull consumer chung</td>
                  <td>Nhiều consumer trên cùng queue</td>
                </tr>
                <tr>
                  <td>Commit offset</td>
                  <td>basic.ack</td>
                  <td>Ack</td>
                  <td>DeleteMessage</td>
                </tr>
                <tr>
                  <td>acks=all</td>
                  <td>Confirms + quorum queue</td>
                  <td>PubAck + replicas 3</td>
                  <td>Gửi thành công khi đã lưu nhiều AZ</td>
                </tr>
                <tr>
                  <td>Idempotent producer</td>
                  <td>Không có</td>
                  <td>Nats-Msg-Id + duplicate_window</td>
                  <td>FIFO: MessageDeduplicationId</td>
                </tr>
                <tr>
                  <td>Log compaction</td>
                  <td>Không có</td>
                  <td>max_msgs_per_subject = 1 (KV)</td>
                  <td>Không có</td>
                </tr>
                <tr>
                  <td>MirrorMaker 2</td>
                  <td>Federation / Shovel</td>
                  <td>Mirror / Source, gateway</td>
                  <td>Không có (dịch vụ managed)</td>
                </tr>
                <tr>
                  <td>KRaft</td>
                  <td>Khepri</td>
                  <td>JetStream meta group (Raft)</td>
                  <td>Không cần, AWS lo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
