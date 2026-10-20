import { Code } from "@/components/Code";

export default function GraphqlPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="GraphQL contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#gql-overview"><span>01</span>What is GraphQL</a></li>
          <li><a href="#gql-flow"><span>02</span>Query flow</a></li>
          <li><a href="#gql-schema"><span>03</span>{"Schema & types"}</a></li>
          <li><a href="#gql-ops"><span>04</span>Query, Mutation, Subscription</a></li>
          <li><a href="#gql-resolver"><span>05</span>{"Resolver & N+1"}</a></li>
          <li><a href="#gql-error"><span>06</span>{"Errors, HTTP & caching"}</a></li>
          <li><a href="#gql-security"><span>07</span>{"Security & performance"}</a></li>
          <li><a href="#gql-federation"><span>08</span>Federation</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">graphql · study notes</div>
          <h1>GraphQL notebook: the client asks for exactly what it needs</h1>
          <p className="lede">GraphQL is a query language for APIs. The server publishes a strongly typed <b>schema</b>; the client sends a query describing <b>exactly which fields it wants</b> and gets back JSON in that exact shape, through a single endpoint.</p>
          <div className="tape" aria-hidden="true">
            <div>query</div>
            <div>{"{"}</div>
            <div>order</div>
            <div>{"{ id"}</div>
            <div className="hw">{"total }"}</div>
            <div className="leo">{"}"}</div>
          </div>
        </header>
        <section id="gql-overview">
          <h2><span className="n">01</span>What is GraphQL</h2>
          <div className="cmp">
            <div><h4>With REST</h4>An order screen calls <code>/orders/42</code>, then <code>/users/7</code>, then <code>/orders/42/items</code>. Each endpoint returns extra fields (over-fetching) yet still lacks some data, so more calls are needed (under-fetching).</div>
            <div><h4>With GraphQL</h4>One request to <code>/graphql</code> fetches the order, the buyer and the line items, only the fields the screen needs.</div>
          </div>
          <div className="cmp">
            <Code lang="graphql">{`# Request
query OrderPage($id: ID!) {
  order(id: $id) {
    id
    total
    customer { name }
    items { name qty }
  }
}`}</Code>
            <Code lang="jsonc">{`// Response
{
  "data": {
    "order": {
      "id": "42",
      "total": 350000,
      "customer": { "name": "An" },
      "items": [{ "name": "Pho", "qty": 2 }]
    }
  }
}`}</Code>
          </div>
        </section>
        <section id="gql-flow">
          <h2><span className="n">02</span>How a query is processed</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 420" role="img" aria-label="GraphQL flow: the client writes a query and POSTs it to /graphql; the server parses, validates and executes resolvers, DataLoader batches queries, and data plus errors are returned"> <defs> <marker id="gfa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> <marker id="gfb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker> </defs> <rect className="s-bg" x="8" y="22" width="884" height="118" rx="10" /> <text className="s-lane" x="20" y="42">CLIENT</text> <rect className="s-bg" x="8" y="160" width="884" height="252" rx="10" /> <text className="s-lane" x="20" y="180">GRAPHQL SERVER</text> <rect className="s-box" x="20" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="32" y="78">Write query</text><text className="s-tm" x="32" y="98">pick fields</text> <rect className="s-box" x="195" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="207" y="78">Variables</text><text className="s-tm" x="207" y="98">dynamic values</text> <rect className="s-box" x="370" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="382" y="78">Client cache</text><text className="s-tm" x="382" y="98">normalized by id</text> <rect className="s-box" x="545" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="557" y="78">Persisted query</text><text className="s-tm" x="557" y="98">send hash (optional)</text> <rect className="s-box" x="720" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="732" y="78">HTTP POST</text><text className="s-tm" x="732" y="98">/graphql · JSON</text> <path className="s-ln" d="M170 87 H193" markerEnd="url(#gfa)" /> <path className="s-ln" d="M345 87 H368" markerEnd="url(#gfa)" /> <path className="s-ln" d="M520 87 H543" markerEnd="url(#gfa)" /> <path className="s-ln" d="M695 87 H718" markerEnd="url(#gfa)" /> <rect className="s-box" x="720" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="732" y="216">Parse</text><text className="s-tm" x="732" y="236">query → AST</text> <rect className="s-box" x="545" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="557" y="216">Validate</text><text className="s-tm" x="557" y="236">check vs schema</text> <rect className="s-hl" x="370" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="382" y="216">Execute</text><text className="s-tm" x="382" y="236">resolvers per field</text> <rect className="s-box" x="195" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="207" y="216">DataLoader</text><text className="s-tm" x="207" y="236">batch queries</text> <rect className="s-box" x="20" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="32" y="216">Response</text><text className="s-tm" x="32" y="236">{"{ data, errors }"}</text> <path className="s-ln" d="M720 225 H697" markerEnd="url(#gfa)" /> <path className="s-ln" d="M545 225 H522" markerEnd="url(#gfa)" /> <path className="s-ln" d="M370 225 H347" markerEnd="url(#gfa)" /> <path className="s-ln" d="M195 225 H172" markerEnd="url(#gfa)" /> <path className="s-ln" d="M795 122 V188" markerEnd="url(#gfa)" /> <text className="s-tm" x="805" y="158">one endpoint</text> <path className="s-dl" d="M60 190 V124" markerEnd="url(#gfb)" /> <text className="s-tm" x="70" y="158">{"200 + { data, errors }"}</text> <path className="s-dl" d="M270 262 V318" markerEnd="url(#gfb)" /> <rect className="s-disk" x="195" y="320" width="150" height="62" rx="7" /><text className="s-tb" x="207" y="344">Data sources</text><text className="s-tm" x="207" y="364">DB · REST · gRPC</text> <path className="s-dl" d="M620 262 V318" markerEnd="url(#gfb)" /> <rect className="s-bad" x="545" y="320" width="150" height="62" rx="7" /><text className="s-tb" x="557" y="344">Query sai</text><text className="s-tm" x="557" y="364">return errors, stop</text> </svg>
            </div>
            <figcaption>Every request goes to one endpoint. The server checks the query against the schema first, then runs a resolver for each field.</figcaption>
          </figure>
          <ol className="steps">
            <li>
              <div><b>Parse</b><div className="d">The query string becomes a syntax tree (AST). A syntax error stops here.</div></div>
            </li>
            <li>
              <div><b>Validate</b><div className="d">Checked against the schema: do the fields exist, are argument types right. If this fails, no resolver runs.</div></div>
            </li>
            <li>
              <div><b>Execute</b><div className="d">Walk the query tree; each field calls a <b>resolver</b>. Sibling fields can run in parallel.</div></div>
            </li>
            <li>
              <div><b>Return</b><div className="d">JSON with <code>data</code> and, if any, <code>errors</code>. A response can contain both data and errors.</div></div>
            </li>
          </ol>
        </section>
        <section id="gql-schema">
          <h2><span className="n">03</span>{"Schema & types"}</h2>
          <Code lang="graphql">{`type Order {
  id: ID!                 # ! means non-null
  total: Int!
  status: OrderStatus!
  customer: User!
  items: [OrderItem!]!    # non-null list of non-null items
}

enum OrderStatus { PENDING PAID SHIPPED }

input CreateOrderInput {  # input types are used for arguments
  items: [ItemInput!]!
}

type Query {
  order(id: ID!): Order
  orders(first: Int = 20, after: String): OrderConnection!
}

type Mutation {
  createOrder(input: CreateOrderInput!): Order!
}

type Subscription {
  orderStatusChanged(id: ID!): Order!
}`}</Code>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Kind</th>
                  <th>Meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Scalar</b></td>
                  <td><code>Int</code>, <code>Float</code>, <code>String</code>, <code>Boolean</code>, <code>ID</code>, plus custom scalars such as <code>DateTime</code>.</td>
                </tr>
                <tr>
                  <td><b>Object</b></td>
                  <td>A type with fields, for example <code>Order</code>.</td>
                </tr>
                <tr>
                  <td><b>Input</b></td>
                  <td>A type used only as input arguments.</td>
                </tr>
                <tr>
                  <td><b>Enum</b></td>
                  <td>A fixed set of values.</td>
                </tr>
                <tr>
                  <td><b>Interface / Union</b></td>
                  <td>A field that can return several types, for example a search result is <code>Product | Shop</code>.</td>
                </tr>
                <tr>
                  <td><b>List <code>[ ]</code> and Non-null <code>!</code></b></td>
                  <td>Every field is nullable by default; add <code>!</code> to require a value.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="gql-ops">
          <h2><span className="n">04</span>Query, Mutation, Subscription</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Kind</th>
                  <th>Used for</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>query</b></td>
                  <td>Reading data</td>
                  <td>Root fields run in parallel.</td>
                </tr>
                <tr>
                  <td><b>mutation</b></td>
                  <td>Writing, changing data</td>
                  <td>Root fields run <b>sequentially</b> in the order written.</td>
                </tr>
                <tr>
                  <td><b>subscription</b></td>
                  <td>Real-time events</td>
                  <td>Runs over WebSocket (the <code>graphql-ws</code> protocol) or SSE.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="plain">
            <li><b>Variables</b> (<code>$id</code>): keep dynamic values out of the query text, which helps caching and avoids string concatenation.</li>
            <li><b>Fragment</b>: a reusable group of fields, for example <code>{"fragment OrderCard on Order { id total }"}</code>.</li>
            <li><b>Alias</b>: fetch the same field twice with different arguments: <code>{"a: order(id: 1) { … } b: order(id: 2) { … }"}</code>.</li>
            <li><b>Directive</b>: <code>@include(if: $x)</code>, <code>@skip(if: $x)</code> on the client; <code>@deprecated</code> in the schema marks fields being phased out, instead of versioning.</li>
            <li><b>Introspection</b>: clients can query the schema itself, which powers autocomplete tools like GraphiQL and code generation.</li>
          </ul>
        </section>
        <section id="gql-resolver">
          <h2><span className="n">05</span>{"Resolvers & the N+1 problem"}</h2>
          <p>Every field has a resolver receiving <code>(parent, args, context, info)</code>. The <code>orders</code> resolver returns a list, then for <b>each</b> order the <code>customer</code> resolver runs once more.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Approach</th>
                  <th>DB queries for 50 orders</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>The <code>customer</code> resolver hits the DB directly</td>
                  <td className="n">1 (orders) + 50 (one per customer) = <b>51</b></td>
                </tr>
                <tr>
                  <td>Use <b>DataLoader</b> to batch ids from the same tick</td>
                  <td className="n">1 (orders) + 1 (<code>WHERE id IN (…)</code>) = <b>2</b></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>DataLoader</b> collects every <code>load(id)</code> call made in the same tick, queries the DB once as a batch, and caches results for the duration of one request. Create a new DataLoader per request so data never leaks between users.</div>
        </section>
        <section id="gql-error">
          <h2><span className="n">06</span>{"Errors, HTTP & caching"}</h2>
          <Code lang="json">{`{
  "data": { "order": { "id": "42", "customer": null } },
  "errors": [{
    "message": "Customer service unavailable",
    "path": ["order", "customer"],
    "extensions": { "code": "UNAVAILABLE" }
  }]
}`}</Code>
          <ul className="plain">
            <li>An error in one field does not break the whole response: that field becomes <code>null</code> and the rest is still returned. If the field is non-null, the null bubbles up to the nearest nullable parent.</li>
            <li>Many servers return HTTP 200 even for business errors. The <b>GraphQL over HTTP</b> spec recommends the content type <code>application/graphql-response+json</code> and a 4xx status for invalid requests.</li>
            <li><b>Caching is harder than REST</b> because every request is a POST to one URL. Remedies: a client cache normalized by <code>id</code> (Apollo, urql), and <b>persisted queries</b> that send a hash instead of the full query and allow GET so a CDN can cache.</li>
          </ul>
        </section>
        <section id="gql-security">
          <h2><span className="n">07</span>{"Security & performance"}</h2>
          <ul className="plain">
            <li>Clients write their own queries, so they can send very deep or very expensive ones. Limit <b>depth</b>, <b>complexity</b> (score by field count and list size) and set a <b>timeout</b>.</li>
            <li>Rate limit by <b>query cost</b>, not just request count.</li>
            <li><b>Persisted queries as an allowlist</b>: production accepts only pre-registered queries. Great for first-party apps.</li>
            <li>Consider disabling introspection on public APIs if not needed, and turning off field-name suggestions in error messages.</li>
            <li>Authorize in resolvers or business logic, not only at the endpoint, because one endpoint serves everything.</li>
            <li>File upload is not in the core spec; usually upload via REST or a presigned URL, then pass the URL into a mutation.</li>
          </ul>
        </section>
        <section id="gql-federation">
          <h2><span className="n">08</span>Federation: many services, one schema</h2>
          <p>With many teams, each service owns part of the schema (a <b>subgraph</b>). A <b>router/gateway</b> composes them into a <b>supergraph</b> and splits each query into calls to the right subgraphs.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Approach</th>
                  <th>Characteristics</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Apollo Federation</b></td>
                  <td>Most popular. Subgraphs mark entities with <code>@key</code>; the router does the composition.</td>
                </tr>
                <tr>
                  <td><b>Schema stitching</b></td>
                  <td>Older approach, schemas stitched by hand at the gateway.</td>
                </tr>
                <tr>
                  <td><b>BFF (Backend for Frontend)</b></td>
                  <td>One GraphQL server per client type, calling REST or gRPC behind it.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
