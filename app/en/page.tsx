import { AreaCards } from "@/components/AreaCards";
import Link from "next/link";
import type { Metadata } from "next";
import { SystemDesignEn as SystemDesign } from "@/components/SystemDesign.en";

export const metadata: Metadata = { title: { absolute: "Programming notebook" } };

export default function HomePage() {
  return (
    <div className="wrap single">
      <main>
        <header className="hero">
          <div className="eyebrow">programming notebook · overview</div>
          <h1>Programming notebook</h1>
          <p className="lede">Study notes in five areas: Frontend, Backend, Database, CI/CD and Git. Every example revolves around one online <b>selling and payments</b> system, shown below.</p>
        </header>
        <section>
          <h2>The example system: an e-commerce marketplace</h2>
          <figure className="fig">
            <div className="scroll">
              <SystemDesign />
            </div>
            <figcaption>A layered system design, sized for a 10-million-user flash sale. Requests flow top to bottom and each layer absorbs part of the load; work that can wait goes through Kafka to workers.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Layer</th>
                  <th>Component</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>1 · Client</b></td><td>Web, mobile, admin, seller center</td><td>A UI for each group of users</td></tr>
                <tr><td><b>2 · Edge</b></td><td>GeoDNS, CDN, WAF, load balancer</td><td>Serve static content, block bots, spread load before it enters the system</td></tr>
                <tr><td><b>3 · Gateway</b></td><td>API Gateway / BFF, waiting room</td><td>A single entry: authentication, rate limiting, routing; queueing when overloaded</td></tr>
                <tr><td><b>4 · Service</b></td><td>user, catalog, cart, order, payment</td><td>Business logic; stateless, so it replicates with load</td></tr>
                <tr><td><b>5 · Cache</b></td><td>Redis Cluster</td><td>Fast reads, cart storage, flash sale stock decrements</td></tr>
                <tr><td><b>6 · Data</b></td><td>PgBouncer, one DB per service, shards, replicas</td><td>Durable storage; writes split by shard, reads sent to replicas</td></tr>
                <tr><td><b>7 · Messaging</b></td><td>Kafka</td><td>Moves events between services and holds them when receivers are slow</td></tr>
                <tr><td><b>8 · Worker</b></td><td>notification, search, inventory, shipping</td><td>Background processing from events, scaled by partition count</td></tr>
                <tr><td><b>Cross-cutting</b></td><td>Observability, CI/CD, config, secrets</td><td>Used by every layer</td></tr>
                <tr><td><b>External</b></td><td>Payment gateways, shipping carriers</td><td>Third-party services called via APIs and webhooks</td></tr>
              </tbody>
            </table>
          </div>
          <h3>Flow of one order</h3>
          <ol className="steps">
            <li><div><b>Place the order</b><div className="d">Web or mobile calls the gateway; <code>order-svc</code> creates the order as <code>pending</code> and calls <code>payment-svc</code>.</div></div></li>
            <li><div><b>Pay</b><div className="d"><code>payment-svc</code> sends the customer to VNPay, MoMo or Stripe; the result comes back via webhook.</div></div></li>
            <li><div><b>Publish the event</b><div className="d">Once paid, <code>PaymentSucceeded</code> goes to Kafka; <code>order-svc</code> moves the order to <code>paid</code>.</div></div></li>
            <li><div><b>Follow-up work</b><div className="d"><code>inventory-svc</code> decrements stock, <code>shipping-svc</code> creates a shipment with GHN, <code>notification-svc</code> sends the confirmation email. Each retries on its own failures without slowing the customer down.</div></div></li>
          </ol>
          <div className="note"><b>Own database or shared?</b> One database per service is the default: schema changes affect nobody else. <code>inventory</code> and <code>shipping</code> sharing <code>warehouse_db</code> is an example of a <b>shared database</b>: easy at first, but it binds two teams to one schema and is hard to split later.</div>
        </section>
        <section id="scale">
          <h2>Handling heavy load: 10 million users, 100 million events</h2>
          <p>The diagram above already includes the flash sale components. The general principles: <b>shed load as early as possible</b> (layers 2, 3, 5), <b>keep services stateless</b> so they replicate freely (layer 4), and <b>push whatever can wait to asynchronous processing</b> (layers 7, 8).</p>

          <h3>Scenario 1: 10 million users at once</h3>
          <p>Estimate: 10 million users, each clicking about once every 10 seconds → <b>~1 million requests/second</b>, ~95% of them reads (browsing products and prices).</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Layer</th>
                  <th>Approach</th>
                  <th>Effect</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>2 · CDN</b></td><td>Cache images, JS and pre-built product pages (SSG, ISR)</td><td>80–90% of requests never reach the servers</td></tr>
                <tr><td><b>2 · DNS, load balancer</b></td><td>GeoDNS sends users to the nearest region; WAF blocks bots</td><td>Load spread over regions, junk requests removed</td></tr>
                <tr><td><b>3 · Waiting room</b></td><td>At sale start, only N people/second enter checkout; the rest queue</td><td>The backend receives only what it can handle</td></tr>
                <tr><td><b>4 · Service</b></td><td>Stateless (sessions in JWT or Redis), Kubernetes HPA adds pods</td><td>More pods means more capacity immediately</td></tr>
                <tr><td><b>5 · Cache</b></td><td>Redis Cluster holds products, prices, carts; flash sale stock decremented with <code>DECR</code></td><td>No read storm on the DB; never oversell</td></tr>
                <tr><td><b>6 · Database</b></td><td>Read replicas for reads, sharding by <code>customer_id</code> for writes, PgBouncer pools connections</td><td>Each DB machine carries only part of the load</td></tr>
                <tr><td><b>7 · Order writes</b></td><td>Accept the order, publish an event to Kafka, reply “processing” immediately</td><td>Customers don't wait for stock updates or emails</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Scenario 2: 100 million events at once</h3>
          <p>Estimate: 100 million events in 1 minute ≈ <b>1.7 million events/second</b>. One Kafka partition comfortably handles about 10,000 events/second (1 KB each) → at least 170 partitions; choose <b>200</b> for headroom. The techniques below live in layer 7 (Kafka) and layer 8 (workers).</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Technique</th>
                  <th>Approach</th>
                  <th>Effect</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>Partitions</b></td><td>200 partitions, keyed by <code>orderId</code></td><td>Parallel processing; events of one order stay in order</td></tr>
                <tr><td><b>Consumer groups</b></td><td>Consumers ≤ partitions; autoscale on lag (KEDA)</td><td>More consumers means faster reading</td></tr>
                <tr><td><b>Batching, compression</b></td><td>Producers batch (<code>linger.ms</code>, <code>batch.size</code>, lz4); consumers write to the DB in batches</td><td>Fewer network calls and disk writes</td></tr>
                <tr><td><b>Idempotency</b></td><td>Every event has an id; consumers skip ids already processed</td><td>Retry freely without decrementing stock twice</td></tr>
                <tr><td><b>Backpressure, DLQ</b></td><td>Slow consumers let events wait (lag); failing events go to a dead letter topic</td><td>No lost events, no blocked queue</td></tr>
                <tr><td><b>Retention</b></td><td>Keep events for 7 days</td><td>After fixing a bug you can replay</td></tr>
              </tbody>
            </table>
          </div>
          <div className="note tip">Details on each part: <Link className="plink" href="/en/messaging/kafka/">Kafka</Link> (partitions, consumer groups), <Link className="plink" href="/en/concurrency/distributed-lock/">Distributed lock</Link> and <Link className="plink" href="/en/concurrency/db-lock/">Locks in the DB</Link> (never oversell), <Link className="plink" href="/en/design/microservice/">Microservice patterns</Link> (Saga, Outbox, Circuit Breaker).</div>
        </section>
        <section>
          <h2>Five areas of knowledge</h2>
          <AreaCards locale="en" />
        </section>
      </main>
    </div>
  );
}
