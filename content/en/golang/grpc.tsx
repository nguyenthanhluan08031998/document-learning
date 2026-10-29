import { Code } from "@/components/Code";

export default function GoGrpcPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="gRPC in Go contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#gg-what"><span>01</span>What gRPC is</a></li>
          <li><a href="#gg-proto"><span>02</span>Writing the proto file</a></li>
          <li><a href="#gg-server"><span>03</span>Server</a></li>
          <li><a href="#gg-client"><span>04</span>Client and deadlines</a></li>
          <li><a href="#gg-interceptor"><span>05</span>Interceptors and metadata</a></li>
          <li><a href="#gg-errors"><span>06</span>Status codes</a></li>
          <li><a href="#gg-prod"><span>07</span>Load balancing and health checks</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · grpc</div>
          <h1>gRPC in Go</h1>
          <p className="lede"><b>gRPC</b> (gRPC Remote Procedure Calls) lets one service call another service's function as if it were local. The contract is written once in a <code>.proto</code> file, and client and server code is generated from it for Go and other languages. Data travels over HTTP/2 as Protocol Buffers: smaller and faster than JSON. This is how the BFF calls the BE in the system diagram on the home page.</p>
          <div className="tape" aria-hidden="true">
            <div>.proto</div>
            <div className="hw">deadline</div>
            <div>interceptor</div>
            <div>status code</div>
            <div>round_robin</div>
          </div>
        </header>

        <section id="gg-what">
          <h2><span className="n">01</span>What gRPC is</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr><th></th><th>REST + JSON</th><th>gRPC</th></tr>
              </thead>
              <tbody>
                <tr><td><b>Contract</b></td><td>Documentation (OpenAPI), can drift from the code</td><td>A proto file, generated code always matches</td></tr>
                <tr><td><b>Data</b></td><td>JSON text</td><td>Binary Protocol Buffers, smaller</td></tr>
                <tr><td><b>Protocol</b></td><td>HTTP/1.1 or HTTP/2</td><td>HTTP/2, one connection carries many calls</td></tr>
                <tr><td><b>Call styles</b></td><td>One request, one response</td><td>Unary, server streaming, client streaming, bidirectional</td></tr>
                <tr><td><b>Browsers</b></td><td>Can call directly</td><td>Need a proxy (gRPC-Web); best between services</td></tr>
                <tr><td><b>Debugging</b></td><td>curl works</td><td>Needs tools such as grpcurl</td></tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Convention:</b> use REST toward the outside (browsers, partners) and gRPC <b>between internal services</b>. See also the gRPC page in the API group.</div>
        </section>

        <section id="gg-proto">
          <h2><span className="n">02</span>Writing the proto file</h2>
          <Code lang="proto">{`// proto/order/v1/order.proto
syntax = "proto3";

package shop.order.v1;                              // the version lives in the package name so upgrades are possible later
option go_package = "example.com/shop/gen/order/v1;orderv1";

service OrderService {
  rpc CreateOrder(CreateOrderRequest) returns (CreateOrderResponse);   // unary: one request, one response
  rpc GetOrder(GetOrderRequest) returns (Order);
  rpc WatchOrders(WatchOrdersRequest) returns (stream Order);          // server streaming: replies many times
}

message Item {
  string sku = 1;                                   // the field number is the identity on the wire, never change it
  int32 quantity = 2;
}

message CreateOrderRequest {
  string customer_id = 1;
  repeated Item items = 2;                          // repeated: a list
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
            <li><b>Never change the number of a field</b> already in use and never reuse an old number. Adding a new field with a new number keeps old clients working.</li>
            <li>Use <code>reserved</code> to stop a deleted field's number or name from being reused.</li>
          </ul>
          <p>Generate the Go code (install <code>protoc-gen-go</code> and <code>protoc-gen-go-grpc</code>, or use the <code>buf</code> tool):</p>
          <Code lang="bash">{`protoc --go_out=gen --go_opt=paths=source_relative \\
       --go-grpc_out=gen --go-grpc_opt=paths=source_relative \\
       proto/order/v1/order.proto

# Or with buf: declare it in buf.gen.yaml, then run
buf generate`}</Code>
        </section>

        <section id="gg-server">
          <h2><span className="n">03</span>Server</h2>
          <Code lang="go">{`type server struct {
    orderv1.UnimplementedOrderServiceServer      // embed it so the code stays compatible when the proto gains methods
    store Store
}

func (s *server) CreateOrder(ctx context.Context, req *orderv1.CreateOrderRequest) (*orderv1.CreateOrderResponse, error) {
    if req.GetCustomerId() == "" {                // getters are nil-safe
        return nil, status.Error(codes.InvalidArgument, "customer_id is required")
    }
    id, err := s.store.Create(ctx, req.GetCustomerId(), req.GetItems())   // pass ctx down so it can be cancelled
    if err != nil {
        return nil, status.Error(codes.Internal, "could not create the order")
    }
    return &orderv1.CreateOrderResponse{OrderId: id}, nil
}

// Server streaming: send many responses for one request
func (s *server) WatchOrders(req *orderv1.WatchOrdersRequest, stream orderv1.OrderService_WatchOrdersServer) error {
    for o := range s.store.Subscribe(stream.Context(), req.GetCustomerId()) {
        if err := stream.Send(o); err != nil {
            return err                             // the client disconnected
        }
    }
    return nil
}

func main() {
    lis, err := net.Listen("tcp", ":50051")
    if err != nil {
        log.Fatal(err)
    }
    srv := grpc.NewServer(grpc.ChainUnaryInterceptor(logging, auth))   // order: logging runs before auth
    orderv1.RegisterOrderServiceServer(srv, &server{store: newStore()})
    reflection.Register(srv)                       // lets grpcurl list methods; enable only in dev

    go func() { log.Fatal(srv.Serve(lis)) }()

    ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
    defer stop()
    <-ctx.Done()
    srv.GracefulStop()                             // wait for in-flight calls to finish, then exit
}`}</Code>
        </section>

        <section id="gg-client">
          <h2><span className="n">04</span>Client and deadlines</h2>
          <Code lang="go">{`// Create ONE connection and share it across the program, not one per call
conn, err := grpc.NewClient(
    "dns:///order-svc-headless:50051",
    grpc.WithTransportCredentials(insecure.NewCredentials()),   // inside a cluster you usually use mTLS or a service mesh instead
    grpc.WithDefaultServiceConfig(\`{"loadBalancingConfig":[{"round_robin":{}}]}\`), // client-side load balancing
)
if err != nil {
    log.Fatal(err)
}
defer conn.Close()
client := orderv1.NewOrderServiceClient(conn)

func createOrder(ctx context.Context, customerID string) (string, error) {
    ctx, cancel := context.WithTimeout(ctx, 2*time.Second)   // ALWAYS set a deadline, the default is to wait forever
    defer cancel()

    resp, err := client.CreateOrder(ctx, &orderv1.CreateOrderRequest{
        CustomerId: customerID,
        Items:      []*orderv1.Item{{Sku: "sku-1", Quantity: 2}},
    })
    if err != nil {
        if status.Code(err) == codes.DeadlineExceeded {
            return "", fmt.Errorf("order-svc is too slow: %w", err)
        }
        return "", err
    }
    return resp.GetOrderId(), nil
}`}</Code>
          <div className="note"><b>Deadlines propagate:</b> when service A calls B with 1.5 seconds left, B receives exactly that deadline through the context and can drop the work if A has given up. This keeps slowness from piling up across a chain of services.</div>
        </section>

        <section id="gg-interceptor">
          <h2><span className="n">05</span>Interceptors and metadata</h2>
          <p>An <b>interceptor</b> is gRPC's middleware: it runs before and after every call, used for logging, authentication and timing. <b>Metadata</b> is gRPC's header, used to carry tokens and request ids.</p>
          <Code lang="go">{`// Server: log every call
func logging(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
    start := time.Now()
    resp, err := handler(ctx, req)                 // call the real handler
    slog.InfoContext(ctx, "grpc", "method", info.FullMethod, "code", status.Code(err), "took", time.Since(start))
    return resp, err
}

// Server: check the token in the metadata
func auth(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
    md, _ := metadata.FromIncomingContext(ctx)
    tokens := md.Get("authorization")
    if len(tokens) == 0 {
        return nil, status.Error(codes.Unauthenticated, "missing token")
    }
    user, err := verify(tokens[0])                 // verify the JWT (JSON Web Token) here
    if err != nil {
        return nil, status.Error(codes.Unauthenticated, "invalid token")
    }
    return handler(context.WithValue(ctx, userKey{}, user), req)   // put the user in the context for the handler
}

// Client: attach the token to every call with an interceptor
func withToken(token string) grpc.DialOption {
    return grpc.WithUnaryInterceptor(func(ctx context.Context, method string, req, reply any,
        cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
        ctx = metadata.AppendToOutgoingContext(ctx, "authorization", "Bearer "+token)
        return invoker(ctx, method, req, reply, cc, opts...)
    })
}`}</Code>
        </section>

        <section id="gg-errors">
          <h2><span className="n">06</span>Status codes</h2>
          <p>A gRPC error carries a standard <b>status code</b> plus a message. Use the right code so the client knows whether to retry.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Code</th><th>Meaning</th><th>HTTP equivalent</th><th>Retry?</th></tr>
              </thead>
              <tbody>
                <tr><td><code>InvalidArgument</code></td><td>The input is wrong</td><td>400</td><td>No</td></tr>
                <tr><td><code>Unauthenticated</code></td><td>Not logged in or a bad token</td><td>401</td><td>No</td></tr>
                <tr><td><code>PermissionDenied</code></td><td>Not allowed</td><td>403</td><td>No</td></tr>
                <tr><td><code>NotFound</code></td><td>Does not exist</td><td>404</td><td>No</td></tr>
                <tr><td><code>AlreadyExists</code></td><td>Already exists</td><td>409</td><td>No</td></tr>
                <tr><td><code>DeadlineExceeded</code></td><td>Took too long</td><td>504</td><td>Careful (it may have been processed)</td></tr>
                <tr><td><code>Unavailable</code></td><td>The service is temporarily unavailable</td><td>503</td><td>Yes, with backoff</td></tr>
                <tr><td><code>Internal</code></td><td>A server-side failure</td><td>500</td><td>Usually not</td></tr>
              </tbody>
            </table>
          </div>
          <Code lang="go">{`// The BFF turns a gRPC code into an HTTP status for the client
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
          <h2><span className="n">07</span>Load balancing and health checks</h2>
          <ul className="plain">
            <li><b>Load balancing:</b> gRPC keeps HTTP/2 connections open for a long time, so a Kubernetes L4 Service (kube-proxy) balances poorly: every call can pile onto one pod. Use a <b>headless Service</b> (<code>clusterIP: None</code>) so DNS returns every IP, then enable <code>round_robin</code> on the client as in the example above, or use a service mesh/Envoy (L7).</li>
            <li><b>Health checks:</b> implement the standard health protocol so Kubernetes can tell whether a pod is alive.</li>
            <li><b>Keepalive:</b> set <code>keepalive</code> to detect dead connections after NAT or a load balancer.</li>
            <li><b>Security:</b> inside a cluster use mTLS (mutual TLS) through a service mesh; authenticate users with a token in the metadata.</li>
          </ul>
          <Code lang="go">{`// The standard gRPC health check
healthSrv := health.NewServer()
healthpb.RegisterHealthServer(srv, healthSrv)
healthSrv.SetServingStatus("", healthpb.HealthCheckResponse_SERVING)`}</Code>
          <Code lang="yaml">{`# Kubernetes calls gRPC's health protocol directly (no extra tool needed)
livenessProbe:
  grpc: { port: 50051 }
readinessProbe:
  grpc: { port: 50051 }
  periodSeconds: 5`}</Code>
          <div className="note tip"><b>Try it from the command line:</b> <code>grpcurl -plaintext localhost:50051 list</code> lists the services (reflection must be on), and <code>grpcurl -plaintext -d &apos;{"{"}&quot;customer_id&quot;:&quot;c1&quot;{"}"}&apos; localhost:50051 shop.order.v1.OrderService/CreateOrder</code> calls a method.</div>
        </section>
      </main>
    </div>
  );
}
