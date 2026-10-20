import Link from "next/link";
import { Code } from "@/components/Code";

// One partition of the single table: header is the partition key, rows are sort keys
const Partition = ({ x, pk, rows, hit = [] }: { x: number; pk: string; rows: string[]; hit?: number[] }) => (
  <g>
    <rect className="s-bg" x={x} y={40} width={270} height={34 + rows.length * 34} rx="8" />
    <text className="s-tb" x={x + 12} y={62}>{`PK = ${pk}`}</text>
    {rows.map((r, i) => (
      <g key={r}>
        <rect className={hit.includes(i) ? "s-hl" : "s-box"} x={x + 10} y={72 + i * 34} width={250} height={28} rx="5" />
        <text className="s-tm" x={x + 20} y={90 + i * 34} style={{ fill: "var(--ink)" }}>{r}</text>
      </g>
    ))}
  </g>
);

function SingleTableDiagram() {
  return (
    <svg viewBox="0 0 900 260" role="img" aria-label="Single-table design: partition CUSTOMER#7 holds PROFILE and ORDER items by date; partition ORDER#42 holds META, ITEMs and PAYMENT; partition PRODUCT#PHONE-01 holds META with stock. Querying PK CUSTOMER#7 with SK starting with ORDER# returns exactly that customer's orders">
      <text className="s-lane" x="20" y="24">TABLE shop · ONE TABLE FOR MANY KINDS OF DATA</text>
      <Partition x={20} pk="CUSTOMER#7" rows={["SK = PROFILE · name, email", "SK = ORDER#2026-10-19#42", "SK = ORDER#2026-10-20#57"]} hit={[1, 2]} />
      <Partition x={315} pk="ORDER#42" rows={["SK = META · status, total", "SK = ITEM#PHONE-01 · qty 1", "SK = ITEM#CASE-02 · qty 1", "SK = PAYMENT#vnp_9f2c"]} />
      <Partition x={610} pk="PRODUCT#PHONE-01" rows={["SK = META · price, stock"]} />
      <text className="s-tm" x="20" y="200" style={{ fill: "var(--accent)" }}>Query PK = CUSTOMER#7</text>
      <text className="s-tm" x="20" y="218" style={{ fill: "var(--accent)" }}>AND begins_with(SK, "ORDER#")</text>
      <text className="s-tm" x="20" y="236" style={{ fill: "var(--accent)" }}>→ the teal cells, already sorted by date</text>
      <text className="s-tm" x="610" y="140" style={{ fill: "var(--muted)" }}>PK decides which partition</text>
      <text className="s-tm" x="610" y="158" style={{ fill: "var(--muted)" }}>holds the data; SK sorts</text>
      <text className="s-tm" x="610" y="176" style={{ fill: "var(--muted)" }}>the items inside it</text>
    </svg>
  );
}

export default function DynamoPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="DynamoDB contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#dy-what"><span>01</span>Characteristics</a></li>
          <li><a href="#dy-key"><span>02</span>Partition key, sort key</a></li>
          <li><a href="#dy-single"><span>03</span>Single-table design</a></li>
          <li><a href="#dy-code"><span>04</span>Code</a></li>
          <li><a href="#dy-limit"><span>05</span>{"Consistency & limits"}</a></li>
          <li><a href="#dy-when"><span>06</span>When to use</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">database · dynamodb</div>
          <h1>DynamoDB</h1>
          <p className="lede">AWS's key-value database: no servers to manage, scales by itself and keeps single-digit millisecond latency at any size. In exchange, you must <b>know how you will query</b> before designing the table.</p>
          <div className="tape" aria-hidden="true">
            <div>partition key</div>
            <div>sort key</div>
            <div>GSI</div>
            <div className="hw">single table</div>
            <div className="leo">on-demand</div>
          </div>
        </header>

        <section id="dy-what">
          <h2><span className="n">01</span>Characteristics</h2>
          <ul className="plain">
            <li><b>Fully managed, serverless:</b> nothing to install, patch or replicate; AWS copies data across 3 availability zones (AZ).</li>
            <li><b>Pay per request</b> (on-demand) or reserve capacity (provisioned). Nearly free at low traffic.</li>
            <li><b>No JOINs, no ad-hoc queries:</b> only fast reads by key. To filter by another field you need a secondary index (GSI).</li>
            <li>Each item is at most <b>400 KB</b>.</li>
          </ul>
        </section>

        <section id="dy-key">
          <h2><span className="n">02</span>Partition key, sort key</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Lock</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>Partition key (PK)</b></td><td>Hashed to pick the partition (machine) that stores the item. Reads by PK always touch one partition.</td></tr>
                <tr><td><b>Sort key (SK)</b></td><td>Orders items sharing a PK. Enables range reads: <code>begins_with</code>, <code>between</code>, greater than, less than.</td></tr>
                <tr><td><b>GSI</b></td><td>A secondary index with a different PK and SK, for a second way to query (for example by order status).</td></tr>
              </tbody>
            </table>
          </div>
          <div className="note"><b>Hot partition:</b> each partition handles about 3,000 reads and 1,000 writes per second. Using <code>STATUS#pending</code> as the PK for every order funnels a whole flash sale into one partition. Choose a PK that spreads evenly (by customer, by order).</div>
        </section>

        <section id="dy-single">
          <h2><span className="n">03</span>Single-table design</h2>
          <p>Instead of one table per kind of data as in SQL, DynamoDB usually keeps <b>everything in one table</b>, arranged so each access pattern needs <b>a single Query</b>.</p>
          <figure className="fig">
            <div className="scroll">
              <SingleTableDiagram />
            </div>
            <figcaption>Prefixes like <code>CUSTOMER#</code> and <code>ORDER#</code> show the item type. The order date is part of the SK, so orders sort by time automatically.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Need</th>
                  <th>How to fetch</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Customer profile</td><td><code>GetItem</code> PK = <code>CUSTOMER#7</code>, SK = <code>PROFILE</code></td></tr>
                <tr><td>Customer's orders, newest first</td><td><code>Query</code> PK = <code>CUSTOMER#7</code>, SK begins with <code>ORDER#</code>, reversed</td></tr>
                <tr><td>Order details, lines and payment</td><td><code>Query</code> PK = <code>ORDER#42</code> (one call gets everything)</td></tr>
                <tr><td>Pending orders</td><td>GSI1: GSI1PK = <code>STATUS#pending#{"{shard}"}</code>, GSI1SK = creation time</td></tr>
              </tbody>
            </table>
          </div>
          <div className="note tip">DynamoDB design runs <b>opposite to SQL</b>: list the screens and questions first (access patterns), then choose PK and SK. Adding a new query later usually means a new GSI or copying data.</div>
        </section>

        <section id="dy-code">
          <h2><span className="n">04</span>Code</h2>
          <Code lang="ts">{`import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";

const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "ap-southeast-1" }));

// Orders of customer 7, newest first
const { Items } = await db.send(new QueryCommand({
  TableName: "shop",
  KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
  ExpressionAttributeValues: { ":pk": "CUSTOMER#7", ":sk": "ORDER#" },
  ScanIndexForward: false,
  Limit: 20,
}));

// Place an order: decrement stock and write the order in one transaction
await db.send(new TransactWriteCommand({
  TransactItems: [
    { Update: {
        TableName: "shop",
        Key: { PK: "PRODUCT#PHONE-01", SK: "META" },
        UpdateExpression: "SET stock = stock - :qty",
        ConditionExpression: "stock >= :qty",            // not enough stock → whole transaction fails
        ExpressionAttributeValues: { ":qty": 1 },
    } },
    { Put: {
        TableName: "shop",
        Item: { PK: "ORDER#42", SK: "META", customerId: 7, status: "pending", total: 22990000 },
        ConditionExpression: "attribute_not_exists(PK)",  // never overwrite an existing order
    } },
    { Put: {
        TableName: "shop",
        Item: { PK: "CUSTOMER#7", SK: "ORDER#2026-10-19#42", orderId: 42, status: "pending", total: 22990000 },
    } },
  ],
}));`}</Code>
        </section>

        <section id="dy-limit">
          <h2><span className="n">05</span>{"Consistency & limits"}</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>Reads</b></td><td>Eventually consistent by default (may lag under a second). <code>ConsistentRead: true</code> reads the latest, costs double, and is not available on a GSI.</td></tr>
                <tr><td><b>Transactions</b></td><td>Up to 100 items per transaction; cost twice a normal write.</td></tr>
                <tr><td><b>Scan</b></td><td>Reads the whole table, slow and expensive; only for one-off jobs.</td></tr>
                <tr><td><b>Streams</b></td><td>Every change goes to DynamoDB Streams → Lambda → Kafka, OpenSearch (like CDC, outbox).</td></tr>
                <tr><td><b>TTL</b></td><td>Deletes expired items automatically: abandoned carts, sessions, OTP codes.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="dy-when">
          <h2><span className="n">06</span>When to use</h2>
          <div className="pp">
            <div><span className="pl">Good for</span>Carts, sessions, customer order history, view counters: key access, spiky traffic like flash sales; teams on AWS that don't want to operate a database.</div>
            <div className="warnc"><span className="pl">Consider</span>Reports, ad-hoc filters and many JOINs are hard and costly: push data to an analytics store or use <Link className="plink" href="/en/db/postgresql/">PostgreSQL</Link>. Tightly tied to AWS.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
