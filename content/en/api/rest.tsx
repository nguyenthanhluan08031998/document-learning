import { Code } from "@/components/Code";

export default function RestPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="REST contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#rest-principle"><span>01</span>REST principles</a></li>
          <li><a href="#rest-flow"><span>02</span>Flow of a request</a></li>
          <li><a href="#rest-method"><span>03</span>HTTP method</a></li>
          <li><a href="#rest-status"><span>04</span>Status code</a></li>
          <li><a href="#rest-design"><span>05</span>URI design</a></li>
          <li><a href="#rest-cache"><span>06</span>{"Caching & conditions"}</a></li>
          <li><a href="#rest-security"><span>07</span>Security</a></li>
          <li><a href="#rest-ref"><span>08</span>Quick reference</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">rest · study notes</div>
          <h1>REST notebook: resources, methods and status codes</h1>
          <p className="lede">REST is an <b>architectural style</b> on top of HTTP: everything is a <b>resource</b> with its own URI, clients act on it with standard methods and receive a representation of it, usually JSON.</p>
          <div className="tape" aria-hidden="true">
            <div>GET</div>
            <div>/orders</div>
            <div>/42</div>
            <div className="hw">200 OK</div>
            <div className="leo">ETag</div>
          </div>
        </header>
        <section id="rest-principle">
          <h2><span className="n">01</span>REST principles</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Constraint</th>
                  <th>Meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Client–server</b></td>
                  <td>UI and data are separated and evolve independently.</td>
                </tr>
                <tr>
                  <td><b>Stateless</b></td>
                  <td>Each request carries everything it needs (token, parameters). The server keeps no session, so it scales out easily.</td>
                </tr>
                <tr>
                  <td><b>Cacheable</b></td>
                  <td>Responses declare whether they can be cached.</td>
                </tr>
                <tr>
                  <td><b>Uniform interface</b></td>
                  <td>URIs for resources, standard methods, clear media types, links to follow.</td>
                </tr>
                <tr>
                  <td><b>Layered system</b></td>
                  <td>Proxies, CDNs, gateways can sit in between without the client knowing.</td>
                </tr>
                <tr>
                  <td><b>Code on demand</b> (optional)</td>
                  <td>The server may send code for the client to run, for example JavaScript.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>Richardson Maturity Model</h3>
          <ol className="steps">
            <li>
              <div><b>Level 0</b><div className="d">One URI, everything via POST. RPC over HTTP.</div></div>
            </li>
            <li>
              <div><b>Level 1 · Resource</b><div className="d">Each resource has its own URI: <code>/orders/42</code>.</div></div>
            </li>
            <li>
              <div><b>Level 2 · HTTP verbs</b><div className="d">Correct methods and status codes. Most real-world “REST” APIs stop here.</div></div>
            </li>
            <li>
              <div><b>Level 3 · Hypermedia (HATEOAS)</b><div className="d">Responses contain links to the next actions; clients follow links instead of building URIs.</div></div>
            </li>
          </ol>
        </section>
        <section id="rest-flow">
          <h2><span className="n">02</span>Flow of a request</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 420" role="img" aria-label="Flow of a REST request from the client through cache, CDN and gateway to the service, and the response back"> <defs> <marker id="rfa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> <marker id="rfb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker> </defs> <rect className="s-bg" x="8" y="22" width="884" height="118" rx="10" /> <text className="s-lane" x="20" y="42">CLIENT</text> <rect className="s-bg" x="8" y="160" width="884" height="252" rx="10" /> <text className="s-lane" x="20" y="180">SERVER</text> <rect className="s-box" x="20" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="32" y="78">Build request</text><text className="s-tm" x="32" y="98">GET /orders/42</text> <rect className="s-box" x="195" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="207" y="78">DNS + TLS</text><text className="s-tm" x="207" y="98">resolve IP · HTTPS</text> <rect className="s-box" x="370" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="382" y="78">Client cache</text><text className="s-tm" x="382" y="98">max-age · ETag</text> <rect className="s-box" x="545" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="557" y="78">CDN</text><text className="s-tm" x="557" y="98">near the user</text> <rect className="s-box" x="720" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="732" y="78">Send request</text><text className="s-tm" x="732" y="98">headers + body</text> <path className="s-ln" d="M170 87 H193" markerEnd="url(#rfa)" /> <path className="s-ln" d="M345 87 H368" markerEnd="url(#rfa)" /> <path className="s-ln" d="M520 87 H543" markerEnd="url(#rfa)" /> <path className="s-ln" d="M695 87 H718" markerEnd="url(#rfa)" /> <rect className="s-box" x="720" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="732" y="216">API Gateway</text><text className="s-tm" x="732" y="236">auth · rate limit</text> <rect className="s-box" x="545" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="557" y="216">Router</text><text className="s-tm" x="557" y="236">method + path</text> <rect className="s-box" x="370" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="382" y="216">Validate</text><text className="s-tm" x="382" y="236">params · body</text> <rect className="s-hl" x="195" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="207" y="216">Handle</text><text className="s-tm" x="207" y="236">business logic</text> <rect className="s-box" x="20" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="32" y="216">Response</text><text className="s-tm" x="32" y="236">status · headers</text> <path className="s-ln" d="M720 225 H697" markerEnd="url(#rfa)" /> <path className="s-ln" d="M545 225 H522" markerEnd="url(#rfa)" /> <path className="s-ln" d="M370 225 H347" markerEnd="url(#rfa)" /> <path className="s-ln" d="M195 225 H172" markerEnd="url(#rfa)" /> <path className="s-ln" d="M795 122 V188" markerEnd="url(#rfa)" /> <text className="s-tm" x="805" y="158">HTTP</text> <path className="s-dl" d="M60 190 V124" markerEnd="url(#rfb)" /> <text className="s-tm" x="70" y="158">200 OK + JSON</text> <path className="s-dl" d="M270 262 V318" markerEnd="url(#rfb)" /> <rect className="s-disk" x="195" y="320" width="150" height="62" rx="7" /><text className="s-tb" x="207" y="344">Database</text><text className="s-tm" x="207" y="364">SQL / NoSQL</text> <path className="s-dl" d="M795 262 V318" markerEnd="url(#rfb)" /> <rect className="s-bad" x="720" y="320" width="150" height="62" rx="7" /><text className="s-tb" x="732" y="344">Reject early</text><text className="s-tm" x="732" y="364">401 · 403 · 429</text> <text className="s-tm" x="380" y="334">stateless: each request carries its token</text> <text className="s-tm" x="380" y="352">repeated GETs change nothing</text> <text className="s-tm" x="380" y="370">304 when the ETag is unchanged</text> </svg>
            </div>
            <figcaption>The top row runs on the client and nearby infrastructure, the bottom row on the server. A request can end early at a cache or the CDN.</figcaption>
          </figure>
          <ul className="plain">
            <li>A request can stop early at the <b>client cache</b> or the <b>CDN</b> if an earlier response is still fresh, never reaching the server.</li>
            <li>The <b>API Gateway</b> handles shared concerns: auth, rate limiting, logging, routing to the right service.</li>
            <li>A response has a <b>status line</b>, <b>headers</b> (Content-Type, Cache-Control, ETag…) and a <b>body</b>.</li>
          </ul>
        </section>
        <section id="rest-method">
          <h2><span className="n">03</span>HTTP method</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Used for</th>
                  <th>Safe</th>
                  <th>Idempotent</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">GET</td>
                  <td>Read a resource</td>
                  <td>Yes</td>
                  <td>Yes</td>
                  <td><code>GET /orders/42</code></td>
                </tr>
                <tr>
                  <td className="m">POST</td>
                  <td>Create or trigger an action</td>
                  <td>No</td>
                  <td>No</td>
                  <td><code>POST /orders</code></td>
                </tr>
                <tr>
                  <td className="m">PUT</td>
                  <td>Replace the whole resource</td>
                  <td>No</td>
                  <td>Yes</td>
                  <td><code>PUT /orders/42</code></td>
                </tr>
                <tr>
                  <td className="m">PATCH</td>
                  <td>Partial update</td>
                  <td>No</td>
                  <td>Not guaranteed</td>
                  <td><code>PATCH /orders/42</code></td>
                </tr>
                <tr>
                  <td className="m">DELETE</td>
                  <td>Delete</td>
                  <td>No</td>
                  <td>Yes</td>
                  <td><code>DELETE /orders/42</code></td>
                </tr>
                <tr>
                  <td className="m">HEAD</td>
                  <td>Like GET without a body</td>
                  <td>Yes</td>
                  <td>Yes</td>
                  <td>Check existence, size</td>
                </tr>
                <tr>
                  <td className="m">OPTIONS</td>
                  <td>Ask which methods are allowed, CORS preflight</td>
                  <td>Yes</td>
                  <td>Yes</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
          <p><b>Safe</b>: does not change data. <b>Idempotent</b>: calling once or many times leaves the same final state, so clients can retry safely.</p>
          <div className="note tip"><b>Making POST safe to retry:</b> the client sends an <code>Idempotency-Key</code> header (a UUID). The server stores the result by key and returns the stored result when the same key comes again, instead of creating a second record. Payment APIs commonly do this.</div>
        </section>
        <section id="rest-status">
          <h2><span className="n">04</span>Status code</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Meaning</th>
                  <th>When to use</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">200 OK</td>
                  <td>Success</td>
                  <td>GET, PUT, PATCH returning data</td>
                </tr>
                <tr>
                  <td className="m">201 Created</td>
                  <td>Created</td>
                  <td>POST that creates, with a <code>Location</code> header</td>
                </tr>
                <tr>
                  <td className="m">202 Accepted</td>
                  <td>Accepted, processed later</td>
                  <td>Asynchronous work</td>
                </tr>
                <tr>
                  <td className="m">204 No Content</td>
                  <td>Success, no body</td>
                  <td>DELETE</td>
                </tr>
                <tr>
                  <td className="m">301 / 308</td>
                  <td>Moved permanently</td>
                  <td>URI changed</td>
                </tr>
                <tr>
                  <td className="m">304 Not Modified</td>
                  <td>Unchanged</td>
                  <td>Cached copy still valid</td>
                </tr>
                <tr>
                  <td className="m">400 Bad Request</td>
                  <td>Malformed request</td>
                  <td>Broken JSON, missing parameter</td>
                </tr>
                <tr>
                  <td className="m">401 Unauthorized</td>
                  <td>Not authenticated</td>
                  <td>Missing or invalid token</td>
                </tr>
                <tr>
                  <td className="m">403 Forbidden</td>
                  <td>No permission</td>
                  <td>Logged in but not allowed</td>
                </tr>
                <tr>
                  <td className="m">404 Not Found</td>
                  <td>Does not exist</td>
                  <td />
                </tr>
                <tr>
                  <td className="m">409 Conflict</td>
                  <td>State conflict</td>
                  <td>Duplicate data, stale version</td>
                </tr>
                <tr>
                  <td className="m">412 Precondition Failed</td>
                  <td>Precondition not met</td>
                  <td><code>If-Match</code> does not match the ETag</td>
                </tr>
                <tr>
                  <td className="m">422 Unprocessable Content</td>
                  <td>Valid syntax but breaks business rules</td>
                  <td>Validation failed</td>
                </tr>
                <tr>
                  <td className="m">429 Too Many Requests</td>
                  <td>Rate limit exceeded</td>
                  <td>With <code>Retry-After</code></td>
                </tr>
                <tr>
                  <td className="m">500 Internal Server Error</td>
                  <td>Server error</td>
                  <td />
                </tr>
                <tr>
                  <td className="m">502 / 503 / 504</td>
                  <td>Gateway error / overloaded / timeout</td>
                  <td>Infrastructure layer failures</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Error bodies should follow <b>Problem Details</b> (RFC 9457), content type <code>application/problem+json</code>:</p>
          <Code lang="json">{`{
  "type": "https://api.example.com/errors/out-of-stock",
  "title": "Out of stock",
  "status": 409,
  "detail": "Item SKU-123 has only 2 units left",
  "instance": "/orders/42"
}`}</Code>
        </section>
        <section id="rest-design">
          <h2><span className="n">05</span>URI design</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Do</th>
                  <th>Don't</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>GET /orders</code></td>
                  <td><code>GET /getAllOrders</code></td>
                </tr>
                <tr>
                  <td><code>POST /orders</code></td>
                  <td><code>POST /createOrder</code></td>
                </tr>
                <tr>
                  <td><code>GET /users/7/orders</code></td>
                  <td><code>{"GET /orders?userId=7&type=user"}</code> when the relation is clear</td>
                </tr>
                <tr>
                  <td><code>POST /orders/42/cancel</code></td>
                  <td><code>PUT /orders/42</code> with a confusing <code>"cancel": true</code> flag</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="plain">
            <li>Plural nouns, lowercase, hyphenated: <code>/order-items</code>. Nest no more than 2 levels.</li>
            <li><b>Filtering and sorting</b> via the query string: <code>{"?status=paid&sort=-created_at"}</code>.</li>
            <li><b>Pagination</b>: offset (<code>{"?page=3&size=20"}</code>) is easy but slow and drifts when data changes; cursor (<code>?after=eyJpZCI6NDJ9</code>) is stable and fast on large data.</li>
            <li><b>Versioning</b>: in the URI (<code>/v1/orders</code>) is most common; or via header/media type. Only bump the version for breaking changes.</li>
            <li>Describe the API with <b>OpenAPI</b> (3.1 or later) to generate docs, clients and automated tests.</li>
          </ul>
        </section>
        <section id="rest-cache">
          <h2><span className="n">06</span>{"Caching & conditional requests"}</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Header</th>
                  <th>Effect</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">Cache-Control</td>
                  <td><code>max-age=60</code>, <code>no-store</code>, <code>private</code>, <code>public</code>: who may cache, and for how long.</td>
                </tr>
                <tr>
                  <td className="m">ETag</td>
                  <td>A “fingerprint” of the resource version, for example <code>"v7"</code>.</td>
                </tr>
                <tr>
                  <td className="m">If-None-Match</td>
                  <td>The client sends the ETag it has; if unchanged, the server returns <b>304</b> without the body.</td>
                </tr>
                <tr>
                  <td className="m">If-Match</td>
                  <td>Update only if the ETag still matches, so nobody overwrites someone else's change (returns <b>412</b> on mismatch).</td>
                </tr>
                <tr>
                  <td className="m">Last-Modified / If-Modified-Since</td>
                  <td>Like ETag but time based, less precise.</td>
                </tr>
                <tr>
                  <td className="m">Vary</td>
                  <td>Tells caches which headers make responses differ, for example <code>Accept-Language</code>.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="rest-security">
          <h2><span className="n">07</span>Security</h2>
          <ul className="plain">
            <li>Always use <b>HTTPS</b>. Never put tokens or sensitive data in the URL, because URLs end up in logs.</li>
            <li><b>Authentication</b>: API keys for simple server-to-server; <b>OAuth 2.0 / OpenID Connect</b> with Bearer tokens (usually JWT) for users.</li>
            <li><b>Authorization</b> per resource: check that <code>/orders/42</code> belongs to the caller. This is the most common flaw (BOLA/IDOR).</li>
            <li><b>Rate limit</b> per user or IP, returning 429 with <code>Retry-After</code>.</li>
            <li><b>CORS</b>: allow only the origins you need; browsers send an OPTIONS preflight before “non-simple” requests.</li>
            <li>Validate every input, cap body size and items per page.</li>
          </ul>
        </section>
        <section id="rest-ref">
          <h2><span className="n">08</span>Quick reference</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Header</th>
                  <th>Side</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">Authorization</td>
                  <td>Request</td>
                  <td><code>Bearer eyJhbGci…</code></td>
                </tr>
                <tr>
                  <td className="m">Content-Type</td>
                  <td>Both</td>
                  <td><code>application/json</code></td>
                </tr>
                <tr>
                  <td className="m">Accept</td>
                  <td>Request</td>
                  <td><code>application/json</code></td>
                </tr>
                <tr>
                  <td className="m">Idempotency-Key</td>
                  <td>Request</td>
                  <td><code>3f2c…</code> (UUID)</td>
                </tr>
                <tr>
                  <td className="m">Location</td>
                  <td>Response</td>
                  <td><code>/orders/43</code> after creation</td>
                </tr>
                <tr>
                  <td className="m">Retry-After</td>
                  <td>Response</td>
                  <td><code>30</code> (seconds)</td>
                </tr>
                <tr>
                  <td className="m">X-Request-Id / traceparent</td>
                  <td>Both</td>
                  <td>Trace a request across services</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
