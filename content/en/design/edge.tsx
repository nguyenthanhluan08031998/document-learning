import { Code } from "@/components/Code";

// Image is served from /public; prefix the base path when hosted under a sub-path (GitHub Pages)
const IMG = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/reverse-proxy-vs-gateway-vs-lb.png`;

export default function DesignEdgePage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Reverse Proxy, API Gateway, Load Balancer contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#ed-overview"><span>01</span>Quick comparison</a></li>
          <li><a href="#ed-each"><span>02</span>What each one does</a></li>
          <li><a href="#ed-together"><span>03</span>Using them together</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">design · edge</div>
          <h1>Reverse Proxy, API Gateway, Load Balancer</h1>
          <p className="lede">All three sit between clients and servers, so they are easy to confuse. In short: <b>a proxy hides servers</b>, <b>a gateway is a front door with rules</b>, <b>a load balancer spreads load</b>. nginx or Envoy can do all three, so tell them apart by role, not by software name.</p>
        </header>

        <section id="ed-overview">
          <h2><span className="n">01</span>Quick comparison</h2>
          <figure className="fig">
            <img src={IMG} alt="Reverse Proxy, API Gateway and Load Balancer: position between clients and servers, example software and what each does" />
            <figcaption>Source: Level Up Coding (blog.levelupcoding.com).</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr><th></th><th>Reverse Proxy</th><th>API (Application Programming Interface) Gateway</th><th>Load Balancer</th></tr>
              </thead>
              <tbody>
                <tr><td><b>Purpose</b></td><td>Receive requests on behalf of servers</td><td>One front door for many services</td><td>Spread requests across replicas</td></tr>
                <tr><td><b>Understands</b></td><td>HTTP (HyperText Transfer Protocol) (host, path)</td><td>APIs (user, key, quota, version)</td><td>Load and server health</td></tr>
                <tr><td><b>Merges several services</b></td><td>No</td><td>Yes</td><td>No</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="ed-each">
          <h2><span className="n">02</span>What each one does</h2>
          <div className="pp">
            <div><span className="pl">Reverse Proxy</span>Clients only know the proxy&apos;s address; real servers are never exposed to the internet. Handles TLS (Transport Layer Security) termination, caching, compression, static files.</div>
            <div><span className="pl">API Gateway</span>A proxy that understands your API: authentication, rate limiting, routing <code>/orders</code> to order-svc, merging results from several services. See also the SSO (Single Sign-On) &amp; Microservice page.</div>
            <div><span className="pl">Load Balancer</span>One public address, many replicas behind it. Periodic health checks remove broken servers. L4 (TCP) is fast; L7 (HTTP) can route by path.</div>
            <div className="warnc"><span className="pl">Careful</span>The gateway is a single point of failure and easily grows into a &quot;big ball&quot;. Keep only shared concerns (auth, limits, routing) there; business logic belongs in services.</div>
          </div>
          <Code lang="nginx">{`upstream app {
  least_conn;                                  # load balancer: fewest connections first
  server 10.0.1.11:3000 max_fails=3 fail_timeout=10s;   # dropped after 3 failures
  server 10.0.1.12:3000 max_fails=3 fail_timeout=10s;
}

server {
  listen 443 ssl;                              # reverse proxy: TLS ends here
  location / {
    proxy_pass http://app;                     # real servers stay hidden
    proxy_set_header X-Forwarded-For $remote_addr;
  }
}`}</Code>
        </section>

        <section id="ed-together">
          <h2><span className="n">03</span>Using them together</h2>
          <p>In a real system they are layered, not substitutes:</p>
          <ol className="steps">
            <li><div><b>Outermost load balancer</b><div className="d">One public address (ALB) spreading requests over several gateway replicas.</div></div></li>
            <li><div><b>API Gateway</b><div className="d">Authentication, rate limiting, routing to the right service; often itself a reverse proxy such as Envoy or Kong.</div></div></li>
            <li><div><b>Internal load balancing</b><div className="d">In front of each service with several replicas (Kubernetes Service, service mesh).</div></div></li>
          </ol>
          <div className="note tip"><b>Quick pick:</b> one small app needing TLS and caching only needs a reverse proxy. Many services needing auth and quotas add a gateway. Several replicas need a load balancer.</div>
        </section>
      </main>
    </div>
  );
}
