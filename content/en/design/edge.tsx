import { Code } from "@/components/Code";
import { Box, Label, Markers } from "@/components/Svg";

// Rows of the comparison diagram: [component, role line, server note]
const ROWS: [string, string, string][] = [
  ["Reverse Proxy", "nginx · Envoy · Apache httpd", "hides real servers"],
  ["API Gateway", "Kong · Apigee · AWS API Gateway", "routes per service"],
  ["Load Balancer", "HAProxy · AWS ALB · Azure LB", "spreads load, checks health"],
];

export default function DesignEdgePage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Reverse Proxy, API Gateway, Load Balancer contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#ed-overview"><span>01</span>Where each one sits</a></li>
          <li><a href="#ed-proxy"><span>02</span>Reverse Proxy</a></li>
          <li><a href="#ed-gateway"><span>03</span>API Gateway</a></li>
          <li><a href="#ed-lb"><span>04</span>Load Balancer</a></li>
          <li><a href="#ed-together"><span>05</span>Using them together</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">design · edge</div>
          <h1>Reverse Proxy, API Gateway, Load Balancer</h1>
          <p className="lede">All three sit between clients and servers, so they are easy to confuse. They differ in <b>purpose</b>: a proxy acts on behalf of servers and hides them, a gateway is the front door with API-level logic, a load balancer spreads load and drops failed servers. One product such as nginx or Envoy can play all three roles, so what to distinguish is the role, not the software name.</p>
          <div className="tape" aria-hidden="true">
            <div>nginx</div>
            <div>Envoy</div>
            <div className="hw">Kong</div>
            <div>HAProxy</div>
            <div>ALB</div>
          </div>
        </header>

        <section id="ed-overview">
          <h2><span className="n">01</span>Where each one sits</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 340" role="img" aria-label="Three rows: a client goes through a Reverse Proxy to hidden servers; through an API Gateway to services; through a Load Balancer to several replicas of the same server">
                <Markers id="ed" />
                {ROWS.map(([t, s, n], i) => {
                  const y = 8 + i * 110;
                  return (
                    <g key={t}>
                      <Box x={20} y={y + 10} w={150} h={70} title="Client" sub="web · mobile" />
                      <path className="s-ln" d={`M170 ${y + 45} H320`} markerEnd="url(#eda)" />
                      <Box x={322} y={y + 5} w={256} h={80} title={t} sub={s} cls="s-hl" />
                      <path className="s-ln" d={`M578 ${y + 45} H730`} markerEnd="url(#eda)" />
                      {[0, 1].map(k => (
                        <Box key={k} x={732} y={y + 4 + k * 42} w={148} h={36} title={i === 1 ? ["order-svc", "user-svc"][k] : i === 2 ? `app #${k + 1}` : `server ${k + 1}`} />
                      ))}
                      <Label x={654} y={y + 38} anchor="middle">{n}</Label>
                    </g>
                  );
                })}
              </svg>
            </div>
            <figcaption>The same position on the request path, different roles.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr><th></th><th>Reverse Proxy</th><th>API Gateway</th><th>Load Balancer</th></tr>
              </thead>
              <tbody>
                <tr><td><b>Main purpose</b></td><td>Receive requests on behalf of servers, hide the real ones</td><td>One unified entry point for many APIs/services</td><td>Spread requests across replicas</td></tr>
                <tr><td><b>Understands</b></td><td>HTTP: host, path, headers</td><td>APIs: routes, users, keys, quotas, versions</td><td>Load and health of each server</td></tr>
                <tr><td><b>Typical jobs</b></td><td>TLS termination, caching, compression, static files</td><td>Auth, rate limiting, route rewriting, aggregation</td><td>Round robin, health checks, failover</td></tr>
                <tr><td><b>Calls several services per request</b></td><td>No</td><td>Yes (aggregation)</td><td>No</td></tr>
                <tr><td><b>Examples</b></td><td>nginx, Envoy, Apache</td><td>Kong, Apigee, AWS API Gateway</td><td>HAProxy, AWS ALB, Azure LB</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="ed-proxy">
          <h2><span className="n">02</span>Reverse Proxy</h2>
          <p>Clients only know the proxy&apos;s address. The proxy receives the request and forwards it to an internal server, so the real server is never exposed to the internet. Unlike a <i>forward proxy</i> (on the client&apos;s side, such as a company proxy), a reverse proxy stands on the server&apos;s side.</p>
          <ul className="plain">
            <li><b>TLS termination:</b> decrypt HTTPS at the proxy; run HTTP or mTLS internally.</li>
            <li><b>Caching and compression:</b> serve static content, gzip/brotli, take load off the app.</li>
            <li><b>Protection:</b> hide the topology, block bad requests, cap request size, add security headers.</li>
          </ul>
          <Code lang="nginx">{`server {
  listen 443 ssl http2;
  server_name shop.example.com;

  location /static/ {                 # served and cached by the proxy itself
    root /var/www;
    expires 7d;
  }

  location / {
    proxy_pass http://app:3000;       # the real server is never exposed
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;   # keep the client IP
  }
}`}</Code>
        </section>

        <section id="ed-gateway">
          <h2><span className="n">03</span>API Gateway</h2>
          <p>A gateway is a reverse proxy with <b>knowledge of your API</b>. It is the single entry point of a microservice system and collects the shared concerns so each service does not have to.</p>
          <ul className="plain">
            <li><b>Authentication and authorization:</b> verify a JWT or API key before a request reaches a service (see the SSO &amp; Microservice page).</li>
            <li><b>Rate limiting, quotas, throttling</b> per user or key.</li>
            <li><b>Routing:</b> <code>/orders</code> to order-svc, <code>/users</code> to user-svc; API versioning, canary releases.</li>
            <li><b>Aggregation:</b> for one mobile request the gateway calls several services and merges the result (also called a BFF).</li>
            <li><b>Translation and observability:</b> protocol translation (REST to gRPC), central logs, metrics, traces.</li>
          </ul>
          <Code lang="ts">{`// Aggregation at the gateway: one call from the client, three calls inside
app.get("/home", authenticate, rateLimit, async (req, res) => {
  const [user, orders, promos] = await Promise.all([
    fetch("http://user-svc/me", { headers: forward(req) }).then(r => r.json()),
    fetch("http://order-svc/recent", { headers: forward(req) }).then(r => r.json()),
    fetch("http://promo-svc/active").then(r => r.json()),
  ]);
  res.json({ user, orders, promos });   // mobile makes 1 round trip instead of 3
});`}</Code>
          <div className="note"><b>Careful:</b> the gateway is a single point of failure and easily grows into a &quot;big ball&quot; holding business logic. Keep only cross-cutting work here (auth, limits, routing); business logic belongs in services.</div>
        </section>

        <section id="ed-lb">
          <h2><span className="n">04</span>Load Balancer</h2>
          <p>It takes requests at one public address and spreads them across replicas of the same service. It <b>monitors health</b> and stops sending traffic to failed servers, improving both capacity and availability.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Type</th><th>Based on</th><th>Notes</th></tr>
              </thead>
              <tbody>
                <tr><td><b>L4</b> (TCP/UDP)</td><td>IP, port</td><td>Very fast, does not read content. Example: AWS NLB</td></tr>
                <tr><td><b>L7</b> (HTTP)</td><td>Host, path, headers, cookies</td><td>Flexible, can route by path. Examples: AWS ALB, HAProxy</td></tr>
              </tbody>
            </table>
          </div>
          <ul className="plain">
            <li><b>Algorithms:</b> round robin, least connections, weighted, IP hash (same client to the same server).</li>
            <li><b>Health checks:</b> call <code>/health</code> periodically; a server that fails repeatedly is removed and re-added when it recovers.</li>
            <li><b>Sticky sessions:</b> pin a user to one server when state lives in RAM. Better: keep services stateless and move state to Redis.</li>
          </ul>
          <Code lang="nginx">{`upstream app {
  least_conn;                               # pick the server with fewest connections
  server 10.0.1.11:3000 max_fails=3 fail_timeout=10s;   # passive health check
  server 10.0.1.12:3000 max_fails=3 fail_timeout=10s;
  server 10.0.1.13:3000 backup;             # used only when the others are down
}

server {
  location / { proxy_pass http://app; }
}`}</Code>
        </section>

        <section id="ed-together">
          <h2><span className="n">05</span>Using them together</h2>
          <p>In a real system they are layered, not substitutes:</p>
          <ol className="steps">
            <li><div><b>Outermost load balancer</b><div className="d">One public address (ALB) that spreads requests over several gateway replicas and drops broken ones.</div></div></li>
            <li><div><b>API Gateway</b><div className="d">Authentication, rate limiting, routing to the right service; often itself a reverse proxy such as Envoy or Kong.</div></div></li>
            <li><div><b>Internal load balancing</b><div className="d">In front of each service with several replicas: a Kubernetes Service, or service mesh sidecars that balance on their own.</div></div></li>
          </ol>
          <div className="pp">
            <div><span className="pl">Pick a Reverse Proxy when</span>You have one app and need TLS, caching, static files, hidden servers. Simple is enough.</div>
            <div><span className="pl">Pick an API Gateway when</span>You have many services and client types and need auth, quotas, versioning and API aggregation in one place.</div>
            <div><span className="pl">Pick a Load Balancer when</span>One service runs several replicas and must survive load and failures.</div>
            <div className="warnc"><span className="pl">Avoid</span>Putting business logic in the gateway, or running a heavy gateway for a small app that only needs nginx.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
