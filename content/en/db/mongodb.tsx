import Link from "next/link";
import { Code } from "@/components/Code";

const Mono = ({ x, y, children, color = "var(--ink)" }: { x: number; y: number; children: string; color?: string }) => (
  <text className="s-tm" x={x} y={y} style={{ fill: color }}>{children}</text>
);

function EmbedReferenceDiagram() {
  return (
    <svg viewBox="0 0 900 290" role="img" aria-label="An order document embeds the purchased items and the shipping address, while the customer and the original products are only referenced by id in the customers and products collections">
      <defs>
        <marker id="mga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker>
      </defs>
      <rect className="s-hl" x="20" y="14" width="470" height="262" rx="8" />
      <text className="s-tb" x="34" y="38">orders · one document</text>
      <Mono x={34} y={64}>{"{"}</Mono>
      <Mono x={48} y={84}>{"_id: \"ORD-42\","}</Mono>
      <Mono x={48} y={104}>{"customerId: 7,"}</Mono>
      <Mono x={300} y={104} color="var(--warn)">← reference</Mono>
      <Mono x={48} y={124}>{"status: \"paid\", total: 23040000,"}</Mono>
      <Mono x={48} y={144}>{"items: ["}</Mono>
      <Mono x={300} y={144} color="var(--accent)">← embedded</Mono>
      <Mono x={62} y={164}>{"{ sku: \"PHONE-01\", name: \"iPhone 16\","}</Mono>
      <Mono x={76} y={184}>{"price: 22990000, qty: 1 },"}</Mono>
      <Mono x={62} y={204}>{"{ sku: \"CASE-02\", price: 50000, qty: 1 } ],"}</Mono>
      <Mono x={48} y={224}>{"shippingAddress: { city: \"HCM\", … }"}</Mono>
      <Mono x={360} y={224} color="var(--accent)">← embedded</Mono>
      <Mono x={34} y={250}>{"}"}</Mono>

      <rect className="s-disk" x="600" y="40" width="280" height="70" rx="8" />
      <text className="s-tb" x="614" y="64">customers</text>
      <Mono x={614} y={88}>{"{ _id: 7, name: \"Lan\", email }"}</Mono>
      <rect className="s-disk" x="600" y="170" width="280" height="70" rx="8" />
      <text className="s-tb" x="614" y="194">products</text>
      <Mono x={614} y={218}>{"{ _id: \"PHONE-01\", price, stock }"}</Mono>
      <path d="M396 100 C500 100 500 75 598 75" style={{ stroke: "var(--warn)", strokeWidth: 1.6, strokeDasharray: "5 4", fill: "none" }} markerEnd="url(#mga)" />
      <path d="M396 160 C500 160 500 205 598 205" style={{ stroke: "var(--warn)", strokeWidth: 1.6, strokeDasharray: "5 4", fill: "none" }} markerEnd="url(#mga)" />
      <Mono x={600} y={270} color="var(--muted)">price and name copied at purchase</Mono>
    </svg>
  );
}

export default function MongoPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="MongoDB contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#mg-what"><span>01</span>Characteristics</a></li>
          <li><a href="#mg-model"><span>02</span>Embed or reference</a></li>
          <li><a href="#mg-query"><span>03</span>Queries</a></li>
          <li><a href="#mg-index"><span>04</span>Index</a></li>
          <li><a href="#mg-tx"><span>05</span>Transaction</a></li>
          <li><a href="#mg-scale"><span>06</span>Replica set, sharding</a></li>
          <li><a href="#mg-when"><span>07</span>When to use</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">database · mongodb</div>
          <h1>MongoDB</h1>
          <p className="lede">A document database: each record is a JSON object, and documents in one collection need not share a structure. A good fit for a <b>product catalog</b>, where phones, shirts and books have very different attributes.</p>
          <div className="tape" aria-hidden="true">
            <div>document</div>
            <div>collection</div>
            <div>aggregation</div>
            <div className="hw">replica set</div>
            <div className="leo">shard key</div>
          </div>
        </header>

        <section id="mg-what">
          <h2><span className="n">01</span>Characteristics</h2>
          <ul className="plain">
            <li><b>Documents (BSON):</b> nested data stored together, read once, no JOIN needed.</li>
            <li><b>Flexible schema:</b> add fields without migrations; schema validation can still be enabled when you need strictness.</li>
            <li><b>Built-in replica sets and sharding:</b> automatic primary failover, data spread across machines by shard key.</li>
            <li><b>Aggregation pipeline</b> for reports; MongoDB Atlas is the managed cloud offering.</li>
          </ul>
        </section>

        <section id="mg-model">
          <h2><span className="n">02</span>Embed or reference</h2>
          <p>The most important MongoDB design question: should related data be <b>embedded</b> in the same document or <b>referenced</b> by id in another collection?</p>
          <figure className="fig">
            <div className="scroll">
              <EmbedReferenceDiagram />
            </div>
            <figcaption>The order embeds the purchased items and the address: opening the order gives everything and keeps the purchase price. The customer and original products are only referenced because they change independently.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th />
                  <th>Embed</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>When</b></td><td>Always read together, owned by the parent document, bounded in number</td><td>Shared in many places, changes independently, unbounded in number</td></tr>
                <tr><td><b>Example</b></td><td>Order lines, shipping address, product color variants</td><td>The order's customer, product reviews (possibly tens of thousands)</td></tr>
              </tbody>
            </table>
          </div>
          <div className="note">A document is at most <b>16 MB</b>. Don't embed ever-growing arrays (all reviews, view history) in a product.</div>
        </section>

        <section id="mg-query">
          <h2><span className="n">03</span>Queries</h2>
          <Code lang="ts">{`const orders = db.collection<Order>("orders");
const products = db.collection<Product>("products");

// My orders, newest first
await orders.find({ customerId: 7 }).sort({ createdAt: -1 }).limit(20).toArray();

// Each category has its own attributes, no extra tables needed
await products.find({ category: "phone", "attrs.storage": "256GB", price: { $lte: 25_000_000 } }).toArray();

// Decrement stock only if enough is left: atomic on a single document
const res = await products.updateOne({ _id: "PHONE-01", stock: { $gte: 1 } }, { $inc: { stock: -1 } });
if (res.modifiedCount === 0) throw new Error("Out of stock");

// Revenue per day (aggregation pipeline)
await orders.aggregate([
  { $match: { status: "paid", createdAt: { $gte: new Date("2026-10-01") } } },
  { $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      revenue: { $sum: "$total" },
      orders: { $sum: 1 },
  } },
  { $sort: { _id: 1 } },
]).toArray();`}</Code>
        </section>

        <section id="mg-index">
          <h2><span className="n">04</span>Index</h2>
          <Code lang="ts">{`await orders.createIndex({ customerId: 1, createdAt: -1 });   // "my orders"
await products.createIndex({ category: 1, price: 1 });        // filter by category, sort by price

// TTL index: abandoned carts are deleted automatically after 30 days
await db.collection("carts").createIndex({ updatedAt: 1 }, { expireAfterSeconds: 30 * 24 * 3600 });`}</Code>
          <div className="note tip"><b>The ESR rule</b> for compound indexes: <b>E</b>quality fields first, then <b>S</b>ort fields, then <b>R</b>ange fields. For example filter by <code>category</code>, sort by <code>price</code>, range on <code>rating</code> → <code>{"{ category: 1, price: 1, rating: 1 }"}</code>.</div>
        </section>

        <section id="mg-tx">
          <h2><span className="n">05</span>Transaction</h2>
          <p>Writes to <b>one document</b> are always atomic, so a good embedded design rarely needs transactions. When you must write several documents together (decrement stock and create the order), use a transaction on a replica set:</p>
          <Code lang="ts">{`const session = client.startSession();
try {
  await session.withTransaction(async () => {
    const r = await products.updateOne(
      { _id: sku, stock: { $gte: qty } }, { $inc: { stock: -qty } }, { session },
    );
    if (r.modifiedCount === 0) throw new Error("Out of stock");   // aborts the transaction
    await orders.insertOne({ _id: orderId, customerId, items, status: "pending", createdAt: new Date() }, { session });
  }, { writeConcern: { w: "majority" } });
} finally {
  await session.endSession();
}`}</Code>
          <ul className="plain">
            <li><code>{"w: \"majority\""}</code>: report success only after most replica set members have written, so losing the primary does not lose the order.</li>
            <li>Reading from secondaries (<code>readPreference: "secondary"</code>) offloads the primary but may return data a few hundred milliseconds old.</li>
          </ul>
        </section>

        <section id="mg-scale">
          <h2><span className="n">06</span>Replica set, sharding</h2>
          <ul className="plain">
            <li><b>Replica set:</b> 1 primary takes writes, 2 secondaries replicate. If the primary dies, the others elect a new one within seconds.</li>
            <li><b>Sharding:</b> split a collection across several replica sets by <b>shard key</b>. A bad shard key is very hard to fix.</li>
          </ul>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Shard key cho orders</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="m">{"{ createdAt: 1 }"}</td><td>Bad: every new order lands on the last shard (hot shard)</td></tr>
                <tr><td className="m">{"{ customerId: \"hashed\" }"}</td><td>Writes spread evenly; “my orders” asks only one shard</td></tr>
                <tr><td className="m">{"{ customerId: 1, createdAt: 1 }"}</td><td>One customer's orders sit together; fast time-range reads</td></tr>
              </tbody>
            </table>
          </div>
          <Code lang="js">{`sh.shardCollection("shop.orders", { customerId: "hashed" })`}</Code>
        </section>

        <section id="mg-when">
          <h2><span className="n">07</span>When to use</h2>
          <div className="pp">
            <div><span className="pl">Good for</span>Product catalogs with varied attributes, content (articles, banners), data read as a whole (an order with its lines), horizontal write scaling.</div>
            <div className="warnc"><span className="pl">Consider</span>Highly relational data and complex JOIN reports (accounting, reconciliation) fit <Link className="plink" href="/en/db/postgresql/">PostgreSQL</Link> better. A flexible schema does not mean no design.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
