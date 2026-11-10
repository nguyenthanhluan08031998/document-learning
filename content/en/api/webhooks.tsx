import { Code } from "@/components/Code";
import { AnimFlow, ProsCons } from "@/components/AnimFlow";

export default function WebhooksPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Webhooks contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#wh-overview"><span>01</span>What webhooks are</a></li>
          <li><a href="#wh-flow"><span>02</span>Event flow</a></li>
          <li><a href="#wh-code"><span>03</span>Signing and verifying</a></li>
          <li><a href="#wh-pros"><span>04</span>Strengths and limits</a></li>
          <li><a href="#wh-ops"><span>05</span>Doing it right</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">webhooks · study notes</div>
          <h1>Webhooks: the server calls you back on an event</h1>
          <p className="lede">Instead of the client asking “done yet?” over and over (polling), you register a URL. When a long job (for example an AI task) finishes, the other side <b>POSTs</b> the result to that URL: a reversed HTTP callback.</p>
          <div className="tape" aria-hidden="true">
            <div>POST</div>
            <div className="hw">callback</div>
            <div>HMAC</div>
            <div>retry</div>
          </div>
        </header>
        <section id="wh-overview">
          <h2><span className="n">01</span>What webhooks are</h2>
          <ul className="plain">
            <li><b>Reverse HTTP callback</b>: the service provider is the caller, you are the receiver.</li>
            <li><b>No polling</b>: fewer requests, results arrive on time.</li>
            <li>Good for long jobs, payments, build/deploy notifications.</li>
          </ul>
        </section>
        <section id="wh-flow">
          <h2><span className="n">02</span>Event flow (animated)</h2>
          <AnimFlow
            label="The 5 steps of a webhook"
            steps={[
              { title: "Async job starts", sub: "the AI task begins" },
              { title: "Event triggers", sub: "job done, event emitted" },
              { title: "Server POSTs payload", sub: "JSON sent to your URL" },
              { title: "Signature verification", sub: "check the HMAC signature" },
              { title: "Worker processes", sub: "queued for processing" },
            ]}
            caption="Return 2xx quickly after step 4 and leave the heavy work to a worker in step 5."
          />
        </section>
        <section id="wh-code">
          <h2><span className="n">03</span>Signing and verifying</h2>
          <Code lang="ts">{`import { createHmac, timingSafeEqual } from "node:crypto";

// HMAC (Hash-based Message Authentication Code): proves the payload came from someone holding the secret
export function verify(rawBody: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected), b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b); // constant-time comparison
}`}</Code>
        </section>
        <section id="wh-pros">
          <h2><span className="n">04</span>Strengths and limits</h2>
          <ProsCons
            prosTitle="Strengths"
            consTitle="Limitations"
            pros={["Eliminates polling", "Decouples slow AI tasks from the request", "Lightweight architecture"]}
            cons={["Duplicate or out-of-order events", "Security and replay risks", "One-way notification only"]}
          />
        </section>
        <section id="wh-ops">
          <h2><span className="n">05</span>Doing it right</h2>
          <ul className="plain">
            <li><b>Idempotent</b>: store the event id and skip ids you have seen.</li>
            <li>Verify the signature on the <b>raw body</b> plus a timestamp to stop replays.</li>
            <li>The sender retries when you error or time out; do not trust ordering, compare version/timestamp.</li>
            <li>For stronger guarantees add a <b>queue</b>: the webhook only enqueues and returns 200.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
