export default function BuildLoggerPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Logger contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#lb-basic"><span>01</span>Basic logger</a></li>
          <li><a href="#lb-ids"><span>02</span>Adding traceId, spanId, correlationId</a></li>
          <li><a href="#lb-propagate"><span>03</span>Passing to other services</a></li>
          <li><a href="#lb-compare"><span>04</span>Comparing the IDs</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">operations · logger</div>
          <h1>A logger within one service and across services</h1>
          <p className="lede">Three diagrams: logging inside one service, attaching IDs per request, then linking logs across services.</p>
        </header>

        <section id="lb-basic">
          <h2><span className="n">01</span>Basic logger</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 240" role="img" aria-label="Business code calls log.info with request data; the Logger filters by level, merges fields and hides secrets; the Transport writes one JSON line with level, service, msg and the request data"> <defs><marker id="lba" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs> <rect className="s-box" x="16" y="70" width="190" height="80" rx="7" /><text className="s-tb" x="28" y="96">Business code</text><text className="s-tm" x="28" y="116">log.info("placing order",</text><text className="s-tm" x="28" y="134">{"{ userId, amount, password })"}</text> <path className="s-ln" d="M206 110 H238" markerEnd="url(#lba)" /> <rect className="s-hl" x="240" y="62" width="190" height="96" rx="8" /><text className="s-tb" x="254" y="86">Logger</text><text className="s-tm" x="254" y="108" style={{ fill: "var(--ink)" }}>filter by level</text><text className="s-tm" x="254" y="126" style={{ fill: "var(--ink)" }}>merge fields (service, …)</text><text className="s-tm" x="254" y="144" style={{ fill: "var(--ink)" }}>hide secrets (password)</text> <path className="s-ln" d="M430 110 H462" markerEnd="url(#lba)" /> <rect className="s-disk" x="464" y="78" width="140" height="64" rx="7" /><text className="s-tb" x="476" y="104">Transport</text><text className="s-tm" x="476" y="124">JSON ra stdout</text> <path className="s-ln" d="M604 110 H636" markerEnd="url(#lba)" /> <rect className="s-box" x="638" y="20" width="246" height="180" rx="7" /><text className="s-tb" x="650" y="44">Log line</text><text className="s-tm" x="650" y="66">{"{\"level\":\"info\","}</text><text className="s-tm" x="650" y="84">{" \"service\":\"order-svc\","}</text><text className="s-tm" x="650" y="102">{" \"msg\":\"placing order\","}</text><text className="s-tm" x="650" y="120" style={{ fill: "var(--ink)" }}>{" \"userId\":\"u-12\","}</text><text className="s-tm" x="650" y="138" style={{ fill: "var(--ink)" }}>{" \"amount\":100000,"}</text><text className="s-tm" x="650" y="156" style={{ fill: "var(--ink)" }}>{" \"password\":\"[REDACTED]\"}"}</text><text className="s-tm" x="650" y="186">request data is the 2nd argument</text> <text className="s-tm" x="16" y="226">It has the request data but not which request the line belongs to when many run at once.</text> </svg>
            </div>
          </figure>
        </section>

        <section id="lb-ids">
          <h2><span className="n">02</span>Adding traceId, spanId, correlationId</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 290" role="img" aria-label="A POST /orders request arrives with traceparent and x-correlation-id headers; middleware reads or generates the IDs and puts method and path into a child logger; the log line has the three IDs plus method, path, userId and amount"> <defs><marker id="lbb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs> <rect className="s-box" x="16" y="70" width="176" height="112" rx="7" /><text className="s-tb" x="28" y="94">Incoming request</text><text className="s-tm" x="28" y="114">POST /orders</text><text className="s-tm" x="28" y="132">{"body { userId, amount }"}</text><text className="s-tm" x="28" y="150">header traceparent</text><text className="s-tm" x="28" y="168">x-correlation-id</text> <path className="s-ln" d="M192 126 H222" markerEnd="url(#lbb)" /> <rect className="s-hl" x="224" y="58" width="226" height="136" rx="8" /><text className="s-tb" x="238" y="82">Middleware</text><text className="s-tm" x="238" y="104" style={{ fill: "var(--ink)" }}>traceId: from the header or generated</text><text className="s-tm" x="238" y="122" style={{ fill: "var(--ink)" }}>spanId: always newly generated</text><text className="s-tm" x="238" y="140" style={{ fill: "var(--ink)" }}>correlationId: business key</text><text className="s-tm" x="238" y="158" style={{ fill: "var(--ink)" }}>+ method, path</text><text className="s-tm" x="238" y="180" style={{ fill: "var(--ink)" }}>→ child logger cho request</text> <path className="s-ln" d="M450 126 H478" markerEnd="url(#lbb)" /> <rect className="s-disk" x="480" y="88" width="148" height="76" rx="7" /><text className="s-tb" x="492" y="114">log.info(msg,</text><text className="s-tm" x="492" y="134">{"{ userId, amount })"}</text><text className="s-tm" x="492" y="152">no IDs passed by hand</text> <path className="s-ln" d="M628 126 H656" markerEnd="url(#lbb)" /> <rect className="s-box" x="658" y="14" width="226" height="230" rx="7" /><text className="s-tb" x="670" y="38">Log line</text><text className="s-tm" x="670" y="60">"level":"info",</text><text className="s-tm" x="670" y="78">"service":"order-svc",</text><text className="s-tm" x="670" y="96" style={{ fill: "var(--accent)" }}>"traceId":"traceId_1",</text><text className="s-tm" x="670" y="114" style={{ fill: "var(--accent)" }}>"spanId":"spanId_2",</text><text className="s-tm" x="670" y="132" style={{ fill: "var(--accent)" }}>"correlationId":"ord-42",</text><text className="s-tm" x="670" y="150" style={{ fill: "var(--ink)" }}>"method":"POST",</text><text className="s-tm" x="670" y="168" style={{ fill: "var(--ink)" }}>"path":"/orders",</text><text className="s-tm" x="670" y="186" style={{ fill: "var(--ink)" }}>"userId":"u-12",</text><text className="s-tm" x="670" y="204" style={{ fill: "var(--ink)" }}>"amount":100000,</text><text className="s-tm" x="670" y="222">"msg":"placing order"</text> <text className="s-tm" x="16" y="266">traceId = one request · spanId = one step in the request · correlationId = one business flow (possibly many requests, retries included).</text> </svg>
            </div>
          </figure>
        </section>

        <section id="lb-propagate">
          <h2><span className="n">03</span>Passing to other services</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 270" role="img" aria-label="order-svc calls payment-svc with a traceparent header carrying its traceId and spanId plus x-correlation-id; payment-svc keeps the traceId, generates a new spanId and uses the old one as parentSpanId; searching the traceId in Kibana returns logs from both services"> <defs><marker id="lbc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs> <rect className="s-hl" x="16" y="30" width="230" height="104" rx="8" /><text className="s-tb" x="30" y="54">order-svc</text><text className="s-tm" x="30" y="76" style={{ fill: "var(--ink)" }}>traceId traceId_1</text><text className="s-tm" x="30" y="94" style={{ fill: "var(--ink)" }}>spanId spanId_2</text><text className="s-tm" x="30" y="112" style={{ fill: "var(--ink)" }}>correlationId ord-42</text> <path className="s-ln" d="M246 82 H636" markerEnd="url(#lbc)" /> <text className="s-tm" x="270" y="62" style={{ fill: "var(--ink)" }}>HTTP / message header</text> <text className="s-tm" x="270" y="104">traceparent: 00-traceId_1-spanId_2-01</text> <text className="s-tm" x="270" y="122">x-correlation-id: ord-42</text> <rect className="s-hl" x="638" y="30" width="246" height="104" rx="8" /><text className="s-tb" x="652" y="54">payment-svc</text><text className="s-tm" x="652" y="76" style={{ fill: "var(--ink)" }}>traceId traceId_1 (unchanged)</text><text className="s-tm" x="652" y="94" style={{ fill: "var(--ink)" }}>spanId spanId_3 (new)</text><text className="s-tm" x="652" y="112" style={{ fill: "var(--ink)" }}>parentSpanId spanId_2</text> <path className="s-dl" d="M131 134 V178" markerEnd="url(#lbc)" /> <path className="s-dl" d="M761 134 V178" markerEnd="url(#lbc)" /> <rect className="s-disk" x="16" y="180" width="868" height="66" rx="7" /><text className="s-tb" x="30" y="204">Kibana: search traceId: "traceId_1"</text><text className="s-tm" x="30" y="226">returns order-svc and payment-svc logs from the same request, in time order; parentSpanId shows which step called which</text> </svg>
            </div>
          </figure>
        </section>
        <section id="lb-compare">
          <h2><span className="n">04</span>Comparing the IDs</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Scope</th>
                  <th>Created by</th>
                  <th>When calling another service</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">requestId</td>
                  <td>One request in one service</td>
                  <td>The server / gateway on receiving a request</td>
                  <td>Usually generated anew in each service</td>
                  <td className="m">requestId_2</td>
                </tr>
                <tr>
                  <td className="m">traceId</td>
                  <td>One request across all services</td>
                  <td>The first service</td>
                  <td>Kept unchanged</td>
                  <td className="m">traceId_1</td>
                </tr>
                <tr>
                  <td className="m">spanId</td>
                  <td>One step in a trace</td>
                  <td>Each service / each step</td>
                  <td>Generated anew</td>
                  <td className="m">spanId_3</td>
                </tr>
                <tr>
                  <td className="m">parentSpanId</td>
                  <td>The step that called this one</td>
                  <td>Taken from the caller's spanId</td>
                  <td>= the previous service's spanId</td>
                  <td className="m">spanId_2</td>
                </tr>
                <tr>
                  <td className="m">correlationId</td>
                  <td>One business flow, possibly many traces (retries, jobs, webhooks)</td>
                  <td>Where the business flow starts, often the order number</td>
                  <td>Kept unchanged, even through a job the next day</td>
                  <td className="m">ord-42</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>From smallest to largest: spanId &lt; requestId ≈ one service &lt; traceId = the whole request &lt; correlationId = the whole business flow. Many systems simply use the traceId as the requestId.</p>
          <h3>Example: order ord-42</h3>
          <p>A customer places an order: api-gateway calls order-svc, order-svc calls payment-svc. The confirmation email fails, and a retry job resends it the next day.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>#</th><th>service</th><th>requestId</th><th>traceId</th><th>spanId</th><th>parentSpanId</th><th>correlationId</th><th>msg</th></tr>
              </thead>
              <tbody>
                <tr><td className="m">1</td><td className="m">api-gateway</td><td className="m">requestId_1</td><td className="m">traceId_1</td><td className="m">spanId_1</td><td className="m">–</td><td className="m">ord-42</td><td>POST /orders</td></tr>
                <tr><td className="m">2</td><td className="m">order-svc</td><td className="m">requestId_2</td><td className="m">traceId_1</td><td className="m">spanId_2</td><td className="m">spanId_1</td><td className="m">ord-42</td><td>placing order</td></tr>
                <tr><td className="m">3</td><td className="m">payment-svc</td><td className="m">requestId_3</td><td className="m">traceId_1</td><td className="m">spanId_3</td><td className="m">spanId_2</td><td className="m">ord-42</td><td>charge accepted</td></tr>
                <tr><td className="m">4</td><td className="m">email-retry (next day)</td><td className="m">requestId_4</td><td className="m">traceId_2</td><td className="m">spanId_4</td><td className="m">–</td><td className="m">ord-42</td><td>email sent</td></tr>
              </tbody>
            </table>
          </div>
          <ul>
            <li>Search <code>requestId: requestId_2</code> → only line 2 (one service).</li>
            <li>Search <code>traceId: traceId_1</code> → lines 1–3 (the whole request across 3 services); parentSpanId shows 1 called 2 and 2 called 3.</li>
            <li>Search <code>correlationId: ord-42</code> → all 4 lines, including the retry job running in a different trace.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
