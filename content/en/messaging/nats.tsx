export default function NatsPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="NATS contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#nats-arch"><span>01</span>Overall architecture</a></li>
          <li><a href="#nats-flow"><span>02</span>Publish and receive</a></li>
          <li><a href="#nats-subject"><span>03</span>{"Subject & Queue group"}</a></li>
          <li><a href="#nats-js"><span>04</span>JetStream: Stream</a></li>
          <li><a href="#nats-consumer"><span>05</span>JetStream: Consumer</a></li>
          <li><a href="#nats-kv"><span>06</span>{"KV & Object Store"}</a></li>
          <li><a href="#nats-cluster"><span>07</span>{"Cluster & Topology"}</a></li>
          <li><a href="#nats-config"><span>08</span>Quick reference</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">nats · study notes</div>
          <h1>NATS notebook: from subjects to JetStream</h1>
          <p className="lede">NATS has two layers. <b>Core NATS</b> only routes messages by subject, stores nothing and is very fast. <b>JetStream</b> is a storage layer enabled on the same server, adding acks, replay and long retention. Content as of NATS Server 2.12–2.14.</p>
          <div className="tape" aria-hidden="true">
            <div>orders</div>
            <div>.</div>
            <div>vn</div>
            <div>.</div>
            <div className="hw">created</div>
            <div className="leo">*</div>
            <div className="leo">{">"}</div>
          </div>
        </header>
        <section id="nats-arch">
          <h2><span className="n">01</span>Overall architecture</h2>
          <p className="sub">No exchanges, no pre-declared queues. A publisher sends to a <b>subject</b>, and the server forwards it to every subscriber listening on a matching subject at that moment.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 470" role="img" aria-label="A publisher sends subject orders.vn.created into a three-server NATS cluster; the subject router delivers it to Sub A, to one worker in queue group billing, and to the JetStream stream ORDERS; consumer shipping reads from the stream"> <defs> <marker id="nar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> <marker id="nar0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker> </defs> <style>{`.nt{font-family:var(--f-body);fill:var(--ink);font-size:13px}
.ntm{font-family:var(--f-mono);fill:var(--muted);font-size:11px}
.ntb{font-family:var(--f-body);fill:var(--ink);font-size:14px;font-weight:700}
.nbox{fill:var(--surface);stroke:var(--line);stroke-width:1.5}
.nclu{fill:var(--bg);stroke:var(--muted);stroke-width:1.5;stroke-dasharray:6 4}
.nsrv{fill:var(--new-soft);stroke:var(--new);stroke-width:1.2}
.nrt{fill:var(--warn-soft);stroke:var(--warn);stroke-width:1.5}
.njs{fill:none;stroke:var(--accent);stroke-width:1.3;stroke-dasharray:4 3}
.njst{font-family:var(--f-mono);font-size:11px;font-weight:600;fill:var(--accent)}
.nst{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.5}
.nqg{fill:none;stroke:var(--new);stroke-width:1.3;stroke-dasharray:4 3}
.nqgt{font-family:var(--f-mono);font-size:10.5px;font-weight:600;fill:var(--new)}
.nln{stroke:var(--accent);stroke-width:1.8;fill:none}
.nrln{stroke:var(--new);stroke-width:1.2;fill:none}
.ndl{stroke:var(--muted);stroke-width:1.4;fill:none;stroke-dasharray:5 4}`}</style>  <rect className="nbox" x="16" y="170" width="150" height="120" rx="8" /> <text className="ntb" x="30" y="196">Publisher</text> <text className="ntm" x="30" y="220">PUB</text> <text className="ntm" x="30" y="238">orders.vn.created</text> <text className="ntm" x="30" y="262">payload ≤ 1 MB</text> <path className="nln" d="M166 230 C200 230 200 166 230 166" markerEnd="url(#nar)" />  <rect className="nclu" x="200" y="34" width="490" height="422" rx="12" /> <text className="ntb" x="218" y="58">NATS cluster</text> <rect className="nsrv" x="232" y="72" width="120" height="40" rx="6" /><text className="nt" x="246" y="97">nats-1</text> <rect className="nsrv" x="385" y="72" width="120" height="40" rx="6" /><text className="nt" x="399" y="97">nats-2</text> <rect className="nsrv" x="538" y="72" width="120" height="40" rx="6" /><text className="nt" x="552" y="97">nats-3</text> <path className="nrln" d="M352 92 H385" /><path className="nrln" d="M505 92 H538" /> <path className="nrln" d="M292 72 C292 58 598 58 598 72" /> <text className="ntm" x="460" y="54">route · full mesh</text> <rect className="nrt" x="232" y="134" width="426" height="56" rx="7" /> <text className="ntb" x="246" y="158">Subject router</text> <text className="ntm" x="246" y="178">interest table: who listens to which subject</text> <rect className="njs" x="224" y="214" width="442" height="194" rx="8" /> <text className="njst" x="236" y="232">JetStream (optional, enabled on top)</text> <rect className="nst" x="240" y="244" width="190" height="72" rx="7" /> <text className="ntb" x="254" y="268">Stream ORDERS</text> <text className="ntm" x="254" y="288">{"subjects: orders.>"}</text> <text className="ntm" x="254" y="304">file · replicas 3</text> <rect className="nbox" x="466" y="244" width="184" height="72" rx="7" /> <text className="ntb" x="480" y="268">Consumer shipping</text> <text className="ntm" x="480" y="288">durable · pull</text> <text className="ntm" x="480" y="304">ack_policy explicit</text> <path className="nln" d="M430 280 H464" markerEnd="url(#nar)" /> <rect className="nbox" x="240" y="332" width="410" height="60" rx="7" /> <text className="ntb" x="254" y="356">KV store · Object store</text> <text className="ntm" x="254" y="376">also streams, used differently</text> <path className="nln" d="M300 190 V242" markerEnd="url(#nar)" /> <text className="ntm" x="308" y="208">capture</text> <text className="ntm" x="218" y="440">core: no storage, at-most-once · jetstream: stored, acked, replayable</text>  <rect className="nbox" x="726" y="60" width="160" height="380" rx="8" /> <text className="ntb" x="740" y="84">Subscribers</text> <rect className="nbox" x="738" y="96" width="136" height="50" rx="6" /> <text className="nt" x="750" y="117">Sub A</text><text className="ntm" x="750" y="135">{"SUB orders.>"}</text> <rect className="nqg" x="734" y="162" width="144" height="152" rx="6" /> <text className="nqgt" x="744" y="180">queue group: billing</text> <rect className="nbox" x="744" y="190" width="124" height="48" rx="6" /> <text className="nt" x="756" y="210">Worker 1</text><text className="ntm" x="756" y="228">gets this one</text> <rect className="nbox" x="744" y="252" width="124" height="48" rx="6" /> <text className="nt" x="756" y="272">Worker 2</text><text className="ntm" x="756" y="290">waits for the next</text> <rect className="nbox" x="738" y="350" width="136" height="56" rx="6" /> <text className="nt" x="750" y="372">Shipping svc</text><text className="ntm" x="750" y="392">fetch · ack</text> <path className="nln" d="M658 150 C700 150 700 121 736 121" markerEnd="url(#nar)" /> <path className="nln" d="M658 166 C700 166 700 214 742 214" markerEnd="url(#nar)" /> <path className="ndl" d="M658 176 C690 176 700 276 742 276" markerEnd="url(#nar0)" /> <path className="nln" d="M650 300 C700 300 700 378 736 378" markerEnd="url(#nar)" /> </svg>
            </div>
            <figcaption>A message to <code>orders.vn.created</code> goes to Sub A, to <b>one</b> worker in queue group <code>billing</code>, and is kept by stream <code>ORDERS</code>. Sub A and the worker only receive it if connected at that moment; Shipping svc reads from the stream, so it can receive it later.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Concept</th>
                  <th>Short meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Server</b></td>
                  <td>One <code>nats-server</code> process written in Go, a single binary, very light.</td>
                </tr>
                <tr>
                  <td><b>Subject</b></td>
                  <td>A message's address, tokens separated by dots: <code>orders.vn.created</code>. No need to declare it in advance.</td>
                </tr>
                <tr>
                  <td><b>Subscription</b></td>
                  <td>A registration to listen on a subject, optionally with wildcards.</td>
                </tr>
                <tr>
                  <td><b>Queue group</b></td>
                  <td>A group of subscribers sharing work: each message goes to only one member.</td>
                </tr>
                <tr>
                  <td><b>Stream</b> (JetStream)</td>
                  <td>Where messages of one or more subjects are stored, with increasing sequence numbers.</td>
                </tr>
                <tr>
                  <td><b>Consumer</b> (JetStream)</td>
                  <td>A “cursor” reading a stream that remembers its position and tracks acks.</td>
                </tr>
                <tr>
                  <td><b>Account</b></td>
                  <td>An isolated space between tenants; each account has its own subjects.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="nats-flow">
          <h2><span className="n">02</span>Publish and receive: Core and JetStream</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 360" role="img" aria-label="Core NATS: publish, the server receives it, finds matching subscribers and delivers; if nobody listens it is lost. JetStream: publish with a Msg-Id, the stream leader checks for duplicates, replicates with Raft, returns a PubAck once stored, the consumer fetches and acks"> <defs> <marker id="nar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> <marker id="nar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker> </defs> <style>{`.gtb{font-family:var(--f-body);fill:var(--ink);font-size:13.5px;font-weight:700}
.gtm{font-family:var(--f-mono);fill:var(--muted);font-size:11px}
.glane{font-family:var(--f-mono);font-size:11px;font-weight:600;letter-spacing:.08em;fill:var(--accent)}
.gbox{fill:var(--surface);stroke:var(--line);stroke-width:1.5}
.ghl{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.5}
.gbad{fill:var(--bad-soft);stroke:var(--bad);stroke-width:1.3;stroke-dasharray:4 3}
.gbg{fill:var(--bg);stroke:var(--line);stroke-width:1}
.gln{stroke:var(--accent);stroke-width:1.8;fill:none}
.gdl{stroke:var(--muted);stroke-width:1.5;fill:none;stroke-dasharray:5 4}`}</style> <rect className="gbg" x="8" y="12" width="884" height="138" rx="10" /> <text className="glane" x="20" y="32">CORE NATS · AT-MOST-ONCE</text> <rect className="gbox" x="20" y="48" width="150" height="70" rx="7" /><text className="gtb" x="32" y="74">PUB</text><text className="gtm" x="32" y="94">subject + payload</text> <rect className="gbox" x="195" y="48" width="150" height="70" rx="7" /><text className="gtb" x="207" y="74">Server receives</text><text className="gtm" x="207" y="94">port 4222</text> <rect className="gbox" x="370" y="48" width="150" height="70" rx="7" /><text className="gtb" x="382" y="74">Match subject</text><text className="gtm" x="382" y="94">interest table</text> <rect className="ghl" x="545" y="48" width="150" height="70" rx="7" /><text className="gtb" x="557" y="74">Deliver now</text><text className="gtm" x="557" y="94">1 / queue group</text> <rect className="gbad" x="720" y="48" width="150" height="70" rx="7" /><text className="gtb" x="732" y="74">Nobody listening</text><text className="gtm" x="732" y="94">message lost</text> <path className="gln" d="M170 83 H193" markerEnd="url(#nar2)" /> <path className="gln" d="M345 83 H368" markerEnd="url(#nar2)" /> <path className="gln" d="M520 83 H543" markerEnd="url(#nar2)" /> <path className="gdl" d="M695 83 H718" markerEnd="url(#nar3)" /> <text className="gtm" x="20" y="138">no storage · no ack · no retry · fastest</text> <rect className="gbg" x="8" y="166" width="884" height="186" rx="10" /> <text className="glane" x="20" y="186">JETSTREAM · AT-LEAST-ONCE / EXACTLY-ONCE</text> <rect className="gbox" x="20" y="202" width="150" height="70" rx="7" /><text className="gtb" x="32" y="228">js.publish</text><text className="gtm" x="32" y="248">with Nats-Msg-Id</text> <rect className="gbox" x="195" y="202" width="150" height="70" rx="7" /><text className="gtb" x="207" y="228">Stream leader</text><text className="gtm" x="207" y="248">dedupe by Msg-Id</text> <rect className="gbox" x="370" y="202" width="150" height="70" rx="7" /><text className="gtb" x="382" y="228">Raft replicas</text><text className="gtm" x="382" y="248">majority written</text> <rect className="ghl" x="545" y="202" width="150" height="70" rx="7" /><text className="gtb" x="557" y="228">Stored</text><text className="gtm" x="557" y="248">seq = 1042</text> <rect className="gbox" x="720" y="202" width="150" height="70" rx="7" /><text className="gtb" x="732" y="228">Consumer</text><text className="gtm" x="732" y="248">fetch · ack</text> <path className="gln" d="M170 237 H193" markerEnd="url(#nar2)" /> <path className="gln" d="M345 237 H368" markerEnd="url(#nar2)" /> <path className="gln" d="M520 237 H543" markerEnd="url(#nar2)" /> <path className="gln" d="M695 237 H718" markerEnd="url(#nar2)" /> <path className="gdl" d="M620 274 V310 H95 V276" markerEnd="url(#nar3)" /> <text className="gtm" x="220" y="330">{"PubAck {stream: ORDERS, seq: 1042} → the publisher knows it is safe"}</text> </svg>
            </div>
            <figcaption>The same publish call, but only when the subject belongs to a stream is the message stored and acknowledged with a PubAck. Without JetStream, NATS is just a pipe that delivers instantly.</figcaption>
          </figure>
          <h3>Core NATS</h3>
          <ol className="steps">
            <li>
              <div><b>Connect</b><div className="d">The client opens TCP to port 4222. A simple text protocol: <code>CONNECT</code>, <code>PUB</code>, <code>SUB</code>, <code>MSG</code>, <code>PING/PONG</code>.</div></div>
            </li>
            <li>
              <div><b>Publish</b><div className="d">Send subject + payload (optional headers). The payload is capped at 1 MB by default (<code>max_payload</code>).</div></div>
            </li>
            <li>
              <div><b>Server matches</b><div className="d">Finds every subscription matching the subject, wildcards included. For a queue group, it picks one member at random.</div></div>
            </li>
            <li>
              <div><b>Deliver now</b><div className="d">Pushes to connected subscribers. If a subscriber is offline or nobody listens, the message is lost. This is <b>at-most-once</b>.</div></div>
            </li>
          </ol>
          <div className="note tip"><b>Built-in request–reply:</b> the client attaches a temporary reply subject (<code>_INBOX.xyz</code>); the service handles the request and publishes the result to that subject. No reply queue needed as in RabbitMQ. Several services in one queue group load-balance requests automatically.</div>
          <h3>JetStream</h3>
          <ol className="steps">
            <li>
              <div><b>js.publish with Nats-Msg-Id</b><div className="d">This header lets the server recognize duplicates when the client retries.</div></div>
            </li>
            <li>
              <div><b>The stream leader receives it</b><div className="d">Checks for duplicates within <code>duplicate_window</code> (default 2 minutes) and checks the stream's limits.</div></div>
            </li>
            <li>
              <div><b>Raft replication</b><div className="d">The leader sends to replicas. Once a majority has written it, the message counts as stored.</div></div>
            </li>
            <li>
              <div><b>Return a PubAck</b><div className="d">With the stream name and the <b>sequence number</b>, similar to a Kafka offset but numbered across the whole stream.</div></div>
            </li>
            <li>
              <div><b>The consumer reads and acks</b><div className="d">If it is not acked within <code>ack_wait</code>, the message is redelivered. See section 05.</div></div>
            </li>
          </ol>
        </section>
        <section id="nats-subject">
          <h2><span className="n">03</span>{"Subject, Wildcard & Queue group"}</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 290" role="img" aria-label="The star wildcard matches exactly one token, the greater-than wildcard matches one or more trailing tokens, a queue group delivers to only one member"> <style>{`.wt{font-family:var(--f-body);fill:var(--ink);font-size:14px;font-weight:700}
.wm{font-family:var(--f-mono);fill:var(--muted);font-size:10.5px}
.wk{font-family:var(--f-mono);fill:var(--warn);font-size:9.5px}
.wpanel{fill:var(--bg);stroke:var(--line);stroke-width:1}
.wsrv{fill:var(--warn-soft);stroke:var(--warn);stroke-width:1.4}
.wq{fill:var(--surface);stroke:var(--line);stroke-width:1.3}
.wqh{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.6}
.won{stroke:var(--accent);stroke-width:2;fill:none}
.woff{stroke:var(--muted);stroke-width:1.2;fill:none;stroke-dasharray:4 4;opacity:.6}
.wmsg{fill:var(--surface);stroke:var(--accent);stroke-width:1}
.wgrp{fill:none;stroke:var(--new);stroke-width:1.2;stroke-dasharray:4 3}`}</style> <rect className="wpanel" x="10" y="8" width="288" height="274" rx="10" /> <text className="wt" x="24" y="32">* · exactly 1 token</text> <rect className="wmsg" x="54" y="44" width="200" height="22" rx="11" /> <text className="wm" x="154" y="59" textAnchor="middle">pub: orders.vn.created</text> <rect className="wsrv" x="99" y="84" width="110" height="36" rx="6" /> <text className="wm" x="154" y="106" textAnchor="middle" style={{ fill: "var(--ink)", fontWeight: "600" }}>nats server</text> <path className="won" d="M154 120 L61 194" /> <rect className="wqh" x="16" y="196" width="90" height="44" rx="6" /> <text className="wm" x="61" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>S1</text> <text className="wk" x="61" y="231" textAnchor="middle">orders.*.created</text> <path className="woff" d="M154 120 L154 194" /> <rect className="wq" x="109" y="196" width="90" height="44" rx="6" /> <text className="wm" x="154" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>S2</text> <text className="wk" x="154" y="231" textAnchor="middle">orders.*</text> <path className="won" d="M154 120 L247 194" /> <rect className="wqh" x="202" y="196" width="90" height="44" rx="6" /> <text className="wm" x="247" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>S3</text> <text className="wk" x="247" y="231" textAnchor="middle">*.vn.*</text> <text className="wm" x="154" y="266" textAnchor="middle">orders.* needs exactly 2 tokens</text> <rect className="wpanel" x="306" y="8" width="288" height="274" rx="10" /> <text className="wt" x="320" y="32">{"> · 1+ trailing tokens"}</text> <rect className="wmsg" x="350" y="44" width="200" height="22" rx="11" /> <text className="wm" x="450" y="59" textAnchor="middle">pub: orders.vn.created</text> <rect className="wsrv" x="395" y="84" width="110" height="36" rx="6" /> <text className="wm" x="450" y="106" textAnchor="middle" style={{ fill: "var(--ink)", fontWeight: "600" }}>nats server</text> <path className="won" d="M450 120 L357 194" /> <rect className="wqh" x="312" y="196" width="90" height="44" rx="6" /> <text className="wm" x="357" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>S1</text> <text className="wk" x="357" y="231" textAnchor="middle">{"orders.>"}</text> <path className="won" d="M450 120 L450 194" /> <rect className="wqh" x="405" y="196" width="90" height="44" rx="6" /> <text className="wm" x="450" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>S2</text> <text className="wk" x="450" y="231" textAnchor="middle">{">"}</text> <path className="woff" d="M450 120 L543 194" /> <rect className="wq" x="498" y="196" width="90" height="44" rx="6" /> <text className="wm" x="543" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>S3</text> <text className="wk" x="543" y="231" textAnchor="middle">{"vn.>"}</text> <text className="wm" x="450" y="266" textAnchor="middle">{"> matches every subject"}</text> <rect className="wpanel" x="602" y="8" width="288" height="274" rx="10" /> <text className="wt" x="616" y="32">queue group</text> <rect className="wmsg" x="646" y="44" width="200" height="22" rx="11" /> <text className="wm" x="746" y="59" textAnchor="middle">pub: orders.vn.created</text> <rect className="wsrv" x="691" y="84" width="110" height="36" rx="6" /> <text className="wm" x="746" y="106" textAnchor="middle" style={{ fill: "var(--ink)", fontWeight: "600" }}>nats server</text> <rect className="wgrp" x="604" y="182" width="190" height="66" rx="6" /> <text className="wm" x="612" y="177" style={{ fill: "var(--new)" }}>queue group billing</text> <path className="won" d="M746 120 L653 194" /> <rect className="wqh" x="608" y="196" width="90" height="44" rx="6" /> <text className="wm" x="653" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>W1</text> <text className="wk" x="653" y="231" textAnchor="middle">billing</text> <path className="woff" d="M746 120 L746 194" /> <rect className="wq" x="701" y="196" width="90" height="44" rx="6" /> <text className="wm" x="746" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>W2</text> <text className="wk" x="746" y="231" textAnchor="middle">billing</text> <path className="won" d="M746 120 L839 194" /> <rect className="wqh" x="794" y="196" width="90" height="44" rx="6" /> <text className="wm" x="839" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Sub A</text> <text className="wk" x="839" y="231" textAnchor="middle">{"orders.>"}</text> <text className="wm" x="746" y="266" textAnchor="middle">same group: only 1 receives</text> </svg>
            </div>
            <figcaption>Teal boxes are subscribers that receive the message. The orange text in each box is the subject it listens on.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Meaning</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">*</td>
                  <td>Exactly one token, in any position</td>
                  <td><code>orders.*.created</code> matches <code>orders.vn.created</code></td>
                </tr>
                <tr>
                  <td className="m">{">"}</td>
                  <td>One or more tokens, only at the end</td>
                  <td><code>{"orders.>"}</code> matches <code>orders.vn</code> and <code>orders.vn.created</code>, not <code>orders</code></td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="plain">
            <li>Unlike RabbitMQ: RabbitMQ's <code>#</code> matches <b>zero or more</b> words, while NATS's <code>{">"}</code> needs <b>at least one</b> token.</li>
            <li>Name subjects from general to specific: <code>{"<domain>.<region>.<event>"}</code>, so wildcards can filter.</li>
            <li><b>Queue groups</b>: subscribers sharing a group name receive one copy per message between them. Subscribers outside the group still get their own copy. Nothing to declare on the server.</li>
          </ul>
        </section>
        <section id="nats-js">
          <h2><span className="n">04</span>JetStream: Stream</h2>
          <p>A stream “captures” every message whose subject matches its <code>subjects</code> list and stores it in order with an increasing <b>sequence number</b>. Publishers still just publish to ordinary subjects.</p>
          <h3>Retention policy: when messages are deleted</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Policy</th>
                  <th>Deleted when</th>
                  <th>Similar to</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>limits</b> (default)</td>
                  <td><code>max_age</code>, <code>max_msgs</code>, <code>max_bytes</code> or <code>max_msgs_per_subject</code> is exceeded</td>
                  <td>Kafka retention</td>
                </tr>
                <tr>
                  <td><b>interest</b></td>
                  <td>Every existing consumer has acked</td>
                  <td>RabbitMQ fanout</td>
                </tr>
                <tr>
                  <td><b>workqueue</b></td>
                  <td>Any one consumer has acked; one consumer per subject</td>
                  <td>A RabbitMQ work queue</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="plain">
            <li><code>discard</code>: when a limit is hit, <code>old</code> (default) drops the oldest message, <code>new</code> rejects new ones.</li>
            <li><code>storage</code>: <code>file</code> (default) or <code>memory</code>.</li>
            <li><code>num_replicas</code>: 1 to 5, using Raft. Use 3 (survives 1 server down) or 5.</li>
            <li><code>max_msgs_per_subject=1</code> keeps only the latest message per subject, like Kafka log compaction. The KV store is built on it.</li>
            <li><b>Mirror / Source</b>: a stream can copy from another stream, even in another cluster, for DR or aggregation.</li>
          </ul>
        </section>
        <section id="nats-consumer">
          <h2><span className="n">05</span>JetStream: Consumer</h2>
          <div className="cmp">
            <div><h4>Pull consumer (recommended)</h4>The client actively <code>fetch</code>es a batch. Easy to scale: many instances fetch from one consumer, whoever is free takes work. Like Kafka.</div>
            <div><h4>Push consumer</h4>The server pushes messages to a delivery subject. Simple but hard to throttle; use it for low latency with few consumers.</div>
          </div>
          <ul className="plain">
            <li><b>Durable</b> (named) consumers remember their position even when the client disconnects. <b>Ephemeral</b> ones delete themselves when unused.</li>
            <li><code>deliver_policy</code>: where to start: <code>all</code>, <code>last</code>, <code>new</code>, <code>by_start_sequence</code>, <code>by_start_time</code>, <code>last_per_subject</code>.</li>
            <li><code>filter_subject</code>: a consumer reads only part of a stream, for example <code>{"orders.vn.>"}</code>.</li>
          </ul>
          <h3>Kinds of ack</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Command</th>
                  <th>Meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">Ack</td>
                  <td>Done processing.</td>
                </tr>
                <tr>
                  <td className="m">Nak</td>
                  <td>Could not process; redeliver (optionally after a delay).</td>
                </tr>
                <tr>
                  <td className="m">InProgress</td>
                  <td>Still working; extend <code>ack_wait</code> so it is not redelivered.</td>
                </tr>
                <tr>
                  <td className="m">Term</td>
                  <td>Give up; never redeliver (a poison message).</td>
                </tr>
                <tr>
                  <td className="m">AckSync</td>
                  <td>Ack and wait for the server to confirm it received the ack; used for exactly-once.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="plain">
            <li>If not acked within <code>ack_wait</code> (default 30 seconds), the message is redelivered, up to <code>max_deliver</code> times.</li>
            <li><code>max_ack_pending</code> (default 1000): how many delivered messages may be unacked, like RabbitMQ's prefetch.</li>
          </ul>
          <div className="note"><b>Exactly-once in JetStream:</b> the sender uses <code>Nats-Msg-Id</code> so the server drops duplicates; the receiver uses <code>AckSync</code> (double ack) to be sure the server recorded the ack. Outside the dedupe window you still need an idempotent consumer.</div>
        </section>
        <section id="nats-kv">
          <h2><span className="n">06</span>{"KV Store & Object Store"}</h2>
          <div className="cmp">
            <div><h4>Key-Value store</h4>Buckets of key–value pairs with <code>put</code>, <code>get</code>, <code>delete</code>, revision history, TTL, and <b>watch</b> for real-time changes. Used for configuration, feature flags, distributed state, simple locks.</div>
            <div><h4>Object store</h4>Stores large files by splitting them into chunks in a stream. Used to distribute files, models and updates to nodes, especially at the edge.</div>
          </div>
          <p>Both are really streams with special settings, so they get replication and mirroring for free. One NATS server can replace a broker plus a small KV store like etcd or Redis for simple needs.</p>
        </section>
        <section id="nats-cluster">
          <h2><span className="n">07</span>{"Cluster & Topology"}</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Port</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Cluster</b></td>
                  <td className="m">6222</td>
                  <td>Servers connect in a full mesh via routes. Clients can connect to any server; messages reach the right place automatically.</td>
                </tr>
                <tr>
                  <td><b>Super-cluster</b></td>
                  <td className="m">7222</td>
                  <td>Many clusters (regions, clouds) joined by gateways. Messages cross only when someone is listening on the other side.</td>
                </tr>
                <tr>
                  <td><b>Leaf node</b></td>
                  <td className="m">7422</td>
                  <td>Small servers at the edge (stores, factories, devices) connecting back to a central cluster, still working when the network is down.</td>
                </tr>
                <tr>
                  <td><b>Monitoring</b></td>
                  <td className="m">8222</td>
                  <td>HTTP endpoints <code>/varz</code>, <code>/connz</code>, <code>/jsz</code> for monitoring.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="plain">
            <li>Core NATS needs no consensus: if a server dies, clients reconnect to another one in their list.</li>
            <li>JetStream uses Raft at two levels: a <b>meta group</b> manages the list of streams/consumers, and each stream has its own Raft group with a leader and replicas.</li>
            <li>Security and multi-tenancy through <b>accounts</b>, authentication with NKEY/JWT, and subject export/import between accounts.</li>
          </ul>
          <h3>Some new features</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Highlights</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">2.12 (09/2025)</td>
                  <td>Atomic batch publish (write N messages as one unit), distributed counters, delayed message scheduling, prioritized pull consumers, promoting a mirror to the primary stream.</td>
                </tr>
                <tr>
                  <td className="m">2.14 (04/2026)</td>
                  <td>High-throughput publishing into JetStream, extended message scheduling, sourcing/mirroring fixes for interest and workqueue streams.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="nats-config">
          <h2><span className="n">08</span>Quick reference</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Setting</th>
                  <th>Side</th>
                  <th>Default</th>
                  <th>Effect</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">max_payload</td>
                  <td>Server</td>
                  <td className="v">1MB</td>
                  <td>Maximum message size.</td>
                </tr>
                <tr>
                  <td className="m">retention</td>
                  <td>Stream</td>
                  <td className="v">limits</td>
                  <td>limits, interest or workqueue.</td>
                </tr>
                <tr>
                  <td className="m">storage</td>
                  <td>Stream</td>
                  <td className="v">file</td>
                  <td>file or memory.</td>
                </tr>
                <tr>
                  <td className="m">num_replicas</td>
                  <td>Stream</td>
                  <td className="v">1</td>
                  <td>Number of copies, at most 5. Use 3 in production.</td>
                </tr>
                <tr>
                  <td className="m">discard</td>
                  <td>Stream</td>
                  <td className="v">old</td>
                  <td>Drop old or reject new when full.</td>
                </tr>
                <tr>
                  <td className="m">max_age</td>
                  <td>Stream</td>
                  <td className="v">0 (unlimited)</td>
                  <td>How long messages are kept.</td>
                </tr>
                <tr>
                  <td className="m">duplicate_window</td>
                  <td>Stream</td>
                  <td className="v">2m</td>
                  <td>Dedupe window for Nats-Msg-Id.</td>
                </tr>
                <tr>
                  <td className="m">ack_policy</td>
                  <td>Consumer</td>
                  <td className="v">explicit</td>
                  <td>explicit, all or none.</td>
                </tr>
                <tr>
                  <td className="m">ack_wait</td>
                  <td>Consumer</td>
                  <td className="v">30s</td>
                  <td>Redeliver if not acked in time.</td>
                </tr>
                <tr>
                  <td className="m">max_deliver</td>
                  <td>Consumer</td>
                  <td className="v">-1 (unlimited)</td>
                  <td>Maximum delivery attempts.</td>
                </tr>
                <tr>
                  <td className="m">max_ack_pending</td>
                  <td>Consumer</td>
                  <td className="v">1000</td>
                  <td>Maximum unacked messages.</td>
                </tr>
                <tr>
                  <td className="m">deliver_policy</td>
                  <td>Consumer</td>
                  <td className="v">all</td>
                  <td>Where to start reading.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>Common CLI commands</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Command</th>
                  <th>Effect</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">{"nats sub \"orders.>\""}</td>
                  <td>Listen on a subject.</td>
                </tr>
                <tr>
                  <td className="m">{"nats pub orders.vn.created '{\"id\":1}'"}</td>
                  <td>Send a test message.</td>
                </tr>
                <tr>
                  <td className="m">{"nats stream add ORDERS --subjects \"orders.>\""}</td>
                  <td>Create a stream.</td>
                </tr>
                <tr>
                  <td className="m">nats consumer add ORDERS shipping --pull</td>
                  <td>Create a pull consumer.</td>
                </tr>
                <tr>
                  <td className="m">nats kv add config</td>
                  <td>Create a KV bucket.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
