export default function ComparePage() {
  return (
    <div className="wrap single">
      <main>
        <header className="hero">
          <div className="eyebrow">rest · graphql · grpc</div>
          <h1>Three kinds of synchronous API</h1>
          <p className="lede"><b>REST</b> is built around resources and standard HTTP. <b>GraphQL</b> lets the client pick its data through a schema. <b>gRPC</b> calls remote functions with a Protobuf contract over HTTP/2. All three are request–response: the caller waits for the result.</p>
        </header>
        <section>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Criterion</th>
                  <th>REST</th>
                  <th>GraphQL</th>
                  <th>gRPC</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Model</b></td>
                  <td>Resources + HTTP methods</td>
                  <td>Query language over a schema</td>
                  <td>Function calls (RPC)</td>
                </tr>
                <tr>
                  <td><b>Endpoint</b></td>
                  <td>Many URIs</td>
                  <td>A single <code>/graphql</code></td>
                  <td>One path per method <code>/pkg.Svc/Method</code></td>
                </tr>
                <tr>
                  <td><b>Format</b></td>
                  <td>JSON (usually)</td>
                  <td>JSON</td>
                  <td>Binary Protobuf</td>
                </tr>
                <tr>
                  <td><b>Protocol</b></td>
                  <td>HTTP/1.1, 2, 3</td>
                  <td>HTTP (usually POST)</td>
                  <td>HTTP/2</td>
                </tr>
                <tr>
                  <td><b>Contract</b></td>
                  <td>OpenAPI (optional)</td>
                  <td>Schema required</td>
                  <td><code>.proto</code> required</td>
                </tr>
                <tr>
                  <td><b>Data shape</b></td>
                  <td>Server decides the shape</td>
                  <td>Client picks exact fields</td>
                  <td>Server decides via the message</td>
                </tr>
                <tr>
                  <td><b>Streaming</b></td>
                  <td>Not built in (use SSE, WebSocket)</td>
                  <td>Subscription</td>
                  <td>4 kinds, including bidirectional</td>
                </tr>
                <tr>
                  <td><b>Cache HTTP</b></td>
                  <td>Excellent (GET, ETag, CDN)</td>
                  <td>Hard, needs persisted queries</td>
                  <td>Cannot use HTTP caching</td>
                </tr>
                <tr>
                  <td><b>Browser</b></td>
                  <td>Call directly</td>
                  <td>Call directly</td>
                  <td>Needs gRPC-Web or Connect</td>
                </tr>
                <tr>
                  <td><b>Performance</b></td>
                  <td>Good</td>
                  <td>Good, more work on the server</td>
                  <td>Highest, small payloads</td>
                </tr>
                <tr>
                  <td><b>Easy to learn and debug</b></td>
                  <td>Easiest, human readable</td>
                  <td>Medium</td>
                  <td>Needs tooling (grpcurl)</td>
                </tr>
                <tr>
                  <td><b>Errors</b></td>
                  <td>HTTP status code</td>
                  <td>An <code>errors</code> array, usually HTTP 200</td>
                  <td><code>grpc-status</code> trong trailers</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2>When to choose</h2>
          <div className="cmp three">
            <div>
              <h4>REST</h4>
              <ul className="plain">
                <li>Public APIs for third parties.</li>
                <li>Simple CRUD that benefits from CDN caching.</li>
                <li>Diverse teams that need something approachable.</li>
              </ul>
            </div>
            <div>
              <h4>GraphQL</h4>
              <ul className="plain">
                <li>Frontends with many screens, each needing different data.</li>
                <li>Mobile apps that must cut request count and payload size.</li>
                <li>Aggregating many backend services into one API (BFF).</li>
              </ul>
            </div>
            <div>
              <h4>gRPC</h4>
              <ul className="plain">
                <li>Internal communication between microservices.</li>
                <li>Low latency, many languages, a strict contract.</li>
                <li>Two-way streaming.</li>
              </ul>
            </div>
          </div>
          <div className="note tip">Many systems use all three: REST or GraphQL facing outward, gRPC between services inside. See the diagram on the Overview page.</div>
        </section>
        <section>
          <h2>Synchronous or asynchronous?</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th />
                  <th>API (REST, GraphQL, gRPC)</th>
                  <th>Messaging (Kafka, RabbitMQ, NATS)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Caller</b></td>
                  <td>Waits for the result</td>
                  <td>Sends and moves on</td>
                </tr>
                <tr>
                  <td><b>Coupling</b></td>
                  <td>The other side must be running</td>
                  <td>The other side can pause; messages wait</td>
                </tr>
                <tr>
                  <td><b>Receivers</b></td>
                  <td>One</td>
                  <td>One or many</td>
                </tr>
                <tr>
                  <td><b>Good for</b></td>
                  <td>Queries and commands that need an answer now</td>
                  <td>Event notifications, background work, load levelling</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
