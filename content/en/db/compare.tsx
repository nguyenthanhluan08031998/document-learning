import Link from "next/link";

const ROWS: [string, string, string, string, string][] = [
  ["Model", "Relational tables", "Relational tables", "JSON documents", "Key-value, document"],
  ["Schema", "Strict, with constraints", "Strict, with constraints", "Flexible, optional validation", "Only the key is required"],
  ["Queries", "Full SQL, JOIN, window functions", "SQL, JOIN", "Field queries, aggregation pipeline", "By PK, SK and GSI; no JOIN"],
  ["Transactions", "Full ACID", "ACID (InnoDB)", "Single document always atomic; multi-document via sessions", "TransactWrite up to 100 items"],
  ["Write scaling", "One primary; shard with Citus or by hand", "One primary; shard with Vitess", "Built-in sharding", "Automatic, practically unlimited"],
  ["Operations", "Self-managed or RDS, Aurora, Neon", "Self-managed or RDS, Aurora, PlanetScale", "Self-managed or Atlas", "Fully managed by AWS"],
  ["Strengths", "Correctness, complex queries, extensions", "Popular, very fast primary key reads", "Varied data, reads by aggregate", "Stable latency when traffic spikes"],
  ["Weaknesses", "VACUUM to watch; horizontal write scaling is hard", "Gap locks cause waits; less flexible JSON", "Easy to design carelessly; weak JOINs", "Access patterns must be known up front; tied to AWS"],
];

export default function DatabaseComparePage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Database comparison contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#dbc-table"><span>01</span>Comparison table</a></li>
          <li><a href="#dbc-shop"><span>02</span>What the shop uses</a></li>
          <li><a href="#dbc-choose"><span>03</span>Quick choice</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">database · comparison</div>
          <h1>PostgreSQL, MySQL, MongoDB, DynamoDB</h1>
          <p className="lede">There is no best database, only the right one for each kind of data. A microservice system usually uses several at once (polyglot persistence).</p>
        </header>

        <section id="dbc-table">
          <h2><span className="n">01</span>Comparison table</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th />
                  <th><Link className="plink" href="/en/db/postgresql/">PostgreSQL</Link></th>
                  <th><Link className="plink" href="/en/db/mysql/">MySQL</Link></th>
                  <th><Link className="plink" href="/en/db/mongodb/">MongoDB</Link></th>
                  <th><Link className="plink" href="/en/db/dynamodb/">DynamoDB</Link></th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([label, ...cells]) => (
                  <tr key={label}>
                    <td><b>{label}</b></td>
                    {cells.map((c, i) => <td key={i}>{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="dbc-shop">
          <h2><span className="n">02</span>What the shop uses</h2>
          <p>Each service picks the database that fits its data (see the diagram on the <Link className="plink" href="/en/">Overview</Link>):</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Choice</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Orders, payments, reconciliation</td><td><b>PostgreSQL</b> or <b>MySQL</b></td><td>Must never be wrong: transactions, constraints, JOIN reports</td></tr>
                <tr><td>Customer accounts</td><td><b>PostgreSQL</b></td><td>Unique email, relations to orders and addresses</td></tr>
                <tr><td>Product catalog</td><td><b>MongoDB</b></td><td>Each product type has its own attributes; read a whole product at once</td></tr>
                <tr><td>Carts, sessions</td><td><b>DynamoDB</b> or Redis</td><td>Key access, automatic expiry (TTL), handles flash sale traffic</td></tr>
                <tr><td>Product search</td><td>Elasticsearch, OpenSearch</td><td>Full-text search, suggestions, faceted filters; synced from the main DB via CDC</td></tr>
                <tr><td>Large revenue reports</td><td>An analytics warehouse (BigQuery, ClickHouse)</td><td>Scan hundreds of millions of rows without slowing the shop's DB</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="dbc-choose">
          <h2><span className="n">03</span>Quick choice</h2>
          <ol className="steps">
            <li><div><b>Not sure what to use</b><div className="d">Start with PostgreSQL. It handles most jobs well, JSON included, and is easy to move away from later.</div></div></li>
            <li><div><b>Data must be exactly right, many relations</b><div className="d">PostgreSQL or MySQL; pick the one your team already runs.</div></div></li>
            <li><div><b>Each record has a different structure, read as a whole</b><div className="d">MongoDB.</div></div></li>
            <li><div><b>Key access, unpredictable traffic, running on AWS</b><div className="d">DynamoDB; list the access patterns before designing the table.</div></div></li>
          </ol>
        </section>
      </main>
    </div>
  );
}
