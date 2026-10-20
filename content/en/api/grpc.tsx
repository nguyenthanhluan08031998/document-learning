import { Code } from "@/components/Code";

export default function GrpcPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="gRPC contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#grpc-overview"><span>01</span>What is gRPC</a></li>
          <li><a href="#grpc-flow"><span>02</span>Flow of one call</a></li>
          <li><a href="#grpc-proto"><span>03</span>Protocol Buffers</a></li>
          <li><a href="#grpc-kinds"><span>04</span>4 kinds of RPC</a></li>
          <li><a href="#grpc-status"><span>05</span>{"Deadline & status"}</a></li>
          <li><a href="#grpc-lb"><span>06</span>Load balancing</a></li>
          <li><a href="#grpc-web"><span>07</span>{"Browsers & tooling"}</a></li>
          <li><a href="#grpc-ref"><span>08</span>Quick reference</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">grpc · study notes</div>
          <h1>gRPC notebook: remote calls over HTTP/2</h1>
          <p className="lede">gRPC is an open-source RPC framework started by Google and now part of the CNCF. You describe services in a <code>.proto</code> file, tools generate client and server code for many languages, and you call a service on another machine like a normal function.</p>
          <div className="tape" aria-hidden="true">
            <div>.proto</div>
            <div>protoc</div>
            <div>stub</div>
            <div className="hw">HTTP/2</div>
            <div className="leo">trailers</div>
          </div>
        </header>
        <section id="grpc-overview">
          <h2><span className="n">01</span>What is gRPC</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Protocol Buffers</b></td>
                  <td>Contract language and a compact binary format, many times faster than JSON to encode/decode.</td>
                </tr>
                <tr>
                  <td><b>HTTP/2</b></td>
                  <td>One connection carries many parallel calls (multiplexing), compressed headers, two-way streaming.</td>
                </tr>
                <tr>
                  <td><b>Code generation</b></td>
                  <td><code>protoc</code> or <code>buf</code> generate typed client stubs and server interfaces.</td>
                </tr>
                <tr>
                  <td><b>Contract-first</b></td>
                  <td>The <code>.proto</code> file is the shared source of truth between teams; contract changes surface as compile errors.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="grpc-flow">
          <h2><span className="n">02</span>Flow of one call (unary)</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 420" role="img" aria-label="Flow of one unary gRPC call: the client calls the stub, serializes protobuf, runs interceptors and sends over HTTP/2; the server receives, runs interceptors, deserializes, calls the handler and returns the message and trailers"> <defs> <marker id="pfa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> <marker id="pfb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker> </defs> <rect className="s-bg" x="8" y="22" width="884" height="118" rx="10" /> <text className="s-lane" x="20" y="42">CLIENT</text> <rect className="s-bg" x="8" y="160" width="884" height="252" rx="10" /> <text className="s-lane" x="20" y="180">SERVER</text> <rect className="s-box" x="20" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="32" y="78">Call stub</text><text className="s-tm" x="32" y="98">GetOrder(req)</text> <rect className="s-box" x="195" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="207" y="78">Serialize</text><text className="s-tm" x="207" y="98">Protobuf → byte</text> <rect className="s-box" x="370" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="382" y="78">Interceptors</text><text className="s-tm" x="382" y="98">token · deadline</text> <rect className="s-box" x="545" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="557" y="78">HTTP/2 stream</text><text className="s-tm" x="557" y="98">1 conn, many calls</text> <rect className="s-box" x="720" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="732" y="78">Send frames</text><text className="s-tm" x="732" y="98">HEADERS + DATA</text> <path className="s-ln" d="M170 87 H193" markerEnd="url(#pfa)" /> <path className="s-ln" d="M345 87 H368" markerEnd="url(#pfa)" /> <path className="s-ln" d="M520 87 H543" markerEnd="url(#pfa)" /> <path className="s-ln" d="M695 87 H718" markerEnd="url(#pfa)" /> <rect className="s-box" x="720" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="732" y="216">Receive stream</text><text className="s-tm" x="732" y="236">:path /Svc/Method</text> <rect className="s-box" x="545" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="557" y="216">Interceptors</text><text className="s-tm" x="557" y="236">auth · metrics</text> <rect className="s-box" x="370" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="382" y="216">Deserialize</text><text className="s-tm" x="382" y="236">byte → message</text> <rect className="s-hl" x="195" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="207" y="216">Handler</text><text className="s-tm" x="207" y="236">your code</text> <rect className="s-box" x="20" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="32" y="216">Return result</text><text className="s-tm" x="32" y="236">DATA + trailers</text> <path className="s-ln" d="M720 225 H697" markerEnd="url(#pfa)" /> <path className="s-ln" d="M545 225 H522" markerEnd="url(#pfa)" /> <path className="s-ln" d="M370 225 H347" markerEnd="url(#pfa)" /> <path className="s-ln" d="M195 225 H172" markerEnd="url(#pfa)" /> <path className="s-ln" d="M795 122 V188" markerEnd="url(#pfa)" /> <text className="s-tm" x="805" y="158">HTTP/2</text> <path className="s-dl" d="M60 190 V124" markerEnd="url(#pfb)" /> <text className="s-tm" x="70" y="158">message + grpc-status</text> <path className="s-dl" d="M270 262 V318" markerEnd="url(#pfb)" /> <rect className="s-disk" x="195" y="320" width="150" height="62" rx="7" /><text className="s-tb" x="207" y="344">Deadline</text><text className="s-tm" x="207" y="364">timeout → cancel</text> <path className="s-dl" d="M795 262 V318" markerEnd="url(#pfb)" /> <rect className="s-bad" x="720" y="320" width="150" height="62" rx="7" /><text className="s-tb" x="732" y="344">Sai method</text><text className="s-tm" x="732" y="364">UNIMPLEMENTED</text> <text className="s-tm" x="380" y="334">many parallel calls on 1 connection</text> <text className="s-tm" x="380" y="352">HPACK headers · binary payload</text> <text className="s-tm" x="380" y="370">status lives in trailers, not the HTTP status</text> </svg>
            </div>
            <figcaption>Calling a stub looks like calling a normal function; the stub serializes and sends over HTTP/2. Success or failure is reported in the trailers at the end of the stream.</figcaption>
          </figure>
          <ul className="plain">
            <li>A request is one <b>HTTP/2 stream</b>: a HEADERS frame with <code>:path /shop.OrderService/GetOrder</code> and <code>content-type: application/grpc</code>, followed by DATA frames carrying the serialized message (with a 5-byte length prefix).</li>
            <li>The result is in the <b>trailers</b> at the end of the stream: <code>grpc-status</code> and <code>grpc-message</code>. The HTTP status is almost always 200.</li>
            <li><b>Interceptors</b> (like middleware) handle auth, logging, metrics, tracing and retries on both sides.</li>
          </ul>
        </section>
        <section id="grpc-proto">
          <h2><span className="n">03</span>Protocol Buffers</h2>
          <Code lang="proto">{`syntax = "proto3";
package shop.v1;

service OrderService {
  rpc GetOrder (GetOrderRequest) returns (Order);                    // unary
  rpc WatchOrder (GetOrderRequest) returns (stream OrderEvent);      // server streaming
  rpc UploadItems (stream Item) returns (UploadSummary);             // client streaming
  rpc Chat (stream ChatMessage) returns (stream ChatMessage);        // bidirectional
}

message GetOrderRequest { string id = 1; }

message Order {
  string id = 1;          // field number, not a value
  int64 total = 2;
  Status status = 3;
  repeated Item items = 4;
  reserved 5;             // field 5 was removed; never reuse it
}

enum Status { STATUS_UNSPECIFIED = 0; PAID = 1; SHIPPED = 2; }`}</Code>
          <ul className="plain">
            <li>Only <b>field numbers</b> and values go over the wire, never names, so it is very compact. Field numbers 1–15 take one byte for the tag; reserve them for frequently used fields.</li>
            <li><b>Backward compatibility</b>: add new fields freely; never change the number or type of an existing field; when deleting a field, put its number in <code>reserved</code>.</li>
            <li>Fields not sent get default values (0, empty string). To tell “absent” from “zero”, use <code>optional</code> or a wrapper type.</li>
            <li>Besides <code>proto3</code>, Protobuf now has <b>Editions</b>, which gradually replace proto2/proto3 with feature options.</li>
          </ul>
        </section>
        <section id="grpc-kinds">
          <h2><span className="n">04</span>Four kinds of RPC</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 280" role="img" aria-label="Four kinds of RPC: unary sends one and receives one, server streaming sends one and receives many, client streaming sends many and receives one, bidirectional streams both ways independently"> <defs> <marker id="gka" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> <marker id="gkb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker> </defs> <rect className="s-bg" x="10" y="8" width="212" height="264" rx="10" /> <text className="s-tb" x="24" y="32">Unary</text> <rect className="s-box" x="22" y="46" width="54" height="190" rx="6" /> <text className="s-tm" x="49" y="144" textAnchor="middle" style={{ fill: "var(--ink)" }}>client</text> <rect className="s-hl" x="156" y="46" width="54" height="190" rx="6" /> <text className="s-tm" x="183" y="144" textAnchor="middle" style={{ fill: "var(--ink)" }}>server</text> <path className="s-ln" d="M78 66 H152" markerEnd="url(#gka)" /> <path className="s-ln2" d="M154 106 H80" markerEnd="url(#gkb)" /> <text className="s-tm" x="116" y="260" textAnchor="middle">1 → 1</text> <rect className="s-bg" x="232" y="8" width="212" height="264" rx="10" /> <text className="s-tb" x="246" y="32">Server streaming</text> <rect className="s-box" x="244" y="46" width="54" height="190" rx="6" /> <text className="s-tm" x="271" y="144" textAnchor="middle" style={{ fill: "var(--ink)" }}>client</text> <rect className="s-hl" x="378" y="46" width="54" height="190" rx="6" /> <text className="s-tm" x="405" y="144" textAnchor="middle" style={{ fill: "var(--ink)" }}>server</text> <path className="s-ln" d="M300 66 H374" markerEnd="url(#gka)" /> <path className="s-ln2" d="M376 106 H302" markerEnd="url(#gkb)" /> <path className="s-ln2" d="M376 130 H302" markerEnd="url(#gkb)" /> <path className="s-ln2" d="M376 154 H302" markerEnd="url(#gkb)" /> <text className="s-tm" x="338" y="260" textAnchor="middle">1 → many</text> <rect className="s-bg" x="454" y="8" width="212" height="264" rx="10" /> <text className="s-tb" x="468" y="32">Client streaming</text> <rect className="s-box" x="466" y="46" width="54" height="190" rx="6" /> <text className="s-tm" x="493" y="144" textAnchor="middle" style={{ fill: "var(--ink)" }}>client</text> <rect className="s-hl" x="600" y="46" width="54" height="190" rx="6" /> <text className="s-tm" x="627" y="144" textAnchor="middle" style={{ fill: "var(--ink)" }}>server</text> <path className="s-ln" d="M522 66 H596" markerEnd="url(#gka)" /> <path className="s-ln" d="M522 90 H596" markerEnd="url(#gka)" /> <path className="s-ln" d="M522 114 H596" markerEnd="url(#gka)" /> <path className="s-ln2" d="M598 154 H524" markerEnd="url(#gkb)" /> <text className="s-tm" x="560" y="260" textAnchor="middle">many → 1</text> <rect className="s-bg" x="676" y="8" width="212" height="264" rx="10" /> <text className="s-tb" x="690" y="32">Bidirectional</text> <rect className="s-box" x="688" y="46" width="54" height="190" rx="6" /> <text className="s-tm" x="715" y="144" textAnchor="middle" style={{ fill: "var(--ink)" }}>client</text> <rect className="s-hl" x="822" y="46" width="54" height="190" rx="6" /> <text className="s-tm" x="849" y="144" textAnchor="middle" style={{ fill: "var(--ink)" }}>server</text> <path className="s-ln" d="M744 66 H818" markerEnd="url(#gka)" /> <path className="s-ln2" d="M820 92 H746" markerEnd="url(#gkb)" /> <path className="s-ln" d="M744 118 H818" markerEnd="url(#gka)" /> <path className="s-ln" d="M744 144 H818" markerEnd="url(#gka)" /> <path className="s-ln2" d="M820 170 H746" markerEnd="url(#gkb)" /> <path className="s-ln2" d="M820 196 H746" markerEnd="url(#gkb)" /> <path className="s-ln" d="M744 222 H818" markerEnd="url(#gka)" /> <text className="s-tm" x="782" y="260" textAnchor="middle">many ⇄ many</text> </svg>
            </div>
            <figcaption>Teal arrows are messages sent by the client, orange arrows are messages returned by the server. Everything runs on one HTTP/2 stream.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Kind</th>
                  <th>Client sends</th>
                  <th>Server returns</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Unary</b></td>
                  <td>1</td>
                  <td>1</td>
                  <td>Get an order by id</td>
                </tr>
                <tr>
                  <td><b>Server streaming</b></td>
                  <td>1</td>
                  <td>Many</td>
                  <td>Track order status, export a large report</td>
                </tr>
                <tr>
                  <td><b>Client streaming</b></td>
                  <td>Many</td>
                  <td>1</td>
                  <td>Upload a file in chunks, send sensor readings</td>
                </tr>
                <tr>
                  <td><b>Bidirectional</b></td>
                  <td>Many</td>
                  <td>Many, independent</td>
                  <td>Chat between buyer and seller, two-way sync</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="grpc-status">
          <h2><span className="n">05</span>{"Deadline, metadata & status code"}</h2>
          <ul className="plain">
            <li><b>Deadline</b>: the client sets an expiry time for each call. When it passes, both client and server get a cancellation signal, and the deadline propagates to downstream calls. Always set a deadline; the default is no limit.</li>
            <li><b>Metadata</b>: key–value pairs sent with a call, like HTTP headers, used for tokens and trace ids. Keys ending in <code>-bin</code> carry binary data.</li>
            <li><b>Retries</b> are declared in the service config; only retry safe codes such as <code>UNAVAILABLE</code>.</li>
          </ul>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>When</th>
                  <th>HTTP equivalent</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">0</td>
                  <td>OK</td>
                  <td>Success</td>
                  <td>200</td>
                </tr>
                <tr>
                  <td className="m">1</td>
                  <td>CANCELLED</td>
                  <td>Client cancelled</td>
                  <td>499</td>
                </tr>
                <tr>
                  <td className="m">3</td>
                  <td>INVALID_ARGUMENT</td>
                  <td>Bad argument</td>
                  <td>400</td>
                </tr>
                <tr>
                  <td className="m">4</td>
                  <td>DEADLINE_EXCEEDED</td>
                  <td>Timed out</td>
                  <td>504</td>
                </tr>
                <tr>
                  <td className="m">5</td>
                  <td>NOT_FOUND</td>
                  <td>Does not exist</td>
                  <td>404</td>
                </tr>
                <tr>
                  <td className="m">6</td>
                  <td>ALREADY_EXISTS</td>
                  <td>Already exists</td>
                  <td>409</td>
                </tr>
                <tr>
                  <td className="m">7</td>
                  <td>PERMISSION_DENIED</td>
                  <td>No permission</td>
                  <td>403</td>
                </tr>
                <tr>
                  <td className="m">8</td>
                  <td>RESOURCE_EXHAUSTED</td>
                  <td>Quota exceeded</td>
                  <td>429</td>
                </tr>
                <tr>
                  <td className="m">9</td>
                  <td>FAILED_PRECONDITION</td>
                  <td>State does not allow it</td>
                  <td>400</td>
                </tr>
                <tr>
                  <td className="m">12</td>
                  <td>UNIMPLEMENTED</td>
                  <td>Method does not exist</td>
                  <td>501</td>
                </tr>
                <tr>
                  <td className="m">13</td>
                  <td>INTERNAL</td>
                  <td>Internal error</td>
                  <td>500</td>
                </tr>
                <tr>
                  <td className="m">14</td>
                  <td>UNAVAILABLE</td>
                  <td>Temporarily unavailable, retry</td>
                  <td>503</td>
                </tr>
                <tr>
                  <td className="m">16</td>
                  <td>UNAUTHENTICATED</td>
                  <td>Not authenticated</td>
                  <td>401</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="grpc-lb">
          <h2><span className="n">06</span>Load balancing: a common trap</h2>
          <p>gRPC keeps <b>one long-lived HTTP/2 connection</b> and sends every call over it. A layer 4 (TCP) load balancer only spreads <em>connections</em>, so all requests from one client land on the same server even if you run 10.</p>
          <div className="cmp">
            <div><h4>L7 proxy</h4>Envoy, NGINX, Linkerd, Istio understand HTTP/2 and balance per request. Easy to deploy, adds one network hop.</div>
            <div><h4>Client-side LB</h4>The client knows the server list itself (DNS, xDS) and balances, for example with the <code>round_robin</code> policy. Fastest, but the logic lives in the client.</div>
          </div>
          <p>On Kubernetes a regular ClusterIP Service is L4, so use a headless service with client-side LB, or a service mesh.</p>
        </section>
        <section id="grpc-web">
          <h2><span className="n">07</span>{"Browsers & tooling"}</h2>
          <ul className="plain">
            <li>Browsers cannot control HTTP/2 frames and trailers, so they cannot call gRPC directly. Use <b>gRPC-Web</b> through a proxy (Envoy), or the <b>Connect</b> protocol, which works over HTTP/1.1 and JSON too.</li>
            <li><b>Transcoding</b>: <code>grpc-gateway</code> or Envoy expose a REST/JSON API from the same <code>.proto</code> file (using <code>google.api.http</code> annotations) for external clients.</li>
            <li><b>Server reflection</b> lets tools list services; <code>grpcurl</code> calls them like <code>curl</code>.</li>
            <li>The standard <b>health checking protocol</b> (<code>grpc.health.v1.Health</code>) lets load balancers and Kubernetes probe servers.</li>
            <li><code>buf</code> lints, detects breaking changes (<code>buf breaking</code>) and manages <code>.proto</code> files.</li>
          </ul>
        </section>
        <section id="grpc-ref">
          <h2><span className="n">08</span>Quick reference</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Value / command</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Max receive message size (common default)</td>
                  <td className="m">4 MB</td>
                </tr>
                <tr>
                  <td>Default deadline</td>
                  <td className="m">none, set your own</td>
                </tr>
                <tr>
                  <td>Content-Type</td>
                  <td className="m">application/grpc</td>
                </tr>
                <tr>
                  <td>Sinh code</td>
                  <td className="m">protoc --go_out=. --go-grpc_out=. order.proto</td>
                </tr>
                <tr>
                  <td>List services</td>
                  <td className="m">grpcurl -plaintext localhost:50051 list</td>
                </tr>
                <tr>
                  <td>Try a call</td>
                  <td className="m">{"grpcurl -d '{\"id\":\"42\"}' localhost:50051 shop.v1.OrderService/GetOrder"}</td>
                </tr>
                <tr>
                  <td>Check compatibility</td>
                  <td className="m">buf breaking --against '.git#branch=main'</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
