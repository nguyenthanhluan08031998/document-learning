import { Code } from "@/components/Code";
import { Box, Label, Markers } from "@/components/Svg";

// Fan-out: one SNS topic feeds several SQS queues, each read by its own consumer: [queue, consumer, y]
const FANOUT: [string, string, number][] = [
  ["inventory-queue", "inventory-svc", 24],
  ["email-queue", "notification-svc", 110],
  ["analytics-queue", "analytics-svc", 196],
];

export default function SqsPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục SQS">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#sqs-what"><span>01</span>SQS là gì</a></li>
          <li><a href="#sqs-types"><span>02</span>Standard và FIFO</a></li>
          <li><a href="#sqs-life"><span>03</span>Vòng đời một message</a></li>
          <li><a href="#sqs-settings"><span>04</span>Các thiết lập quan trọng</a></li>
          <li><a href="#sqs-code"><span>05</span>Code và cấu hình</a></li>
          <li><a href="#sqs-fanout"><span>06</span>SNS fan-out và Lambda</a></li>
          <li><a href="#sqs-pick"><span>07</span>Lưu ý và khi nào chọn</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">sqs · ghi chú học tập</div>
          <h1>Sổ tay SQS: hàng đợi managed của AWS</h1>
          <p className="lede"><b>SQS</b> (Simple Queue Service) là hàng đợi tin nhắn do AWS (Amazon Web Services) vận hành hoàn toàn: không có server để cài, không có cluster để nâng cấp. Producer gửi message vào queue, consumer lấy ra xử lý rồi <b>xóa</b>. Đơn giản, bền và tự co giãn, đổi lại không giữ message để đọc lại như Kafka.</p>
          <div className="tape" aria-hidden="true">
            <div>Send</div>
            <div className="hw">Receive</div>
            <div>Visibility</div>
            <div>Delete</div>
            <div>DLQ</div>
          </div>
        </header>

        <section id="sqs-what">
          <h2><span className="n">01</span>SQS là gì</h2>
          <p>Mỗi queue là một hàng đợi có tên. Nhiều consumer cùng đọc một queue thì <b>chia việc cho nhau</b>: mỗi message chỉ một consumer nhận tại một thời điểm. Không có exchange, topic hay partition để cấu hình.</p>
          <ul className="plain">
            <li><b>Managed hoàn toàn:</b> AWS lo nhân bản qua nhiều AZ (Availability Zone), co giãn và bảo trì.</li>
            <li><b>Trả theo request:</b> không tốn tiền khi queue rỗng, không phải đoán dung lượng trước.</li>
            <li><b>Pull:</b> consumer chủ động gọi <code>ReceiveMessage</code>, không có kết nối giữ mở như AMQP (Advanced Message Queuing Protocol) của RabbitMQ.</li>
            <li><b>Xóa sau khi xử lý:</b> message không ở lại để đọc lại. Muốn nhiều hệ thống cùng nhận một sự kiện thì dùng SNS (Simple Notification Service) phía trước.</li>
          </ul>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 270" role="img" aria-label="Producer gửi sự kiện vào SNS topic; SNS chuyển bản sao tới ba queue SQS là inventory, email và analytics; mỗi queue có một consumer riêng đọc ra và xóa message">
                <Markers id="sq" />
                <Box x={16} y={95} w={130} h={70} title="Producer" sub="order-svc" />
                <path className="s-ln" d="M146 130 H196" markerEnd="url(#sqa)" />
                <Box x={198} y={95} w={150} h={70} title="SNS topic" sub="order-events" cls="s-hl" />
                {FANOUT.map(([q, c, y]) => (
                  <g key={q}>
                    <path className="s-ln" d={`M348 130 C 380 130, 380 ${y + 25}, 410 ${y + 25}`} markerEnd="url(#sqa)" />
                    <Box x={412} y={y} w={190} h={50} title={q} sub="SQS queue" />
                    <path className="s-ln" d={`M602 ${y + 25} H652`} markerEnd="url(#sqa)" />
                    <Box x={654} y={y} w={190} h={50} title={c} sub="Receive → xử lý → Delete" />
                  </g>
                ))}
                <Label x={16} y={258}>Mỗi queue nhận một bản sao của sự kiện; consumer của queue nào chỉ đọc queue đó</Label>
              </svg>
            </div>
            <figcaption>SNS phát một sự kiện, mỗi queue SQS giữ riêng một bản sao. Consumer trong cùng một queue chia việc cho nhau; các queue khác nhau độc lập nhau.</figcaption>
          </figure>
        </section>

        <section id="sqs-types">
          <h2><span className="n">02</span>Standard và FIFO</h2>
          <p>Có hai loại queue, chọn lúc tạo và không đổi được sau đó.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr><th></th><th>Standard</th><th>FIFO (First In, First Out)</th></tr>
              </thead>
              <tbody>
                <tr><td><b>Thứ tự</b></td><td>Cố gắng giữ thứ tự, không đảm bảo</td><td>Đúng thứ tự trong cùng một <code>MessageGroupId</code></td></tr>
                <tr><td><b>Trùng lặp</b></td><td>At-least-once: thỉnh thoảng giao hai lần</td><td>Exactly-once xử lý: loại trùng theo <code>MessageDeduplicationId</code> trong 5 phút</td></tr>
                <tr><td><b>Thông lượng</b></td><td>Gần như không giới hạn</td><td>Có giới hạn theo từng nhóm; bật chế độ high throughput để tăng</td></tr>
                <tr><td><b>Tên queue</b></td><td>Tùy ý</td><td>Phải kết thúc bằng <code>.fifo</code></td></tr>
                <tr><td><b>Khi dùng</b></td><td>Việc độc lập: gửi email, xử lý ảnh, đồng bộ dữ liệu</td><td>Thứ tự quan trọng: các thay đổi của cùng một đơn hàng, giao dịch tài khoản</td></tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Mặc định dùng Standard</b> và viết consumer idempotent (xử lý hai lần ra cùng kết quả). Chỉ chuyển sang FIFO khi thật sự cần thứ tự, vì FIFO chậm hơn và đắt hơn.</div>
        </section>

        <section id="sqs-life">
          <h2><span className="n">03</span>Vòng đời một message</h2>
          <ol className="steps">
            <li><div><b>Send</b><div className="d">Producer gọi <code>SendMessage</code> (hoặc <code>SendMessageBatch</code>, tối đa 10 message mỗi lần). SQS lưu message trên nhiều AZ rồi mới trả thành công.</div></div></li>
            <li><div><b>Receive</b><div className="d">Consumer gọi <code>ReceiveMessage</code> (lấy tối đa 10 message). Message không bị xóa mà chuyển sang trạng thái <b>ẩn</b> trong thời gian <b>visibility timeout</b>, nên consumer khác không thấy.</div></div></li>
            <li><div><b>Xử lý rồi Delete</b><div className="d">Xử lý xong, consumer gọi <code>DeleteMessage</code> với <code>ReceiptHandle</code>. Message biến mất vĩnh viễn.</div></div></li>
            <li><div><b>Nếu quên Delete hoặc xử lý lỗi</b><div className="d">Hết visibility timeout, message <b>hiện lại</b> và consumer khác nhận được. Mỗi lần nhận, <code>ApproximateReceiveCount</code> tăng thêm một.</div></div></li>
            <li><div><b>Vào DLQ</b><div className="d">Khi số lần nhận vượt <code>maxReceiveCount</code>, SQS chuyển message sang <b>DLQ</b> (Dead Letter Queue) để bạn kiểm tra thay vì quay vòng mãi.</div></div></li>
          </ol>
          <div className="note"><b>Bẫy hay gặp:</b> xử lý lâu hơn visibility timeout thì message hiện lại khi bạn chưa xong, và bị xử lý hai lần. Đặt timeout lớn hơn thời gian xử lý tối đa, hoặc gọi <code>ChangeMessageVisibility</code> để gia hạn.</div>
        </section>

        <section id="sqs-settings">
          <h2><span className="n">04</span>Các thiết lập quan trọng</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Thiết lập</th><th>Mặc định</th><th>Ý nghĩa và lời khuyên</th></tr>
              </thead>
              <tbody>
                <tr><td><code>VisibilityTimeout</code></td><td>30 giây (tối đa 12 giờ)</td><td>Thời gian message ẩn sau khi nhận. Đặt lớn hơn thời gian xử lý lâu nhất</td></tr>
                <tr><td><code>ReceiveMessageWaitTimeSeconds</code></td><td>0 (short polling)</td><td>Đặt <b>20</b> để bật <b>long polling</b>: đợi tới khi có message, giảm số request rỗng và tiền</td></tr>
                <tr><td><code>MessageRetentionPeriod</code></td><td>4 ngày (1 phút tới 14 ngày)</td><td>Message chưa được xử lý quá thời gian này sẽ bị xóa</td></tr>
                <tr><td><code>DelaySeconds</code></td><td>0 (tối đa 15 phút)</td><td>Hoãn giao message mới, dùng cho việc cần chạy trễ</td></tr>
                <tr><td>Kích thước message</td><td>Tối đa 1 MiB</td><td>Lớn hơn thì lưu file vào S3 rồi gửi đường dẫn trong message</td></tr>
                <tr><td><code>RedrivePolicy</code></td><td>Không có</td><td>Trỏ tới DLQ và đặt <code>maxReceiveCount</code> (thường 3 tới 5)</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="sqs-code">
          <h2><span className="n">05</span>Code và cấu hình</h2>
          <p>Tạo queue kèm DLQ bằng Terraform:</p>
          <Code lang="hcl">{`resource "aws_sqs_queue" "orders_dlq" {
  name                      = "orders-dlq"
  message_retention_seconds = 1209600          # 14 ngày để kịp điều tra
}

resource "aws_sqs_queue" "orders" {
  name                       = "orders"
  visibility_timeout_seconds = 60              # lớn hơn thời gian xử lý lâu nhất
  receive_wait_time_seconds  = 20              # bật long polling
  message_retention_seconds  = 345600          # 4 ngày

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.orders_dlq.arn
    maxReceiveCount     = 5                    # nhận quá 5 lần thì chuyển vào DLQ
  })
}`}</Code>
          <p>Gửi và nhận bằng AWS SDK (Software Development Kit) cho JavaScript v3:</p>
          <Code lang="ts">{`import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: "ap-southeast-1" });
const QueueUrl = process.env.ORDERS_QUEUE_URL!;

// Producer
await sqs.send(new SendMessageCommand({
  QueueUrl,
  MessageBody: JSON.stringify({ orderId: "o-123", type: "OrderCreated" }),
}));

// Consumer: vòng lặp nhận, xử lý, xóa
for (;;) {
  const { Messages = [] } = await sqs.send(new ReceiveMessageCommand({
    QueueUrl,
    MaxNumberOfMessages: 10,           // tối đa 10 message mỗi lần
    WaitTimeSeconds: 20,               // long polling
  }));

  await Promise.allSettled(Messages.map(async (m) => {
    await handle(JSON.parse(m.Body!)); // nếu ném lỗi thì KHÔNG xóa, message sẽ hiện lại
    await sqs.send(new DeleteMessageCommand({ QueueUrl, ReceiptHandle: m.ReceiptHandle! }));
  }));
}`}</Code>
          <p>Với FIFO, mỗi message cần thêm nhóm và mã chống trùng:</p>
          <Code lang="ts">{`await sqs.send(new SendMessageCommand({
  QueueUrl: process.env.ORDERS_FIFO_URL!,         // tên queue kết thúc bằng .fifo
  MessageBody: JSON.stringify({ orderId: "o-123", status: "paid" }),
  MessageGroupId: "o-123",                        // cùng nhóm thì đúng thứ tự, khác nhóm chạy song song
  MessageDeduplicationId: "o-123-paid",           // gửi lại trong 5 phút sẽ bị bỏ qua
}));`}</Code>
        </section>

        <section id="sqs-fanout">
          <h2><span className="n">06</span>SNS fan-out và Lambda</h2>
          <p>SQS không có pub/sub: một message chỉ tới một consumer. Muốn nhiều hệ thống cùng nhận một sự kiện, đặt <b>SNS topic</b> phía trước và đăng ký nhiều queue SQS vào topic đó (như sơ đồ ở đầu trang). Mỗi hệ thống có queue riêng nên chậm hay lỗi cũng không ảnh hưởng nhau.</p>
          <Code lang="hcl">{`resource "aws_sns_topic" "order_events" { name = "order-events" }

resource "aws_sns_topic_subscription" "inventory" {
  topic_arn            = aws_sns_topic.order_events.arn
  protocol             = "sqs"
  endpoint             = aws_sqs_queue.inventory.arn
  raw_message_delivery = true                  # gửi nguyên nội dung, không bọc thêm lớp JSON của SNS
}
# Queue cần policy cho phép SNS gửi vào (aws_sqs_queue_policy)`}</Code>
          <p><b>Lambda</b> đọc SQS không cần viết vòng lặp: AWS tự gọi hàm của bạn theo lô và tự thêm bớt số instance theo độ dài queue.</p>
          <Code lang="ts">{`// Lambda handler: trả về những message lỗi để chỉ chúng được thử lại
export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const batchItemFailures: { itemIdentifier: string }[] = [];
  for (const record of event.Records) {
    try {
      await handle(JSON.parse(record.body));
    } catch {
      batchItemFailures.push({ itemIdentifier: record.messageId });   // chỉ message này hiện lại
    }
  }
  return { batchItemFailures };                // cần bật ReportBatchItemFailures ở event source mapping
};`}</Code>
        </section>

        <section id="sqs-pick">
          <h2><span className="n">07</span>Lưu ý và khi nào chọn</h2>
          <div className="pp">
            <div><span className="pl">Nên dùng SQS</span>Đã chạy trên AWS và muốn hàng đợi việc không phải vận hành; lưu lượng thất thường; tách việc nặng khỏi request (gửi email, xử lý ảnh, đồng bộ); kết hợp với Lambda.</div>
            <div className="warnc"><span className="pl">Cân nhắc cái khác</span>Cần đọc lại sự kiện cũ hoặc nhiều hệ thống đọc theo tốc độ riêng (Kafka); định tuyến phức tạp, priority (RabbitMQ); độ trễ micro giây, request–reply (NATS); không dùng AWS.</div>
          </div>
          <ul className="plain">
            <li><b>Luôn viết consumer idempotent</b> với queue Standard: cùng một message có thể tới hai lần.</li>
            <li><b>Luôn gắn DLQ</b> và đặt cảnh báo khi DLQ có message, nếu không message lỗi sẽ im lặng quay vòng rồi mất khi hết retention.</li>
            <li><b>Dùng long polling</b> (<code>WaitTimeSeconds=20</code>) để giảm tiền và độ trễ.</li>
            <li><b>Quyền truy cập</b> qua IAM (Identity and Access Management): producer chỉ có <code>sqs:SendMessage</code>, consumer có <code>sqs:ReceiveMessage</code> và <code>sqs:DeleteMessage</code>.</li>
            <li><b>Mã hóa</b> bằng SSE (Server-Side Encryption) với khóa của SQS hoặc KMS (Key Management Service).</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
