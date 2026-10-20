export default function RabbitmqPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="RabbitMQ contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#rmq-arch"><span>01</span>Overall architecture</a></li>
          <li><a href="#rmq-publish"><span>02</span>Producer → Queue</a></li>
          <li><a href="#rmq-exchange"><span>03</span>{"Exchange & Routing"}</a></li>
          <li><a href="#rmq-queue"><span>04</span>Queue types</a></li>
          <li><a href="#rmq-consumer"><span>05</span>{"Consumer & Ack"}</a></li>
          <li><a href="#rmq-dlx"><span>06</span>{"TTL & Dead Letter"}</a></li>
          <li><a href="#rmq-cluster"><span>07</span>{"Cluster & HA"}</a></li>
          <li><a href="#rmq-flow"><span>08</span>Flow control</a></li>
          <li><a href="#rmq-config"><span>09</span>Quick reference</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">rabbitmq · study notes</div>
          <h1>RabbitMQ notebook: from exchanges to dead letters</h1>
          <p className="lede">How RabbitMQ receives messages, routes them through exchanges, stores them in queues, delivers them to consumers and handles failures. Content as of RabbitMQ 4.x.</p>
          <div className="tape" aria-hidden="true">
            <div>publish</div>
            <div>exchange</div>
            <div>binding</div>
            <div className="hw">queue</div>
            <div>deliver</div>
            <div className="leo">ack</div>
          </div>
        </header>
        <section id="rmq-arch">
          <h2><span className="n">01</span>Overall architecture</h2>
          <p className="sub">Producers never send straight to a queue. Messages always go through an <b>exchange</b>, which uses <b>bindings</b> to decide which queues get a copy.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 470" role="img" aria-label="A producer publishes to exchanges orders (topic) and notify (fanout) in vhost shop; exchanges route through bindings to queues payment, shipping, email and sms; consumers receive from the queues"> <defs> <marker id="rar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> </defs> <style>{`.rt{font-family:var(--f-body);fill:var(--ink);font-size:13px}
.rtm{font-family:var(--f-mono);fill:var(--muted);font-size:11px}
.rtb{font-family:var(--f-body);fill:var(--ink);font-size:14px;font-weight:700}
.rbox{fill:var(--surface);stroke:var(--line);stroke-width:1.5}
.rclu{fill:var(--bg);stroke:var(--muted);stroke-width:1.5;stroke-dasharray:6 4}
.rvh{fill:none;stroke:var(--new);stroke-width:1.3;stroke-dasharray:4 3}
.rvht{font-family:var(--f-mono);font-size:11px;font-weight:600;fill:var(--new)}
.rex{fill:var(--warn-soft);stroke:var(--warn);stroke-width:1.5}
.rq{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.5}
.rln{stroke:var(--accent);stroke-width:1.8;fill:none}
.rbd{stroke:var(--warn);stroke-width:1.5;fill:none}
.rbk{font-family:var(--f-mono);font-size:10.5px;fill:var(--warn)}`}</style>  <rect className="rbox" x="16" y="176" width="150" height="128" rx="8" /> <text className="rtb" x="30" y="202">Producer</text> <text className="rtm" x="30" y="226">connection → channel</text> <text className="rtm" x="30" y="244">basic.publish(</text> <text className="rtm" x="30" y="262"> exchange,</text> <text className="rtm" x="30" y="280"> routing_key)</text> <path className="rln" d="M166 220 C196 220 200 150 230 150" markerEnd="url(#rar)" /> <path className="rln" d="M166 270 C196 270 200 330 230 330" markerEnd="url(#rar)" />  <rect className="rclu" x="200" y="34" width="490" height="420" rx="12" /> <text className="rtb" x="218" y="58">RabbitMQ broker</text> <rect className="rvh" x="216" y="72" width="458" height="364" rx="8" /> <text className="rvht" x="228" y="90">vhost: /shop</text> <rect className="rex" x="232" y="120" width="150" height="60" rx="7" /> <text className="rtb" x="246" y="146">orders</text> <text className="rtm" x="246" y="166">exchange · topic</text> <rect className="rex" x="232" y="300" width="150" height="60" rx="7" /> <text className="rtb" x="246" y="326">notify</text> <text className="rtm" x="246" y="346">exchange · fanout</text> <rect className="rq" x="508" y="100" width="150" height="50" rx="7" /> <text className="rt" x="520" y="121" style={{ fontWeight: "600" }}>payment</text><text className="rtm" x="520" y="139">queue · quorum</text> <rect className="rq" x="508" y="170" width="150" height="50" rx="7" /> <text className="rt" x="520" y="191" style={{ fontWeight: "600" }}>shipping</text><text className="rtm" x="520" y="209">queue · quorum</text> <rect className="rq" x="508" y="280" width="150" height="50" rx="7" /> <text className="rt" x="520" y="301" style={{ fontWeight: "600" }}>email</text><text className="rtm" x="520" y="319">queue · classic</text> <rect className="rq" x="508" y="350" width="150" height="50" rx="7" /> <text className="rt" x="520" y="371" style={{ fontWeight: "600" }}>sms</text><text className="rtm" x="520" y="389">queue · classic</text>  <path className="rbd" d="M382 140 C440 140 450 125 506 125" markerEnd="url(#rar)" /> <text className="rbk" x="398" y="122">order.created</text> <path className="rbd" d="M382 162 C440 162 450 195 506 195" markerEnd="url(#rar)" /> <text className="rbk" x="404" y="204">order.*</text> <path className="rbd" d="M382 322 C440 322 450 305 506 305" markerEnd="url(#rar)" /> <path className="rbd" d="M382 340 C440 340 450 375 506 375" markerEnd="url(#rar)" /> <text className="rbk" x="398" y="392">no key needed</text> <text className="rtm" x="232" y="424">orange lines = bindings (with binding keys)</text>  <rect className="rbox" x="726" y="96" width="160" height="320" rx="8" /> <text className="rtb" x="740" y="122">Consumers</text> <text className="rtm" x="740" y="140">push · prefetch · ack</text> <rect className="rbox" x="738" y="152" width="136" height="50" rx="6" /> <text className="rt" x="750" y="173">Payment svc</text><text className="rtm" x="750" y="191">← payment</text> <rect className="rbox" x="738" y="214" width="136" height="50" rx="6" /> <text className="rt" x="750" y="235">Shipping svc</text><text className="rtm" x="750" y="253">← shipping</text> <rect className="rbox" x="738" y="300" width="136" height="50" rx="6" /> <text className="rt" x="750" y="321">Notify svc</text><text className="rtm" x="750" y="339">← email, sms</text> <path className="rln" d="M658 125 C700 125 700 177 736 177" markerEnd="url(#rar)" /> <path className="rln" d="M658 195 C700 195 700 239 736 239" markerEnd="url(#rar)" /> <path className="rln" d="M658 305 C700 305 700 325 736 325" markerEnd="url(#rar)" /> <path className="rln" d="M658 375 C700 375 700 325 736 325" markerEnd="url(#rar)" /> </svg>
            </div>
            <figcaption>Message <code>order.created</code> sent to exchange <code>orders</code> is copied to both <code>payment</code> (exact match) and <code>shipping</code> (matches <code>order.*</code>). The fanout exchange <code>notify</code> copies every message to both <code>email</code> and <code>sms</code>. Each queue holds its own copy; once a consumer takes it and acks, it is removed from that queue.</figcaption>
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
                  <td><b>Broker / Node</b></td>
                  <td>One RabbitMQ server. Several nodes form a cluster.</td>
                </tr>
                <tr>
                  <td><b>Connection</b></td>
                  <td>A long-lived TCP connection from the app to the broker (port 5672 for AMQP 0-9-1).</td>
                </tr>
                <tr>
                  <td><b>Channel</b></td>
                  <td>A virtual connection inside a connection. Use one channel per thread; don't open a new connection per send.</td>
                </tr>
                <tr>
                  <td><b>Virtual host (vhost)</b></td>
                  <td>An isolated space with its own exchanges, queues and permissions. Like a “database” on a DB server.</td>
                </tr>
                <tr>
                  <td><b>Exchange</b></td>
                  <td>Receives messages from producers and routes them. Stores nothing.</td>
                </tr>
                <tr>
                  <td><b>Binding</b></td>
                  <td>A rule linking an exchange to a queue (or another exchange), with a binding key or header conditions.</td>
                </tr>
                <tr>
                  <td><b>Routing key</b></td>
                  <td>A string the producer attaches to a message; the exchange compares it with binding keys to choose queues.</td>
                </tr>
                <tr>
                  <td><b>Queue</b></td>
                  <td>Where messages actually wait for consumers, in FIFO order.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="rmq-publish">
          <h2><span className="n">02</span>Producer → queue flow</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 420" role="img" aria-label="The producer builds a message, opens a connection and a channel, enables confirm mode and publishes; on the broker the exchange receives it, routes by binding, enqueues and stores it, and sends a confirm back to the producer"> <defs> <marker id="rar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> <marker id="rar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker> </defs> <style>{`.ftb{font-family:var(--f-body);fill:var(--ink);font-size:13.5px;font-weight:700}
.ftm{font-family:var(--f-mono);fill:var(--muted);font-size:11px}
.flane{font-family:var(--f-mono);font-size:11px;font-weight:600;letter-spacing:.08em;fill:var(--accent)}
.fbox{fill:var(--surface);stroke:var(--line);stroke-width:1.5}
.fq{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.5}
.fbg{fill:var(--bg);stroke:var(--line);stroke-width:1}
.fdisk{fill:var(--warn-soft);stroke:var(--warn);stroke-width:1.3}
.fbad{fill:var(--bad-soft);stroke:var(--bad);stroke-width:1.3;stroke-dasharray:4 3}
.fln{stroke:var(--accent);stroke-width:1.8;fill:none}
.fdl{stroke:var(--muted);stroke-width:1.5;fill:none;stroke-dasharray:5 4}`}</style> <rect className="fbg" x="8" y="22" width="884" height="118" rx="10" /> <text className="flane" x="20" y="42">PRODUCER (CLIENT)</text> <rect className="fbg" x="8" y="160" width="884" height="252" rx="10" /> <text className="flane" x="20" y="180">RABBITMQ BROKER</text> <rect className="fbox" x="20" y="52" width="150" height="70" rx="7" /><text className="ftb" x="32" y="78">Build message</text><text className="ftm" x="32" y="98">body + properties</text> <rect className="fbox" x="195" y="52" width="150" height="70" rx="7" /><text className="ftb" x="207" y="78">Connection</text><text className="ftm" x="207" y="98">TCP · port 5672</text> <rect className="fbox" x="370" y="52" width="150" height="70" rx="7" /><text className="ftb" x="382" y="78">Channel</text><text className="ftm" x="382" y="98">virtual channel over TCP</text> <rect className="fbox" x="545" y="52" width="150" height="70" rx="7" /><text className="ftb" x="557" y="78">Confirm mode</text><text className="ftm" x="557" y="98">confirm.select</text> <rect className="fbox" x="720" y="52" width="150" height="70" rx="7" /><text className="ftb" x="732" y="78">basic.publish</text><text className="ftm" x="732" y="98">exchange + key</text> <path className="fln" d="M170 87 H193" markerEnd="url(#rar2)" /> <path className="fln" d="M345 87 H368" markerEnd="url(#rar2)" /> <path className="fln" d="M520 87 H543" markerEnd="url(#rar2)" /> <path className="fln" d="M695 87 H718" markerEnd="url(#rar2)" /> <rect className="fbox" x="720" y="190" width="150" height="70" rx="7" /><text className="ftb" x="732" y="216">Exchange receives</text><text className="ftm" x="732" y="236">checks permissions</text> <rect className="fbox" x="545" y="190" width="150" height="70" rx="7" /><text className="ftb" x="557" y="216">Route</text><text className="ftm" x="557" y="236">type + binding</text> <rect className="fq" x="370" y="190" width="150" height="70" rx="7" /><text className="ftb" x="382" y="216">Enqueue</text><text className="ftm" x="382" y="236">one copy per queue</text> <rect className="fbox" x="195" y="190" width="150" height="70" rx="7" /><text className="ftb" x="207" y="216">Store</text><text className="ftm" x="207" y="236">RAM · disk · Raft</text> <rect className="fbox" x="20" y="190" width="150" height="70" rx="7" /><text className="ftb" x="32" y="216">Send confirm</text><text className="ftm" x="32" y="236">basic.ack / nack</text> <path className="fln" d="M720 225 H697" markerEnd="url(#rar2)" /> <path className="fln" d="M545 225 H522" markerEnd="url(#rar2)" /> <path className="fln" d="M370 225 H347" markerEnd="url(#rar2)" /> <path className="fln" d="M195 225 H172" markerEnd="url(#rar2)" /> <path className="fln" d="M795 122 V188" markerEnd="url(#rar2)" /> <text className="ftm" x="805" y="158">AMQP frame</text> <path className="fdl" d="M60 190 V124" markerEnd="url(#rar3)" /> <text className="ftm" x="70" y="158">ack → producer knows it is safe</text> <path className="fdl" d="M270 262 V318" markerEnd="url(#rar3)" /> <rect className="fdisk" x="195" y="320" width="150" height="62" rx="7" /> <text className="ftb" x="207" y="344">Disk / replicas</text> <text className="ftm" x="207" y="364">persistent · quorum</text> <path className="fdl" d="M795 262 V318" markerEnd="url(#rar3)" /> <rect className="fbad" x="720" y="320" width="150" height="62" rx="7" /> <text className="ftb" x="732" y="344">No binding matches</text> <text className="ftm" x="732" y="364">drop · return · AE</text> <text className="ftm" x="380" y="334">classic + persistent → ack after the disk write</text> <text className="ftm" x="380" y="352">quorum → ack once a majority of replicas has it</text> <text className="ftm" x="380" y="370">confirms off → no ack</text> </svg>
            </div>
            <figcaption>The top row runs in the application, the bottom row on the broker. Exchanges only route and store nothing; a message exists only once it has entered at least one queue.</figcaption>
          </figure>
          <h3>Producer side</h3>
          <ol className="steps">
            <li>
              <div><b>Build the message</b><div className="d">The body is <code>byte[]</code> (serialize it yourself, usually JSON). Properties include <code>delivery_mode</code> (2 = persistent), <code>content_type</code>, <code>message_id</code>, <code>correlation_id</code>, <code>reply_to</code>, <code>expiration</code>, <code>priority</code>, <code>headers</code>.</div></div>
            </li>
            <li>
              <div><b>Open a connection and a channel</b><div className="d">A connection is TCP and costly, so open it once and reuse it. Channels are cheap: one per thread.</div></div>
            </li>
            <li>
              <div><b>Enable publisher confirms</b><div className="d"><code>confirm.select</code> on the channel. Each message gets a sequence number (delivery tag) to match the returned acks.</div></div>
            </li>
            <li>
              <div><b>basic.publish</b><div className="d">Send to an exchange with a routing key. Set <code>mandatory=true</code> to get the message back if no queue takes it.</div></div>
            </li>
          </ol>
          <h3>Broker side</h3>
          <ol className="steps">
            <li>
              <div><b>The exchange receives the message</b><div className="d">Checks that the exchange exists and the user may write in the vhost.</div></div>
            </li>
            <li>
              <div><b>Routing</b><div className="d">Compares the routing key or headers with bindings according to the exchange type. A message can go to 0, 1 or many queues.</div></div>
            </li>
            <li>
              <div><b>No binding matches</b><div className="d">By default the message is dropped. With <code>mandatory=true</code> the broker returns it via <code>basic.return</code>. If the exchange has an <b>alternate exchange</b>, the message goes there.</div></div>
            </li>
            <li>
              <div><b>Enqueue and store</b><div className="d">Classic queues: persistent messages are written to disk. Quorum queues: always appended to a Raft log and replicated.</div></div>
            </li>
            <li>
              <div><b>Send the confirm</b><div className="d"><code>basic.ack</code> once every target queue has the message safely; <code>basic.nack</code> when the broker could not handle it. The producer gets acks asynchronously via callbacks, much like the Kafka producer.</div></div>
            </li>
          </ol>
          <div className="note"><b>To never lose messages on the sending side:</b> a durable (or quorum) queue + <code>delivery_mode=2</code> + publisher confirms + handling <code>nack</code> and <code>basic.return</code>. Skip any of these and messages can vanish without the producer knowing.</div>
        </section>
        <section id="rmq-exchange">
          <h2><span className="n">03</span>{"Exchange & Routing"}</h2>
          <p className="sub">Four exchange types, differing in how they match messages to bindings.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 300" role="img" aria-label="Four exchange types: direct matches the key exactly, fanout sends to every queue, topic matches patterns with star and hash, headers matches on headers"> <style>{`.xt{font-family:var(--f-body);fill:var(--ink);font-size:14px;font-weight:700}
.xm{font-family:var(--f-mono);fill:var(--muted);font-size:10.5px}
.xk{font-family:var(--f-mono);fill:var(--warn);font-size:9.5px}
.xpanel{fill:var(--bg);stroke:var(--line);stroke-width:1}
.xex{fill:var(--warn-soft);stroke:var(--warn);stroke-width:1.4}
.xq{fill:var(--surface);stroke:var(--line);stroke-width:1.3}
.xqh{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.6}
.xon{stroke:var(--accent);stroke-width:2;fill:none}
.xoff{stroke:var(--muted);stroke-width:1.2;fill:none;stroke-dasharray:4 4;opacity:.6}
.xmsg{fill:var(--surface);stroke:var(--accent);stroke-width:1}`}</style> <rect className="xpanel" x="10" y="8" width="212" height="284" rx="10" /> <text className="xt" x="24" y="32">direct</text> <rect className="xmsg" x="24" y="42" width="184" height="22" rx="11" /> <text className="xm" x="116" y="57" textAnchor="middle">msg: key = pdf</text> <rect className="xex" x="66" y="80" width="100" height="36" rx="6" /> <text className="xm" x="116" y="102" textAnchor="middle" style={{ fill: "var(--ink)", fontWeight: "600" }}>exchange</text> <path className="xon" d="M116 116 L47 196" /> <rect className="xqh" x="14" y="198" width="66" height="40" rx="6" /><text className="xm" x="47" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q1</text><text className="xk" x="47" y="230" textAnchor="middle">pdf</text> <path className="xoff" d="M116 116 L116 196" /> <rect className="xq" x="83" y="198" width="66" height="40" rx="6" /><text className="xm" x="116" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q2</text><text className="xk" x="116" y="230" textAnchor="middle">png</text> <path className="xon" d="M116 116 L185 196" /> <rect className="xqh" x="152" y="198" width="66" height="40" rx="6" /><text className="xm" x="185" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q3</text><text className="xk" x="185" y="230" textAnchor="middle">pdf</text> <text className="xm" x="116" y="270" textAnchor="middle">exact key match</text> <rect className="xpanel" x="232" y="8" width="212" height="284" rx="10" /> <text className="xt" x="246" y="32">fanout</text> <rect className="xmsg" x="246" y="42" width="184" height="22" rx="11" /> <text className="xm" x="338" y="57" textAnchor="middle">msg: any key</text> <rect className="xex" x="288" y="80" width="100" height="36" rx="6" /> <text className="xm" x="338" y="102" textAnchor="middle" style={{ fill: "var(--ink)", fontWeight: "600" }}>exchange</text> <path className="xon" d="M338 116 L269 196" /> <rect className="xqh" x="236" y="198" width="66" height="40" rx="6" /><text className="xm" x="269" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q1</text><text className="xk" x="269" y="230" textAnchor="middle">—</text> <path className="xon" d="M338 116 L338 196" /> <rect className="xqh" x="305" y="198" width="66" height="40" rx="6" /><text className="xm" x="338" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q2</text><text className="xk" x="338" y="230" textAnchor="middle">—</text> <path className="xon" d="M338 116 L407 196" /> <rect className="xqh" x="374" y="198" width="66" height="40" rx="6" /><text className="xm" x="407" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q3</text><text className="xk" x="407" y="230" textAnchor="middle">—</text> <text className="xm" x="338" y="270" textAnchor="middle">copied to every queue</text> <rect className="xpanel" x="454" y="8" width="212" height="284" rx="10" /> <text className="xt" x="468" y="32">topic</text> <rect className="xmsg" x="468" y="42" width="184" height="22" rx="11" /> <text className="xm" x="560" y="57" textAnchor="middle">msg: order.vn.created</text> <rect className="xex" x="510" y="80" width="100" height="36" rx="6" /> <text className="xm" x="560" y="102" textAnchor="middle" style={{ fill: "var(--ink)", fontWeight: "600" }}>exchange</text> <path className="xon" d="M560 116 L491 196" /> <rect className="xqh" x="458" y="198" width="66" height="40" rx="6" /><text className="xm" x="491" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q1</text><text className="xk" x="491" y="230" textAnchor="middle">*.vn.*</text> <path className="xoff" d="M560 116 L560 196" /> <rect className="xq" x="527" y="198" width="66" height="40" rx="6" /><text className="xm" x="560" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q2</text><text className="xk" x="560" y="230" textAnchor="middle">*.created</text> <path className="xon" d="M560 116 L629 196" /> <rect className="xqh" x="596" y="198" width="66" height="40" rx="6" /><text className="xm" x="629" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q3</text><text className="xk" x="629" y="230" textAnchor="middle">order.#</text> <text className="xm" x="560" y="270" textAnchor="middle">* = 1 word · # = 0+ words</text> <rect className="xpanel" x="676" y="8" width="212" height="284" rx="10" /> <text className="xt" x="690" y="32">headers</text> <rect className="xmsg" x="690" y="42" width="184" height="22" rx="11" /> <text className="xm" x="782" y="57" textAnchor="middle">msg: type=pdf, lang=vi</text> <rect className="xex" x="732" y="80" width="100" height="36" rx="6" /> <text className="xm" x="782" y="102" textAnchor="middle" style={{ fill: "var(--ink)", fontWeight: "600" }}>exchange</text> <path className="xoff" d="M782 116 L713 196" /> <rect className="xq" x="680" y="198" width="66" height="40" rx="6" /><text className="xm" x="713" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q1</text><text className="xk" x="713" y="230" textAnchor="middle">all:pdf+en</text> <path className="xon" d="M782 116 L782 196" /> <rect className="xqh" x="749" y="198" width="66" height="40" rx="6" /><text className="xm" x="782" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q2</text><text className="xk" x="782" y="230" textAnchor="middle">any:vi</text> <path className="xon" d="M782 116 L851 196" /> <rect className="xqh" x="818" y="198" width="66" height="40" rx="6" /><text className="xm" x="851" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q3</text><text className="xk" x="851" y="230" textAnchor="middle">all:pdf</text> <text className="xm" x="782" y="270" textAnchor="middle">matches headers</text> </svg>
            </div>
            <figcaption>Teal boxes are queues that receive the message. The orange text in each queue is its binding.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Kind</th>
                  <th>Matching rule</th>
                  <th>Use when</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>direct</b></td>
                  <td>The routing key equals the binding key exactly.</td>
                  <td>Dispatch work by specific type: <code>pdf</code>, <code>email</code>.</td>
                </tr>
                <tr>
                  <td><b>fanout</b></td>
                  <td>Ignores the key and copies to every bound queue.</td>
                  <td>Broadcasts: notifications, cache invalidation across services.</td>
                </tr>
                <tr>
                  <td><b>topic</b></td>
                  <td>Keys are dot-separated words. <code>*</code> matches exactly 1 word, <code>#</code> matches 0 or more.</td>
                  <td>Multi-dimensional filtering: <code>order.vn.created</code>, <code>log.*.error</code>.</td>
                </tr>
                <tr>
                  <td><b>headers</b></td>
                  <td>Compares pairs in <code>headers</code>. <code>x-match=all</code> needs all to match, <code>x-match=any</code> just one.</td>
                  <td>Conditions that don't fit in a single key string.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="plain">
            <li>The <b>default exchange</b> (empty name <code>""</code>) is a built-in direct exchange; every queue is automatically bound to it by its own name. That is why <code>publish("", "payment")</code> looks like sending straight to queue <code>payment</code>.</li>
            <li><b>Exchange-to-exchange bindings</b>: an exchange can be bound to another to build routing layers.</li>
            <li><b>Alternate exchange</b> (<code>alternate-exchange</code>): receives messages that match no binding, so nothing is silently lost.</li>
          </ul>
        </section>
        <section id="rmq-queue">
          <h2><span className="n">04</span>Queue types</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th />
                  <th>Classic</th>
                  <th>Quorum</th>
                  <th>Stream</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Storage</b></td>
                  <td>One node</td>
                  <td>Many nodes, Raft consensus</td>
                  <td>Append-only log, many nodes</td>
                </tr>
                <tr>
                  <td><b>Replication</b></td>
                  <td>None (mirroring removed in 4.0)</td>
                  <td>Leader + followers, needs a majority alive</td>
                  <td>Leader + replica</td>
                </tr>
                <tr>
                  <td><b>After reading</b></td>
                  <td>Deleted after ack</td>
                  <td>Deleted after ack</td>
                  <td>Not deleted; reread by offset</td>
                </tr>
                <tr>
                  <td><b>Priorities</b></td>
                  <td>Yes (<code>x-max-priority</code>)</td>
                  <td>Yes (2 levels since 4.0)</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><b>Poison messages</b></td>
                  <td>Not handled automatically</td>
                  <td><code>delivery-limit</code> (default 20 since 4.0)</td>
                  <td>Not applicable</td>
                </tr>
                <tr>
                  <td><b>Use for</b></td>
                  <td>Transient data that may be lost, needs speed</td>
                  <td>Important data; the default choice</td>
                  <td>Many consumers reading the same data, replay needed, Kafka-like</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>Queue declaration properties</h3>
          <ul className="plain">
            <li><code>durable</code>: the queue survives a broker restart. Messages survive only with <code>delivery_mode=2</code> too.</li>
            <li><code>exclusive</code>: only the declaring connection may use it; deleted when that connection closes. Common for reply queues.</li>
            <li><code>auto-delete</code>: deleted when the last consumer unsubscribes.</li>
            <li><code>arguments</code>: <code>x-queue-type</code> (classic/quorum/stream), <code>x-message-ttl</code>, <code>x-expires</code>, <code>x-max-length</code>, <code>x-overflow</code>, <code>x-dead-letter-exchange</code>, <code>x-dead-letter-routing-key</code>.</li>
          </ul>
          <div className="note tip"><b>Policies instead of arguments:</b> TTL, max-length, dead lettering… are better set via <b>policies</b> (<code>rabbitmqctl set_policy</code>) so they can change at runtime. Arguments declared in code cannot be changed without deleting and recreating the queue.</div>
        </section>
        <section id="rmq-consumer">
          <h2><span className="n">05</span>{"Consumer & Acknowledgement"}</h2>
          <ol className="steps">
            <li>
              <div><b>Subscribe (basic.consume)</b><div className="d">The broker <b>pushes</b> messages to consumers. <code>basic.get</code> pulls one message at a time but is slow and discouraged.</div></div>
            </li>
            <li>
              <div><b>Limit with prefetch</b><div className="d"><code>basic.qos(prefetch_count)</code>: the maximum delivered-but-unacked messages. Once reached, the broker stops pushing to that consumer.</div></div>
            </li>
            <li>
              <div><b>Process the message</b><div className="d">The message is now <em>unacked</em>: still in the queue but not delivered to anyone else.</div></div>
            </li>
            <li>
              <div><b>Report the result</b><div className="d"><code>basic.ack</code>: done, remove from the queue. <code>basic.nack</code>/<code>basic.reject</code> with <code>requeue=true</code>: back to the queue; <code>requeue=false</code>: drop or dead-letter.</div></div>
            </li>
          </ol>
          <h3>Auto ack and manual ack</h3>
          <div className="cmp">
            <div><h4>Auto ack (<code>autoAck=true</code>)</h4>The broker considers it done as soon as it is sent. If the consumer crashes midway, the message is lost. Fast; at-most-once.</div>
            <div><h4>Manual ack</h4>The consumer acks after processing. If the channel closes before the ack, the message returns to the queue with <code>redelivered=true</code>. At-least-once.</div>
          </div>
          <h3>Many consumers on one queue</h3>
          <ul className="plain">
            <li><b>Competing consumers</b>: messages are handed out in turn (round-robin), each to exactly one consumer. Adding consumers speeds up processing, without a cap like Kafka's partition count.</li>
            <li>For several services to <b>each receive the same message</b>, each service needs its own queue bound to the same exchange (usually fanout or topic).</li>
            <li>Ordering is guaranteed only with a single consumer, since multiple consumers or requeues reorder messages. To keep order, enable <code>x-single-active-consumer</code>.</li>
            <li><code>consumer_timeout</code> (default 30 minutes): if a message stays unacked too long, the broker closes the channel and returns the message to the queue.</li>
          </ul>
          <div className="note">RabbitMQ has no exactly-once. Combine publisher confirms with manual acks for at-least-once, then make consumers <b>idempotent</b> (for example by storing processed <code>message_id</code>s) to tolerate duplicates.</div>
        </section>
        <section id="rmq-dlx">
          <h2><span className="n">06</span>{"TTL & Dead Letter"}</h2>
          <h3>A message is dead-lettered when</h3>
          <ul className="plain">
            <li>A consumer <code>nack</code>s or <code>reject</code>s it with <code>requeue=false</code>.</li>
            <li>Its TTL expires: per queue (<code>x-message-ttl</code>) or per message (the <code>expiration</code> property).</li>
            <li>The queue exceeds <code>x-max-length</code> / <code>x-max-length-bytes</code> with <code>x-overflow=drop-head</code> (default), pushing out the oldest message.</li>
            <li>Quorum queues: it was redelivered more than <code>delivery-limit</code> times.</li>
          </ul>
          <p>The message is sent to the queue's configured <b>dead letter exchange</b> (DLX) with an <code>x-death</code> header recording the reason, original queue and count. Without a DLX the message is dropped.</p>
          <h3>Delayed retry pattern</h3>
          <ol className="steps">
            <li>
              <div><b>Handle the error</b><div className="d">The <code>orders</code> consumer hits a transient error and calls <code>nack(requeue=false)</code>.</div></div>
            </li>
            <li>
              <div><b>Into a waiting queue</b><div className="d">The DLX routes the message to <code>orders.retry</code>, which has <code>x-message-ttl=30000</code> and no consumers.</div></div>
            </li>
            <li>
              <div><b>TTL expires</b><div className="d">The DLX of <code>orders.retry</code> points back to the main exchange, so the message returns to <code>orders</code> after 30 seconds.</div></div>
            </li>
            <li>
              <div><b>Cap the attempts</b><div className="d">Count via <code>x-death</code>; after N attempts move it to <code>orders.dlq</code> for a human to inspect.</div></div>
            </li>
          </ol>
          <div className="note tip"><code>x-overflow=reject-publish</code> rejects new messages when the queue is full (the producer gets a <code>nack</code>) instead of pushing old ones out. Use it when old data must not be lost.</div>
        </section>
        <section id="rmq-cluster">
          <h2><span className="n">07</span>{"Cluster & High Availability"}</h2>
          <ul className="plain">
            <li><b>Metadata</b> (users, vhosts, exchanges, bindings, queue definitions) is replicated to <b>every node</b>, so clients see the same structure whichever node they connect to.</li>
            <li><b>Queue contents</b> are not: a classic queue lives on one node. If that node dies, the queue is unavailable until it returns.</li>
            <li><b>Quorum queues</b> have replicas on several nodes, one leader and followers, using Raft. A <b>majority</b> must be alive: 3 nodes survive 1 failure, 5 survive 2. Use an odd number of nodes.</li>
            <li>Clients connected to a node that doesn't host the leader still work; the broker forwards internally.</li>
          </ul>
          <h3>Where metadata lives: Mnesia → Khepri</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">3.x</td>
                  <td>Metadata stored in Mnesia. Fragile under network partitions; you must pick a <code>cluster_partition_handling</code> strategy.</td>
                </tr>
                <tr>
                  <td className="m">4.0 (2024)</td>
                  <td>Khepri (Raft based) officially supported. Classic queue mirroring removed in favor of quorum queues.</td>
                </tr>
                <tr>
                  <td className="m">4.2</td>
                  <td>Khepri is the default metadata store for new clusters.</td>
                </tr>
                <tr>
                  <td className="m">4.3 (planned)</td>
                  <td>Khepri expected to become mandatory.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>To copy data between separate clusters (different datacenters) use the <b>Federation</b> or <b>Shovel</b> plugins, similar to MirrorMaker 2 for Kafka.</p>
        </section>
        <section id="rmq-flow">
          <h2><span className="n">08</span>{"Flow control & Alarm"}</h2>
          <ul className="plain">
            <li><b>Memory alarm</b>: when RAM use exceeds <code>vm_memory_high_watermark</code> (default 0.6, i.e. 60% of RAM), the broker <b>blocks every publisher</b> in the cluster until memory drops. Consumers keep reading.</li>
            <li><b>Disk alarm</b>: when free disk falls below <code>disk_free_limit</code>, the broker blocks publishers too.</li>
            <li><b>Credit flow</b>: an internal mechanism that slows connections publishing faster than queues can write. Such connections show as <code>flow</code> in the Management UI.</li>
          </ul>
          <div className="note">“High watermark” here is a <b>memory threshold</b>, entirely different from Kafka's High Watermark (the committed offset).</div>
          <div className="note tip"><b>Operations tip:</b> use separate connections for publishing and consuming. When an alarm blocks publishing, consumer connections are not blocked and can keep draining messages.</div>
        </section>
        <section id="rmq-config">
          <h2><span className="n">09</span>Quick reference</h2>
          <h3>Queue arguments / policies</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Example</th>
                  <th>Effect</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">x-queue-type</td>
                  <td className="v">quorum</td>
                  <td>classic, quorum or stream.</td>
                </tr>
                <tr>
                  <td className="m">x-message-ttl</td>
                  <td className="v">60000</td>
                  <td>Message time-to-live in the queue (ms).</td>
                </tr>
                <tr>
                  <td className="m">x-expires</td>
                  <td className="v">1800000</td>
                  <td>Delete the queue if unused for this long (ms).</td>
                </tr>
                <tr>
                  <td className="m">x-max-length</td>
                  <td className="v">10000</td>
                  <td>Maximum number of messages.</td>
                </tr>
                <tr>
                  <td className="m">x-overflow</td>
                  <td className="v">reject-publish</td>
                  <td>drop-head (default) or reject-publish when full.</td>
                </tr>
                <tr>
                  <td className="m">x-dead-letter-exchange</td>
                  <td className="v">dlx</td>
                  <td>Exchange that receives rejected messages.</td>
                </tr>
                <tr>
                  <td className="m">x-dead-letter-routing-key</td>
                  <td className="v">orders.dead</td>
                  <td>Change the routing key when dead-lettering.</td>
                </tr>
                <tr>
                  <td className="m">x-max-priority</td>
                  <td className="v">10</td>
                  <td>Enable priorities on a classic queue.</td>
                </tr>
                <tr>
                  <td className="m">x-single-active-consumer</td>
                  <td className="v">true</td>
                  <td>Only one consumer receives at a time.</td>
                </tr>
                <tr>
                  <td className="m">x-delivery-limit</td>
                  <td className="v">20</td>
                  <td>Quorum queues: maximum redeliveries.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>Broker and client settings</h3>
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
                  <td className="m">prefetch_count</td>
                  <td>Consumer</td>
                  <td className="v">0 (unlimited)</td>
                  <td>Set it; usually 10–300 depending on processing time.</td>
                </tr>
                <tr>
                  <td className="m">consumer_timeout</td>
                  <td>Broker</td>
                  <td className="v">1800000</td>
                  <td>Maximum time a message may stay unacked (30 minutes).</td>
                </tr>
                <tr>
                  <td className="m">vm_memory_high_watermark</td>
                  <td>Broker</td>
                  <td className="v">0.6</td>
                  <td>RAM threshold that triggers the memory alarm.</td>
                </tr>
                <tr>
                  <td className="m">disk_free_limit</td>
                  <td>Broker</td>
                  <td className="v">50MB</td>
                  <td>Free disk threshold that triggers the disk alarm. Set it higher in production.</td>
                </tr>
                <tr>
                  <td className="m">heartbeat</td>
                  <td>Client/Broker</td>
                  <td className="v">60 seconds</td>
                  <td>Detects dead connections.</td>
                </tr>
                <tr>
                  <td className="m">default_queue_type</td>
                  <td>vhost</td>
                  <td className="v">classic</td>
                  <td>Queue type when x-queue-type is not given.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>Default ports</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Port</th>
                  <th>Used for</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">5672 / 5671</td>
                  <td>AMQP 0-9-1 and AMQP 1.0 (5671 with TLS)</td>
                </tr>
                <tr>
                  <td className="m">15672</td>
                  <td>Management UI and HTTP API</td>
                </tr>
                <tr>
                  <td className="m">5552</td>
                  <td>Stream protocol</td>
                </tr>
                <tr>
                  <td className="m">1883 / 61613</td>
                  <td>MQTT / STOMP (plugin)</td>
                </tr>
                <tr>
                  <td className="m">25672 · 4369</td>
                  <td>Inter-node communication · epmd</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
