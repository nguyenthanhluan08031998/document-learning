import { Code } from "@/components/Code";
import { AnimFlow, ProsCons } from "@/components/AnimFlow";

export default function WebSocketsPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="WebSockets contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#ws-overview"><span>01</span>What WebSockets are</a></li>
          <li><a href="#ws-flow"><span>02</span>Connection flow</a></li>
          <li><a href="#ws-code"><span>03</span>Code sample</a></li>
          <li><a href="#ws-pros"><span>04</span>Strengths and limits</a></li>
          <li><a href="#ws-ops"><span>05</span>Running it in production</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">websockets · study notes</div>
          <h1>WebSockets: a real-time two-way channel</h1>
          <p className="lede">A WebSocket opens <b>one TCP (Transmission Control Protocol) connection</b> and keeps it alive. Client and server can both send frames at any time, with no request–response round trip as in REST.</p>
          <div className="tape" aria-hidden="true">
            <div>HTTP Upgrade</div>
            <div>101</div>
            <div className="hw">full duplex</div>
            <div>ping/pong</div>
          </div>
        </header>
        <section id="ws-overview">
          <h2><span className="n">01</span>What WebSockets are</h2>
          <ul className="plain">
            <li><b>Persistent connection</b>: one handshake, reused for every message.</li>
            <li><b>Two-way, low latency</b>: the server pushes data the moment it has it, no polling.</li>
            <li><b>Good for</b>: voice/live AI, chat, stock prices, real-time collaboration. URLs use <code>ws://</code> or <code>wss://</code> (WSS, WebSocket Secure, over TLS).</li>
          </ul>
        </section>
        <section id="ws-flow">
          <h2><span className="n">02</span>Connection flow (animated)</h2>
          <AnimFlow
            label="The 5 steps of a WebSocket connection"
            steps={[
              { title: "HTTP handshake", sub: "GET + Upgrade: websocket" },
              { title: "101 Switching Protocols", sub: "server accepts the upgrade" },
              { title: "Persistent open pipe", sub: "TCP stays open" },
              { title: "Continuous duplex frames", sub: "both sides send freely" },
              { title: "Instant state sync", sub: "UI updates immediately" },
            ]}
            caption="Each step lights up in turn, then the loop repeats. After step 2 the connection is no longer HTTP request–response."
          />
        </section>
        <section id="ws-code">
          <h2><span className="n">03</span>Code sample</h2>
          <Code lang="ts">{`// Client (browser)
const ws = new WebSocket("wss://api.example.com/live");
ws.onopen = () => ws.send(JSON.stringify({ type: "subscribe", topic: "orders" }));
ws.onmessage = (e) => console.log("server pushed:", JSON.parse(e.data));
ws.onclose = () => setTimeout(connect, 1000); // reconnect yourself, WebSocket does not retry`}</Code>
        </section>
        <section id="ws-pros">
          <h2><span className="n">04</span>Strengths and limits</h2>
          <ProsCons
            prosTitle="Strengths"
            consTitle="Limitations"
            pros={["Very low message latency", "True two-way server push", "Ideal for voice and live AI"]}
            cons={["Stateful, so scaling is painful (sticky sessions or pub/sub)", "No built-in retry or backpressure", "Firewalls and proxies may drop the connection"]}
          />
        </section>
        <section id="ws-ops">
          <h2><span className="n">05</span>Running it in production</h2>
          <ul className="plain">
            <li>Send periodic <b>ping/pong</b> to detect dead connections and keep NATs and proxies from closing them.</li>
            <li>Clients must <b>reconnect with backoff</b> and resync missed state (send the last event id).</li>
            <li>Several servers: use Redis pub/sub or a broker to reach the right connection.</li>
            <li>If you only need server → client, <b>SSE</b> (Server-Sent Events) is simpler.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
