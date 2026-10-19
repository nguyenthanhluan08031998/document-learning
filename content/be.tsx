import Link from "next/link";

export default function BackendOverviewPage() {
  return (
    <div className="wrap single">
      <main>
        <header className="hero">
          <div className="eyebrow">backend · tổng quan</div>
          <h1>Các service nói chuyện với nhau thế nào</h1>
          <p className="lede">Có hai cách chính. <b>API đồng bộ</b>: gửi yêu cầu và chờ trả lời ngay. <b>Messaging bất đồng bộ</b>: gửi sự kiện vào một hệ thống trung gian rồi làm việc khác, bên nhận xử lý khi sẵn sàng. Sổ tay có hai nhóm cho hai cách này, cộng thêm nhóm <b>Thiết kế</b> về cách tổ chức code bên trong mỗi service, nhóm <b>Đồng thời</b> về xử lý khi nhiều bên cùng sửa một dữ liệu, và nhóm <b>Vận hành</b> về log và quan sát hệ thống.</p>
        </header>
        <section>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 406" role="img" aria-label="Kiến trúc điển hình: web, mobile, đối tác gọi API Gateway bằng REST hoặc GraphQL; gateway gọi Order, Payment, Inventory service bằng gRPC; các service publish sự kiện vào event bus Kafka, RabbitMQ hoặc NATS; Email, Analytics, Search tiêu thụ sự kiện"> <defs> <marker id="ha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> <marker id="hb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker> </defs> <rect className="s-bg" x="8" y="10" width="560" height="386" rx="10" /> <text className="s-lane" x="22" y="32">ĐỒNG BỘ · API</text> <rect className="s-bg2" x="584" y="10" width="308" height="386" rx="10" /> <text className="s-lane2" x="598" y="32">BẤT ĐỒNG BỘ · MESSAGING</text> <rect className="s-box" x="22" y="70" width="120" height="62" rx="7" /><text className="s-tb" x="34" y="96">Web app</text><text className="s-tm" x="34" y="116">trình duyệt</text> <rect className="s-box" x="22" y="160" width="120" height="62" rx="7" /><text className="s-tb" x="34" y="186">Mobile app</text><text className="s-tm" x="34" y="206">iOS · Android</text> <rect className="s-box" x="22" y="250" width="120" height="62" rx="7" /><text className="s-tb" x="34" y="276">Đối tác</text><text className="s-tm" x="34" y="296">hệ thống ngoài</text> <rect className="s-box" x="196" y="110" width="130" height="140" rx="7" /><text className="s-tb" x="208" y="136">API Gateway</text><text className="s-tm" x="208" y="156">hoặc BFF</text> <text className="s-tm" x="208" y="196">auth · rate limit</text><text className="s-tm" x="208" y="214">routing</text> <path className="s-ln" d="M142 101 C170 101 168 180 194 180" markerEnd="url(#ha)" /> <path className="s-ln" d="M142 191 C170 191 168 180 194 180" markerEnd="url(#ha)" /> <path className="s-ln" d="M142 281 C170 281 168 180 194 180" markerEnd="url(#ha)" /> <text className="s-tm" x="146" y="60">REST · GraphQL</text> <rect className="s-hl" x="400" y="60" width="150" height="62" rx="7" /><text className="s-tb" x="412" y="86">Order svc</text><text className="s-tm" x="412" y="106">gRPC server</text> <rect className="s-hl" x="400" y="170" width="150" height="62" rx="7" /><text className="s-tb" x="412" y="196">Payment svc</text><text className="s-tm" x="412" y="216">gRPC server</text> <rect className="s-hl" x="400" y="280" width="150" height="62" rx="7" /><text className="s-tb" x="412" y="306">Inventory svc</text><text className="s-tm" x="412" y="326">gRPC server</text> <path className="s-ln" d="M326 160 C360 160 360 91 398 91" markerEnd="url(#ha)" /> <text className="s-tm" x="346" y="178">gRPC</text> <path className="s-ln" d="M475 122 V168" markerEnd="url(#ha)" /> <path className="s-ln" d="M475 232 V278" markerEnd="url(#ha)" /> <text className="s-tm" x="482" y="260">gRPC</text> <text className="s-tm" x="482" y="150">gRPC</text> <rect className="s-disk" x="606" y="140" width="130" height="110" rx="8" /> <text className="s-tb" x="618" y="166">Event bus</text><text className="s-tm" x="618" y="188">Kafka</text><text className="s-tm" x="618" y="206">RabbitMQ</text><text className="s-tm" x="618" y="224">NATS</text> <path className="s-dl2" d="M550 91 C580 91 580 195 604 195" markerEnd="url(#hb)" /> <path className="s-dl2" d="M550 201 C580 201 580 195 604 195" markerEnd="url(#hb)" /> <path className="s-dl2" d="M550 311 C580 311 580 195 604 195" markerEnd="url(#hb)" /> <text className="s-tm" x="560" y="372" style={{ fill: "var(--warn)" }}>publish sự kiện</text> <rect className="s-box" x="766" y="70" width="116" height="62" rx="7" /><text className="s-tb" x="778" y="96">Email svc</text><text className="s-tm" x="778" y="116">consumer</text> <path className="s-dl2" d="M736 195 C752 195 748 101 764 101" markerEnd="url(#hb)" /> <rect className="s-box" x="766" y="170" width="116" height="62" rx="7" /><text className="s-tb" x="778" y="196">Analytics</text><text className="s-tm" x="778" y="216">consumer</text> <path className="s-dl2" d="M736 195 C752 195 748 201 764 201" markerEnd="url(#hb)" /> <rect className="s-box" x="766" y="270" width="116" height="62" rx="7" /><text className="s-tb" x="778" y="296">Search index</text><text className="s-tm" x="778" y="316">consumer</text> <path className="s-dl2" d="M736 195 C752 195 748 301 764 301" markerEnd="url(#hb)" /> </svg>
            </div>
            <figcaption>Một kiến trúc thường gặp: client gọi REST hoặc GraphQL vào gateway, các service gọi nhau bằng gRPC khi cần câu trả lời ngay, và publish sự kiện lên event bus cho những việc không cần chờ (gửi email, thống kê, cập nhật tìm kiếm).</figcaption>
          </figure>
        </section>
        <section>
          <div className="groups">
            <div className="group g-api">
              <div className="g-head"><span className="g-tag">Đồng bộ</span><h2>API</h2></div>
              <p>Request → response. Bên gọi chờ kết quả, phù hợp khi cần câu trả lời ngay.</p>
              <div className="g-list"> <Link className="g-item" href="/api/rest/"><b>REST</b><span>Tài nguyên, HTTP method, status code, cache</span></Link> <Link className="g-item" href="/api/graphql/"><b>GraphQL</b><span>Schema, client chọn trường, resolver, N+1</span></Link> <Link className="g-item" href="/api/grpc/"><b>gRPC</b><span>Protobuf, HTTP/2, 4 kiểu streaming, deadline</span></Link> <Link className="g-item g-cmp" href="/api/compare/"><b>So sánh API</b><span>REST vs GraphQL vs gRPC</span></Link> </div>
            </div>
            <div className="group g-msg">
              <div className="g-head"><span className="g-tag">Bất đồng bộ</span><h2>Messaging</h2></div>
              <p>Publish → broker → consumer. Bên gửi không chờ, bên nhận xử lý theo tốc độ riêng.</p>
              <div className="g-list"> <Link className="g-item" href="/messaging/kafka/"><b>Kafka</b><span>Commit log, partition, replication, HW</span></Link> <Link className="g-item" href="/messaging/rabbitmq/"><b>RabbitMQ</b><span>Exchange, queue, ack, dead letter</span></Link> <Link className="g-item" href="/messaging/nats/"><b>NATS</b><span>Subject, queue group, JetStream, KV</span></Link> <Link className="g-item g-cmp" href="/messaging/compare/"><b>So sánh Messaging</b><span>Kafka vs RabbitMQ vs NATS</span></Link> </div>
            </div>
            <div className="group g-design">
              <div className="g-head"><span className="g-tag">Bên trong service</span><h2>Thiết kế</h2></div>
              <p>Nguyên tắc, design pattern và kiến trúc để code dễ đổi, dễ test.</p>
              <div className="g-list"> <Link className="g-item" href="/design/oop/"><b>OOP</b><span>Class, static, kế thừa, interface, quan hệ UML</span></Link> <Link className="g-item" href="/design/principles/"><b>Nguyên tắc</b><span>SOLID, composition, DRY, KISS, YAGNI</span></Link> <Link className="g-item" href="/design/creational/"><b>GoF · 23 pattern</b><span>Creational, Structural, Behavioral</span></Link> <Link className="g-item" href="/design/microservice/"><b>Pattern microservice</b><span>Saga, Outbox, CQRS, Circuit Breaker</span></Link> <Link className="g-item" href="/design/clean-architecture/"><b>Clean Architecture</b><span>Bốn vòng, Dependency Rule, code TypeScript</span></Link> <Link className="g-item g-cmp" href="/design/cheat-sheet/"><b>Tra nhanh</b><span>Vấn đề → pattern nên dùng</span></Link> </div>
            </div>
            <div className="group g-conc">
              <div className="g-head"><span className="g-tag">Dữ liệu dùng chung</span><h2>Đồng thời</h2></div>
              <p>Khi nhiều request, nhiều instance cùng sửa một dữ liệu: race condition và các loại lock.</p>
              <div className="g-list"> <Link className="g-item" href="/concurrency/overview/"><b>Tổng quan</b><span>Race condition, isolation level, blocking</span></Link> <Link className="g-item" href="/concurrency/db-lock/"><b>Lock trong DB</b><span>Atomic, pessimistic, optimistic, deadlock</span></Link> <Link className="g-item" href="/concurrency/distributed-lock/"><b>Distributed lock</b><span>Redis, Redlock, fencing token, etcd</span></Link> <Link className="g-item g-cmp" href="/concurrency/compare/"><b>So sánh</b><span>Chọn cơ chế nào, cách tránh lock</span></Link> </div>
            </div>
            <div className="group g-ops">
              <div className="g-head"><span className="g-tag">Chạy production</span><h2>Vận hành</h2></div>
              <p>Biết hệ thống đang làm gì: log, request ID, trace và metric.</p>
              <div className="g-list"> <Link className="g-item" href="/operations/logging/"><b>Logging cơ bản</b><span>Level, nên và không nên log gì, log lỗi</span></Link> <Link className="g-item" href="/operations/structured-logging/"><b>{"Structured & context"}</b><span>JSON, pino, child logger, request ID</span></Link> <Link className="g-item" href="/operations/build-logger/"><b>Tự viết logger</b><span>Log trong một service, traceId, spanId, correlationId</span></Link> <Link className="g-item" href="/operations/observability/"><b>Observability</b><span>Logs, metrics, traces, OpenTelemetry</span></Link> </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
