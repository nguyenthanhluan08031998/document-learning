export default function ComparePage() {
  return (
    <div className="wrap single">
      <main>
        <header className="hero">
          <div className="eyebrow">kafka · rabbitmq · nats</div>
          <h1>How they differ and when to choose which</h1>
          <p className="lede"><b>Kafka</b> is a distributed commit log: it stores messages in order and consumers read by offset. <b>RabbitMQ</b> is a message broker: it routes messages into queues and deletes them once processed. <b>NATS</b> is an ultra-light subject-based messaging system, with JetStream added when storage is needed.</p>
        </header>
        <section>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Criterion</th>
                  <th>Kafka</th>
                  <th>RabbitMQ</th>
                  <th>NATS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Model</b></td>
                  <td>Log chia partition</td>
                  <td>Exchange → queue</td>
                  <td>Subject pub/sub; JetStream adds streams</td>
                </tr>
                <tr>
                  <td><b>Message storage</b></td>
                  <td>Always kept until retention ends</td>
                  <td>Kept in the queue until acked</td>
                  <td>Core: none. JetStream: yes</td>
                </tr>
                <tr>
                  <td><b>Replay</b></td>
                  <td>Yes, by offset</td>
                  <td>No (except stream queues)</td>
                  <td>Yes with JetStream, by sequence</td>
                </tr>
                <tr>
                  <td><b>Delivery</b></td>
                  <td>Pull</td>
                  <td>Push + prefetch</td>
                  <td>Core: push. JetStream: pull or push</td>
                </tr>
                <tr>
                  <td><b>Routing</b></td>
                  <td>Topic, partition theo key</td>
                  <td>direct, fanout, topic, headers</td>
                  <td>Subjects with <code>*</code> and <code>{">"}</code> wildcards</td>
                </tr>
                <tr>
                  <td><b>Work sharing</b></td>
                  <td>Consumer groups, at most one consumer per partition</td>
                  <td>Many consumers on one queue</td>
                  <td>Queue groups, no declaration needed</td>
                </tr>
                <tr>
                  <td><b>Request–reply</b></td>
                  <td>Not built in</td>
                  <td>Yes, via reply_to</td>
                  <td>Built in, very concise</td>
                </tr>
                <tr>
                  <td><b>Delivery guarantee</b></td>
                  <td>At-least-once, exactly-once with transactions</td>
                  <td>At-least-once</td>
                  <td>Core: at-most-once. JetStream: at-least-once, exactly-once with Msg-Id + double ack</td>
                </tr>
                <tr>
                  <td><b>Replication</b></td>
                  <td>Replica + ISR</td>
                  <td>Quorum queue (Raft)</td>
                  <td>Stream replicas (Raft)</td>
                </tr>
                <tr>
                  <td><b>Latency</b></td>
                  <td>Low, optimized for throughput</td>
                  <td>Low</td>
                  <td>Very low (microseconds with core)</td>
                </tr>
                <tr>
                  <td><b>Operations</b></td>
                  <td>Heaviest, JVM</td>
                  <td>Medium, Erlang</td>
                  <td>Lightest, a single Go binary</td>
                </tr>
                <tr>
                  <td><b>Extras</b></td>
                  <td>Kafka Streams, Connect</td>
                  <td>TTL, DLX, priority, plugin</td>
                  <td>KV store, Object store, leaf node</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2>When to choose</h2>
          <div className="cmp three">
            <div>
              <h4>Kafka</h4>
              <ul className="plain">
                <li>Very large event streams: logs, clickstreams, CDC.</li>
                <li>Long retention, many systems replaying at their own pace.</li>
                <li>Stream processing, event sourcing.</li>
              </ul>
            </div>
            <div>
              <h4>RabbitMQ</h4>
              <ul className="plain">
                <li>Work queues: emails, PDFs, image processing.</li>
                <li>Complex routing, priorities, delays, retries.</li>
                <li>An existing AMQP, MQTT, STOMP ecosystem.</li>
              </ul>
            </div>
            <div>
              <h4>NATS</h4>
              <ul className="plain">
                <li>Very fast microservice communication, request–reply.</li>
                <li>Edge and IoT, clusters spread over many regions.</li>
                <li>One compact system replacing a broker + a simple KV store.</li>
              </ul>
            </div>
          </div>
          <div className="note tip">The three are not mutually exclusive. A common architecture: Kafka as the event backbone, RabbitMQ or NATS for communication and work queues between services.</div>
        </section>
        <section>
          <h2>Equivalent terms</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Kafka</th>
                  <th>RabbitMQ</th>
                  <th>NATS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Topic</td>
                  <td>Exchange + queue</td>
                  <td>Subject (+ Stream)</td>
                </tr>
                <tr>
                  <td>Partition</td>
                  <td>Queue</td>
                  <td>Stream (or a subject within a stream)</td>
                </tr>
                <tr>
                  <td>Offset</td>
                  <td>None (except stream queues)</td>
                  <td>Stream sequence</td>
                </tr>
                <tr>
                  <td>Consumer group</td>
                  <td>Consumers on the same queue</td>
                  <td>Queue group / pull consumer chung</td>
                </tr>
                <tr>
                  <td>Commit offset</td>
                  <td>basic.ack</td>
                  <td>Ack</td>
                </tr>
                <tr>
                  <td>acks=all</td>
                  <td>Confirms + quorum queue</td>
                  <td>PubAck + replicas 3</td>
                </tr>
                <tr>
                  <td>Idempotent producer</td>
                  <td>None</td>
                  <td>Nats-Msg-Id + duplicate_window</td>
                </tr>
                <tr>
                  <td>Log compaction</td>
                  <td>None</td>
                  <td>max_msgs_per_subject = 1 (KV)</td>
                </tr>
                <tr>
                  <td>MirrorMaker 2</td>
                  <td>Federation / Shovel</td>
                  <td>Mirror / Source, gateway</td>
                </tr>
                <tr>
                  <td>KRaft</td>
                  <td>Khepri</td>
                  <td>JetStream meta group (Raft)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
