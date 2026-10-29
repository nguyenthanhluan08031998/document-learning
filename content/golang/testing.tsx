import { Code } from "@/components/Code";

export default function GoTestingPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục test trong Go">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#gt-basic"><span>01</span>Test cơ bản, table-driven</a></li>
          <li><a href="#gt-fake"><span>02</span>Giả lập bằng interface</a></li>
          <li><a href="#gt-http"><span>03</span>Test HTTP handler</a></li>
          <li><a href="#gt-db"><span>04</span>Test với database thật</a></li>
          <li><a href="#gt-bench"><span>05</span>Benchmark, fuzz, race</a></li>
          <li><a href="#gt-tips"><span>06</span>Thói quen tốt</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · testing</div>
          <h1>Test trong Go</h1>
          <p className="lede">Go có sẵn công cụ test trong thư viện chuẩn: không cần framework. Quy ước: file kết thúc bằng <code>_test.go</code>, hàm bắt đầu bằng <code>Test</code>, chạy bằng <code>go test</code>. Cách viết quen thuộc nhất là <b>table-driven test</b>: một bảng các trường hợp, một vòng lặp chạy hết.</p>
          <div className="tape" aria-hidden="true">
            <div>_test.go</div>
            <div className="hw">table-driven</div>
            <div>httptest</div>
            <div>-race</div>
            <div>Benchmark</div>
          </div>
        </header>

        <section id="gt-basic">
          <h2><span className="n">01</span>Test cơ bản, table-driven</h2>
          <Code lang="go">{`// port_test.go (cùng package với code cần test)
package config

import "testing"

func TestParsePort(t *testing.T) {
    tests := []struct {
        name    string
        in      string
        want    int
        wantErr bool
    }{
        {"hợp lệ", "8080", 8080, false},
        {"không phải số", "abc", 0, true},
        {"vượt giới hạn", "70000", 0, true},
        {"rỗng", "", 0, true},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {   // mỗi trường hợp là một test con, lỗi chỉ rõ tên
            t.Parallel()                      // chạy song song (an toàn từ Go 1.22 vì tt riêng cho mỗi vòng)
            got, err := parsePort(tt.in)
            if (err != nil) != tt.wantErr {
                t.Fatalf("parsePort(%q) lỗi = %v, mong đợi lỗi = %v", tt.in, err, tt.wantErr)
            }
            if got != tt.want {
                t.Errorf("parsePort(%q) = %d, mong đợi %d", tt.in, got, tt.want)
            }
        })
    }
}`}</Code>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Hàm</th><th>Khi gặp lỗi</th></tr>
              </thead>
              <tbody>
                <tr><td><code>t.Errorf</code></td><td>Ghi lỗi và <b>chạy tiếp</b> để thấy hết các lỗi</td></tr>
                <tr><td><code>t.Fatalf</code></td><td>Ghi lỗi và <b>dừng</b> test này (dùng khi các bước sau vô nghĩa)</td></tr>
                <tr><td><code>t.Helper()</code></td><td>Đánh dấu hàm phụ để dòng báo lỗi trỏ về nơi gọi</td></tr>
                <tr><td><code>t.Cleanup(fn)</code></td><td>Dọn dẹp khi test kết thúc, chạy ngược thứ tự đăng ký</td></tr>
                <tr><td><code>t.TempDir()</code></td><td>Thư mục tạm, tự xóa sau test</td></tr>
              </tbody>
            </table>
          </div>
          <Code lang="bash">{`go test ./...                     # chạy toàn bộ test trong project
go test -run TestParsePort ./config   # chỉ chạy test khớp tên
go test -v ./...                  # in chi tiết từng test
go test -count=1 ./...            # bỏ cache kết quả, buộc chạy lại
go test -cover ./...              # xem độ phủ code
go test -coverprofile=c.out ./... && go tool cover -html=c.out   # xem phần nào chưa được test`}</Code>
        </section>

        <section id="gt-fake">
          <h2><span className="n">02</span>Giả lập bằng interface</h2>
          <p>Vì interface của Go được thỏa mãn ngầm, ta giả lập (fake) phần phụ thuộc bằng cách viết một struct nhỏ có cùng method, không cần thư viện mock. Điều kiện: code cần test nhận <b>interface</b> thay vì kiểu cụ thể (xem trang Lỗi &amp; Interface).</p>
          <Code lang="go">{`// Service phụ thuộc vào interface UserStore
type fakeStore struct {
    users map[int]*User
    err   error                       // đặt lỗi để thử nhánh lỗi
}

func (f fakeStore) Find(ctx context.Context, id int) (*User, error) {
    if f.err != nil {
        return nil, f.err
    }
    u, ok := f.users[id]
    if !ok {
        return nil, ErrNotFound
    }
    return u, nil
}

func TestService_Greet(t *testing.T) {
    svc := NewService(fakeStore{users: map[int]*User{1: {ID: 1, Name: "Lan"}}})

    got, err := svc.Greet(context.Background(), 1)
    if err != nil || got != "Xin chào Lan" {
        t.Fatalf("got %q, %v", got, err)
    }

    _, err = svc.Greet(context.Background(), 99)
    if !errors.Is(err, ErrNotFound) {    // kiểm tra đúng loại lỗi, không so chuỗi
        t.Fatalf("mong đợi ErrNotFound, nhận %v", err)
    }
}`}</Code>
          <div className="note tip"><b>Fake hay mock?</b> Fake là bản cài đặt đơn giản chạy thật (như trên). Mock (<code>gomock</code>, <code>mockery</code>) ghi lại lời gọi để kiểm tra &quot;hàm này được gọi đúng một lần với tham số X&quot;. Ưu tiên fake vì ít gắn chặt vào cách cài đặt bên trong.</div>
        </section>

        <section id="gt-http">
          <h2><span className="n">03</span>Test HTTP handler</h2>
          <p>Gói <code>net/http/httptest</code> cho phép gọi handler mà không mở cổng mạng.</p>
          <Code lang="go">{`func TestGetUser(t *testing.T) {
    h := &userHandler{store: fakeStore{users: map[int]*User{1: {ID: 1, Name: "Lan"}}}}
    mux := routes(h)

    tests := []struct {
        name string
        path string
        want int
    }{
        {"tìm thấy", "/users/1", http.StatusOK},
        {"không tìm thấy", "/users/99", http.StatusNotFound},
        {"id sai", "/users/abc", http.StatusBadRequest},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            req := httptest.NewRequest(http.MethodGet, tt.path, nil)
            rec := httptest.NewRecorder()     // ghi lại response thay vì gửi qua mạng
            mux.ServeHTTP(rec, req)

            if rec.Code != tt.want {
                t.Errorf("status = %d, mong đợi %d, body = %s", rec.Code, tt.want, rec.Body)
            }
        })
    }
}

// Test client gọi một API bên ngoài: dựng server giả
func TestFetchRate(t *testing.T) {
    srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprint(w, \`{"usd_vnd": 25000}\`)
    }))
    defer srv.Close()

    rate, err := FetchRate(srv.URL)           // truyền địa chỉ server giả vào code cần test
    if err != nil || rate != 25000 {
        t.Fatalf("got %v, %v", rate, err)
    }
}`}</Code>
        </section>

        <section id="gt-db">
          <h2><span className="n">04</span>Test với database thật</h2>
          <p>Test unit dùng fake rất nhanh, nhưng không bắt được lỗi SQL (Structured Query Language) hay migration. Với phần truy cập database nên có thêm <b>integration test</b> chạy trên PostgreSQL thật, thường dựng bằng container tạm với <code>testcontainers-go</code>.</p>
          <Code lang="go">{`func newTestDB(t *testing.T) *sql.DB {
    t.Helper()
    if testing.Short() {
        t.Skip("bỏ qua integration test khi chạy -short")
    }
    ctx := context.Background()

    // Khởi động PostgreSQL trong container (API của thư viện thay đổi theo phiên bản, xem tài liệu)
    ctr, err := postgres.Run(ctx, "postgres:16-alpine",
        postgres.WithDatabase("shop"), postgres.WithUsername("test"), postgres.WithPassword("test"))
    if err != nil {
        t.Fatal(err)
    }
    t.Cleanup(func() { _ = ctr.Terminate(ctx) })     // tự dọn container khi test xong

    dsn, _ := ctr.ConnectionString(ctx, "sslmode=disable")
    db, err := sql.Open("pgx", dsn)
    if err != nil {
        t.Fatal(err)
    }
    runMigrations(t, db)                              // dựng schema giống production
    return db
}

func TestStore_Find(t *testing.T) {
    store := NewStore(newTestDB(t))
    // ... insert dữ liệu mẫu rồi gọi store.Find và kiểm tra kết quả
}`}</Code>
          <ul className="plain">
            <li>Mỗi test nên dùng dữ liệu riêng hoặc bọc trong một transaction rồi rollback để các test không ảnh hưởng nhau.</li>
            <li>Tách integration test bằng <code>testing.Short()</code> hoặc build tag, để CI (Continuous Integration) chạy cả hai còn máy cá nhân chỉ chạy bản nhanh.</li>
          </ul>
        </section>

        <section id="gt-bench">
          <h2><span className="n">05</span>Benchmark, fuzz, race</h2>
          <Code lang="go">{`// Benchmark: đo thời gian và số lần cấp phát bộ nhớ
func BenchmarkParsePort(b *testing.B) {
    for i := 0; i < b.N; i++ {            // Go 1.24+ có thể dùng: for b.Loop() { ... }
        parsePort("8080")
    }
}

// Fuzz: Go tự sinh đầu vào ngẫu nhiên để tìm panic và lỗi bất ngờ
func FuzzParsePort(f *testing.F) {
    f.Add("8080")                         // dữ liệu mẫu ban đầu
    f.Fuzz(func(t *testing.T, s string) {
        parsePort(s)                      // không được panic với bất kỳ chuỗi nào
    })
}`}</Code>
          <Code lang="bash">{`go test -bench=. -benchmem ./...          # chạy benchmark, in thêm số lần cấp phát
go test -fuzz=FuzzParsePort -fuzztime=30s # chạy fuzz 30 giây
go test -race ./...                       # phát hiện data race (CI nên luôn bật)`}</Code>
          <div className="note"><b>Đọc kết quả benchmark:</b> <code>ns/op</code> là nanogiây mỗi lần chạy, <code>allocs/op</code> là số lần cấp phát heap. Hai con số này giúp bạn so sánh trước và sau khi tối ưu (xem trang Bộ nhớ và Production).</div>
        </section>

        <section id="gt-tips">
          <h2><span className="n">06</span>Thói quen tốt</h2>
          <ul className="plain">
            <li><b>Test hành vi, không test cài đặt:</b> kiểm tra kết quả nhìn thấy từ ngoài, để refactor bên trong không làm vỡ test.</li>
            <li><b>Tên test mô tả tình huống:</b> <code>TestTransfer_InsufficientFunds</code> hơn là <code>TestTransfer2</code>.</li>
            <li><b>Dùng <code>errors.Is</code>/<code>errors.As</code></b> để kiểm tra lỗi, đừng so sánh chuỗi.</li>
            <li><b>Đừng <code>time.Sleep</code> để chờ:</b> dùng channel, <code>sync.WaitGroup</code> hoặc inject đồng hồ giả; nếu không test sẽ chậm và lúc chạy được lúc không.</li>
            <li><b>Golden file:</b> với đầu ra dài (JSON, HTML), lưu kết quả mong đợi vào <code>testdata/</code> rồi so sánh.</li>
            <li><b>Thư viện hỗ trợ so sánh:</b> <code>github.com/google/go-cmp/cmp</code> in ra khác biệt dễ đọc; <code>testify</code> có <code>assert</code>/<code>require</code> nếu team muốn gọn hơn.</li>
            <li>Chạy <code>go vet ./...</code> và <code>go test -race ./...</code> trong CI trước mỗi lần merge.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
