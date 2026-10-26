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
      <nav className="toc" aria-label="SQS contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#sqs-what"><span>01</span>What SQS is</a></li>
          <li><a href="#sqs-types"><span>02</span>Standard and FIFO</a></li>
          <li><a href="#sqs-life"><span>03</span>Life of a message</a></li>
          <li><a href="#sqs-settings"><span>04</span>Key settings</a></li>
          <li><a href="#sqs-code"><span>05</span>Code and configuration</a></li>
          <li><a href="#sqs-fanout"><span>06</span>SNS fan-out and Lambda</a></li>
          <li><a href="#sqs-pick"><span>07</span>Notes and when to choose it</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">sqs · study notes</div>
          <h1>SQS notebook: the managed queue from AWS</h1>
          <p className="lede"><b>SQS</b> (Simple Queue Service) is a message queue fully operated by AWS (Amazon Web Services): no servers to install, no cluster to upgrade. Producers send messages to a queue, consumers take them out, process them and <b>delete</b> them. It is simple, durable and scales on its own, but unlike Kafka it does not keep messages around to be read again.</p>
          <div className="tape" aria-hidden="true">
            <div>Send</div>
            <div className="hw">Receive</div>
            <div>Visibility</div>
            <div>Delete</div>
            <div>DLQ</div>
          </div>
        </header>

        <section id="sqs-what">
          <h2><span className="n">01</span>What SQS is</h2>
          <p>Each queue is a named line of messages. Several consumers reading one queue <b>share the work</b>: at any moment a message goes to only one consumer. There are no exchanges, topics or partitions to configure.</p>
          <ul className="plain">
            <li><b>Fully managed:</b> AWS handles replication across AZs (Availability Zones), scaling and maintenance.</li>
            <li><b>Pay per request:</b> nothing is charged while the queue is empty and there is no capacity to guess in advance.</li>
            <li><b>Pull:</b> consumers call <code>ReceiveMessage</code> themselves; there is no open connection like the AMQP (Advanced Message Queuing Protocol) one in RabbitMQ.</li>
            <li><b>Deleted after processing:</b> a message does not stay for replay. To let several systems receive the same event, put SNS (Simple Notification Service) in front.</li>
          </ul>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 270" role="img" aria-label="A producer sends an event to an SNS topic; SNS delivers a copy to three SQS queues, inventory, email and analytics; each queue has its own consumer that reads and deletes messages">
                <Markers id="sq" />
                <Box x={16} y={95} w={130} h={70} title="Producer" sub="order-svc" />
                <path className="s-ln" d="M146 130 H196" markerEnd="url(#sqa)" />
                <Box x={198} y={95} w={150} h={70} title="SNS topic" sub="order-events" cls="s-hl" />
                {FANOUT.map(([q, c, y]) => (
                  <g key={q}>
                    <path className="s-ln" d={`M348 130 C 380 130, 380 ${y + 25}, 410 ${y + 25}`} markerEnd="url(#sqa)" />
                    <Box x={412} y={y} w={190} h={50} title={q} sub="SQS queue" />
                    <path className="s-ln" d={`M602 ${y + 25} H652`} markerEnd="url(#sqa)" />
                    <Box x={654} y={y} w={190} h={50} title={c} sub="Receive → process → Delete" />
                  </g>
                ))}
                <Label x={16} y={258}>Each queue gets its own copy of the event; a queue's consumer only reads that queue</Label>
              </svg>
            </div>
            <figcaption>SNS publishes one event and each SQS queue keeps its own copy. Consumers on the same queue share the work; different queues are independent.</figcaption>
          </figure>
        </section>

        <section id="sqs-types">
          <h2><span className="n">02</span>Standard and FIFO</h2>
          <p>There are two queue types. You pick one at creation and cannot change it later.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr><th></th><th>Standard</th><th>FIFO (First In, First Out)</th></tr>
              </thead>
              <tbody>
                <tr><td><b>Ordering</b></td><td>Best effort, not guaranteed</td><td>Strictly ordered within one <code>MessageGroupId</code></td></tr>
                <tr><td><b>Duplicates</b></td><td>At-least-once: occasionally delivered twice</td><td>Exactly-once processing: duplicates dropped by <code>MessageDeduplicationId</code> for 5 minutes</td></tr>
                <tr><td><b>Throughput</b></td><td>Almost unlimited</td><td>Limited per group; enable high throughput mode to raise it</td></tr>
                <tr><td><b>Queue name</b></td><td>Anything</td><td>Must end with <code>.fifo</code></td></tr>
                <tr><td><b>Use for</b></td><td>Independent jobs: sending email, image processing, data sync</td><td>Order matters: changes to the same order, account transactions</td></tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Default to Standard</b> and write idempotent consumers (processing twice gives the same result). Move to FIFO only when you truly need ordering, because it is slower and costs more.</div>
        </section>

        <section id="sqs-life">
          <h2><span className="n">03</span>Life of a message</h2>
          <ol className="steps">
            <li><div><b>Send</b><div className="d">The producer calls <code>SendMessage</code> (or <code>SendMessageBatch</code>, up to 10 messages at once). SQS stores the message across several AZs before reporting success.</div></div></li>
            <li><div><b>Receive</b><div className="d">A consumer calls <code>ReceiveMessage</code> (up to 10 messages). The message is not deleted; it becomes <b>invisible</b> for the <b>visibility timeout</b>, so other consumers do not see it.</div></div></li>
            <li><div><b>Process, then Delete</b><div className="d">After processing, the consumer calls <code>DeleteMessage</code> with the <code>ReceiptHandle</code>. The message is gone for good.</div></div></li>
            <li><div><b>If Delete is skipped or processing fails</b><div className="d">When the visibility timeout ends the message <b>reappears</b> and another consumer can take it. Each receive increases <code>ApproximateReceiveCount</code> by one.</div></div></li>
            <li><div><b>Into the DLQ</b><div className="d">Once the receive count passes <code>maxReceiveCount</code>, SQS moves the message to the <b>DLQ</b> (Dead Letter Queue) for inspection instead of cycling forever.</div></div></li>
          </ol>
          <div className="note"><b>Common trap:</b> if processing takes longer than the visibility timeout, the message reappears before you finish and is processed twice. Set the timeout above your longest processing time, or call <code>ChangeMessageVisibility</code> to extend it.</div>
        </section>

        <section id="sqs-settings">
          <h2><span className="n">04</span>Key settings</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Setting</th><th>Default</th><th>Meaning and advice</th></tr>
              </thead>
              <tbody>
                <tr><td><code>VisibilityTimeout</code></td><td>30 seconds (max 12 hours)</td><td>How long a message stays hidden after being received. Set it above your longest processing time</td></tr>
                <tr><td><code>ReceiveMessageWaitTimeSeconds</code></td><td>0 (short polling)</td><td>Set <b>20</b> for <b>long polling</b>: wait until a message arrives, fewer empty requests and lower cost</td></tr>
                <tr><td><code>MessageRetentionPeriod</code></td><td>4 days (1 minute to 14 days)</td><td>Messages not processed within this time are deleted</td></tr>
                <tr><td><code>DelaySeconds</code></td><td>0 (max 15 minutes)</td><td>Postpones delivery of new messages, for jobs that should run later</td></tr>
                <tr><td>Message size</td><td>Up to 1 MiB</td><td>For larger payloads store the file in S3 and send its path in the message</td></tr>
                <tr><td><code>RedrivePolicy</code></td><td>None</td><td>Points to the DLQ and sets <code>maxReceiveCount</code> (usually 3 to 5)</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="sqs-code">
          <h2><span className="n">05</span>Code and configuration</h2>
          <p>Create a queue with its DLQ using Terraform:</p>
          <Code lang="hcl">{`resource "aws_sqs_queue" "orders_dlq" {
  name                      = "orders-dlq"
  message_retention_seconds = 1209600          # 14 days, enough time to investigate
}

resource "aws_sqs_queue" "orders" {
  name                       = "orders"
  visibility_timeout_seconds = 60              # above the longest processing time
  receive_wait_time_seconds  = 20              # enable long polling
  message_retention_seconds  = 345600          # 4 days

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.orders_dlq.arn
    maxReceiveCount     = 5                    # after 5 receives the message goes to the DLQ
  })
}`}</Code>
          <p>Send and receive with the AWS SDK (Software Development Kit) for JavaScript v3:</p>
          <Code lang="ts">{`import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: "ap-southeast-1" });
const QueueUrl = process.env.ORDERS_QUEUE_URL!;

// Producer
await sqs.send(new SendMessageCommand({
  QueueUrl,
  MessageBody: JSON.stringify({ orderId: "o-123", type: "OrderCreated" }),
}));

// Consumer: receive, process, delete in a loop
for (;;) {
  const { Messages = [] } = await sqs.send(new ReceiveMessageCommand({
    QueueUrl,
    MaxNumberOfMessages: 10,           // up to 10 messages per call
    WaitTimeSeconds: 20,               // long polling
  }));

  await Promise.allSettled(Messages.map(async (m) => {
    await handle(JSON.parse(m.Body!)); // if this throws we do NOT delete, so the message reappears
    await sqs.send(new DeleteMessageCommand({ QueueUrl, ReceiptHandle: m.ReceiptHandle! }));
  }));
}`}</Code>
          <p>With FIFO each message also needs a group and a deduplication id:</p>
          <Code lang="ts">{`await sqs.send(new SendMessageCommand({
  QueueUrl: process.env.ORDERS_FIFO_URL!,         // queue name ends with .fifo
  MessageBody: JSON.stringify({ orderId: "o-123", status: "paid" }),
  MessageGroupId: "o-123",                        // same group stays in order, different groups run in parallel
  MessageDeduplicationId: "o-123-paid",           // a resend within 5 minutes is ignored
}));`}</Code>
        </section>

        <section id="sqs-fanout">
          <h2><span className="n">06</span>SNS fan-out and Lambda</h2>
          <p>SQS has no pub/sub: a message reaches only one consumer. To let several systems receive the same event, put an <b>SNS topic</b> in front and subscribe several SQS queues to it (as in the diagram at the top). Each system has its own queue, so a slow or failing one does not affect the others.</p>
          <Code lang="hcl">{`resource "aws_sns_topic" "order_events" { name = "order-events" }

resource "aws_sns_topic_subscription" "inventory" {
  topic_arn            = aws_sns_topic.order_events.arn
  protocol             = "sqs"
  endpoint             = aws_sqs_queue.inventory.arn
  raw_message_delivery = true                  # deliver the payload as is, without SNS's JSON wrapper
}
# The queue also needs a policy that lets SNS send to it (aws_sqs_queue_policy)`}</Code>
          <p><b>Lambda</b> can read SQS without a polling loop: AWS calls your function with batches and adds or removes instances based on queue length.</p>
          <Code lang="ts">{`// Lambda handler: report the failed messages so only they are retried
export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const batchItemFailures: { itemIdentifier: string }[] = [];
  for (const record of event.Records) {
    try {
      await handle(JSON.parse(record.body));
    } catch {
      batchItemFailures.push({ itemIdentifier: record.messageId });   // only this message reappears
    }
  }
  return { batchItemFailures };                // requires ReportBatchItemFailures on the event source mapping
};`}</Code>
        </section>

        <section id="sqs-pick">
          <h2><span className="n">07</span>Notes and when to choose it</h2>
          <div className="pp">
            <div><span className="pl">Use SQS when</span>You already run on AWS and want a work queue with nothing to operate; traffic is spiky; you want to move heavy work out of the request (email, images, sync); you combine it with Lambda.</div>
            <div className="warnc"><span className="pl">Consider something else</span>You need to replay old events or let several systems read at their own pace (Kafka); complex routing or priorities (RabbitMQ); microsecond latency or request–reply (NATS); you are not on AWS.</div>
          </div>
          <ul className="plain">
            <li><b>Always write idempotent consumers</b> with Standard queues: the same message can arrive twice.</li>
            <li><b>Always attach a DLQ</b> and alert when it has messages, otherwise failing messages silently cycle and then vanish when retention ends.</li>
            <li><b>Use long polling</b> (<code>WaitTimeSeconds=20</code>) to cut cost and latency.</li>
            <li><b>Access control</b> through IAM (Identity and Access Management): producers get only <code>sqs:SendMessage</code>, consumers get <code>sqs:ReceiveMessage</code> and <code>sqs:DeleteMessage</code>.</li>
            <li><b>Encryption</b> with SSE (Server-Side Encryption) using an SQS-managed key or KMS (Key Management Service).</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
