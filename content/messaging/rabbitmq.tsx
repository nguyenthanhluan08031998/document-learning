export default function RabbitmqPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục RabbitMQ">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#rmq-arch"><span>01</span>Kiến trúc tổng thể</a></li>
          <li><a href="#rmq-publish"><span>02</span>Producer → Queue</a></li>
          <li><a href="#rmq-exchange"><span>03</span>{"Exchange & Routing"}</a></li>
          <li><a href="#rmq-queue"><span>04</span>Các loại Queue</a></li>
          <li><a href="#rmq-consumer"><span>05</span>{"Consumer & Ack"}</a></li>
          <li><a href="#rmq-dlx"><span>06</span>{"TTL & Dead Letter"}</a></li>
          <li><a href="#rmq-cluster"><span>07</span>{"Cluster & HA"}</a></li>
          <li><a href="#rmq-flow"><span>08</span>Flow control</a></li>
          <li><a href="#rmq-config"><span>09</span>Bảng tra nhanh</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">rabbitmq · ghi chú học tập</div>
          <h1>Sổ tay RabbitMQ: từ Exchange đến Dead Letter</h1>
          <p className="lede">Cách RabbitMQ nhận message, định tuyến qua exchange, lưu trong queue, giao cho consumer và xử lý khi có sự cố. Nội dung theo RabbitMQ 4.x.</p>
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
          <h2><span className="n">01</span>Kiến trúc tổng thể</h2>
          <p className="sub">Producer không gửi thẳng vào queue. Message luôn đi qua một <b>exchange</b>, exchange dựa vào <b>binding</b> để quyết định chép message vào queue nào.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 470" role="img" aria-label="Producer publish tới exchange orders (topic) và notify (fanout) trong vhost shop; exchange định tuyến qua binding tới các queue payment, shipping, email, sms; consumer nhận từ queue"> <defs> <marker id="rar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> </defs> <style>{`.rt{font-family:var(--f-body);fill:var(--ink);font-size:13px}
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
.rbk{font-family:var(--f-mono);font-size:10.5px;fill:var(--warn)}`}</style>  <rect className="rbox" x="16" y="176" width="150" height="128" rx="8" /> <text className="rtb" x="30" y="202">Producer</text> <text className="rtm" x="30" y="226">connection → channel</text> <text className="rtm" x="30" y="244">basic.publish(</text> <text className="rtm" x="30" y="262"> exchange,</text> <text className="rtm" x="30" y="280"> routing_key)</text> <path className="rln" d="M166 220 C196 220 200 150 230 150" markerEnd="url(#rar)" /> <path className="rln" d="M166 270 C196 270 200 330 230 330" markerEnd="url(#rar)" />  <rect className="rclu" x="200" y="34" width="490" height="420" rx="12" /> <text className="rtb" x="218" y="58">RabbitMQ broker</text> <rect className="rvh" x="216" y="72" width="458" height="364" rx="8" /> <text className="rvht" x="228" y="90">vhost: /shop</text> <rect className="rex" x="232" y="120" width="150" height="60" rx="7" /> <text className="rtb" x="246" y="146">orders</text> <text className="rtm" x="246" y="166">exchange · topic</text> <rect className="rex" x="232" y="300" width="150" height="60" rx="7" /> <text className="rtb" x="246" y="326">notify</text> <text className="rtm" x="246" y="346">exchange · fanout</text> <rect className="rq" x="508" y="100" width="150" height="50" rx="7" /> <text className="rt" x="520" y="121" style={{ fontWeight: "600" }}>payment</text><text className="rtm" x="520" y="139">queue · quorum</text> <rect className="rq" x="508" y="170" width="150" height="50" rx="7" /> <text className="rt" x="520" y="191" style={{ fontWeight: "600" }}>shipping</text><text className="rtm" x="520" y="209">queue · quorum</text> <rect className="rq" x="508" y="280" width="150" height="50" rx="7" /> <text className="rt" x="520" y="301" style={{ fontWeight: "600" }}>email</text><text className="rtm" x="520" y="319">queue · classic</text> <rect className="rq" x="508" y="350" width="150" height="50" rx="7" /> <text className="rt" x="520" y="371" style={{ fontWeight: "600" }}>sms</text><text className="rtm" x="520" y="389">queue · classic</text>  <path className="rbd" d="M382 140 C440 140 450 125 506 125" markerEnd="url(#rar)" /> <text className="rbk" x="398" y="122">order.created</text> <path className="rbd" d="M382 162 C440 162 450 195 506 195" markerEnd="url(#rar)" /> <text className="rbk" x="404" y="204">order.*</text> <path className="rbd" d="M382 322 C440 322 450 305 506 305" markerEnd="url(#rar)" /> <path className="rbd" d="M382 340 C440 340 450 375 506 375" markerEnd="url(#rar)" /> <text className="rbk" x="398" y="392">không cần key</text> <text className="rtm" x="232" y="424">đường cam = binding (kèm binding key)</text>  <rect className="rbox" x="726" y="96" width="160" height="320" rx="8" /> <text className="rtb" x="740" y="122">Consumers</text> <text className="rtm" x="740" y="140">push · prefetch · ack</text> <rect className="rbox" x="738" y="152" width="136" height="50" rx="6" /> <text className="rt" x="750" y="173">Payment svc</text><text className="rtm" x="750" y="191">← payment</text> <rect className="rbox" x="738" y="214" width="136" height="50" rx="6" /> <text className="rt" x="750" y="235">Shipping svc</text><text className="rtm" x="750" y="253">← shipping</text> <rect className="rbox" x="738" y="300" width="136" height="50" rx="6" /> <text className="rt" x="750" y="321">Notify svc</text><text className="rtm" x="750" y="339">← email, sms</text> <path className="rln" d="M658 125 C700 125 700 177 736 177" markerEnd="url(#rar)" /> <path className="rln" d="M658 195 C700 195 700 239 736 239" markerEnd="url(#rar)" /> <path className="rln" d="M658 305 C700 305 700 325 736 325" markerEnd="url(#rar)" /> <path className="rln" d="M658 375 C700 375 700 325 736 325" markerEnd="url(#rar)" /> </svg>
            </div>
            <figcaption>Message <code>order.created</code> gửi vào exchange <code>orders</code> sẽ được chép vào cả <code>payment</code> (khớp chính xác) và <code>shipping</code> (khớp <code>order.*</code>). Exchange <code>notify</code> kiểu fanout chép mọi message vào cả <code>email</code> và <code>sms</code>. Mỗi queue giữ bản sao riêng; consumer lấy xong và ack thì message bị xóa khỏi queue đó.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Khái niệm</th>
                  <th>Ý nghĩa ngắn gọn</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Broker / Node</b></td>
                  <td>Một server RabbitMQ. Nhiều node ghép lại thành cluster.</td>
                </tr>
                <tr>
                  <td><b>Connection</b></td>
                  <td>Kết nối TCP dài hạn từ ứng dụng tới broker (cổng 5672 cho AMQP 0-9-1).</td>
                </tr>
                <tr>
                  <td><b>Channel</b></td>
                  <td>Kết nối ảo bên trong một connection. Mỗi thread nên dùng channel riêng, không mở connection mới cho mỗi lần gửi.</td>
                </tr>
                <tr>
                  <td><b>Virtual host (vhost)</b></td>
                  <td>Không gian tách biệt chứa exchange, queue, quyền riêng. Giống “database” trong một server DB.</td>
                </tr>
                <tr>
                  <td><b>Exchange</b></td>
                  <td>Nơi nhận message từ producer và định tuyến. Không lưu message.</td>
                </tr>
                <tr>
                  <td><b>Binding</b></td>
                  <td>Luật nối exchange với queue (hoặc exchange khác), kèm binding key hoặc điều kiện headers.</td>
                </tr>
                <tr>
                  <td><b>Routing key</b></td>
                  <td>Chuỗi producer gắn vào message, exchange so với binding key để chọn queue.</td>
                </tr>
                <tr>
                  <td><b>Queue</b></td>
                  <td>Nơi thực sự lưu message chờ consumer xử lý, theo thứ tự FIFO.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="rmq-publish">
          <h2><span className="n">02</span>Luồng Producer → Queue</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 420" role="img" aria-label="Producer tạo message, mở connection và channel, bật confirm mode, publish; broker: exchange nhận, định tuyến theo binding, đưa vào queue, lưu trữ, gửi confirm về producer"> <defs> <marker id="rar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> <marker id="rar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker> </defs> <style>{`.ftb{font-family:var(--f-body);fill:var(--ink);font-size:13.5px;font-weight:700}
.ftm{font-family:var(--f-mono);fill:var(--muted);font-size:11px}
.flane{font-family:var(--f-mono);font-size:11px;font-weight:600;letter-spacing:.08em;fill:var(--accent)}
.fbox{fill:var(--surface);stroke:var(--line);stroke-width:1.5}
.fq{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.5}
.fbg{fill:var(--bg);stroke:var(--line);stroke-width:1}
.fdisk{fill:var(--warn-soft);stroke:var(--warn);stroke-width:1.3}
.fbad{fill:var(--bad-soft);stroke:var(--bad);stroke-width:1.3;stroke-dasharray:4 3}
.fln{stroke:var(--accent);stroke-width:1.8;fill:none}
.fdl{stroke:var(--muted);stroke-width:1.5;fill:none;stroke-dasharray:5 4}`}</style> <rect className="fbg" x="8" y="22" width="884" height="118" rx="10" /> <text className="flane" x="20" y="42">PRODUCER (CLIENT)</text> <rect className="fbg" x="8" y="160" width="884" height="252" rx="10" /> <text className="flane" x="20" y="180">RABBITMQ BROKER</text> <rect className="fbox" x="20" y="52" width="150" height="70" rx="7" /><text className="ftb" x="32" y="78">Tạo message</text><text className="ftm" x="32" y="98">body + properties</text> <rect className="fbox" x="195" y="52" width="150" height="70" rx="7" /><text className="ftb" x="207" y="78">Connection</text><text className="ftm" x="207" y="98">TCP · cổng 5672</text> <rect className="fbox" x="370" y="52" width="150" height="70" rx="7" /><text className="ftb" x="382" y="78">Channel</text><text className="ftm" x="382" y="98">kênh ảo trên TCP</text> <rect className="fbox" x="545" y="52" width="150" height="70" rx="7" /><text className="ftb" x="557" y="78">Confirm mode</text><text className="ftm" x="557" y="98">confirm.select</text> <rect className="fbox" x="720" y="52" width="150" height="70" rx="7" /><text className="ftb" x="732" y="78">basic.publish</text><text className="ftm" x="732" y="98">exchange + key</text> <path className="fln" d="M170 87 H193" markerEnd="url(#rar2)" /> <path className="fln" d="M345 87 H368" markerEnd="url(#rar2)" /> <path className="fln" d="M520 87 H543" markerEnd="url(#rar2)" /> <path className="fln" d="M695 87 H718" markerEnd="url(#rar2)" /> <rect className="fbox" x="720" y="190" width="150" height="70" rx="7" /><text className="ftb" x="732" y="216">Exchange nhận</text><text className="ftm" x="732" y="236">kiểm tra quyền</text> <rect className="fbox" x="545" y="190" width="150" height="70" rx="7" /><text className="ftb" x="557" y="216">Định tuyến</text><text className="ftm" x="557" y="236">type + binding</text> <rect className="fq" x="370" y="190" width="150" height="70" rx="7" /><text className="ftb" x="382" y="216">Vào queue</text><text className="ftm" x="382" y="236">một bản / queue</text> <rect className="fbox" x="195" y="190" width="150" height="70" rx="7" /><text className="ftb" x="207" y="216">Lưu trữ</text><text className="ftm" x="207" y="236">RAM · đĩa · Raft</text> <rect className="fbox" x="20" y="190" width="150" height="70" rx="7" /><text className="ftb" x="32" y="216">Gửi confirm</text><text className="ftm" x="32" y="236">basic.ack / nack</text> <path className="fln" d="M720 225 H697" markerEnd="url(#rar2)" /> <path className="fln" d="M545 225 H522" markerEnd="url(#rar2)" /> <path className="fln" d="M370 225 H347" markerEnd="url(#rar2)" /> <path className="fln" d="M195 225 H172" markerEnd="url(#rar2)" /> <path className="fln" d="M795 122 V188" markerEnd="url(#rar2)" /> <text className="ftm" x="805" y="158">AMQP frame</text> <path className="fdl" d="M60 190 V124" markerEnd="url(#rar3)" /> <text className="ftm" x="70" y="158">ack → producer biết đã an toàn</text> <path className="fdl" d="M270 262 V318" markerEnd="url(#rar3)" /> <rect className="fdisk" x="195" y="320" width="150" height="62" rx="7" /> <text className="ftb" x="207" y="344">Ổ đĩa / replica</text> <text className="ftm" x="207" y="364">persistent · quorum</text> <path className="fdl" d="M795 262 V318" markerEnd="url(#rar3)" /> <rect className="fbad" x="720" y="320" width="150" height="62" rx="7" /> <text className="ftb" x="732" y="344">Không khớp binding</text> <text className="ftm" x="732" y="364">bỏ · return · AE</text> <text className="ftm" x="380" y="334">classic + persistent → ack sau khi ghi đĩa</text> <text className="ftm" x="380" y="352">quorum → ack khi đa số replica đã có</text> <text className="ftm" x="380" y="370">không bật confirm → không có ack</text> </svg>
            </div>
            <figcaption>Hàng trên chạy trong ứng dụng, hàng dưới chạy trên broker. Exchange chỉ định tuyến, không lưu gì; message chỉ tồn tại khi đã vào ít nhất một queue.</figcaption>
          </figure>
          <h3>Phía Producer</h3>
          <ol className="steps">
            <li>
              <div><b>Tạo message</b><div className="d">Body là <code>byte[]</code> (tự serialize, thường JSON). Properties gồm <code>delivery_mode</code> (2 = persistent), <code>content_type</code>, <code>message_id</code>, <code>correlation_id</code>, <code>reply_to</code>, <code>expiration</code>, <code>priority</code>, <code>headers</code>.</div></div>
            </li>
            <li>
              <div><b>Mở connection và channel</b><div className="d">Connection là TCP, tốn tài nguyên, nên mở một lần và dùng lại. Channel nhẹ, mỗi thread một channel.</div></div>
            </li>
            <li>
              <div><b>Bật publisher confirms</b><div className="d"><code>confirm.select</code> trên channel. Mỗi message được đánh số thứ tự (delivery tag) để khớp với ack trả về.</div></div>
            </li>
            <li>
              <div><b>basic.publish</b><div className="d">Gửi tới một exchange kèm routing key. Có thể đặt cờ <code>mandatory=true</code> để được trả lại message nếu không có queue nào nhận.</div></div>
            </li>
          </ol>
          <h3>Phía Broker</h3>
          <ol className="steps">
            <li>
              <div><b>Exchange nhận message</b><div className="d">Kiểm tra exchange có tồn tại và user có quyền ghi trên vhost.</div></div>
            </li>
            <li>
              <div><b>Định tuyến</b><div className="d">So routing key hoặc headers với các binding theo loại exchange. Một message có thể vào 0, 1 hoặc nhiều queue.</div></div>
            </li>
            <li>
              <div><b>Không khớp binding nào</b><div className="d">Mặc định message bị bỏ. Với <code>mandatory=true</code>, broker gửi trả qua <code>basic.return</code>. Nếu exchange có <b>alternate exchange</b> thì message chuyển sang đó.</div></div>
            </li>
            <li>
              <div><b>Vào queue và lưu trữ</b><div className="d">Classic queue: persistent message được ghi xuống đĩa. Quorum queue: luôn ghi vào Raft log và sao chép sang các replica.</div></div>
            </li>
            <li>
              <div><b>Gửi confirm</b><div className="d"><code>basic.ack</code> khi message đã được mọi queue đích nhận an toàn; <code>basic.nack</code> khi broker không xử lý được. Producer nhận ack bất đồng bộ qua callback, giống cơ chế callback của Kafka producer.</div></div>
            </li>
          </ol>
          <div className="note"><b>Để không mất message phía gửi:</b> queue durable (hoặc quorum) + <code>delivery_mode=2</code> + bật publisher confirms + xử lý <code>nack</code> và <code>basic.return</code>. Thiếu một trong các bước này thì message có thể mất mà producer không biết.</div>
        </section>
        <section id="rmq-exchange">
          <h2><span className="n">03</span>{"Exchange & Routing"}</h2>
          <p className="sub">Bốn loại exchange, khác nhau ở cách so message với binding.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 300" role="img" aria-label="Bốn loại exchange: direct khớp chính xác key, fanout gửi mọi queue, topic khớp mẫu có dấu sao và thăng, headers khớp theo headers"> <style>{`.xt{font-family:var(--f-body);fill:var(--ink);font-size:14px;font-weight:700}
.xm{font-family:var(--f-mono);fill:var(--muted);font-size:10.5px}
.xk{font-family:var(--f-mono);fill:var(--warn);font-size:9.5px}
.xpanel{fill:var(--bg);stroke:var(--line);stroke-width:1}
.xex{fill:var(--warn-soft);stroke:var(--warn);stroke-width:1.4}
.xq{fill:var(--surface);stroke:var(--line);stroke-width:1.3}
.xqh{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.6}
.xon{stroke:var(--accent);stroke-width:2;fill:none}
.xoff{stroke:var(--muted);stroke-width:1.2;fill:none;stroke-dasharray:4 4;opacity:.6}
.xmsg{fill:var(--surface);stroke:var(--accent);stroke-width:1}`}</style> <rect className="xpanel" x="10" y="8" width="212" height="284" rx="10" /> <text className="xt" x="24" y="32">direct</text> <rect className="xmsg" x="24" y="42" width="184" height="22" rx="11" /> <text className="xm" x="116" y="57" textAnchor="middle">msg: key = pdf</text> <rect className="xex" x="66" y="80" width="100" height="36" rx="6" /> <text className="xm" x="116" y="102" textAnchor="middle" style={{ fill: "var(--ink)", fontWeight: "600" }}>exchange</text> <path className="xon" d="M116 116 L47 196" /> <rect className="xqh" x="14" y="198" width="66" height="40" rx="6" /><text className="xm" x="47" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q1</text><text className="xk" x="47" y="230" textAnchor="middle">pdf</text> <path className="xoff" d="M116 116 L116 196" /> <rect className="xq" x="83" y="198" width="66" height="40" rx="6" /><text className="xm" x="116" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q2</text><text className="xk" x="116" y="230" textAnchor="middle">png</text> <path className="xon" d="M116 116 L185 196" /> <rect className="xqh" x="152" y="198" width="66" height="40" rx="6" /><text className="xm" x="185" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q3</text><text className="xk" x="185" y="230" textAnchor="middle">pdf</text> <text className="xm" x="116" y="270" textAnchor="middle">key khớp chính xác</text> <rect className="xpanel" x="232" y="8" width="212" height="284" rx="10" /> <text className="xt" x="246" y="32">fanout</text> <rect className="xmsg" x="246" y="42" width="184" height="22" rx="11" /> <text className="xm" x="338" y="57" textAnchor="middle">msg: key bất kỳ</text> <rect className="xex" x="288" y="80" width="100" height="36" rx="6" /> <text className="xm" x="338" y="102" textAnchor="middle" style={{ fill: "var(--ink)", fontWeight: "600" }}>exchange</text> <path className="xon" d="M338 116 L269 196" /> <rect className="xqh" x="236" y="198" width="66" height="40" rx="6" /><text className="xm" x="269" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q1</text><text className="xk" x="269" y="230" textAnchor="middle">—</text> <path className="xon" d="M338 116 L338 196" /> <rect className="xqh" x="305" y="198" width="66" height="40" rx="6" /><text className="xm" x="338" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q2</text><text className="xk" x="338" y="230" textAnchor="middle">—</text> <path className="xon" d="M338 116 L407 196" /> <rect className="xqh" x="374" y="198" width="66" height="40" rx="6" /><text className="xm" x="407" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q3</text><text className="xk" x="407" y="230" textAnchor="middle">—</text> <text className="xm" x="338" y="270" textAnchor="middle">chép vào mọi queue</text> <rect className="xpanel" x="454" y="8" width="212" height="284" rx="10" /> <text className="xt" x="468" y="32">topic</text> <rect className="xmsg" x="468" y="42" width="184" height="22" rx="11" /> <text className="xm" x="560" y="57" textAnchor="middle">msg: order.vn.created</text> <rect className="xex" x="510" y="80" width="100" height="36" rx="6" /> <text className="xm" x="560" y="102" textAnchor="middle" style={{ fill: "var(--ink)", fontWeight: "600" }}>exchange</text> <path className="xon" d="M560 116 L491 196" /> <rect className="xqh" x="458" y="198" width="66" height="40" rx="6" /><text className="xm" x="491" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q1</text><text className="xk" x="491" y="230" textAnchor="middle">*.vn.*</text> <path className="xoff" d="M560 116 L560 196" /> <rect className="xq" x="527" y="198" width="66" height="40" rx="6" /><text className="xm" x="560" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q2</text><text className="xk" x="560" y="230" textAnchor="middle">*.created</text> <path className="xon" d="M560 116 L629 196" /> <rect className="xqh" x="596" y="198" width="66" height="40" rx="6" /><text className="xm" x="629" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q3</text><text className="xk" x="629" y="230" textAnchor="middle">order.#</text> <text className="xm" x="560" y="270" textAnchor="middle">* = 1 từ · # = 0+ từ</text> <rect className="xpanel" x="676" y="8" width="212" height="284" rx="10" /> <text className="xt" x="690" y="32">headers</text> <rect className="xmsg" x="690" y="42" width="184" height="22" rx="11" /> <text className="xm" x="782" y="57" textAnchor="middle">msg: type=pdf, lang=vi</text> <rect className="xex" x="732" y="80" width="100" height="36" rx="6" /> <text className="xm" x="782" y="102" textAnchor="middle" style={{ fill: "var(--ink)", fontWeight: "600" }}>exchange</text> <path className="xoff" d="M782 116 L713 196" /> <rect className="xq" x="680" y="198" width="66" height="40" rx="6" /><text className="xm" x="713" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q1</text><text className="xk" x="713" y="230" textAnchor="middle">all:pdf+en</text> <path className="xon" d="M782 116 L782 196" /> <rect className="xqh" x="749" y="198" width="66" height="40" rx="6" /><text className="xm" x="782" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q2</text><text className="xk" x="782" y="230" textAnchor="middle">any:vi</text> <path className="xon" d="M782 116 L851 196" /> <rect className="xqh" x="818" y="198" width="66" height="40" rx="6" /><text className="xm" x="851" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Q3</text><text className="xk" x="851" y="230" textAnchor="middle">all:pdf</text> <text className="xm" x="782" y="270" textAnchor="middle">so khớp headers</text> </svg>
            </div>
            <figcaption>Ô xanh là queue nhận được message. Chữ cam trong mỗi queue là binding của queue đó.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>Quy tắc khớp</th>
                  <th>Dùng khi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>direct</b></td>
                  <td>Routing key bằng đúng binding key.</td>
                  <td>Giao việc theo loại cụ thể: <code>pdf</code>, <code>email</code>.</td>
                </tr>
                <tr>
                  <td><b>fanout</b></td>
                  <td>Bỏ qua key, chép vào mọi queue đã bind.</td>
                  <td>Broadcast: thông báo, xóa cache trên nhiều service.</td>
                </tr>
                <tr>
                  <td><b>topic</b></td>
                  <td>Key gồm các từ ngăn bởi dấu chấm. <code>*</code> khớp đúng 1 từ, <code>#</code> khớp 0 hoặc nhiều từ.</td>
                  <td>Lọc theo nhiều chiều: <code>order.vn.created</code>, <code>log.*.error</code>.</td>
                </tr>
                <tr>
                  <td><b>headers</b></td>
                  <td>So các cặp trong <code>headers</code>. <code>x-match=all</code> cần khớp hết, <code>x-match=any</code> chỉ cần một.</td>
                  <td>Điều kiện không gói gọn trong một chuỗi key.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="plain">
            <li><b>Default exchange</b> (tên rỗng <code>""</code>) là direct exchange có sẵn, mọi queue tự động bind vào nó bằng chính tên queue. Vì vậy <code>publish("", "payment")</code> trông như gửi thẳng vào queue <code>payment</code>.</li>
            <li><b>Exchange-to-exchange binding</b>: exchange có thể bind vào exchange khác để xếp tầng định tuyến.</li>
            <li><b>Alternate exchange</b> (<code>alternate-exchange</code>): nơi nhận các message không khớp binding nào, tránh mất message âm thầm.</li>
          </ul>
        </section>
        <section id="rmq-queue">
          <h2><span className="n">04</span>Các loại Queue</h2>
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
                  <td><b>Lưu trữ</b></td>
                  <td>Một node</td>
                  <td>Nhiều node, đồng thuận Raft</td>
                  <td>Log chỉ ghi nối thêm, nhiều node</td>
                </tr>
                <tr>
                  <td><b>Nhân bản</b></td>
                  <td>Không (mirroring đã bị bỏ từ 4.0)</td>
                  <td>Leader + follower, cần đa số node sống</td>
                  <td>Leader + replica</td>
                </tr>
                <tr>
                  <td><b>Đọc xong</b></td>
                  <td>Xóa sau ack</td>
                  <td>Xóa sau ack</td>
                  <td>Không xóa, đọc lại theo offset</td>
                </tr>
                <tr>
                  <td><b>Thứ tự ưu tiên</b></td>
                  <td>Có (<code>x-max-priority</code>)</td>
                  <td>Có (2 mức từ 4.0)</td>
                  <td>Không</td>
                </tr>
                <tr>
                  <td><b>Message độc hại</b></td>
                  <td>Không tự xử lý</td>
                  <td><code>delivery-limit</code> (mặc định 20 từ 4.0)</td>
                  <td>Không áp dụng</td>
                </tr>
                <tr>
                  <td><b>Dùng khi</b></td>
                  <td>Dữ liệu tạm, có thể mất, cần nhanh</td>
                  <td>Dữ liệu quan trọng, mặc định nên chọn</td>
                  <td>Nhiều consumer đọc cùng dữ liệu, cần replay, giống Kafka</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>Thuộc tính khi khai báo queue</h3>
          <ul className="plain">
            <li><code>durable</code>: queue còn tồn tại sau khi broker restart. Message chỉ sống sót nếu thêm <code>delivery_mode=2</code>.</li>
            <li><code>exclusive</code>: chỉ connection tạo ra mới dùng được, tự xóa khi connection đóng. Hay dùng cho reply queue.</li>
            <li><code>auto-delete</code>: tự xóa khi consumer cuối cùng hủy đăng ký.</li>
            <li><code>arguments</code>: <code>x-queue-type</code> (classic/quorum/stream), <code>x-message-ttl</code>, <code>x-expires</code>, <code>x-max-length</code>, <code>x-overflow</code>, <code>x-dead-letter-exchange</code>, <code>x-dead-letter-routing-key</code>.</li>
          </ul>
          <div className="note tip"><b>Policy thay vì arguments:</b> TTL, max-length, dead letter… nên đặt bằng <b>policy</b> (<code>rabbitmqctl set_policy</code>) để đổi được lúc chạy. Arguments khai báo trong code thì không sửa được nếu không xóa và tạo lại queue.</div>
        </section>
        <section id="rmq-consumer">
          <h2><span className="n">05</span>{"Consumer & Acknowledgement"}</h2>
          <ol className="steps">
            <li>
              <div><b>Đăng ký nhận (basic.consume)</b><div className="d">Broker <b>đẩy (push)</b> message tới consumer. Có <code>basic.get</code> để kéo từng message nhưng chậm, không khuyến khích.</div></div>
            </li>
            <li>
              <div><b>Giới hạn bằng prefetch</b><div className="d"><code>basic.qos(prefetch_count)</code>: số message tối đa đã giao mà chưa ack. Hết hạn mức thì broker ngừng đẩy thêm cho consumer đó.</div></div>
            </li>
            <li>
              <div><b>Xử lý message</b><div className="d">Message lúc này ở trạng thái <em>unacked</em>, vẫn nằm trong queue nhưng không giao cho ai khác.</div></div>
            </li>
            <li>
              <div><b>Gửi kết quả</b><div className="d"><code>basic.ack</code>: xong, xóa khỏi queue. <code>basic.nack</code>/<code>basic.reject</code> với <code>requeue=true</code>: trả lại queue; <code>requeue=false</code>: bỏ hoặc chuyển sang dead letter.</div></div>
            </li>
          </ol>
          <h3>Auto ack và manual ack</h3>
          <div className="cmp">
            <div><h4>Auto ack (<code>autoAck=true</code>)</h4>Broker coi là xong ngay khi gửi đi. Consumer crash giữa chừng thì message mất. Nhanh, tương ứng at-most-once.</div>
            <div><h4>Manual ack</h4>Consumer ack sau khi xử lý xong. Channel đóng trước khi ack thì message tự quay lại queue với cờ <code>redelivered=true</code>. Tương ứng at-least-once.</div>
          </div>
          <h3>Nhiều consumer trên một queue</h3>
          <ul className="plain">
            <li><b>Competing consumers</b>: message được chia lần lượt (round-robin) cho các consumer, mỗi message chỉ giao cho một consumer. Thêm consumer là tăng tốc xử lý, không bị giới hạn như số partition của Kafka.</li>
            <li>Muốn nhiều service <b>cùng nhận một message</b> thì mỗi service cần queue riêng, bind vào cùng exchange (thường là fanout hoặc topic).</li>
            <li>Thứ tự chỉ đảm bảo khi một consumer xử lý, vì nhiều consumer hoặc requeue sẽ đảo thứ tự. Cần giữ thứ tự thì bật <code>x-single-active-consumer</code>.</li>
            <li><code>consumer_timeout</code> (mặc định 30 phút): giữ message unacked quá lâu thì broker đóng channel và trả message về queue.</li>
          </ul>
          <div className="note">RabbitMQ không có exactly-once. Kết hợp publisher confirms và manual ack cho at-least-once, rồi làm consumer <b>idempotent</b> (ví dụ lưu <code>message_id</code> đã xử lý) để chịu được message lặp.</div>
        </section>
        <section id="rmq-dlx">
          <h2><span className="n">06</span>{"TTL & Dead Letter"}</h2>
          <h3>Message bị chuyển sang dead letter khi</h3>
          <ul className="plain">
            <li>Consumer <code>nack</code> hoặc <code>reject</code> với <code>requeue=false</code>.</li>
            <li>Hết TTL: theo queue (<code>x-message-ttl</code>) hoặc theo từng message (property <code>expiration</code>).</li>
            <li>Queue vượt <code>x-max-length</code> / <code>x-max-length-bytes</code> với <code>x-overflow=drop-head</code> (mặc định), message cũ nhất bị đẩy ra.</li>
            <li>Quorum queue: message bị giao lại vượt <code>delivery-limit</code>.</li>
          </ul>
          <p>Message bị đẩy sang <b>dead letter exchange</b> (DLX) cấu hình cho queue, kèm header <code>x-death</code> ghi lý do, queue gốc và số lần. Nếu không cấu hình DLX thì message bị bỏ.</p>
          <h3>Mẫu retry có độ trễ</h3>
          <ol className="steps">
            <li>
              <div><b>Xử lý lỗi</b><div className="d">Consumer của <code>orders</code> gặp lỗi tạm thời, <code>nack(requeue=false)</code>.</div></div>
            </li>
            <li>
              <div><b>Sang queue chờ</b><div className="d">DLX đưa message vào <code>orders.retry</code>, queue này có <code>x-message-ttl=30000</code> và không có consumer.</div></div>
            </li>
            <li>
              <div><b>Hết TTL</b><div className="d">DLX của <code>orders.retry</code> trỏ ngược về exchange chính, message quay lại <code>orders</code> sau 30 giây.</div></div>
            </li>
            <li>
              <div><b>Giới hạn số lần</b><div className="d">Đếm qua <code>x-death</code>; quá N lần thì chuyển hẳn vào <code>orders.dlq</code> để người xem xét.</div></div>
            </li>
          </ol>
          <div className="note tip"><code>x-overflow=reject-publish</code> từ chối message mới khi queue đầy (producer nhận <code>nack</code>) thay vì đẩy message cũ ra. Phù hợp khi không được làm mất dữ liệu cũ.</div>
        </section>
        <section id="rmq-cluster">
          <h2><span className="n">07</span>{"Cluster & High Availability"}</h2>
          <ul className="plain">
            <li><b>Metadata</b> (user, vhost, exchange, binding, định nghĩa queue) được chép lên <b>mọi node</b>. Vì vậy client kết nối node nào cũng thấy cùng một cấu trúc.</li>
            <li><b>Nội dung queue</b> thì không: classic queue chỉ nằm trên một node. Node đó chết thì queue không dùng được cho tới khi node quay lại.</li>
            <li><b>Quorum queue</b> có replica trên nhiều node, gồm một leader và các follower, dùng Raft. Cần <b>đa số</b> replica sống: 3 node chịu được 1 node chết, 5 node chịu được 2. Nên dùng số node lẻ.</li>
            <li>Client nối vào node không giữ leader vẫn dùng được, broker tự chuyển tiếp nội bộ.</li>
          </ul>
          <h3>Nơi lưu metadata: Mnesia → Khepri</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Phiên bản</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">3.x</td>
                  <td>Metadata lưu trong Mnesia. Dễ gặp lỗi khi mạng bị chia cắt, phải chọn chiến lược <code>cluster_partition_handling</code>.</td>
                </tr>
                <tr>
                  <td className="m">4.0 (2024)</td>
                  <td>Khepri (dựa trên Raft) được hỗ trợ chính thức. Classic queue mirroring bị gỡ bỏ, thay bằng quorum queue.</td>
                </tr>
                <tr>
                  <td className="m">4.2</td>
                  <td>Khepri là metadata store mặc định cho cluster mới.</td>
                </tr>
                <tr>
                  <td className="m">4.3 (dự kiến)</td>
                  <td>Khepri dự kiến trở thành bắt buộc.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Chép dữ liệu giữa các cluster khác nhau (khác datacenter) dùng plugin <b>Federation</b> hoặc <b>Shovel</b>, tương tự vai trò MirrorMaker 2 bên Kafka.</p>
        </section>
        <section id="rmq-flow">
          <h2><span className="n">08</span>{"Flow control & Alarm"}</h2>
          <ul className="plain">
            <li><b>Memory alarm</b>: khi RAM dùng vượt <code>vm_memory_high_watermark</code> (mặc định 0.6, tức 60% RAM), broker <b>chặn mọi publisher</b> trên cluster cho tới khi bộ nhớ giảm. Consumer vẫn đọc bình thường.</li>
            <li><b>Disk alarm</b>: khi ổ trống dưới <code>disk_free_limit</code>, broker cũng chặn publisher.</li>
            <li><b>Credit flow</b>: cơ chế nội bộ làm chậm connection gửi quá nhanh so với khả năng ghi của queue. Trạng thái connection hiện là <code>flow</code> trên Management UI.</li>
          </ul>
          <div className="note">Tên “high watermark” ở đây là <b>ngưỡng bộ nhớ</b>, hoàn toàn khác High Watermark (offset đã committed) của Kafka.</div>
          <div className="note tip"><b>Mẹo vận hành:</b> tách connection cho publisher và consumer. Khi alarm chặn publish, connection của consumer không bị chặn theo nên vẫn rút bớt được message.</div>
        </section>
        <section id="rmq-config">
          <h2><span className="n">09</span>Bảng tra nhanh</h2>
          <h3>Argument / policy của queue</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Tham số</th>
                  <th>Ví dụ</th>
                  <th>Tác dụng</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">x-queue-type</td>
                  <td className="v">quorum</td>
                  <td>classic, quorum hoặc stream.</td>
                </tr>
                <tr>
                  <td className="m">x-message-ttl</td>
                  <td className="v">60000</td>
                  <td>Thời gian sống của message trong queue (ms).</td>
                </tr>
                <tr>
                  <td className="m">x-expires</td>
                  <td className="v">1800000</td>
                  <td>Xóa queue nếu không được dùng trong khoảng này (ms).</td>
                </tr>
                <tr>
                  <td className="m">x-max-length</td>
                  <td className="v">10000</td>
                  <td>Số message tối đa.</td>
                </tr>
                <tr>
                  <td className="m">x-overflow</td>
                  <td className="v">reject-publish</td>
                  <td>drop-head (mặc định) hoặc reject-publish khi đầy.</td>
                </tr>
                <tr>
                  <td className="m">x-dead-letter-exchange</td>
                  <td className="v">dlx</td>
                  <td>Exchange nhận message bị loại.</td>
                </tr>
                <tr>
                  <td className="m">x-dead-letter-routing-key</td>
                  <td className="v">orders.dead</td>
                  <td>Đổi routing key khi dead letter.</td>
                </tr>
                <tr>
                  <td className="m">x-max-priority</td>
                  <td className="v">10</td>
                  <td>Bật priority cho classic queue.</td>
                </tr>
                <tr>
                  <td className="m">x-single-active-consumer</td>
                  <td className="v">true</td>
                  <td>Chỉ một consumer nhận tại một thời điểm.</td>
                </tr>
                <tr>
                  <td className="m">x-delivery-limit</td>
                  <td className="v">20</td>
                  <td>Quorum queue: số lần giao lại tối đa.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>Cấu hình broker và client</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Cấu hình</th>
                  <th>Phía</th>
                  <th>Mặc định</th>
                  <th>Tác dụng</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">prefetch_count</td>
                  <td>Consumer</td>
                  <td className="v">0 (không giới hạn)</td>
                  <td>Nên đặt, thường 10–300 tùy thời gian xử lý.</td>
                </tr>
                <tr>
                  <td className="m">consumer_timeout</td>
                  <td>Broker</td>
                  <td className="v">1800000</td>
                  <td>Thời gian tối đa giữ message chưa ack (30 phút).</td>
                </tr>
                <tr>
                  <td className="m">vm_memory_high_watermark</td>
                  <td>Broker</td>
                  <td className="v">0.6</td>
                  <td>Ngưỡng RAM kích hoạt memory alarm.</td>
                </tr>
                <tr>
                  <td className="m">disk_free_limit</td>
                  <td>Broker</td>
                  <td className="v">50MB</td>
                  <td>Ngưỡng ổ trống kích hoạt disk alarm. Production nên đặt cao hơn.</td>
                </tr>
                <tr>
                  <td className="m">heartbeat</td>
                  <td>Client/Broker</td>
                  <td className="v">60 giây</td>
                  <td>Phát hiện connection chết.</td>
                </tr>
                <tr>
                  <td className="m">default_queue_type</td>
                  <td>vhost</td>
                  <td className="v">classic</td>
                  <td>Loại queue khi không chỉ định x-queue-type.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>Cổng mặc định</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Cổng</th>
                  <th>Dùng cho</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">5672 / 5671</td>
                  <td>AMQP 0-9-1 và AMQP 1.0 (5671 có TLS)</td>
                </tr>
                <tr>
                  <td className="m">15672</td>
                  <td>Management UI và HTTP API</td>
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
                  <td>Giao tiếp giữa các node · epmd</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
