import { Code } from "@/components/Code";

export default function LoggingPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Logging basics contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#lg-why"><span>01</span>Why log</a></li>
          <li><a href="#lg-levels"><span>02</span>Log level</a></li>
          <li><a href="#lg-what"><span>03</span>What to log</a></li>
          <li><a href="#lg-not"><span>04</span>What never to log</a></li>
          <li><a href="#lg-error"><span>05</span>Logging errors properly</a></li>
          <li><a href="#lg-where"><span>06</span>Where logs go</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">operations · logging</div>
          <h1>Logging: the system's diary</h1>
          <p className="lede">Logs record what an application did. When something breaks in production at 2 a.m., good logs tell you what happened in minutes; bad (or missing) logs leave you guessing for hours.</p>
          <div className="tape" aria-hidden="true">
            <div>trace</div>
            <div>debug</div>
            <div>info</div>
            <div className="hw">warn</div>
            <div className="leo">error</div>
            <div className="leo">fatal</div>
          </div>
        </header>
        <section id="lg-why">
          <h2><span className="n">01</span>Why log</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Purpose</th>
                  <th>A question logs can answer</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Debugging incidents</b></td>
                  <td>Why was order 42 charged but never shipped?</td>
                </tr>
                <tr>
                  <td><b>Monitoring activity</b></td>
                  <td>How many payments failed today, and at which gateway?</td>
                </tr>
                <tr>
                  <td><b>Auditing</b></td>
                  <td>Who changed user 7's permissions, and when?</td>
                </tr>
                <tr>
                  <td><b>Security</b></td>
                  <td>Did any IP fail to log in 100 times in a minute?</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="lg-levels">
          <h2><span className="n">02</span>Log level</h2>
          <p>Each log line has a level. Production usually enables <code>info</code> and above; during investigations you temporarily lower it to <code>debug</code>.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Number (pino)</th>
                  <th>When to use</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">trace</td>
                  <td className="n">10</td>
                  <td>Step-by-step detail, only for deep debugging</td>
                  <td>Variable values inside a loop</td>
                </tr>
                <tr>
                  <td className="m">debug</td>
                  <td className="n">20</td>
                  <td>Information for developers</td>
                  <td>SQL executed, cache hit/miss</td>
                </tr>
                <tr>
                  <td className="m">info</td>
                  <td className="n">30</td>
                  <td>Normal business events worth recording</td>
                  <td>Order created, server started</td>
                </tr>
                <tr>
                  <td className="m">warn</td>
                  <td className="n">40</td>
                  <td>Unusual but handled by the system</td>
                  <td>Second retry, quota nearly used up, falling back to a default</td>
                </tr>
                <tr>
                  <td className="m">error</td>
                  <td className="n">50</td>
                  <td>An operation failed and needs a human</td>
                  <td>The payment gateway call failed after all retries</td>
                </tr>
                <tr>
                  <td className="m">fatal</td>
                  <td className="n">60</td>
                  <td>The application cannot continue</td>
                  <td>Cannot connect to the database at startup</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Choosing a level:</b> if this line appears at 2 a.m., should someone be woken up? Then it is <code>error</code>. Should someone look during work hours? <code>warn</code>. Only for reference? <code>info</code>. Errors caused by bad user input (400, 404) are usually <code>info</code> or <code>warn</code>, not <code>error</code>.</div>
        </section>
        <section id="lg-what">
          <h2><span className="n">03</span>What to log</h2>
          <ul className="plain">
            <li><b>System boundaries</b>: incoming requests and outgoing responses (method, path, status, duration), calls to other services, messages received from Kafka/RabbitMQ.</li>
            <li><b>Business events</b>: order created, payment succeeded, status changed.</li>
            <li><b>Important decisions</b>: why an order was rejected, which fallback was chosen.</li>
            <li><b>Errors and retries</b>: with the cause and attempt count.</li>
            <li><b>Startup and configuration</b>: version, environment, loaded config (with secrets hidden).</li>
            <li>Every line carries enough context: <b>who</b> (userId), <b>what</b> (orderId), <b>which request</b> (requestId, traceId).</li>
          </ul>
        </section>
        <section id="lg-not">
          <h2><span className="n">04</span>What never to log</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Kind</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Secrets</b></td>
                  <td>Passwords, tokens, API keys, the <code>Authorization</code> header, session cookies</td>
                </tr>
                <tr>
                  <td><b>Payment data</b></td>
                  <td>Card numbers, CVV</td>
                </tr>
                <tr>
                  <td><b>Personal data</b></td>
                  <td>National ID numbers, phone numbers, addresses, full emails (mask them: <code>a***@gmail.com</code>)</td>
                </tr>
                <tr>
                  <td><b>Large bodies</b></td>
                  <td>Whole long requests/responses, files, base64 images</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Logs are kept for a long time and read by many people, so leaking secrets through logs is a common security flaw. Use your library's <b>redact</b> feature to mask sensitive fields automatically instead of remembering every spot.</p>
        </section>
        <section id="lg-error">
          <h2><span className="n">05</span>Logging errors properly</h2>
          <Code lang="ts">{`// Bad: loses stack trace and context, and logs the same error at every layer
catch (e) {
  console.log("error: " + e);
  throw e;
}

// Good: wrap with context once, keep the original as "cause"
async function chargeOrder(orderId: string) {
  try {
    await paymentClient.charge(orderId);
  } catch (e) {
    throw new Error(\`Charge failed for order \${orderId}\`, { cause: e });
  }
}

// Log once, at the boundary that decides what to do with the error
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  req.log.error({ err, orderId: req.params.id }, "request failed");  // pino serializes stack + cause
  res.status(500).json({ title: "Internal error", requestId: req.id });
});`}</Code>
          <ul className="plain">
            <li><b>Log once</b>, where the error is handled. Logging at every layer and rethrowing produces five lines for one error.</li>
            <li>Always keep the <b>stack trace</b> and the <b>root cause</b> (<code>cause</code>).</li>
            <li>Return a <code>requestId</code> to users instead of error details, so they can report it and you can look it up.</li>
          </ul>
        </section>
        <section id="lg-where">
          <h2><span className="n">06</span>Where logs go</h2>
          <ol className="steps">
            <li>
              <div><b>The app writes to stdout</b><div className="d">Per the 12-factor principles: apps don't manage log files, they just print JSON to stdout.</div></div>
            </li>
            <li>
              <div><b>A collector</b><div className="d">Docker, Kubernetes, Fluent Bit, Vector or the OpenTelemetry Collector read container stdout and ship it.</div></div>
            </li>
            <li>
              <div><b>Storage and search</b><div className="d">Elasticsearch/OpenSearch + Kibana, Grafana Loki, Datadog, CloudWatch, Google Cloud Logging.</div></div>
            </li>
            <li>
              <div><b>Alerting</b><div className="d">Rules on logs: a spike in <code>error</code> lines notifies Slack or pages someone.</div></div>
            </li>
          </ol>
          <div className="note">If you must write files, use <b>log rotation</b> (logrotate or your library's rotation) so the disk never fills up.</div>
        </section>
      </main>
    </div>
  );
}
