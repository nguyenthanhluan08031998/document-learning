import { Code } from "@/components/Code";

export default function GrpcPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục gRPC">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#grpc-overview"><span>01</span>gRPC là gì</a></li>
          <li><a href="#grpc-flow"><span>02</span>Luồng một lời gọi</a></li>
          <li><a href="#grpc-proto"><span>03</span>Protocol Buffers</a></li>
          <li><a href="#grpc-kinds"><span>04</span>4 kiểu RPC</a></li>
          <li><a href="#grpc-status"><span>05</span>{"Deadline & status"}</a></li>
          <li><a href="#grpc-lb"><span>06</span>Load balancing</a></li>
          <li><a href="#grpc-web"><span>07</span>{"Trình duyệt & công cụ"}</a></li>
          <li><a href="#grpc-ref"><span>08</span>Bảng tra nhanh</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">grpc · ghi chú học tập</div>
          <h1>Sổ tay gRPC: gọi hàm từ xa qua HTTP/2</h1>
          <p className="lede">gRPC là framework RPC mã nguồn mở do Google khởi xướng, nay thuộc CNCF. Bạn mô tả service trong file <code>.proto</code>, công cụ sinh code client và server cho nhiều ngôn ngữ, rồi gọi service ở máy khác như gọi một hàm bình thường.</p>
          <div className="tape" aria-hidden="true">
            <div>.proto</div>
            <div>protoc</div>
            <div>stub</div>
            <div className="hw">HTTP/2</div>
            <div className="leo">trailers</div>
          </div>
        </header>
        <section id="grpc-overview">
          <h2><span className="n">01</span>gRPC là gì</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Thành phần</th>
                  <th>Vai trò</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Protocol Buffers</b></td>
                  <td>Ngôn ngữ mô tả hợp đồng và định dạng nhị phân gọn, nhanh hơn JSON nhiều lần khi encode/decode.</td>
                </tr>
                <tr>
                  <td><b>HTTP/2</b></td>
                  <td>Một connection chạy nhiều lời gọi song song (multiplexing), header nén, hỗ trợ streaming hai chiều.</td>
                </tr>
                <tr>
                  <td><b>Code generation</b></td>
                  <td><code>protoc</code> hoặc <code>buf</code> sinh stub client và interface server có kiểu rõ ràng.</td>
                </tr>
                <tr>
                  <td><b>Contract-first</b></td>
                  <td>File <code>.proto</code> là nguồn chân lý chung giữa các team, đổi hợp đồng là thấy lỗi lúc biên dịch.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="grpc-flow">
          <h2><span className="n">02</span>Luồng một lời gọi (unary)</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 420" role="img" aria-label="Luồng một lời gọi gRPC unary: client gọi stub, serialize protobuf, interceptor, gửi qua HTTP/2; server nhận, interceptor, deserialize, handler, trả message và trailers"> <defs> <marker id="pfa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> <marker id="pfb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker> </defs> <rect className="s-bg" x="8" y="22" width="884" height="118" rx="10" /> <text className="s-lane" x="20" y="42">CLIENT</text> <rect className="s-bg" x="8" y="160" width="884" height="252" rx="10" /> <text className="s-lane" x="20" y="180">SERVER</text> <rect className="s-box" x="20" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="32" y="78">Gọi stub</text><text className="s-tm" x="32" y="98">GetOrder(req)</text> <rect className="s-box" x="195" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="207" y="78">Serialize</text><text className="s-tm" x="207" y="98">Protobuf → byte</text> <rect className="s-box" x="370" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="382" y="78">Interceptors</text><text className="s-tm" x="382" y="98">token · deadline</text> <rect className="s-box" x="545" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="557" y="78">HTTP/2 stream</text><text className="s-tm" x="557" y="98">1 conn, nhiều call</text> <rect className="s-box" x="720" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="732" y="78">Gửi frames</text><text className="s-tm" x="732" y="98">HEADERS + DATA</text> <path className="s-ln" d="M170 87 H193" markerEnd="url(#pfa)" /> <path className="s-ln" d="M345 87 H368" markerEnd="url(#pfa)" /> <path className="s-ln" d="M520 87 H543" markerEnd="url(#pfa)" /> <path className="s-ln" d="M695 87 H718" markerEnd="url(#pfa)" /> <rect className="s-box" x="720" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="732" y="216">Nhận stream</text><text className="s-tm" x="732" y="236">:path /Svc/Method</text> <rect className="s-box" x="545" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="557" y="216">Interceptors</text><text className="s-tm" x="557" y="236">auth · metrics</text> <rect className="s-box" x="370" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="382" y="216">Deserialize</text><text className="s-tm" x="382" y="236">byte → message</text> <rect className="s-hl" x="195" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="207" y="216">Handler</text><text className="s-tm" x="207" y="236">code bạn viết</text> <rect className="s-box" x="20" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="32" y="216">Trả kết quả</text><text className="s-tm" x="32" y="236">DATA + trailers</text> <path className="s-ln" d="M720 225 H697" markerEnd="url(#pfa)" /> <path className="s-ln" d="M545 225 H522" markerEnd="url(#pfa)" /> <path className="s-ln" d="M370 225 H347" markerEnd="url(#pfa)" /> <path className="s-ln" d="M195 225 H172" markerEnd="url(#pfa)" /> <path className="s-ln" d="M795 122 V188" markerEnd="url(#pfa)" /> <text className="s-tm" x="805" y="158">HTTP/2</text> <path className="s-dl" d="M60 190 V124" markerEnd="url(#pfb)" /> <text className="s-tm" x="70" y="158">message + grpc-status</text> <path className="s-dl" d="M270 262 V318" markerEnd="url(#pfb)" /> <rect className="s-disk" x="195" y="320" width="150" height="62" rx="7" /><text className="s-tb" x="207" y="344">Deadline</text><text className="s-tm" x="207" y="364">hết giờ → hủy</text> <path className="s-dl" d="M795 262 V318" markerEnd="url(#pfb)" /> <rect className="s-bad" x="720" y="320" width="150" height="62" rx="7" /><text className="s-tb" x="732" y="344">Sai method</text><text className="s-tm" x="732" y="364">UNIMPLEMENTED</text> <text className="s-tm" x="380" y="334">nhiều call song song trên 1 connection</text> <text className="s-tm" x="380" y="352">header nén HPACK · payload nhị phân</text> <text className="s-tm" x="380" y="370">status nằm ở trailers, không ở HTTP status</text> </svg>
            </div>
            <figcaption>Code gọi stub giống gọi hàm thường; stub lo serialize và gửi qua HTTP/2. Kết quả lỗi hay thành công nằm trong trailers cuối stream.</figcaption>
          </figure>
          <ul className="plain">
            <li>Request là một <b>HTTP/2 stream</b>: frame HEADERS chứa <code>:path /shop.OrderService/GetOrder</code> và <code>content-type: application/grpc</code>, tiếp theo là frame DATA chứa message đã serialize (có 5 byte tiền tố độ dài).</li>
            <li>Kết quả nằm ở <b>trailers</b> cuối stream: <code>grpc-status</code> và <code>grpc-message</code>. HTTP status gần như luôn là 200.</li>
            <li><b>Interceptor</b> (giống middleware) dùng cho xác thực, log, metrics, tracing, retry ở cả hai phía.</li>
          </ul>
        </section>
        <section id="grpc-proto">
          <h2><span className="n">03</span>Protocol Buffers</h2>
          <Code lang="proto">{`syntax = "proto3";
package shop.v1;

service OrderService {
  rpc GetOrder (GetOrderRequest) returns (Order);                    // unary
  rpc WatchOrder (GetOrderRequest) returns (stream OrderEvent);      // server streaming
  rpc UploadItems (stream Item) returns (UploadSummary);             // client streaming
  rpc Chat (stream ChatMessage) returns (stream ChatMessage);        // bidirectional
}

message GetOrderRequest { string id = 1; }

message Order {
  string id = 1;          // field number, not a value
  int64 total = 2;
  Status status = 3;
  repeated Item items = 4;
  reserved 5;             // field 5 was removed; never reuse it
}

enum Status { STATUS_UNSPECIFIED = 0; PAID = 1; SHIPPED = 2; }`}</Code>
          <ul className="plain">
            <li>Trên dây chỉ gửi <b>số thứ tự trường</b> và giá trị, không gửi tên, nên rất gọn. Số trường 1–15 chỉ tốn 1 byte cho phần nhãn, dành cho các trường hay dùng.</li>
            <li><b>Tương thích ngược</b>: được thêm trường mới; không đổi số hay kiểu của trường cũ; xóa trường thì đưa số vào <code>reserved</code>.</li>
            <li>Trường không gửi sẽ nhận giá trị mặc định (0, chuỗi rỗng). Cần phân biệt “không có” với “bằng 0” thì dùng <code>optional</code> hoặc wrapper type.</li>
            <li>Ngoài <code>proto3</code>, Protobuf có thêm cú pháp <b>Editions</b> để thay dần proto2/proto3 bằng các tùy chọn tính năng.</li>
          </ul>
        </section>
        <section id="grpc-kinds">
          <h2><span className="n">04</span>Bốn kiểu RPC</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 280" role="img" aria-label="Bốn kiểu RPC: unary một gửi một nhận, server streaming một gửi nhiều nhận, client streaming nhiều gửi một nhận, bidirectional hai chiều độc lập"> <defs> <marker id="gka" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> <marker id="gkb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker> </defs> <rect className="s-bg" x="10" y="8" width="212" height="264" rx="10" /> <text className="s-tb" x="24" y="32">Unary</text> <rect className="s-box" x="22" y="46" width="54" height="190" rx="6" /> <text className="s-tm" x="49" y="144" textAnchor="middle" style={{ fill: "var(--ink)" }}>client</text> <rect className="s-hl" x="156" y="46" width="54" height="190" rx="6" /> <text className="s-tm" x="183" y="144" textAnchor="middle" style={{ fill: "var(--ink)" }}>server</text> <path className="s-ln" d="M78 66 H152" markerEnd="url(#gka)" /> <path className="s-ln2" d="M154 106 H80" markerEnd="url(#gkb)" /> <text className="s-tm" x="116" y="260" textAnchor="middle">1 → 1</text> <rect className="s-bg" x="232" y="8" width="212" height="264" rx="10" /> <text className="s-tb" x="246" y="32">Server streaming</text> <rect className="s-box" x="244" y="46" width="54" height="190" rx="6" /> <text className="s-tm" x="271" y="144" textAnchor="middle" style={{ fill: "var(--ink)" }}>client</text> <rect className="s-hl" x="378" y="46" width="54" height="190" rx="6" /> <text className="s-tm" x="405" y="144" textAnchor="middle" style={{ fill: "var(--ink)" }}>server</text> <path className="s-ln" d="M300 66 H374" markerEnd="url(#gka)" /> <path className="s-ln2" d="M376 106 H302" markerEnd="url(#gkb)" /> <path className="s-ln2" d="M376 130 H302" markerEnd="url(#gkb)" /> <path className="s-ln2" d="M376 154 H302" markerEnd="url(#gkb)" /> <text className="s-tm" x="338" y="260" textAnchor="middle">1 → nhiều</text> <rect className="s-bg" x="454" y="8" width="212" height="264" rx="10" /> <text className="s-tb" x="468" y="32">Client streaming</text> <rect className="s-box" x="466" y="46" width="54" height="190" rx="6" /> <text className="s-tm" x="493" y="144" textAnchor="middle" style={{ fill: "var(--ink)" }}>client</text> <rect className="s-hl" x="600" y="46" width="54" height="190" rx="6" /> <text className="s-tm" x="627" y="144" textAnchor="middle" style={{ fill: "var(--ink)" }}>server</text> <path className="s-ln" d="M522 66 H596" markerEnd="url(#gka)" /> <path className="s-ln" d="M522 90 H596" markerEnd="url(#gka)" /> <path className="s-ln" d="M522 114 H596" markerEnd="url(#gka)" /> <path className="s-ln2" d="M598 154 H524" markerEnd="url(#gkb)" /> <text className="s-tm" x="560" y="260" textAnchor="middle">nhiều → 1</text> <rect className="s-bg" x="676" y="8" width="212" height="264" rx="10" /> <text className="s-tb" x="690" y="32">Bidirectional</text> <rect className="s-box" x="688" y="46" width="54" height="190" rx="6" /> <text className="s-tm" x="715" y="144" textAnchor="middle" style={{ fill: "var(--ink)" }}>client</text> <rect className="s-hl" x="822" y="46" width="54" height="190" rx="6" /> <text className="s-tm" x="849" y="144" textAnchor="middle" style={{ fill: "var(--ink)" }}>server</text> <path className="s-ln" d="M744 66 H818" markerEnd="url(#gka)" /> <path className="s-ln2" d="M820 92 H746" markerEnd="url(#gkb)" /> <path className="s-ln" d="M744 118 H818" markerEnd="url(#gka)" /> <path className="s-ln" d="M744 144 H818" markerEnd="url(#gka)" /> <path className="s-ln2" d="M820 170 H746" markerEnd="url(#gkb)" /> <path className="s-ln2" d="M820 196 H746" markerEnd="url(#gkb)" /> <path className="s-ln" d="M744 222 H818" markerEnd="url(#gka)" /> <text className="s-tm" x="782" y="260" textAnchor="middle">nhiều ⇄ nhiều</text> </svg>
            </div>
            <figcaption>Mũi tên xanh là message client gửi, mũi tên cam là message server trả. Tất cả chạy trên một HTTP/2 stream.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Kiểu</th>
                  <th>Client gửi</th>
                  <th>Server trả</th>
                  <th>Ví dụ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Unary</b></td>
                  <td>1</td>
                  <td>1</td>
                  <td>Lấy đơn hàng theo id</td>
                </tr>
                <tr>
                  <td><b>Server streaming</b></td>
                  <td>1</td>
                  <td>Nhiều</td>
                  <td>Theo dõi trạng thái đơn, xuất báo cáo lớn</td>
                </tr>
                <tr>
                  <td><b>Client streaming</b></td>
                  <td>Nhiều</td>
                  <td>1</td>
                  <td>Upload file theo khúc, gửi số liệu cảm biến</td>
                </tr>
                <tr>
                  <td><b>Bidirectional</b></td>
                  <td>Nhiều</td>
                  <td>Nhiều, độc lập</td>
                  <td>Chat giữa khách và người bán, đồng bộ hai chiều</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="grpc-status">
          <h2><span className="n">05</span>{"Deadline, metadata & status code"}</h2>
          <ul className="plain">
            <li><b>Deadline</b>: client đặt thời điểm hết hạn cho mỗi lời gọi. Hết hạn thì cả client và server nhận tín hiệu hủy, và deadline được truyền tiếp sang các service gọi sau. Luôn đặt deadline; mặc định là không giới hạn.</li>
            <li><b>Metadata</b>: cặp key–value đi kèm lời gọi, giống HTTP header, dùng cho token, trace id. Key kết thúc bằng <code>-bin</code> chứa dữ liệu nhị phân.</li>
            <li><b>Retry</b> khai báo qua service config, chỉ nên retry các mã an toàn như <code>UNAVAILABLE</code>.</li>
          </ul>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Tên</th>
                  <th>Khi nào</th>
                  <th>HTTP tương đương</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">0</td>
                  <td>OK</td>
                  <td>Thành công</td>
                  <td>200</td>
                </tr>
                <tr>
                  <td className="m">1</td>
                  <td>CANCELLED</td>
                  <td>Client hủy</td>
                  <td>499</td>
                </tr>
                <tr>
                  <td className="m">3</td>
                  <td>INVALID_ARGUMENT</td>
                  <td>Tham số sai</td>
                  <td>400</td>
                </tr>
                <tr>
                  <td className="m">4</td>
                  <td>DEADLINE_EXCEEDED</td>
                  <td>Hết thời gian</td>
                  <td>504</td>
                </tr>
                <tr>
                  <td className="m">5</td>
                  <td>NOT_FOUND</td>
                  <td>Không tồn tại</td>
                  <td>404</td>
                </tr>
                <tr>
                  <td className="m">6</td>
                  <td>ALREADY_EXISTS</td>
                  <td>Đã tồn tại</td>
                  <td>409</td>
                </tr>
                <tr>
                  <td className="m">7</td>
                  <td>PERMISSION_DENIED</td>
                  <td>Không có quyền</td>
                  <td>403</td>
                </tr>
                <tr>
                  <td className="m">8</td>
                  <td>RESOURCE_EXHAUSTED</td>
                  <td>Quá hạn mức</td>
                  <td>429</td>
                </tr>
                <tr>
                  <td className="m">9</td>
                  <td>FAILED_PRECONDITION</td>
                  <td>Trạng thái không cho phép</td>
                  <td>400</td>
                </tr>
                <tr>
                  <td className="m">12</td>
                  <td>UNIMPLEMENTED</td>
                  <td>Method không tồn tại</td>
                  <td>501</td>
                </tr>
                <tr>
                  <td className="m">13</td>
                  <td>INTERNAL</td>
                  <td>Lỗi nội bộ</td>
                  <td>500</td>
                </tr>
                <tr>
                  <td className="m">14</td>
                  <td>UNAVAILABLE</td>
                  <td>Tạm thời không phục vụ, nên retry</td>
                  <td>503</td>
                </tr>
                <tr>
                  <td className="m">16</td>
                  <td>UNAUTHENTICATED</td>
                  <td>Chưa xác thực</td>
                  <td>401</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="grpc-lb">
          <h2><span className="n">06</span>Load balancing: cái bẫy hay gặp</h2>
          <p>gRPC giữ <b>một connection HTTP/2 lâu dài</b> và dồn mọi lời gọi vào đó. Load balancer tầng 4 (TCP) chỉ chia <em>connection</em>, nên toàn bộ request của một client rơi vào cùng một server dù bạn có 10 server.</p>
          <div className="cmp">
            <div><h4>L7 proxy</h4>Envoy, NGINX, Linkerd, Istio hiểu HTTP/2 và chia theo từng request. Dễ triển khai, thêm một bước nhảy mạng.</div>
            <div><h4>Client-side LB</h4>Client tự biết danh sách server (DNS, xDS) và chia tải, ví dụ chính sách <code>round_robin</code>. Nhanh nhất, nhưng logic nằm ở client.</div>
          </div>
          <p>Trên Kubernetes, một Service ClusterIP thông thường là L4, nên cần headless service với client-side LB, hoặc service mesh.</p>
        </section>
        <section id="grpc-web">
          <h2><span className="n">07</span>{"Trình duyệt & công cụ"}</h2>
          <ul className="plain">
            <li>Trình duyệt không điều khiển được HTTP/2 frame và trailers, nên không gọi gRPC trực tiếp được. Dùng <b>gRPC-Web</b> qua proxy (Envoy), hoặc giao thức <b>Connect</b> chạy được cả HTTP/1.1 lẫn JSON.</li>
            <li><b>Transcoding</b>: <code>grpc-gateway</code> hoặc Envoy sinh REST/JSON API từ cùng file <code>.proto</code> (dùng annotation <code>google.api.http</code>) cho client bên ngoài.</li>
            <li><b>Server reflection</b> cho phép công cụ hỏi danh sách service; <code>grpcurl</code> gọi thử như <code>curl</code>.</li>
            <li><b>Health checking protocol</b> chuẩn (<code>grpc.health.v1.Health</code>) để load balancer và Kubernetes kiểm tra server.</li>
            <li><code>buf</code> giúp lint, phát hiện thay đổi phá tương thích (<code>buf breaking</code>) và quản lý file <code>.proto</code>.</li>
          </ul>
        </section>
        <section id="grpc-ref">
          <h2><span className="n">08</span>Bảng tra nhanh</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Mục</th>
                  <th>Giá trị / lệnh</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Kích thước message nhận tối đa (mặc định phổ biến)</td>
                  <td className="m">4 MB</td>
                </tr>
                <tr>
                  <td>Deadline mặc định</td>
                  <td className="m">không có, phải tự đặt</td>
                </tr>
                <tr>
                  <td>Content-Type</td>
                  <td className="m">application/grpc</td>
                </tr>
                <tr>
                  <td>Sinh code</td>
                  <td className="m">protoc --go_out=. --go-grpc_out=. order.proto</td>
                </tr>
                <tr>
                  <td>Liệt kê service</td>
                  <td className="m">grpcurl -plaintext localhost:50051 list</td>
                </tr>
                <tr>
                  <td>Gọi thử</td>
                  <td className="m">{"grpcurl -d '{\"id\":\"42\"}' localhost:50051 shop.v1.OrderService/GetOrder"}</td>
                </tr>
                <tr>
                  <td>Kiểm tra tương thích</td>
                  <td className="m">buf breaking --against '.git#branch=main'</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
