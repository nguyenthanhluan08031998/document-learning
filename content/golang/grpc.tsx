import { Code } from "@/components/Code";

export default function GoGrpcPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục gRPC trong Go">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#gg-what"><span>01</span>gRPC là gì</a></li>
          <li><a href="#gg-proto"><span>02</span>Viết file proto</a></li>
          <li><a href="#gg-server"><span>03</span>Server</a></li>
          <li><a href="#gg-client"><span>04</span>Client và deadline</a></li>
          <li><a href="#gg-interceptor"><span>05</span>Interceptor và metadata</a></li>
          <li><a href="#gg-errors"><span>06</span>Mã lỗi</a></li>
          <li><a href="#gg-prod"><span>07</span>Chia tải và health check</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · grpc</div>
          <h1>gRPC trong Go</h1>
          <p className="lede"><b>gRPC</b> (gRPC Remote Procedure Calls) cho phép service này gọi hàm của service khác như gọi hàm cục bộ. Hợp đồng được viết một lần trong file <code>.proto</code>, từ đó sinh code client và server cho cả Go lẫn ngôn ngữ khác. Dữ liệu đi qua HTTP/2 dưới dạng Protocol Buffers: nhỏ gọn và nhanh hơn JSON. Đây là cách BFF gọi BE trong sơ đồ hệ thống ở trang chủ.</p>
          <div className="tape" aria-hidden="true">
            <div>.proto</div>
            <div className="hw">deadline</div>
            <div>interceptor</div>
            <div>status code</div>
            <div>round_robin</div>
          </div>
        </header>

        <section id="gg-what">
          <h2><span className="n">01</span>gRPC là gì</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr><th></th><th>REST + JSON</th><th>gRPC</th></tr>
              </thead>
              <tbody>
                <tr><td><b>Hợp đồng</b></td><td>Tài liệu (OpenAPI), dễ lệch với code</td><td>File proto, code sinh ra luôn khớp</td></tr>
                <tr><td><b>Dữ liệu</b></td><td>Văn bản JSON</td><td>Nhị phân Protocol Buffers, nhỏ hơn</td></tr>
                <tr><td><b>Giao thức</b></td><td>HTTP/1.1 hoặc HTTP/2</td><td>HTTP/2, một kết nối chạy nhiều lời gọi</td></tr>
                <tr><td><b>Kiểu gọi</b></td><td>Một yêu cầu, một phản hồi</td><td>Unary, server streaming, client streaming, hai chiều</td></tr>
                <tr><td><b>Trình duyệt</b></td><td>Gọi trực tiếp được</td><td>Cần proxy (gRPC-Web); hợp cho gọi giữa service</td></tr>
                <tr><td><b>Dễ debug</b></td><td>Dùng curl được</td><td>Cần công cụ như grpcurl</td></tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Quy ước:</b> bên ngoài (trình duyệt, đối tác) dùng REST; <b>giữa các service nội bộ</b> dùng gRPC. Xem thêm trang gRPC ở nhóm API.</div>
        </section>

        <section id="gg-proto">
          <h2><span className="n">02</span>Viết file proto</h2>
          <Code lang="proto">{`// proto/order/v1/order.proto
syntax = "proto3";

package shop.order.v1;                              // phiên bản nằm trong tên package để sau này nâng cấp
option go_package = "example.com/shop/gen/order/v1;orderv1";

service OrderService {
  rpc CreateOrder(CreateOrderRequest) returns (CreateOrderResponse);   // unary: một yêu cầu, một phản hồi
  rpc GetOrder(GetOrderRequest) returns (Order);
  rpc WatchOrders(WatchOrdersRequest) returns (stream Order);          // server streaming: trả về nhiều lần
}

message Item {
  string sku = 1;                                   // số thứ tự field là định danh trên đường truyền, đừng đổi
  int32 quantity = 2;
}

message CreateOrderRequest {
  string customer_id = 1;
  repeated Item items = 2;                          // repeated: danh sách
}

message CreateOrderResponse { string order_id = 1; }
message GetOrderRequest { string order_id = 1; }
message WatchOrdersRequest { string customer_id = 1; }

message Order {
  string id = 1;
  string customer_id = 2;
  int64 total = 3;
}`}</Code>
          <ul className="plain">
            <li><b>Không đổi số thứ tự field</b> đã dùng và không tái sử dụng số cũ. Thêm field mới bằng số mới thì client cũ vẫn chạy được.</li>
            <li>Dùng <code>reserved</code> để chặn việc dùng lại số hoặc tên của field đã xóa.</li>
          </ul>
          <p>Sinh code Go (cài <code>protoc-gen-go</code> và <code>protoc-gen-go-grpc</code>, hoặc dùng công cụ <code>buf</code>):</p>
          <Code lang="bash">{`protoc --go_out=gen --go_opt=paths=source_relative \\
       --go-grpc_out=gen --go-grpc_opt=paths=source_relative \\
       proto/order/v1/order.proto

# Hoặc với buf: khai báo trong buf.gen.yaml rồi chạy
buf generate`}</Code>
        </section>

        <section id="gg-server">
          <h2><span className="n">03</span>Server</h2>
          <Code lang="go">{`type server struct {
    orderv1.UnimplementedOrderServiceServer      // nhúng để tương thích khi proto thêm method mới
    store Store
}

func (s *server) CreateOrder(ctx context.Context, req *orderv1.CreateOrderRequest) (*orderv1.CreateOrderResponse, error) {
    if req.GetCustomerId() == "" {                // getter an toàn với nil
        return nil, status.Error(codes.InvalidArgument, "customer_id là bắt buộc")
    }
    id, err := s.store.Create(ctx, req.GetCustomerId(), req.GetItems())   // truyền ctx xuống để hủy được
    if err != nil {
        return nil, status.Error(codes.Internal, "không tạo được đơn")
    }
    return &orderv1.CreateOrderResponse{OrderId: id}, nil
}

// Server streaming: gửi nhiều phản hồi cho một yêu cầu
func (s *server) WatchOrders(req *orderv1.WatchOrdersRequest, stream orderv1.OrderService_WatchOrdersServer) error {
    for o := range s.store.Subscribe(stream.Context(), req.GetCustomerId()) {
        if err := stream.Send(o); err != nil {
            return err                             // client đã ngắt
        }
    }
    return nil
}

func main() {
    lis, err := net.Listen("tcp", ":50051")
    if err != nil {
        log.Fatal(err)
    }
    srv := grpc.NewServer(grpc.ChainUnaryInterceptor(logging, auth))   // thứ tự: logging chạy trước auth
    orderv1.RegisterOrderServiceServer(srv, &server{store: newStore()})
    reflection.Register(srv)                       // cho grpcurl liệt kê method; chỉ bật ở môi trường dev

    go func() { log.Fatal(srv.Serve(lis)) }()

    ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
    defer stop()
    <-ctx.Done()
    srv.GracefulStop()                             // chờ các lời gọi đang chạy xong rồi mới thoát
}`}</Code>
        </section>

        <section id="gg-client">
          <h2><span className="n">04</span>Client và deadline</h2>
          <Code lang="go">{`// Tạo MỘT kết nối dùng chung cho cả chương trình, đừng tạo mỗi lần gọi
conn, err := grpc.NewClient(
    "dns:///order-svc-headless:50051",
    grpc.WithTransportCredentials(insecure.NewCredentials()),   // trong cluster thường dùng mTLS hoặc service mesh thay thế
    grpc.WithDefaultServiceConfig(\`{"loadBalancingConfig":[{"round_robin":{}}]}\`), // chia tải phía client
)
if err != nil {
    log.Fatal(err)
}
defer conn.Close()
client := orderv1.NewOrderServiceClient(conn)

func createOrder(ctx context.Context, customerID string) (string, error) {
    ctx, cancel := context.WithTimeout(ctx, 2*time.Second)   // LUÔN đặt deadline, mặc định là chờ vô hạn
    defer cancel()

    resp, err := client.CreateOrder(ctx, &orderv1.CreateOrderRequest{
        CustomerId: customerID,
        Items:      []*orderv1.Item{{Sku: "sku-1", Quantity: 2}},
    })
    if err != nil {
        if status.Code(err) == codes.DeadlineExceeded {
            return "", fmt.Errorf("order-svc quá chậm: %w", err)
        }
        return "", err
    }
    return resp.GetOrderId(), nil
}`}</Code>
          <div className="note"><b>Deadline được lan truyền:</b> khi service A gọi B với deadline còn 1,5 giây, B nhận được đúng thời hạn đó qua context và có thể tự hủy việc nếu A đã bỏ cuộc. Nhờ vậy lỗi chậm không dồn ứ trong cả chuỗi service.</div>
        </section>

        <section id="gg-interceptor">
          <h2><span className="n">05</span>Interceptor và metadata</h2>
          <p><b>Interceptor</b> là middleware của gRPC: chạy trước và sau mỗi lời gọi, dùng cho log, xác thực, đo thời gian. <b>Metadata</b> là header của gRPC, dùng để chuyển token và request id.</p>
          <Code lang="go">{`// Server: ghi log mỗi lời gọi
func logging(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
    start := time.Now()
    resp, err := handler(ctx, req)                 // gọi handler thật
    slog.InfoContext(ctx, "grpc", "method", info.FullMethod, "code", status.Code(err), "took", time.Since(start))
    return resp, err
}

// Server: kiểm token trong metadata
func auth(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
    md, _ := metadata.FromIncomingContext(ctx)
    tokens := md.Get("authorization")
    if len(tokens) == 0 {
        return nil, status.Error(codes.Unauthenticated, "thiếu token")
    }
    user, err := verify(tokens[0])                 // kiểm JWT (JSON Web Token) ở đây
    if err != nil {
        return nil, status.Error(codes.Unauthenticated, "token không hợp lệ")
    }
    return handler(context.WithValue(ctx, userKey{}, user), req)   // đưa user vào context cho handler
}

// Client: gắn token vào mọi lời gọi bằng một interceptor
func withToken(token string) grpc.DialOption {
    return grpc.WithUnaryInterceptor(func(ctx context.Context, method string, req, reply any,
        cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
        ctx = metadata.AppendToOutgoingContext(ctx, "authorization", "Bearer "+token)
        return invoker(ctx, method, req, reply, cc, opts...)
    })
}`}</Code>
        </section>

        <section id="gg-errors">
          <h2><span className="n">06</span>Mã lỗi</h2>
          <p>Lỗi gRPC mang một <b>mã trạng thái</b> chuẩn kèm thông điệp. Dùng đúng mã để client biết có nên thử lại hay không.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Mã</th><th>Ý nghĩa</th><th>HTTP tương đương</th><th>Thử lại?</th></tr>
              </thead>
              <tbody>
                <tr><td><code>InvalidArgument</code></td><td>Dữ liệu gửi lên sai</td><td>400</td><td>Không</td></tr>
                <tr><td><code>Unauthenticated</code></td><td>Chưa đăng nhập hoặc token sai</td><td>401</td><td>Không</td></tr>
                <tr><td><code>PermissionDenied</code></td><td>Không đủ quyền</td><td>403</td><td>Không</td></tr>
                <tr><td><code>NotFound</code></td><td>Không tồn tại</td><td>404</td><td>Không</td></tr>
                <tr><td><code>AlreadyExists</code></td><td>Đã tồn tại</td><td>409</td><td>Không</td></tr>
                <tr><td><code>DeadlineExceeded</code></td><td>Quá thời hạn</td><td>504</td><td>Cẩn thận (có thể đã xử lý)</td></tr>
                <tr><td><code>Unavailable</code></td><td>Service tạm thời không sẵn sàng</td><td>503</td><td>Có, kèm backoff</td></tr>
                <tr><td><code>Internal</code></td><td>Lỗi phía server</td><td>500</td><td>Thường không</td></tr>
              </tbody>
            </table>
          </div>
          <Code lang="go">{`// BFF đổi mã gRPC thành mã HTTP cho client
func httpStatus(err error) int {
    switch status.Code(err) {
    case codes.OK:
        return http.StatusOK
    case codes.InvalidArgument:
        return http.StatusBadRequest
    case codes.Unauthenticated:
        return http.StatusUnauthorized
    case codes.PermissionDenied:
        return http.StatusForbidden
    case codes.NotFound:
        return http.StatusNotFound
    case codes.Unavailable:
        return http.StatusServiceUnavailable
    case codes.DeadlineExceeded:
        return http.StatusGatewayTimeout
    default:
        return http.StatusInternalServerError
    }
}`}</Code>
        </section>

        <section id="gg-prod">
          <h2><span className="n">07</span>Chia tải và health check</h2>
          <ul className="plain">
            <li><b>Chia tải:</b> gRPC giữ kết nối HTTP/2 rất lâu nên Service L4 của Kubernetes (kube-proxy) chia không đều: mọi lời gọi có thể dồn vào một pod. Dùng <b>headless Service</b> (<code>clusterIP: None</code>) để DNS trả về mọi IP, rồi bật <code>round_robin</code> phía client như ví dụ trên, hoặc dùng service mesh/Envoy (L7).</li>
            <li><b>Health check:</b> cài giao thức health chuẩn để Kubernetes kiểm tra pod còn sống không.</li>
            <li><b>Keepalive:</b> đặt <code>keepalive</code> để phát hiện kết nối chết sau khi qua NAT hoặc load balancer.</li>
            <li><b>Bảo mật:</b> trong cluster dùng mTLS (mutual TLS, TLS hai chiều) qua service mesh; xác thực người dùng bằng token trong metadata.</li>
          </ul>
          <Code lang="go">{`// Health check chuẩn của gRPC
healthSrv := health.NewServer()
healthpb.RegisterHealthServer(srv, healthSrv)
healthSrv.SetServingStatus("", healthpb.HealthCheckResponse_SERVING)`}</Code>
          <Code lang="yaml">{`# Kubernetes gọi thẳng giao thức health của gRPC (không cần công cụ ngoài)
livenessProbe:
  grpc: { port: 50051 }
readinessProbe:
  grpc: { port: 50051 }
  periodSeconds: 5`}</Code>
          <div className="note tip"><b>Thử nhanh bằng dòng lệnh:</b> <code>grpcurl -plaintext localhost:50051 list</code> liệt kê các service (cần bật reflection), <code>grpcurl -plaintext -d &apos;{"{"}&quot;customer_id&quot;:&quot;c1&quot;{"}"}&apos; localhost:50051 shop.order.v1.OrderService/CreateOrder</code> gọi thử một method.</div>
        </section>
      </main>
    </div>
  );
}
