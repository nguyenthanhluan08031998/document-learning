export default function NatsPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục NATS">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#nats-arch"><span>01</span>Kiến trúc tổng thể</a></li>
          <li><a href="#nats-flow"><span>02</span>Luồng gửi nhận</a></li>
          <li><a href="#nats-subject"><span>03</span>{"Subject & Queue group"}</a></li>
          <li><a href="#nats-js"><span>04</span>JetStream: Stream</a></li>
          <li><a href="#nats-consumer"><span>05</span>JetStream: Consumer</a></li>
          <li><a href="#nats-kv"><span>06</span>{"KV & Object Store"}</a></li>
          <li><a href="#nats-cluster"><span>07</span>{"Cluster & Topology"}</a></li>
          <li><a href="#nats-config"><span>08</span>Bảng tra nhanh</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">nats · ghi chú học tập</div>
          <h1>Sổ tay NATS: từ Subject đến JetStream</h1>
          <p className="lede">NATS có hai tầng. <b>Core NATS</b> chỉ chuyển message theo subject, không lưu gì, rất nhanh. <b>JetStream</b> là tầng lưu trữ bật thêm trên cùng server, cho phép ack, đọc lại và lưu lâu. Nội dung theo NATS Server 2.12–2.14.</p>
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
          <h2><span className="n">01</span>Kiến trúc tổng thể</h2>
          <p className="sub">Không có exchange, không có queue khai báo trước. Publisher gửi vào một <b>subject</b>, server chuyển cho mọi subscriber đang nghe subject khớp tại đúng thời điểm đó.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 470" role="img" aria-label="Publisher gửi subject orders.vn.created vào cụm NATS ba server; subject router chuyển tới Sub A, một worker trong queue group billing, và stream ORDERS của JetStream; consumer shipping đọc từ stream"> <defs> <marker id="nar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> <marker id="nar0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker> </defs> <style>{`.nt{font-family:var(--f-body);fill:var(--ink);font-size:13px}
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
.ndl{stroke:var(--muted);stroke-width:1.4;fill:none;stroke-dasharray:5 4}`}</style>  <rect className="nbox" x="16" y="170" width="150" height="120" rx="8" /> <text className="ntb" x="30" y="196">Publisher</text> <text className="ntm" x="30" y="220">PUB</text> <text className="ntm" x="30" y="238">orders.vn.created</text> <text className="ntm" x="30" y="262">payload ≤ 1 MB</text> <path className="nln" d="M166 230 C200 230 200 166 230 166" markerEnd="url(#nar)" />  <rect className="nclu" x="200" y="34" width="490" height="422" rx="12" /> <text className="ntb" x="218" y="58">NATS cluster</text> <rect className="nsrv" x="232" y="72" width="120" height="40" rx="6" /><text className="nt" x="246" y="97">nats-1</text> <rect className="nsrv" x="385" y="72" width="120" height="40" rx="6" /><text className="nt" x="399" y="97">nats-2</text> <rect className="nsrv" x="538" y="72" width="120" height="40" rx="6" /><text className="nt" x="552" y="97">nats-3</text> <path className="nrln" d="M352 92 H385" /><path className="nrln" d="M505 92 H538" /> <path className="nrln" d="M292 72 C292 58 598 58 598 72" /> <text className="ntm" x="460" y="54">route · full mesh</text> <rect className="nrt" x="232" y="134" width="426" height="56" rx="7" /> <text className="ntb" x="246" y="158">Subject router</text> <text className="ntm" x="246" y="178">bảng interest: subject nào có ai đang nghe</text> <rect className="njs" x="224" y="214" width="442" height="194" rx="8" /> <text className="njst" x="236" y="232">JetStream (bật thêm, tùy chọn)</text> <rect className="nst" x="240" y="244" width="190" height="72" rx="7" /> <text className="ntb" x="254" y="268">Stream ORDERS</text> <text className="ntm" x="254" y="288">{"subjects: orders.>"}</text> <text className="ntm" x="254" y="304">file · replicas 3</text> <rect className="nbox" x="466" y="244" width="184" height="72" rx="7" /> <text className="ntb" x="480" y="268">Consumer shipping</text> <text className="ntm" x="480" y="288">durable · pull</text> <text className="ntm" x="480" y="304">ack_policy explicit</text> <path className="nln" d="M430 280 H464" markerEnd="url(#nar)" /> <rect className="nbox" x="240" y="332" width="410" height="60" rx="7" /> <text className="ntb" x="254" y="356">KV store · Object store</text> <text className="ntm" x="254" y="376">cũng là stream, chỉ khác cách dùng</text> <path className="nln" d="M300 190 V242" markerEnd="url(#nar)" /> <text className="ntm" x="308" y="208">capture</text> <text className="ntm" x="218" y="440">core: không lưu, at-most-once · jetstream: lưu, ack, đọc lại</text>  <rect className="nbox" x="726" y="60" width="160" height="380" rx="8" /> <text className="ntb" x="740" y="84">Subscribers</text> <rect className="nbox" x="738" y="96" width="136" height="50" rx="6" /> <text className="nt" x="750" y="117">Sub A</text><text className="ntm" x="750" y="135">{"SUB orders.>"}</text> <rect className="nqg" x="734" y="162" width="144" height="152" rx="6" /> <text className="nqgt" x="744" y="180">queue group: billing</text> <rect className="nbox" x="744" y="190" width="124" height="48" rx="6" /> <text className="nt" x="756" y="210">Worker 1</text><text className="ntm" x="756" y="228">nhận lần này</text> <rect className="nbox" x="744" y="252" width="124" height="48" rx="6" /> <text className="nt" x="756" y="272">Worker 2</text><text className="ntm" x="756" y="290">chờ message sau</text> <rect className="nbox" x="738" y="350" width="136" height="56" rx="6" /> <text className="nt" x="750" y="372">Shipping svc</text><text className="ntm" x="750" y="392">fetch · ack</text> <path className="nln" d="M658 150 C700 150 700 121 736 121" markerEnd="url(#nar)" /> <path className="nln" d="M658 166 C700 166 700 214 742 214" markerEnd="url(#nar)" /> <path className="ndl" d="M658 176 C690 176 700 276 742 276" markerEnd="url(#nar0)" /> <path className="nln" d="M650 300 C700 300 700 378 736 378" markerEnd="url(#nar)" /> </svg>
            </div>
            <figcaption>Một message tới <code>orders.vn.created</code> được giao cho Sub A, cho <b>một</b> worker trong queue group <code>billing</code>, và được stream <code>ORDERS</code> giữ lại. Sub A và worker chỉ nhận được nếu đang kết nối lúc đó; còn Shipping svc đọc từ stream nên có thể nhận sau.</figcaption>
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
                  <td><b>Server</b></td>
                  <td>Một tiến trình <code>nats-server</code>, viết bằng Go, một file chạy duy nhất, rất nhẹ.</td>
                </tr>
                <tr>
                  <td><b>Subject</b></td>
                  <td>Địa chỉ của message, các token ngăn bằng dấu chấm: <code>orders.vn.created</code>. Không cần khai báo trước.</td>
                </tr>
                <tr>
                  <td><b>Subscription</b></td>
                  <td>Đăng ký nghe một subject, có thể dùng wildcard.</td>
                </tr>
                <tr>
                  <td><b>Queue group</b></td>
                  <td>Nhóm subscriber chia việc: mỗi message chỉ tới một thành viên.</td>
                </tr>
                <tr>
                  <td><b>Stream</b> (JetStream)</td>
                  <td>Nơi lưu message của một hoặc nhiều subject, có sequence number tăng dần.</td>
                </tr>
                <tr>
                  <td><b>Consumer</b> (JetStream)</td>
                  <td>Một “con trỏ” đọc stream, nhớ vị trí và theo dõi ack.</td>
                </tr>
                <tr>
                  <td><b>Account</b></td>
                  <td>Không gian tách biệt giữa các tenant, mỗi account có subject riêng.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="nats-flow">
          <h2><span className="n">02</span>Luồng gửi nhận: Core và JetStream</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 360" role="img" aria-label="Core NATS: publish, server nhận, tìm subscriber khớp, giao, không ai nghe thì mất. JetStream: publish kèm Msg-Id, stream leader kiểm tra trùng, sao chép Raft, lưu xong trả PubAck, consumer fetch và ack"> <defs> <marker id="nar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> <marker id="nar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker> </defs> <style>{`.gtb{font-family:var(--f-body);fill:var(--ink);font-size:13.5px;font-weight:700}
.gtm{font-family:var(--f-mono);fill:var(--muted);font-size:11px}
.glane{font-family:var(--f-mono);font-size:11px;font-weight:600;letter-spacing:.08em;fill:var(--accent)}
.gbox{fill:var(--surface);stroke:var(--line);stroke-width:1.5}
.ghl{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.5}
.gbad{fill:var(--bad-soft);stroke:var(--bad);stroke-width:1.3;stroke-dasharray:4 3}
.gbg{fill:var(--bg);stroke:var(--line);stroke-width:1}
.gln{stroke:var(--accent);stroke-width:1.8;fill:none}
.gdl{stroke:var(--muted);stroke-width:1.5;fill:none;stroke-dasharray:5 4}`}</style> <rect className="gbg" x="8" y="12" width="884" height="138" rx="10" /> <text className="glane" x="20" y="32">CORE NATS · AT-MOST-ONCE</text> <rect className="gbox" x="20" y="48" width="150" height="70" rx="7" /><text className="gtb" x="32" y="74">PUB</text><text className="gtm" x="32" y="94">subject + payload</text> <rect className="gbox" x="195" y="48" width="150" height="70" rx="7" /><text className="gtb" x="207" y="74">Server nhận</text><text className="gtm" x="207" y="94">cổng 4222</text> <rect className="gbox" x="370" y="48" width="150" height="70" rx="7" /><text className="gtb" x="382" y="74">So khớp subject</text><text className="gtm" x="382" y="94">bảng interest</text> <rect className="ghl" x="545" y="48" width="150" height="70" rx="7" /><text className="gtb" x="557" y="74">Giao ngay</text><text className="gtm" x="557" y="94">1 / queue group</text> <rect className="gbad" x="720" y="48" width="150" height="70" rx="7" /><text className="gtb" x="732" y="74">Không ai nghe</text><text className="gtm" x="732" y="94">message mất</text> <path className="gln" d="M170 83 H193" markerEnd="url(#nar2)" /> <path className="gln" d="M345 83 H368" markerEnd="url(#nar2)" /> <path className="gln" d="M520 83 H543" markerEnd="url(#nar2)" /> <path className="gdl" d="M695 83 H718" markerEnd="url(#nar3)" /> <text className="gtm" x="20" y="138">không lưu · không ack · không retry · nhanh nhất</text> <rect className="gbg" x="8" y="166" width="884" height="186" rx="10" /> <text className="glane" x="20" y="186">JETSTREAM · AT-LEAST-ONCE / EXACTLY-ONCE</text> <rect className="gbox" x="20" y="202" width="150" height="70" rx="7" /><text className="gtb" x="32" y="228">js.publish</text><text className="gtm" x="32" y="248">kèm Nats-Msg-Id</text> <rect className="gbox" x="195" y="202" width="150" height="70" rx="7" /><text className="gtb" x="207" y="228">Stream leader</text><text className="gtm" x="207" y="248">lọc trùng Msg-Id</text> <rect className="gbox" x="370" y="202" width="150" height="70" rx="7" /><text className="gtb" x="382" y="228">Raft replicas</text><text className="gtm" x="382" y="248">đa số ghi xong</text> <rect className="ghl" x="545" y="202" width="150" height="70" rx="7" /><text className="gtb" x="557" y="228">Đã lưu</text><text className="gtm" x="557" y="248">seq = 1042</text> <rect className="gbox" x="720" y="202" width="150" height="70" rx="7" /><text className="gtb" x="732" y="228">Consumer</text><text className="gtm" x="732" y="248">fetch · ack</text> <path className="gln" d="M170 237 H193" markerEnd="url(#nar2)" /> <path className="gln" d="M345 237 H368" markerEnd="url(#nar2)" /> <path className="gln" d="M520 237 H543" markerEnd="url(#nar2)" /> <path className="gln" d="M695 237 H718" markerEnd="url(#nar2)" /> <path className="gdl" d="M620 274 V310 H95 V276" markerEnd="url(#nar3)" /> <text className="gtm" x="220" y="330">{"PubAck {stream: ORDERS, seq: 1042} → publisher biết đã an toàn"}</text> </svg>
            </div>
            <figcaption>Cùng một lệnh publish, nhưng chỉ khi subject thuộc một stream thì message mới được lưu và có PubAck. Không bật JetStream thì NATS chỉ là “đường ống” chuyển tức thời.</figcaption>
          </figure>
          <h3>Core NATS</h3>
          <ol className="steps">
            <li>
              <div><b>Kết nối</b><div className="d">Client mở TCP tới cổng 4222. Giao thức dạng text đơn giản: <code>CONNECT</code>, <code>PUB</code>, <code>SUB</code>, <code>MSG</code>, <code>PING/PONG</code>.</div></div>
            </li>
            <li>
              <div><b>Publish</b><div className="d">Gửi subject + payload (tùy chọn headers). Mặc định payload tối đa 1 MB (<code>max_payload</code>).</div></div>
            </li>
            <li>
              <div><b>Server so khớp</b><div className="d">Tìm mọi subscription khớp subject, kể cả wildcard. Với queue group, chọn ngẫu nhiên một thành viên.</div></div>
            </li>
            <li>
              <div><b>Giao ngay</b><div className="d">Đẩy tới subscriber đang kết nối. Subscriber offline hoặc không có ai nghe thì message mất. Đây là <b>at-most-once</b>.</div></div>
            </li>
          </ol>
          <div className="note tip"><b>Request–reply có sẵn:</b> client gửi kèm một subject trả lời tạm (<code>_INBOX.xyz</code>), service xử lý rồi publish kết quả vào subject đó. Không cần reply queue như RabbitMQ. Nhiều service cùng queue group sẽ tự cân tải cho request.</div>
          <h3>JetStream</h3>
          <ol className="steps">
            <li>
              <div><b>js.publish kèm Nats-Msg-Id</b><div className="d">Header này giúp server nhận ra message gửi trùng khi client retry.</div></div>
            </li>
            <li>
              <div><b>Stream leader nhận</b><div className="d">Kiểm tra trùng trong <code>duplicate_window</code> (mặc định 2 phút), kiểm tra giới hạn của stream.</div></div>
            </li>
            <li>
              <div><b>Sao chép Raft</b><div className="d">Leader gửi sang replica. Đa số đã ghi thì message được coi là đã lưu.</div></div>
            </li>
            <li>
              <div><b>Trả PubAck</b><div className="d">Kèm tên stream và <b>sequence number</b>, tương tự offset của Kafka nhưng đánh số cho cả stream.</div></div>
            </li>
            <li>
              <div><b>Consumer đọc và ack</b><div className="d">Không ack trong <code>ack_wait</code> thì message được giao lại. Xem mục 05.</div></div>
            </li>
          </ol>
        </section>
        <section id="nats-subject">
          <h2><span className="n">03</span>{"Subject, Wildcard & Queue group"}</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 290" role="img" aria-label="Wildcard sao khớp đúng một token, wildcard lớn hơn khớp một hoặc nhiều token ở cuối, queue group chỉ giao cho một thành viên"> <style>{`.wt{font-family:var(--f-body);fill:var(--ink);font-size:14px;font-weight:700}
.wm{font-family:var(--f-mono);fill:var(--muted);font-size:10.5px}
.wk{font-family:var(--f-mono);fill:var(--warn);font-size:9.5px}
.wpanel{fill:var(--bg);stroke:var(--line);stroke-width:1}
.wsrv{fill:var(--warn-soft);stroke:var(--warn);stroke-width:1.4}
.wq{fill:var(--surface);stroke:var(--line);stroke-width:1.3}
.wqh{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.6}
.won{stroke:var(--accent);stroke-width:2;fill:none}
.woff{stroke:var(--muted);stroke-width:1.2;fill:none;stroke-dasharray:4 4;opacity:.6}
.wmsg{fill:var(--surface);stroke:var(--accent);stroke-width:1}
.wgrp{fill:none;stroke:var(--new);stroke-width:1.2;stroke-dasharray:4 3}`}</style> <rect className="wpanel" x="10" y="8" width="288" height="274" rx="10" /> <text className="wt" x="24" y="32">* · đúng 1 token</text> <rect className="wmsg" x="54" y="44" width="200" height="22" rx="11" /> <text className="wm" x="154" y="59" textAnchor="middle">pub: orders.vn.created</text> <rect className="wsrv" x="99" y="84" width="110" height="36" rx="6" /> <text className="wm" x="154" y="106" textAnchor="middle" style={{ fill: "var(--ink)", fontWeight: "600" }}>nats server</text> <path className="won" d="M154 120 L61 194" /> <rect className="wqh" x="16" y="196" width="90" height="44" rx="6" /> <text className="wm" x="61" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>S1</text> <text className="wk" x="61" y="231" textAnchor="middle">orders.*.created</text> <path className="woff" d="M154 120 L154 194" /> <rect className="wq" x="109" y="196" width="90" height="44" rx="6" /> <text className="wm" x="154" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>S2</text> <text className="wk" x="154" y="231" textAnchor="middle">orders.*</text> <path className="won" d="M154 120 L247 194" /> <rect className="wqh" x="202" y="196" width="90" height="44" rx="6" /> <text className="wm" x="247" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>S3</text> <text className="wk" x="247" y="231" textAnchor="middle">*.vn.*</text> <text className="wm" x="154" y="266" textAnchor="middle">orders.* cần đúng 2 token</text> <rect className="wpanel" x="306" y="8" width="288" height="274" rx="10" /> <text className="wt" x="320" y="32">{"> · 1+ token ở cuối"}</text> <rect className="wmsg" x="350" y="44" width="200" height="22" rx="11" /> <text className="wm" x="450" y="59" textAnchor="middle">pub: orders.vn.created</text> <rect className="wsrv" x="395" y="84" width="110" height="36" rx="6" /> <text className="wm" x="450" y="106" textAnchor="middle" style={{ fill: "var(--ink)", fontWeight: "600" }}>nats server</text> <path className="won" d="M450 120 L357 194" /> <rect className="wqh" x="312" y="196" width="90" height="44" rx="6" /> <text className="wm" x="357" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>S1</text> <text className="wk" x="357" y="231" textAnchor="middle">{"orders.>"}</text> <path className="won" d="M450 120 L450 194" /> <rect className="wqh" x="405" y="196" width="90" height="44" rx="6" /> <text className="wm" x="450" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>S2</text> <text className="wk" x="450" y="231" textAnchor="middle">{">"}</text> <path className="woff" d="M450 120 L543 194" /> <rect className="wq" x="498" y="196" width="90" height="44" rx="6" /> <text className="wm" x="543" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>S3</text> <text className="wk" x="543" y="231" textAnchor="middle">{"vn.>"}</text> <text className="wm" x="450" y="266" textAnchor="middle">{"> khớp mọi subject"}</text> <rect className="wpanel" x="602" y="8" width="288" height="274" rx="10" /> <text className="wt" x="616" y="32">queue group</text> <rect className="wmsg" x="646" y="44" width="200" height="22" rx="11" /> <text className="wm" x="746" y="59" textAnchor="middle">pub: orders.vn.created</text> <rect className="wsrv" x="691" y="84" width="110" height="36" rx="6" /> <text className="wm" x="746" y="106" textAnchor="middle" style={{ fill: "var(--ink)", fontWeight: "600" }}>nats server</text> <rect className="wgrp" x="604" y="182" width="190" height="66" rx="6" /> <text className="wm" x="612" y="177" style={{ fill: "var(--new)" }}>queue group billing</text> <path className="won" d="M746 120 L653 194" /> <rect className="wqh" x="608" y="196" width="90" height="44" rx="6" /> <text className="wm" x="653" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>W1</text> <text className="wk" x="653" y="231" textAnchor="middle">billing</text> <path className="woff" d="M746 120 L746 194" /> <rect className="wq" x="701" y="196" width="90" height="44" rx="6" /> <text className="wm" x="746" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>W2</text> <text className="wk" x="746" y="231" textAnchor="middle">billing</text> <path className="won" d="M746 120 L839 194" /> <rect className="wqh" x="794" y="196" width="90" height="44" rx="6" /> <text className="wm" x="839" y="214" textAnchor="middle" style={{ fill: "var(--ink)" }}>Sub A</text> <text className="wk" x="839" y="231" textAnchor="middle">{"orders.>"}</text> <text className="wm" x="746" y="266" textAnchor="middle">cùng group: chỉ 1 nhận</text> </svg>
            </div>
            <figcaption>Ô xanh là subscriber nhận được message. Chữ cam trong ô là subject mà subscriber đang nghe.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Ký hiệu</th>
                  <th>Ý nghĩa</th>
                  <th>Ví dụ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">*</td>
                  <td>Đúng một token, ở bất kỳ vị trí nào</td>
                  <td><code>orders.*.created</code> khớp <code>orders.vn.created</code></td>
                </tr>
                <tr>
                  <td className="m">{">"}</td>
                  <td>Một hoặc nhiều token, chỉ đặt ở cuối</td>
                  <td><code>{"orders.>"}</code> khớp <code>orders.vn</code> và <code>orders.vn.created</code>, không khớp <code>orders</code></td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="plain">
            <li>Khác RabbitMQ: <code>#</code> của RabbitMQ khớp <b>0 hoặc nhiều</b> từ, còn <code>{">"}</code> của NATS cần <b>ít nhất 1</b> token.</li>
            <li>Đặt tên subject theo cấp từ chung đến riêng: <code>{"<domain>.<vùng>.<sự kiện>"}</code>, để wildcard lọc được.</li>
            <li><b>Queue group</b>: các subscriber cùng tên group chỉ nhận một bản cho mỗi message. Subscriber không thuộc group vẫn nhận bản riêng. Không cần khai báo gì trên server.</li>
          </ul>
        </section>
        <section id="nats-js">
          <h2><span className="n">04</span>JetStream: Stream</h2>
          <p>Stream “bắt” mọi message có subject khớp danh sách <code>subjects</code> của nó và lưu lại theo thứ tự, đánh <b>sequence number</b> tăng dần. Publisher vẫn chỉ publish vào subject bình thường.</p>
          <h3>Retention policy: khi nào message bị xóa</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Policy</th>
                  <th>Xóa khi</th>
                  <th>Giống với</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>limits</b> (mặc định)</td>
                  <td>Vượt <code>max_age</code>, <code>max_msgs</code>, <code>max_bytes</code> hoặc <code>max_msgs_per_subject</code></td>
                  <td>Kafka retention</td>
                </tr>
                <tr>
                  <td><b>interest</b></td>
                  <td>Mọi consumer đang tồn tại đều đã ack</td>
                  <td>Fanout của RabbitMQ</td>
                </tr>
                <tr>
                  <td><b>workqueue</b></td>
                  <td>Một consumer bất kỳ đã ack; mỗi subject chỉ một consumer</td>
                  <td>Hàng đợi công việc RabbitMQ</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="plain">
            <li><code>discard</code>: khi chạm giới hạn, <code>old</code> (mặc định) xóa message cũ nhất, <code>new</code> từ chối message mới.</li>
            <li><code>storage</code>: <code>file</code> (mặc định) hoặc <code>memory</code>.</li>
            <li><code>num_replicas</code>: 1 đến 5, dùng Raft. Nên dùng 3 (chịu được 1 server chết) hoặc 5.</li>
            <li><code>max_msgs_per_subject=1</code> giữ đúng bản mới nhất cho mỗi subject, giống log compaction của Kafka. KV store dựa trên tính năng này.</li>
            <li><b>Mirror / Source</b>: stream có thể sao chép từ stream khác, kể cả ở cluster khác, dùng cho DR hoặc gom dữ liệu.</li>
          </ul>
        </section>
        <section id="nats-consumer">
          <h2><span className="n">05</span>JetStream: Consumer</h2>
          <div className="cmp">
            <div><h4>Pull consumer (khuyên dùng)</h4>Client chủ động <code>fetch</code> một lô message. Dễ cân tải: nhiều instance cùng fetch từ một consumer, ai rảnh thì lấy. Giống Kafka.</div>
            <div><h4>Push consumer</h4>Server đẩy message tới một subject giao nhận. Đơn giản nhưng khó kiểm soát tốc độ; dùng khi cần độ trễ thấp và ít consumer.</div>
          </div>
          <ul className="plain">
            <li><b>Durable</b> (có tên) nhớ vị trí kể cả khi client ngắt kết nối. <b>Ephemeral</b> tự xóa khi không còn dùng.</li>
            <li><code>deliver_policy</code>: bắt đầu từ đâu, gồm <code>all</code>, <code>last</code>, <code>new</code>, <code>by_start_sequence</code>, <code>by_start_time</code>, <code>last_per_subject</code>.</li>
            <li><code>filter_subject</code>: một consumer chỉ đọc một phần stream, ví dụ <code>{"orders.vn.>"}</code>.</li>
          </ul>
          <h3>Các kiểu ack</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Lệnh</th>
                  <th>Ý nghĩa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">Ack</td>
                  <td>Xử lý xong.</td>
                </tr>
                <tr>
                  <td className="m">Nak</td>
                  <td>Chưa xử lý được, giao lại (có thể kèm thời gian chờ).</td>
                </tr>
                <tr>
                  <td className="m">InProgress</td>
                  <td>Đang xử lý, gia hạn thêm <code>ack_wait</code> để không bị giao lại.</td>
                </tr>
                <tr>
                  <td className="m">Term</td>
                  <td>Bỏ hẳn, không giao lại nữa (message lỗi).</td>
                </tr>
                <tr>
                  <td className="m">AckSync</td>
                  <td>Ack và chờ server xác nhận đã nhận ack, dùng cho exactly-once.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="plain">
            <li>Không ack trong <code>ack_wait</code> (mặc định 30 giây) thì message được giao lại, tối đa <code>max_deliver</code> lần.</li>
            <li><code>max_ack_pending</code> (mặc định 1000): số message đã giao mà chưa ack, tương tự prefetch của RabbitMQ.</li>
          </ul>
          <div className="note"><b>Exactly-once trong JetStream:</b> phía gửi dùng <code>Nats-Msg-Id</code> để server lọc trùng; phía nhận dùng <code>AckSync</code> (double ack) để chắc server đã ghi nhận ack. Ngoài khung thời gian lọc trùng thì vẫn cần consumer idempotent.</div>
        </section>
        <section id="nats-kv">
          <h2><span className="n">06</span>{"KV Store & Object Store"}</h2>
          <div className="cmp">
            <div><h4>Key-Value store</h4>Bucket chứa cặp key–value, có <code>put</code>, <code>get</code>, <code>delete</code>, lịch sử theo revision, TTL, và <b>watch</b> để nhận thay đổi theo thời gian thực. Dùng cho cấu hình, feature flag, trạng thái phân tán, khóa đơn giản.</div>
            <div><h4>Object store</h4>Lưu file lớn bằng cách chia thành nhiều chunk trong một stream. Dùng để phân phối file, model, bản cập nhật tới các node, nhất là ở edge.</div>
          </div>
          <p>Cả hai thực chất là stream với cấu hình đặc biệt, nên tự có replication và mirror. Một server NATS có thể thay vai trò của một broker cộng một KV store nhỏ như etcd hay Redis cho nhu cầu đơn giản.</p>
        </section>
        <section id="nats-cluster">
          <h2><span className="n">07</span>{"Cluster & Topology"}</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Thành phần</th>
                  <th>Cổng</th>
                  <th>Vai trò</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Cluster</b></td>
                  <td className="m">6222</td>
                  <td>Các server nối với nhau dạng full mesh qua route. Client kết nối server nào cũng được, message tự chuyển tới đúng nơi.</td>
                </tr>
                <tr>
                  <td><b>Super-cluster</b></td>
                  <td className="m">7222</td>
                  <td>Nhiều cluster (nhiều vùng, nhiều cloud) nối qua gateway. Chỉ chuyển message khi phía kia có người nghe.</td>
                </tr>
                <tr>
                  <td><b>Leaf node</b></td>
                  <td className="m">7422</td>
                  <td>Server nhỏ ở edge (cửa hàng, nhà máy, thiết bị) nối về cụm trung tâm, vẫn chạy được khi mất mạng.</td>
                </tr>
                <tr>
                  <td><b>Monitoring</b></td>
                  <td className="m">8222</td>
                  <td>HTTP endpoint <code>/varz</code>, <code>/connz</code>, <code>/jsz</code> để theo dõi.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="plain">
            <li>Core NATS không cần đồng thuận: server chết thì client tự kết nối sang server khác trong danh sách.</li>
            <li>JetStream dùng Raft ở hai tầng: một <b>meta group</b> quản lý danh sách stream/consumer, và mỗi stream có Raft group riêng với leader và replica.</li>
            <li>Bảo mật và đa tenant qua <b>account</b>, xác thực bằng NKEY/JWT, có thể export/import subject giữa các account.</li>
          </ul>
          <h3>Một số tính năng mới</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Phiên bản</th>
                  <th>Điểm đáng chú ý</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">2.12 (09/2025)</td>
                  <td>Atomic batch publish (ghi N message như một khối), counter phân tán, lên lịch gửi message trễ, pull consumer ưu tiên, mirror có thể nâng lên làm stream chính.</td>
                </tr>
                <tr>
                  <td className="m">2.14 (04/2026)</td>
                  <td>Hỗ trợ publish thông lượng cao vào JetStream, mở rộng message scheduling, sửa lỗi sourcing/mirroring cho stream interest và workqueue.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="nats-config">
          <h2><span className="n">08</span>Bảng tra nhanh</h2>
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
                  <td className="m">max_payload</td>
                  <td>Server</td>
                  <td className="v">1MB</td>
                  <td>Kích thước message tối đa.</td>
                </tr>
                <tr>
                  <td className="m">retention</td>
                  <td>Stream</td>
                  <td className="v">limits</td>
                  <td>limits, interest hoặc workqueue.</td>
                </tr>
                <tr>
                  <td className="m">storage</td>
                  <td>Stream</td>
                  <td className="v">file</td>
                  <td>file hoặc memory.</td>
                </tr>
                <tr>
                  <td className="m">num_replicas</td>
                  <td>Stream</td>
                  <td className="v">1</td>
                  <td>Số bản sao, tối đa 5. Production nên 3.</td>
                </tr>
                <tr>
                  <td className="m">discard</td>
                  <td>Stream</td>
                  <td className="v">old</td>
                  <td>Xóa cũ hay từ chối mới khi đầy.</td>
                </tr>
                <tr>
                  <td className="m">max_age</td>
                  <td>Stream</td>
                  <td className="v">0 (không giới hạn)</td>
                  <td>Thời gian giữ message.</td>
                </tr>
                <tr>
                  <td className="m">duplicate_window</td>
                  <td>Stream</td>
                  <td className="v">2m</td>
                  <td>Khoảng thời gian lọc trùng theo Nats-Msg-Id.</td>
                </tr>
                <tr>
                  <td className="m">ack_policy</td>
                  <td>Consumer</td>
                  <td className="v">explicit</td>
                  <td>explicit, all hoặc none.</td>
                </tr>
                <tr>
                  <td className="m">ack_wait</td>
                  <td>Consumer</td>
                  <td className="v">30s</td>
                  <td>Hết thời gian chưa ack thì giao lại.</td>
                </tr>
                <tr>
                  <td className="m">max_deliver</td>
                  <td>Consumer</td>
                  <td className="v">-1 (không giới hạn)</td>
                  <td>Số lần giao tối đa.</td>
                </tr>
                <tr>
                  <td className="m">max_ack_pending</td>
                  <td>Consumer</td>
                  <td className="v">1000</td>
                  <td>Số message chưa ack tối đa.</td>
                </tr>
                <tr>
                  <td className="m">deliver_policy</td>
                  <td>Consumer</td>
                  <td className="v">all</td>
                  <td>Bắt đầu đọc từ đâu.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>Lệnh CLI hay dùng</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Lệnh</th>
                  <th>Tác dụng</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">{"nats sub \"orders.>\""}</td>
                  <td>Nghe thử một subject.</td>
                </tr>
                <tr>
                  <td className="m">{"nats pub orders.vn.created '{\"id\":1}'"}</td>
                  <td>Gửi thử một message.</td>
                </tr>
                <tr>
                  <td className="m">{"nats stream add ORDERS --subjects \"orders.>\""}</td>
                  <td>Tạo stream.</td>
                </tr>
                <tr>
                  <td className="m">nats consumer add ORDERS shipping --pull</td>
                  <td>Tạo pull consumer.</td>
                </tr>
                <tr>
                  <td className="m">nats kv add config</td>
                  <td>Tạo KV bucket.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
