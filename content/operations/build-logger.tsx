export default function BuildLoggerPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục logger">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#lb-basic"><span>01</span>Logger cơ bản</a></li>
          <li><a href="#lb-ids"><span>02</span>Gắn traceId, spanId, correlationId</a></li>
          <li><a href="#lb-propagate"><span>03</span>Truyền sang service khác</a></li>
          <li><a href="#lb-compare"><span>04</span>So sánh các ID</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">vận hành · logger</div>
          <h1>Logger trong một service và qua nhiều service</h1>
          <p className="lede">Ba sơ đồ: log trong một service, gắn ID theo request, rồi nối log giữa các service.</p>
        </header>

        <section id="lb-basic">
          <h2><span className="n">01</span>Logger cơ bản</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 240" role="img" aria-label="Code nghiệp vụ gọi log.info kèm dữ liệu request; Logger lọc level, gộp field, che bí mật; Transport ghi một dòng JSON gồm level, service, msg và dữ liệu request"> <defs><marker id="lba" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs> <rect className="s-box" x="16" y="70" width="190" height="80" rx="7" /><text className="s-tb" x="28" y="96">Code nghiệp vụ</text><text className="s-tm" x="28" y="116">log.info("placing order",</text><text className="s-tm" x="28" y="134">{"{ userId, amount, password })"}</text> <path className="s-ln" d="M206 110 H238" markerEnd="url(#lba)" /> <rect className="s-hl" x="240" y="62" width="190" height="96" rx="8" /><text className="s-tb" x="254" y="86">Logger</text><text className="s-tm" x="254" y="108" style={{ fill: "var(--ink)" }}>lọc theo level</text><text className="s-tm" x="254" y="126" style={{ fill: "var(--ink)" }}>gộp field (service, …)</text><text className="s-tm" x="254" y="144" style={{ fill: "var(--ink)" }}>che bí mật (password)</text> <path className="s-ln" d="M430 110 H462" markerEnd="url(#lba)" /> <rect className="s-disk" x="464" y="78" width="140" height="64" rx="7" /><text className="s-tb" x="476" y="104">Transport</text><text className="s-tm" x="476" y="124">JSON ra stdout</text> <path className="s-ln" d="M604 110 H636" markerEnd="url(#lba)" /> <rect className="s-box" x="638" y="20" width="246" height="180" rx="7" /><text className="s-tb" x="650" y="44">Dòng log</text><text className="s-tm" x="650" y="66">{"{\"level\":\"info\","}</text><text className="s-tm" x="650" y="84">{" \"service\":\"order-svc\","}</text><text className="s-tm" x="650" y="102">{" \"msg\":\"placing order\","}</text><text className="s-tm" x="650" y="120" style={{ fill: "var(--ink)" }}>{" \"userId\":\"u-12\","}</text><text className="s-tm" x="650" y="138" style={{ fill: "var(--ink)" }}>{" \"amount\":100000,"}</text><text className="s-tm" x="650" y="156" style={{ fill: "var(--ink)" }}>{" \"password\":\"[REDACTED]\"}"}</text><text className="s-tm" x="650" y="186">dữ liệu request là field thứ 2</text> <text className="s-tm" x="16" y="226">Có dữ liệu request nhưng chưa biết dòng này thuộc request nào khi nhiều request chạy cùng lúc.</text> </svg>
            </div>
          </figure>
        </section>

        <section id="lb-ids">
          <h2><span className="n">02</span>Gắn traceId, spanId, correlationId</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 290" role="img" aria-label="Request POST /orders vào kèm header traceparent và x-correlation-id; middleware đọc hoặc sinh ID và đưa method, path vào child logger; dòng log có ba ID cùng method, path, userId, amount"> <defs><marker id="lbb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs> <rect className="s-box" x="16" y="70" width="176" height="112" rx="7" /><text className="s-tb" x="28" y="94">Request vào</text><text className="s-tm" x="28" y="114">POST /orders</text><text className="s-tm" x="28" y="132">{"body { userId, amount }"}</text><text className="s-tm" x="28" y="150">header traceparent</text><text className="s-tm" x="28" y="168">x-correlation-id</text> <path className="s-ln" d="M192 126 H222" markerEnd="url(#lbb)" /> <rect className="s-hl" x="224" y="58" width="226" height="136" rx="8" /><text className="s-tb" x="238" y="82">Middleware</text><text className="s-tm" x="238" y="104" style={{ fill: "var(--ink)" }}>traceId: lấy từ header hoặc sinh</text><text className="s-tm" x="238" y="122" style={{ fill: "var(--ink)" }}>spanId: luôn sinh mới</text><text className="s-tm" x="238" y="140" style={{ fill: "var(--ink)" }}>correlationId: mã nghiệp vụ</text><text className="s-tm" x="238" y="158" style={{ fill: "var(--ink)" }}>+ method, path</text><text className="s-tm" x="238" y="180" style={{ fill: "var(--ink)" }}>→ child logger cho request</text> <path className="s-ln" d="M450 126 H478" markerEnd="url(#lbb)" /> <rect className="s-disk" x="480" y="88" width="148" height="76" rx="7" /><text className="s-tb" x="492" y="114">log.info(msg,</text><text className="s-tm" x="492" y="134">{"{ userId, amount })"}</text><text className="s-tm" x="492" y="152">không truyền ID tay</text> <path className="s-ln" d="M628 126 H656" markerEnd="url(#lbb)" /> <rect className="s-box" x="658" y="14" width="226" height="230" rx="7" /><text className="s-tb" x="670" y="38">Dòng log</text><text className="s-tm" x="670" y="60">"level":"info",</text><text className="s-tm" x="670" y="78">"service":"order-svc",</text><text className="s-tm" x="670" y="96" style={{ fill: "var(--accent)" }}>"traceId":"traceId_1",</text><text className="s-tm" x="670" y="114" style={{ fill: "var(--accent)" }}>"spanId":"spanId_2",</text><text className="s-tm" x="670" y="132" style={{ fill: "var(--accent)" }}>"correlationId":"ord-42",</text><text className="s-tm" x="670" y="150" style={{ fill: "var(--ink)" }}>"method":"POST",</text><text className="s-tm" x="670" y="168" style={{ fill: "var(--ink)" }}>"path":"/orders",</text><text className="s-tm" x="670" y="186" style={{ fill: "var(--ink)" }}>"userId":"u-12",</text><text className="s-tm" x="670" y="204" style={{ fill: "var(--ink)" }}>"amount":100000,</text><text className="s-tm" x="670" y="222">"msg":"placing order"</text> <text className="s-tm" x="16" y="266">traceId = một request · spanId = một bước trong request · correlationId = một nghiệp vụ (có thể gồm nhiều request, kể cả retry).</text> </svg>
            </div>
          </figure>
        </section>

        <section id="lb-propagate">
          <h2><span className="n">03</span>Truyền sang service khác</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 270" role="img" aria-label="order-svc gọi payment-svc kèm header traceparent chứa traceId và spanId của mình cùng x-correlation-id; payment-svc giữ traceId, sinh spanId mới, lấy spanId cũ làm parentSpanId; tìm traceId trên Kibana ra log của cả hai service"> <defs><marker id="lbc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs> <rect className="s-hl" x="16" y="30" width="230" height="104" rx="8" /><text className="s-tb" x="30" y="54">order-svc</text><text className="s-tm" x="30" y="76" style={{ fill: "var(--ink)" }}>traceId traceId_1</text><text className="s-tm" x="30" y="94" style={{ fill: "var(--ink)" }}>spanId spanId_2</text><text className="s-tm" x="30" y="112" style={{ fill: "var(--ink)" }}>correlationId ord-42</text> <path className="s-ln" d="M246 82 H636" markerEnd="url(#lbc)" /> <text className="s-tm" x="270" y="62" style={{ fill: "var(--ink)" }}>HTTP / message header</text> <text className="s-tm" x="270" y="104">traceparent: 00-traceId_1-spanId_2-01</text> <text className="s-tm" x="270" y="122">x-correlation-id: ord-42</text> <rect className="s-hl" x="638" y="30" width="246" height="104" rx="8" /><text className="s-tb" x="652" y="54">payment-svc</text><text className="s-tm" x="652" y="76" style={{ fill: "var(--ink)" }}>traceId traceId_1 (giữ nguyên)</text><text className="s-tm" x="652" y="94" style={{ fill: "var(--ink)" }}>spanId spanId_3 (mới)</text><text className="s-tm" x="652" y="112" style={{ fill: "var(--ink)" }}>parentSpanId spanId_2</text> <path className="s-dl" d="M131 134 V178" markerEnd="url(#lbc)" /> <path className="s-dl" d="M761 134 V178" markerEnd="url(#lbc)" /> <rect className="s-disk" x="16" y="180" width="868" height="66" rx="7" /><text className="s-tb" x="30" y="204">Kibana: tìm traceId: "traceId_1"</text><text className="s-tm" x="30" y="226">ra log của order-svc và payment-svc trong cùng request, xếp theo thời gian; parentSpanId cho biết bước nào gọi bước nào</text> </svg>
            </div>
          </figure>
        </section>
        <section id="lb-compare">
          <h2><span className="n">04</span>So sánh các ID</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Phạm vi</th>
                  <th>Ai tạo</th>
                  <th>Khi gọi sang service khác</th>
                  <th>Ví dụ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">requestId</td>
                  <td>Một request tại một service</td>
                  <td>Server / gateway khi nhận request</td>
                  <td>Thường sinh mới ở mỗi service</td>
                  <td className="m">requestId_2</td>
                </tr>
                <tr>
                  <td className="m">traceId</td>
                  <td>Một request đi qua mọi service</td>
                  <td>Service đầu tiên</td>
                  <td>Giữ nguyên</td>
                  <td className="m">traceId_1</td>
                </tr>
                <tr>
                  <td className="m">spanId</td>
                  <td>Một bước trong trace</td>
                  <td>Mỗi service / mỗi bước</td>
                  <td>Sinh mới</td>
                  <td className="m">spanId_3</td>
                </tr>
                <tr>
                  <td className="m">parentSpanId</td>
                  <td>Bước đã gọi bước này</td>
                  <td>Lấy spanId của bên gọi</td>
                  <td>= spanId của service trước</td>
                  <td className="m">spanId_2</td>
                </tr>
                <tr>
                  <td className="m">correlationId</td>
                  <td>Một nghiệp vụ, có thể gồm nhiều trace (retry, job, webhook)</td>
                  <td>Nơi bắt đầu nghiệp vụ, thường là mã đơn</td>
                  <td>Giữ nguyên, kể cả qua job hôm sau</td>
                  <td className="m">ord-42</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Từ nhỏ đến lớn: spanId &lt; requestId ≈ một service &lt; traceId = cả request &lt; correlationId = cả nghiệp vụ. Nhiều hệ thống dùng traceId làm requestId luôn.</p>
          <h3>Ví dụ: đơn ord-42</h3>
          <p>Khách đặt đơn: api-gateway gọi order-svc, order-svc gọi payment-svc. Email xác nhận lỗi, hôm sau job retry gửi lại.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>#</th><th>service</th><th>requestId</th><th>traceId</th><th>spanId</th><th>parentSpanId</th><th>correlationId</th><th>msg</th></tr>
              </thead>
              <tbody>
                <tr><td className="m">1</td><td className="m">api-gateway</td><td className="m">requestId_1</td><td className="m">traceId_1</td><td className="m">spanId_1</td><td className="m">–</td><td className="m">ord-42</td><td>POST /orders</td></tr>
                <tr><td className="m">2</td><td className="m">order-svc</td><td className="m">requestId_2</td><td className="m">traceId_1</td><td className="m">spanId_2</td><td className="m">spanId_1</td><td className="m">ord-42</td><td>placing order</td></tr>
                <tr><td className="m">3</td><td className="m">payment-svc</td><td className="m">requestId_3</td><td className="m">traceId_1</td><td className="m">spanId_3</td><td className="m">spanId_2</td><td className="m">ord-42</td><td>charge accepted</td></tr>
                <tr><td className="m">4</td><td className="m">email-retry (hôm sau)</td><td className="m">requestId_4</td><td className="m">traceId_2</td><td className="m">spanId_4</td><td className="m">–</td><td className="m">ord-42</td><td>email sent</td></tr>
              </tbody>
            </table>
          </div>
          <ul>
            <li>Tìm <code>requestId: requestId_2</code> → chỉ dòng 2 (một service).</li>
            <li>Tìm <code>traceId: traceId_1</code> → dòng 1–3 (cả request qua 3 service); parentSpanId cho thấy 1 gọi 2, 2 gọi 3.</li>
            <li>Tìm <code>correlationId: ord-42</code> → cả 4 dòng, gồm cả job retry chạy ở trace khác.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
