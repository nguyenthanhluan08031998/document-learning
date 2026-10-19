import { Code } from "@/components/Code";

export default function MicroservicePage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục Pattern cho microservice">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#ms-db-per-service"><span>01</span>Database per Service</a></li>
          <li><a href="#ms-saga"><span>02</span>Saga</a></li>
          <li><a href="#ms-orch-choreo"><span>03</span>Orchestration vs Choreography</a></li>
          <li><a href="#ms-outbox"><span>04</span>Transactional Outbox</a></li>
          <li><a href="#ms-idempotent-consumer"><span>05</span>Idempotent Consumer</a></li>
          <li><a href="#ms-cqrs"><span>06</span>CQRS</a></li>
          <li><a href="#ms-event-sourcing"><span>07</span>Event Sourcing</a></li>
          <li><a href="#ms-circuit-breaker"><span>08</span>Circuit Breaker</a></li>
          <li><a href="#ms-retry"><span>09</span>Retry + Backoff + Jitter</a></li>
          <li><a href="#ms-bulkhead"><span>10</span>Bulkhead</a></li>
          <li><a href="#ms-strangler"><span>11</span>Strangler Fig</a></li>
          <li><a href="#ms-sidecar"><span>12</span>Sidecar / Service Mesh</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">design pattern · microservice</div>
          <h1>Pattern cho microservice</h1>
          <p className="lede">Khi hệ thống tách thành nhiều service giao tiếp qua mạng (REST, gRPC, Kafka, RabbitMQ, NATS), xuất hiện những vấn đề mới: giao dịch xuyên service, gửi sự kiện tin cậy, lỗi lan dây chuyền. Đây là các lời giải phổ biến.</p>
        </header>
        <section>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Pattern</th>
                  <th>Tên Việt</th>
                  <th>Ý tưởng một câu</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><a className="plink" href="#ms-db-per-service">Database per Service</a></td>
                  <td>Mỗi service một database</td>
                  <td>Mỗi service sở hữu dữ liệu riêng, service khác chỉ truy cập qua API hoặc sự kiện.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-saga">Saga</a></td>
                  <td>Giao dịch phân tán</td>
                  <td>Chia thành chuỗi transaction cục bộ. Bước nào thất bại thì chạy các <b>hành động bù trừ</b> (compensation) theo thứ tự ngược lại.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-orch-choreo">Orchestration vs Choreography</a></td>
                  <td>Nhạc trưởng hay tự nhảy</td>
                  <td><b>Orchestration</b>: một orchestrator biết cả quy trình và ra lệnh cho từng service. <b>Choreography</b>: không có trung tâm, mỗi service nghe sự kiện của bước trước rồi tự làm phần mình và phát sự kiện mới.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-outbox">Transactional Outbox</a></td>
                  <td>Hộp thư đi</td>
                  <td>Ghi sự kiện vào bảng <code>outbox</code> <b>trong cùng transaction</b> với dữ liệu nghiệp vụ. Một tiến trình riêng đọc bảng outbox và publish lên broker.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-idempotent-consumer">Idempotent Consumer</a></td>
                  <td>Consumer chịu được trùng lặp</td>
                  <td>Ghi lại id của message đã xử lý, trong cùng transaction với thay đổi nghiệp vụ; gặp lại id cũ thì bỏ qua.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-cqrs">CQRS</a></td>
                  <td>Tách ghi và đọc</td>
                  <td>Tách <b>command</b> (ghi) và <b>query</b> (đọc) thành hai mô hình. Phía ghi phát sự kiện; phía đọc nghe sự kiện và cập nhật một view tối ưu sẵn cho truy vấn.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-event-sourcing">Event Sourcing</a></td>
                  <td>Lưu chuỗi sự kiện</td>
                  <td>Lưu <b>mọi sự kiện</b> đã xảy ra theo thứ tự (chỉ thêm, không sửa). Trạng thái hiện tại là kết quả “gộp” các sự kiện.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-circuit-breaker">Circuit Breaker</a></td>
                  <td>Cầu dao</td>
                  <td>Đếm lỗi; vượt ngưỡng thì “ngắt cầu dao” và trả lỗi ngay không gọi B nữa. Sau một lúc cho thử vài lời gọi; thành công thì đóng lại.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-retry">Retry + Backoff + Jitter</a></td>
                  <td>Thử lại có giãn cách</td>
                  <td>Thử lại với thời gian chờ tăng dần theo cấp số nhân, cộng thêm ngẫu nhiên (jitter) để các client không retry cùng lúc.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-bulkhead">Bulkhead</a></td>
                  <td>Vách ngăn</td>
                  <td>Chia tài nguyên thành các khoang riêng cho từng dependency, như vách ngăn chống chìm tàu.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-strangler">Strangler Fig</a></td>
                  <td>Thay dần hệ thống cũ</td>
                  <td>Đặt một proxy/gateway phía trước, chuyển dần từng route sang service mới; route chưa chuyển vẫn đi vào hệ thống cũ cho tới khi cũ không còn gì.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-sidecar">Sidecar / Service Mesh</a></td>
                  <td>Xe thùng bên cạnh</td>
                  <td>Chạy một tiến trình phụ (sidecar, thường là Envoy) bên cạnh mỗi service để lo phần hạ tầng mạng. Tập hợp các sidecar gọi là service mesh (Istio, Linkerd).</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="ms-db-per-service">
          <h2><span className="n">01</span>Database per Service <small className="vn">Mỗi service một database</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Nhiều service dùng chung một database thì đổi schema một bảng là ảnh hưởng tất cả, và không triển khai độc lập được.</div>
            <div><span className="pl">Ý tưởng</span>Mỗi service sở hữu dữ liệu riêng, service khác chỉ truy cập qua API hoặc sự kiện.</div>
          </div>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Gần như mặc định khi tách microservice.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Mất JOIN và transaction xuyên service; cần Saga cho giao dịch và CQRS hoặc API Composition cho truy vấn gộp.</div>
          </div>
        </section>
        <section id="ms-saga">
          <h2><span className="n">02</span>Saga <small className="vn">Giao dịch phân tán</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Đặt hàng cần trừ kho, trừ tiền, tạo vận đơn ở ba service với ba database. Không có transaction chung để rollback.</div>
            <div><span className="pl">Ý tưởng</span>Chia thành chuỗi transaction cục bộ. Bước nào thất bại thì chạy các <b>hành động bù trừ</b> (compensation) theo thứ tự ngược lại.</div>
          </div>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 312" role="img" aria-label="Saga: orchestration có orchestrator gọi lần lượt inventory, payment, shipping; choreography các service nối nhau qua sự kiện"> <defs><marker id="sga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker><marker id="sgb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker></defs> <rect className="s-bg" x="8" y="8" width="430" height="296" rx="10" /> <text className="s-lane" x="22" y="30">ORCHESTRATION</text> <rect className="s-hl" x="150" y="44" width="150" height="54" rx="7" /><text className="s-tb" x="162" y="68">Orchestrator</text><text className="s-tm" x="162" y="86">giữ trạng thái saga</text> <rect className="s-box" x="24" y="190" width="124" height="54" rx="7" /><text className="s-tb" x="36" y="214">Inventory</text><text className="s-tm" x="36" y="232">service</text> <path className="s-ln" d="M225 98 L86 188" markerEnd="url(#sga)" /> <text className="s-tm" x="30" y="150">1 reserve</text> <rect className="s-box" x="160" y="190" width="124" height="54" rx="7" /><text className="s-tb" x="172" y="214">Payment</text><text className="s-tm" x="172" y="232">service</text> <path className="s-ln" d="M225 98 L222 188" markerEnd="url(#sga)" /> <text className="s-tm" x="232" y="150">2 charge</text> <rect className="s-box" x="296" y="190" width="124" height="54" rx="7" /><text className="s-tb" x="308" y="214">Shipping</text><text className="s-tm" x="308" y="232">service</text> <path className="s-ln" d="M225 98 L358 188" markerEnd="url(#sga)" /> <text className="s-tm" x="330" y="150">3 ship</text> <text className="s-tm" x="24" y="272" style={{ fill: "var(--bad)" }}>bước 3 lỗi → refund, rồi release</text> <text className="s-tm" x="24" y="290">một nơi điều khiển, dễ theo dõi</text> <rect className="s-bg2" x="452" y="8" width="440" height="296" rx="10" /> <text className="s-lane2" x="466" y="30">CHOREOGRAPHY</text> <rect className="s-box" x="472" y="44" width="140" height="46" rx="7" /><text className="s-tb" x="484" y="68">Order</text><text className="s-tm" x="484" y="86">service</text> <path className="s-dl2" d="M542 90 V104" markerEnd="url(#sgb)" /> <text className="s-tm" x="556" y="101" style={{ fill: "var(--warn)" }}>OrderCreated</text> <rect className="s-box" x="472" y="106" width="140" height="46" rx="7" /><text className="s-tb" x="484" y="130">Inventory</text><text className="s-tm" x="484" y="148">service</text> <path className="s-dl2" d="M542 152 V166" markerEnd="url(#sgb)" /> <text className="s-tm" x="556" y="163" style={{ fill: "var(--warn)" }}>StockReserved</text> <rect className="s-box" x="472" y="168" width="140" height="46" rx="7" /><text className="s-tb" x="484" y="192">Payment</text><text className="s-tm" x="484" y="210">service</text> <path className="s-dl2" d="M542 214 V228" markerEnd="url(#sgb)" /> <text className="s-tm" x="556" y="225" style={{ fill: "var(--warn)" }}>PaymentDone</text> <rect className="s-box" x="472" y="230" width="140" height="46" rx="7" /><text className="s-tb" x="484" y="254">Shipping</text><text className="s-tm" x="484" y="272">service</text> <text className="s-tm" x="700" y="90">mỗi service nghe</text> <text className="s-tm" x="700" y="108">sự kiện bước trước</text> <text className="s-tm" x="700" y="126">rồi tự làm phần mình</text> <text className="s-tm" x="700" y="190">không có trung tâm,</text> <text className="s-tm" x="700" y="208">khó thấy toàn cảnh</text> </svg>
            </div>
            <figcaption>Hai cách hiện thực Saga. Orchestration hợp với quy trình nhiều bước, cần theo dõi rõ; choreography hợp với chuỗi ngắn, ít service.</figcaption>
          </figure>
          <Code lang="ts">{`type Step = { name: string; run: () => Promise<void>; compensate: () => Promise<void> };

async function runSaga(steps: Step[]) {
  const done: Step[] = [];
  try {
    for (const s of steps) { await s.run(); done.push(s); }
  } catch (err) {
    // Undo completed steps in reverse order
    for (const s of done.reverse()) await s.compensate();
    throw err;
  }
}

await runSaga([
  { name: "reserve stock", run: () => inventory.reserve(order), compensate: () => inventory.release(order) },
  { name: "charge",        run: () => payment.charge(order),    compensate: () => payment.refund(order) },
  { name: "ship",          run: () => shipping.create(order),   compensate: () => shipping.cancel(order) },
]);`}</Code>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Mọi nghiệp vụ trải qua nhiều service cần nhất quán cuối cùng.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Code mẫu là orchestration trong bộ nhớ; thực tế phải lưu trạng thái saga vào DB để sống sót khi service restart, và mỗi bước phải idempotent.</div>
          </div>
        </section>
        <section id="ms-orch-choreo">
          <h2><span className="n">03</span>Orchestration vs Choreography <small className="vn">Nhạc trưởng hay tự nhảy</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Một quy trình chạy qua nhiều service (giữ hàng, trừ tiền, giao hàng). Ai quyết định bước tiếp theo, và khi một bước lỗi thì ai lo bù trừ?</div>
            <div><span className="pl">Ý tưởng</span><b>Orchestration</b>: một orchestrator biết cả quy trình và ra lệnh cho từng service. <b>Choreography</b>: không có trung tâm, mỗi service nghe sự kiện của bước trước rồi tự làm phần mình và phát sự kiện mới.</div>
          </div>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 512" role="img" aria-label="Sơ đồ tuần tự orchestration: orchestrator gọi reserve, charge, createShipment; shipping lỗi nên orchestrator gọi refund rồi release"> <defs><marker id="orqa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker><marker id="orqb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker><marker id="orqc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--bad)" /></marker><marker id="orqd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker><marker id="orqe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--new)" /></marker></defs> <rect className="s-hl" x="0.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="70.0" y="35" textAnchor="middle">Orchestrator</text> <text className="s-tm" x="70.0" y="52" textAnchor="middle">giữ trạng thái</text> <path d="M70.0 62 V498" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-box" x="253.33333333333337" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="323.33333333333337" y="35" textAnchor="middle">Inventory</text> <text className="s-tm" x="323.33333333333337" y="52" textAnchor="middle">service</text> <path d="M323.33333333333337 62 V498" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-box" x="506.66666666666674" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="576.6666666666667" y="35" textAnchor="middle">Payment</text> <text className="s-tm" x="576.6666666666667" y="52" textAnchor="middle">service</text> <path d="M576.6666666666667 62 V498" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-box" x="760.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="830.0" y="35" textAnchor="middle">Shipping</text> <text className="s-tm" x="830.0" y="52" textAnchor="middle">service</text> <path d="M830.0 62 V498" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <path d="M74.0 92 H317.33333333333337" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#orqa)" /> <text className="s-tm" x="196.66666666666669" y="85" textAnchor="middle" style={{ fill: "var(--accent)" }}>1. reserve(items)</text> <path d="M319.33333333333337 126 H76.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#orqb)" /> <text className="s-tm" x="196.66666666666669" y="119" textAnchor="middle" style={{ fill: "var(--muted)" }}>ok</text> <path d="M74.0 160 H570.6666666666667" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#orqa)" /> <text className="s-tm" x="323.33333333333337" y="153" textAnchor="middle" style={{ fill: "var(--accent)" }}>2. charge(order)</text> <path d="M572.6666666666667 194 H76.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#orqb)" /> <text className="s-tm" x="323.33333333333337" y="187" textAnchor="middle" style={{ fill: "var(--muted)" }}>ok</text> <path d="M74.0 228 H824.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#orqa)" /> <text className="s-tm" x="450.0" y="221" textAnchor="middle" style={{ fill: "var(--accent)" }}>3. createShipment(order)</text> <path d="M826.0 262 H76.0" style={{ stroke: "var(--bad)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#orqc)" /> <text className="s-tm" x="450.0" y="255" textAnchor="middle" style={{ fill: "var(--bad)" }}>lỗi: hết shipper</text> <text className="s-tm" x="10.0" y="296" style={{ fill: "var(--warn)", fontWeight: "600" }}>Bù trừ theo thứ tự ngược</text> <path d="M74.0 334 H570.6666666666667" style={{ stroke: "var(--warn)", strokeWidth: "1.8", fill: "none", strokeDasharray: "6 3" }} markerEnd="url(#orqd)" /> <text className="s-tm" x="323.33333333333337" y="327" textAnchor="middle" style={{ fill: "var(--warn)" }}>4. refund(order)</text> <path d="M572.6666666666667 368 H76.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#orqb)" /> <text className="s-tm" x="323.33333333333337" y="361" textAnchor="middle" style={{ fill: "var(--muted)" }}>ok</text> <path d="M74.0 402 H317.33333333333337" style={{ stroke: "var(--warn)", strokeWidth: "1.8", fill: "none", strokeDasharray: "6 3" }} markerEnd="url(#orqd)" /> <text className="s-tm" x="196.66666666666669" y="395" textAnchor="middle" style={{ fill: "var(--warn)" }}>5. release(items)</text> <path d="M319.33333333333337 436 H76.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#orqb)" /> <text className="s-tm" x="196.66666666666669" y="429" textAnchor="middle" style={{ fill: "var(--muted)" }}>ok</text> <text className="s-tm" x="10.0" y="470" style={{ fill: "var(--accent)", fontWeight: "600" }}>Đơn → CANCELLED, lưu trong DB của orchestrator</text> </svg>
            </div>
            <figcaption>Orchestration: mọi lệnh và mọi bù trừ đều đi ra từ orchestrator, nên chỉ cần nhìn một chỗ là biết đơn đang ở bước nào.</figcaption>
          </figure>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 424" role="img" aria-label="Sơ đồ tuần tự choreography: Order phát OrderCreated, Inventory nghe và phát StockReserved, Payment nghe và phát PaymentFailed, Inventory và Order tự bù trừ"> <defs><marker id="chqa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker><marker id="chqb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker><marker id="chqc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--bad)" /></marker><marker id="chqd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker><marker id="chqe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--new)" /></marker></defs> <rect className="s-box" x="0.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="70.0" y="35" textAnchor="middle">Order</text> <text className="s-tm" x="70.0" y="52" textAnchor="middle">service</text> <path d="M70.0 62 V410" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-disk" x="253.33333333333337" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="323.33333333333337" y="35" textAnchor="middle">Event bus</text> <text className="s-tm" x="323.33333333333337" y="52" textAnchor="middle">Kafka · NATS</text> <path d="M323.33333333333337 62 V410" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-box" x="506.66666666666674" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="576.6666666666667" y="35" textAnchor="middle">Inventory</text> <text className="s-tm" x="576.6666666666667" y="52" textAnchor="middle">service</text> <path d="M576.6666666666667 62 V410" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-box" x="760.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="830.0" y="35" textAnchor="middle">Payment</text> <text className="s-tm" x="830.0" y="52" textAnchor="middle">service</text> <path d="M830.0 62 V410" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <path d="M74.0 92 H317.33333333333337" style={{ stroke: "var(--new)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#chqe)" /> <text className="s-tm" x="196.66666666666669" y="85" textAnchor="middle" style={{ fill: "var(--new)" }}>publish OrderCreated</text> <path d="M327.33333333333337 126 H570.6666666666667" style={{ stroke: "var(--new)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#chqe)" /> <text className="s-tm" x="450.00000000000006" y="119" textAnchor="middle" style={{ fill: "var(--new)" }}>OrderCreated</text> <path d="M572.6666666666667 160 H329.33333333333337" style={{ stroke: "var(--new)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#chqe)" /> <text className="s-tm" x="450.00000000000006" y="153" textAnchor="middle" style={{ fill: "var(--new)" }}>publish StockReserved</text> <path d="M327.33333333333337 194 H824.0" style={{ stroke: "var(--new)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#chqe)" /> <text className="s-tm" x="576.6666666666667" y="187" textAnchor="middle" style={{ fill: "var(--new)" }}>StockReserved</text> <path d="M826.0 228 H329.33333333333337" style={{ stroke: "var(--bad)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#chqc)" /> <text className="s-tm" x="576.6666666666667" y="221" textAnchor="middle" style={{ fill: "var(--bad)" }}>publish PaymentFailed</text> <text className="s-tm" x="10.0" y="262" style={{ fill: "var(--warn)", fontWeight: "600" }}>Ai quan tâm PaymentFailed thì tự bù trừ</text> <path d="M327.33333333333337 300 H570.6666666666667" style={{ stroke: "var(--warn)", strokeWidth: "1.8", fill: "none", strokeDasharray: "6 3" }} markerEnd="url(#chqd)" /> <text className="s-tm" x="450.00000000000006" y="293" textAnchor="middle" style={{ fill: "var(--warn)" }}>PaymentFailed → release stock</text> <path d="M319.33333333333337 334 H76.0" style={{ stroke: "var(--warn)", strokeWidth: "1.8", fill: "none", strokeDasharray: "6 3" }} markerEnd="url(#chqd)" /> <text className="s-tm" x="196.66666666666669" y="327" textAnchor="middle" style={{ fill: "var(--warn)" }}>PaymentFailed → đơn CANCELLED</text> <text className="s-tm" x="10.0" y="368" style={{ fill: "var(--accent)", fontWeight: "600" }}>Không ai giữ trạng thái chung, phải dựng lại từ log và tracing</text> </svg>
            </div>
            <figcaption>Choreography: service chỉ nói chuyện với event bus. Bước tiếp theo xảy ra vì có người đang nghe sự kiện, không vì ai ra lệnh.</figcaption>
          </figure>
          <Code lang="ts">{`// Choreography: each service only reacts to events (Kafka / NATS / RabbitMQ)
inventory.on("OrderCreated", async e => {
  await reserve(e.items);
  await publish("StockReserved", { orderId: e.orderId, items: e.items });
});

payment.on("StockReserved", async e => {
  try {
    await charge(e.orderId);
    await publish("PaymentDone", { orderId: e.orderId });
  } catch {
    await publish("PaymentFailed", { orderId: e.orderId, items: e.items });
  }
});

// Compensation is also just another listener
inventory.on("PaymentFailed", e => release(e.items));
orders.on("PaymentFailed", e => markCancelled(e.orderId));`}</Code>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th />
                  <th>Orchestration</th>
                  <th>Choreography</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Ai biết cả quy trình</b></td>
                  <td>Orchestrator</td>
                  <td>Không ai, logic nằm rải rác</td>
                </tr>
                <tr>
                  <td><b>Giao tiếp</b></td>
                  <td>Lệnh (gRPC, REST, command message)</td>
                  <td>Sự kiện qua event bus</td>
                </tr>
                <tr>
                  <td><b>Liên kết</b></td>
                  <td>Orchestrator phụ thuộc mọi service</td>
                  <td>Lỏng, chỉ phụ thuộc định dạng sự kiện</td>
                </tr>
                <tr>
                  <td><b>Theo dõi, debug</b></td>
                  <td>Dễ, trạng thái nằm một chỗ</td>
                  <td>Khó, cần distributed tracing</td>
                </tr>
                <tr>
                  <td><b>Bù trừ khi lỗi</b></td>
                  <td>Tập trung, đúng thứ tự ngược</td>
                  <td>Mỗi service tự nghe sự kiện lỗi</td>
                </tr>
                <tr>
                  <td><b>Thêm bước mới</b></td>
                  <td>Sửa orchestrator</td>
                  <td>Thêm listener, không sửa ai</td>
                </tr>
                <tr>
                  <td><b>Rủi ro</b></td>
                  <td>Orchestrator thành “god service”</td>
                  <td>Mạng sự kiện rối, vòng lặp khó thấy</td>
                </tr>
                <tr>
                  <td><b>Công cụ</b></td>
                  <td>Temporal, Camunda/Zeebe, AWS Step Functions</td>
                  <td>Kafka, RabbitMQ, NATS</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Orchestration cho quy trình dài, nhiều nhánh, cần biết đơn đang ở đâu (đặt hàng, duyệt vay). Choreography cho chuỗi ngắn hoặc khi một sự kiện có nhiều bên cùng quan tâm (OrderPaid → email, thống kê, tích điểm).</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Thực tế hay kết hợp: orchestration cho luồng chính cần kiểm soát, phát sự kiện cho các việc phụ. Dù cách nào, mỗi bước đều phải idempotent và gửi sự kiện qua Outbox.</div>
          </div>
        </section>
        <section id="ms-outbox">
          <h2><span className="n">04</span>Transactional Outbox <small className="vn">Hộp thư đi</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Lưu đơn vào DB rồi publish sự kiện lên Kafka: nếu DB thành công mà publish lỗi (hoặc ngược lại) thì hai bên lệch nhau. Đây là vấn đề <b>dual write</b>.</div>
            <div><span className="pl">Ý tưởng</span>Ghi sự kiện vào bảng <code>outbox</code> <b>trong cùng transaction</b> với dữ liệu nghiệp vụ. Một tiến trình riêng đọc bảng outbox và publish lên broker.</div>
          </div>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 246" role="img" aria-label="Transactional outbox: service ghi bảng orders và outbox trong một transaction, relay đọc outbox và publish lên Kafka, consumer xử lý idempotent"> <defs><marker id="oba" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs> <rect className="s-box" x="16" y="96" width="128" height="56" rx="7" /><text className="s-tb" x="28" y="120">Order svc</text><text className="s-tm" x="28" y="138">placeOrder()</text> <rect className="s-bg" x="186" y="30" width="250" height="186" rx="10" style={{ strokeDasharray: "5 4" }} /> <text className="s-lane" x="200" y="52">1 DB TRANSACTION</text> <rect className="s-box" x="204" y="66" width="214" height="52" rx="7" /><text className="s-tb" x="216" y="90">orders</text><text className="s-tm" x="216" y="108">INSERT đơn hàng</text> <rect className="s-disk" x="204" y="134" width="214" height="52" rx="7" /><text className="s-tb" x="216" y="158">outbox</text><text className="s-tm" x="216" y="176">INSERT sự kiện</text> <path className="s-ln" d="M144 124 H184" markerEnd="url(#oba)" /> <rect className="s-hl" x="482" y="134" width="134" height="52" rx="7" /><text className="s-tb" x="494" y="158">Relay / CDC</text><text className="s-tm" x="494" y="176">đọc dòng chưa gửi</text> <path className="s-ln" d="M418 160 H480" markerEnd="url(#oba)" /> <rect className="s-box" x="660" y="134" width="104" height="52" rx="7" /><text className="s-tb" x="672" y="158">Kafka</text><text className="s-tm" x="672" y="176">broker</text> <path className="s-ln" d="M616 160 H658" markerEnd="url(#oba)" /> <rect className="s-box" x="800" y="134" width="90" height="52" rx="7" /><text className="s-tb" x="812" y="158">Consumer</text><text className="s-tm" x="812" y="176">idempotent</text> <path className="s-ln" d="M764 160 H798" markerEnd="url(#oba)" /> <text className="s-tm" x="482" y="214">2 publish, rồi đánh dấu sent_at</text> <text className="s-tm" x="482" y="232">có thể gửi trùng → consumer lọc trùng</text> </svg>
            </div>
            <figcaption>Ghi DB và ghi sự kiện cùng thành công hoặc cùng thất bại. Việc gửi lên broker tách ra một bước sau, có retry.</figcaption>
          </figure>
          <Code lang="ts">{`// 1. Business write and event write share one DB transaction
await db.transaction(async tx => {
  await tx.insert("orders", order);
  await tx.insert("outbox", {
    id: crypto.randomUUID(),
    topic: "orders.created",
    payload: JSON.stringify(order),
    created_at: new Date(),
  });
});

// 2. A relay process publishes pending rows, then marks them as sent
async function relay() {
  const rows = await db.query("SELECT * FROM outbox WHERE sent_at IS NULL ORDER BY created_at LIMIT 100");
  for (const r of rows) {
    await producer.send({ topic: r.topic, messages: [{ key: r.id, value: r.payload }] });
    await db.query("UPDATE outbox SET sent_at = now() WHERE id = $1", [r.id]);
  }
}
setInterval(relay, 1000);`}</Code>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Bất cứ khi nào vừa cập nhật DB vừa phải gửi sự kiện.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Relay có thể gửi trùng nếu chết giữa publish và update, nên phía nhận cần Idempotent Consumer. Thay cho polling có thể dùng CDC (Debezium đọc WAL của DB).</div>
          </div>
        </section>
        <section id="ms-idempotent-consumer">
          <h2><span className="n">05</span>Idempotent Consumer <small className="vn">Consumer chịu được trùng lặp</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Kafka, RabbitMQ, JetStream đều có thể giao một message nhiều lần (at-least-once). Xử lý hai lần thì trừ tiền hai lần.</div>
            <div><span className="pl">Ý tưởng</span>Ghi lại id của message đã xử lý, trong cùng transaction với thay đổi nghiệp vụ; gặp lại id cũ thì bỏ qua.</div>
          </div>
          <Code lang="ts">{`async function handle(msg: { id: string; customerId: string; orderId: string; amount: number }) {
  await db.transaction(async tx => {
    // Unique constraint on processed_messages.id rejects duplicates
    const inserted = await tx.query(
      "INSERT INTO processed_messages(id) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id",
      [msg.id],
    );
    if (inserted.rowCount === 0) return; // already handled

    // Pay the order from the customer's wallet
    await tx.query("UPDATE wallets SET balance = balance - $1 WHERE customer_id = $2",
      [msg.amount, msg.customerId]);
    await tx.query("UPDATE orders SET status = 'paid' WHERE id = $1", [msg.orderId]);
  });
}`}</Code>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Mọi consumer có tác dụng phụ (ghi DB, trừ tiền, gửi email).</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Bảng id đã xử lý cần được dọn định kỳ. Thao tác tự nhiên idempotent (ghi đè giá trị) thì không cần bảng này.</div>
          </div>
        </section>
        <section id="ms-cqrs">
          <h2><span className="n">06</span>CQRS <small className="vn">Tách ghi và đọc</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Mô hình dữ liệu tối ưu cho ghi (chuẩn hóa, nhiều ràng buộc) lại chậm cho các màn hình đọc cần JOIN nhiều bảng hoặc nhiều service.</div>
            <div><span className="pl">Ý tưởng</span>Tách <b>command</b> (ghi) và <b>query</b> (đọc) thành hai mô hình. Phía ghi phát sự kiện; phía đọc nghe sự kiện và cập nhật một view tối ưu sẵn cho truy vấn.</div>
          </div>
          <Code lang="ts">{`// Write side: validates and emits events
async function placeOrder(cmd: PlaceOrder) {
  const order = Order.create(cmd);          // business rules
  await orderRepo.save(order);
  await outbox.add("orders.placed", order.toEvent());
}

// Read side: a projection kept up to date from events
consumer.on("orders.placed", async e => {
  await readDb.collection("order_summaries").updateOne(
    { customerId: e.customerId },
    { $inc: { orderCount: 1, totalSpent: e.total }, $set: { lastOrderAt: e.at } },
    { upsert: true },
  );
});

// Queries hit the denormalized view directly
const summary = await readDb.collection("order_summaries").findOne({ customerId: "7" });`}</Code>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Tải đọc và ghi chênh lệch lớn, màn hình đọc phức tạp, kết hợp với Event Sourcing.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>View đọc trễ hơn phía ghi một chút (eventual consistency). Đừng áp dụng cho CRUD đơn giản.</div>
          </div>
        </section>
        <section id="ms-event-sourcing">
          <h2><span className="n">07</span>Event Sourcing <small className="vn">Lưu chuỗi sự kiện</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Chỉ lưu trạng thái hiện tại thì mất lịch sử: không biết một khoản thanh toán đã được giữ, thu, hoàn bao nhiêu và lúc nào; khó đối soát và khó dựng lại.</div>
            <div><span className="pl">Ý tưởng</span>Lưu <b>mọi sự kiện</b> đã xảy ra theo thứ tự (chỉ thêm, không sửa). Trạng thái hiện tại là kết quả “gộp” các sự kiện.</div>
          </div>
          <Code lang="ts">{`type PaymentEvent =
  | { type: "Authorized"; orderId: string; amount: number }   // money held on the card
  | { type: "Captured"; amount: number }                      // money actually taken
  | { type: "Refunded"; amount: number };

function rebuild(events: PaymentEvent[]) {
  // Fold events into current state
  return events.reduce((p, e) => {
    switch (e.type) {
      case "Authorized": return { orderId: e.orderId, authorized: e.amount, captured: 0, refunded: 0 };
      case "Captured":   return { ...p, captured: p.captured + e.amount };
      case "Refunded":   return { ...p, refunded: p.refunded + e.amount };
    }
  }, { orderId: "", authorized: 0, captured: 0, refunded: 0 });
}

const history: PaymentEvent[] = await eventStore.load("payment-42");
const state = rebuild(history);
// { orderId: "42", authorized: 1_200_000, captured: 1_200_000, refunded: 200_000 }`}</Code>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Thanh toán, ví, đối soát, kiểm toán, hệ thống cần “du hành thời gian”. Kafka với retention vô hạn hoặc JetStream thường làm event store.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Phức tạp: cần snapshot khi chuỗi dài, đổi cấu trúc sự kiện cũ rất khó, truy vấn phải qua CQRS.</div>
          </div>
        </section>
        <section id="ms-circuit-breaker">
          <h2><span className="n">08</span>Circuit Breaker <small className="vn">Cầu dao</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Service B chậm hoặc chết; service A vẫn gọi liên tục, mỗi lời gọi chờ timeout, thread cạn dần và A chết theo. Lỗi lan dây chuyền.</div>
            <div><span className="pl">Ý tưởng</span>Đếm lỗi; vượt ngưỡng thì “ngắt cầu dao” và trả lỗi ngay không gọi B nữa. Sau một lúc cho thử vài lời gọi; thành công thì đóng lại.</div>
          </div>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 296" role="img" aria-label="Circuit breaker ba trạng thái: closed chuyển sang open khi lỗi vượt ngưỡng, open sang half-open khi hết thời gian chờ, half-open về closed nếu thử thành công hoặc về open nếu lỗi"> <defs><marker id="cba" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs> <circle className="s-hl" cx="150" cy="120" r="62" /> <text className="s-tb" x="150" y="118" textAnchor="middle">Closed</text> <text className="s-tm" x="150" y="138" textAnchor="middle">gọi bình thường</text> <circle className="s-bad2" cx="450" cy="120" r="62" /> <text className="s-tb" x="450" y="118" textAnchor="middle">Open</text> <text className="s-tm" x="450" y="138" textAnchor="middle">trả lỗi ngay</text> <circle className="s-disk" cx="750" cy="120" r="62" /> <text className="s-tb" x="750" y="118" textAnchor="middle">Half-open</text> <text className="s-tm" x="750" y="138" textAnchor="middle">thử vài lời gọi</text> <path className="s-ln" d="M200 84 C280 40 320 40 400 84" markerEnd="url(#cba)" /> <text className="s-tm" x="300" y="40" textAnchor="middle">lỗi ≥ ngưỡng</text> <path className="s-ln" d="M500 84 C580 40 620 40 700 84" markerEnd="url(#cba)" /> <text className="s-tm" x="600" y="40" textAnchor="middle">hết thời gian chờ</text> <path className="s-ln" d="M700 158 C600 200 560 200 500 158" markerEnd="url(#cba)" /> <text className="s-tm" x="600" y="214" textAnchor="middle">thử lại lỗi</text> <path className="s-ln" d="M730 182 C640 290 260 290 170 182" markerEnd="url(#cba)" /> <text className="s-tm" x="450" y="284" textAnchor="middle">thử thành công → đóng cầu dao</text> </svg>
            </div>
            <figcaption>Giống cầu dao điện: quá tải thì ngắt để bảo vệ phần còn lại, một lúc sau thử đóng lại.</figcaption>
          </figure>
          <Code lang="ts">{`type State = "closed" | "open" | "half-open";

class CircuitBreaker {
  private state: State = "closed";
  private failures = 0;
  private openedAt = 0;
  constructor(private threshold = 5, private resetMs = 10_000) {}

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.openedAt < this.resetMs) throw new Error("Circuit open");
      this.state = "half-open"; // allow a trial call
    }
    try {
      const result = await fn();
      this.state = "closed";
      this.failures = 0;
      return result;
    } catch (err) {
      this.failures++;
      if (this.state === "half-open" || this.failures >= this.threshold) {
        this.state = "open";
        this.openedAt = Date.now();
      }
      throw err;
    }
  }
}

const breaker = new CircuitBreaker();
const price = await breaker.call(() => pricingClient.getPrice("SKU-1"));`}</Code>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Mọi lời gọi đồng bộ sang service khác hoặc API bên ngoài.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Kết hợp với timeout và fallback (giá trị cache, thông báo thân thiện). Thư viện có sẵn: opossum (Node.js); service mesh cũng làm được.</div>
          </div>
        </section>
        <section id="ms-retry">
          <h2><span className="n">09</span>Retry + Backoff + Jitter <small className="vn">Thử lại có giãn cách</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Lỗi tạm thời (mạng chập chờn, 503) có thể tự hết, nhưng retry ngay lập tức với cùng nhịp làm server đang yếu càng quá tải.</div>
            <div><span className="pl">Ý tưởng</span>Thử lại với thời gian chờ tăng dần theo cấp số nhân, cộng thêm ngẫu nhiên (jitter) để các client không retry cùng lúc.</div>
          </div>
          <Code lang="ts">{`async function retry<T>(fn: () => Promise<T>, attempts = 5, baseMs = 200): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i >= attempts - 1 || !isTransient(err)) throw err;
      // Full jitter: random delay between 0 and base * 2^i
      const delay = Math.random() * baseMs * 2 ** i;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

const isTransient = (e: any) => [502, 503, 504].includes(e.status) || e.code === "ECONNRESET";`}</Code>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Lỗi tạm thời ở mạng, broker, database.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Chỉ retry thao tác idempotent (hoặc có Idempotency-Key). Retry nhiều tầng chồng nhau sẽ nhân số request lên rất nhanh.</div>
          </div>
        </section>
        <section id="ms-bulkhead">
          <h2><span className="n">10</span>Bulkhead <small className="vn">Vách ngăn</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Một dependency chậm chiếm hết connection pool hoặc worker, kéo theo cả những tính năng không liên quan.</div>
            <div><span className="pl">Ý tưởng</span>Chia tài nguyên thành các khoang riêng cho từng dependency, như vách ngăn chống chìm tàu.</div>
          </div>
          <Code lang="ts">{`// Limit concurrent calls per dependency
function limiter(max: number) {
  let active = 0;
  const queue: (() => void)[] = [];
  return async <T>(fn: () => Promise<T>): Promise<T> => {
    if (active >= max) await new Promise<void>(r => queue.push(r));
    active++;
    try { return await fn(); }
    finally { active--; queue.shift()?.(); }
  };
}

const forPayment = limiter(20);
const forRecommendation = limiter(5); // slow, non-critical dependency gets a small share

await forRecommendation(() => recoClient.get(userId));`}</Code>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Service gọi nhiều dependency có mức quan trọng khác nhau.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Chọn kích thước khoang dựa trên đo đạc; quá nhỏ thì tự bóp nghẹt mình.</div>
          </div>
        </section>
        <section id="ms-strangler">
          <h2><span className="n">11</span>Strangler Fig <small className="vn">Thay dần hệ thống cũ</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Viết lại toàn bộ hệ thống monolith một lần quá rủi ro.</div>
            <div><span className="pl">Ý tưởng</span>Đặt một proxy/gateway phía trước, chuyển dần từng route sang service mới; route chưa chuyển vẫn đi vào hệ thống cũ cho tới khi cũ không còn gì.</div>
          </div>
          <Code lang="ts">{`// API gateway routing table during migration
const routes: { prefix: string; target: string }[] = [
  { prefix: "/api/orders",   target: "http://order-service" },   // migrated
  { prefix: "/api/payments", target: "http://payment-service" }, // migrated
  { prefix: "/",             target: "http://legacy-monolith" }, // everything else
];

const pickTarget = (path: string) => routes.find(r => path.startsWith(r.prefix))!.target;`}</Code>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Hiện đại hóa hệ thống cũ, tách monolith thành microservice.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Dữ liệu dùng chung giữa cũ và mới là phần khó nhất; cần kế hoạch đồng bộ dữ liệu.</div>
          </div>
        </section>
        <section id="ms-sidecar">
          <h2><span className="n">12</span>Sidecar / Service Mesh <small className="vn">Xe thùng bên cạnh</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Service nào cũng cần TLS, retry, metrics, tracing; viết lại cho từng ngôn ngữ thì tốn công và không đồng nhất.</div>
            <div><span className="pl">Ý tưởng</span>Chạy một tiến trình phụ (sidecar, thường là Envoy) bên cạnh mỗi service để lo phần hạ tầng mạng. Tập hợp các sidecar gọi là service mesh (Istio, Linkerd).</div>
          </div>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Nhiều service, nhiều ngôn ngữ, cần mTLS và quan sát đồng nhất.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Thêm độ trễ và độ phức tạp vận hành; hệ thống nhỏ chưa cần.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
