import { Code } from "@/components/Code";

export default function GoStdlibPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục thư viện chuẩn của Go">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#gl-io"><span>01</span>io.Reader và io.Writer</a></li>
          <li><a href="#gl-json"><span>02</span>encoding/json</a></li>
          <li><a href="#gl-time"><span>03</span>time</a></li>
          <li><a href="#gl-slog"><span>04</span>log/slog</a></li>
          <li><a href="#gl-misc"><span>05</span>strings, slices, maps</a></li>
          <li><a href="#gl-map"><span>06</span>Bản đồ các package</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · standard library</div>
          <h1>Thư viện chuẩn hay dùng</h1>
          <p className="lede">Thư viện chuẩn của Go đủ mạnh để viết phần lớn service mà không cần thư viện ngoài. Điểm cốt lõi là <b>các interface nhỏ</b> (<code>io.Reader</code>, <code>io.Writer</code>) cho phép ghép các mảnh với nhau. Trang này đi qua những package bạn sẽ gặp mỗi ngày.</p>
          <div className="tape" aria-hidden="true">
            <div className="hw">io.Reader</div>
            <div>json</div>
            <div>time</div>
            <div>slog</div>
            <div>slices</div>
          </div>
        </header>

        <section id="gl-io">
          <h2><span className="n">01</span>io.Reader và io.Writer</h2>
          <p>Hai interface chỉ có một method nhưng là nền của gần như mọi thao tác dữ liệu: file, kết nối mạng, body HTTP, bộ đệm, nén. Vì dùng chung interface nên ghép chúng lại rất tự nhiên.</p>
          <Code lang="go">{`type Reader interface { Read(p []byte) (n int, err error) }
type Writer interface { Write(p []byte) (n int, err error) }

// Chép từ nguồn bất kỳ sang đích bất kỳ, không tải cả file vào bộ nhớ
func serveFile(w http.ResponseWriter, path string) error {
    f, err := os.Open(path)
    if err != nil {
        return err
    }
    defer f.Close()
    _, err = io.Copy(w, f)                  // http.ResponseWriter cũng là io.Writer
    return err
}

// Ghép các mảnh với nhau
limited := io.LimitReader(r.Body, 1<<20)    // chỉ đọc tối đa 1 MiB
both := io.MultiWriter(os.Stdout, logFile)  // ghi vào hai nơi cùng lúc
tee := io.TeeReader(src, hasher)            // đọc nguồn và đồng thời đưa dữ liệu vào bộ băm

data, err := io.ReadAll(limited)            // đọc hết (cẩn thận với dữ liệu lớn)

// Đọc từng dòng của một file lớn
sc := bufio.NewScanner(f)
sc.Buffer(make([]byte, 0, 64*1024), 1<<20)  // mặc định dòng dài hơn 64 KiB sẽ lỗi, nới ra nếu cần
for sc.Scan() {
    handle(sc.Text())
}
if err := sc.Err(); err != nil { /* xử lý lỗi đọc */ }`}</Code>
          <div className="note tip"><b>Quy ước:</b> hàm nhận <code>io.Reader</code>/<code>io.Writer</code> thay vì <code>[]byte</code> hay <code>*os.File</code> thì test được bằng <code>strings.NewReader</code> và <code>bytes.Buffer</code>, và xử lý được dữ liệu lớn dạng luồng.</div>
        </section>

        <section id="gl-json">
          <h2><span className="n">02</span>encoding/json</h2>
          <Code lang="go">{`type Order struct {
    ID        string    \`json:"id"\`
    Note      string    \`json:"note,omitempty"\`   // bỏ field khi rỗng
    Total     int64     \`json:"total"\`
    CreatedAt time.Time \`json:"created_at"\`        // time.Time tự mã hóa theo RFC 3339
    secret    string                               // chữ thường: không export nên không vào JSON
}

// Struct -> JSON
b, err := json.Marshal(order)
json.NewEncoder(w).Encode(order)            // ghi thẳng ra io.Writer

// JSON -> struct, đọc từ luồng
dec := json.NewDecoder(r.Body)
dec.DisallowUnknownFields()                 // báo lỗi nếu client gửi field lạ
var in Order
if err := dec.Decode(&in); err != nil {
    http.Error(w, "json không hợp lệ", http.StatusBadRequest)
    return
}

// Khi chưa biết cấu trúc
var any map[string]any
json.Unmarshal(b, &any)                     // số sẽ thành float64, nhớ ép kiểu khi dùng

// Giải mã trễ một phần: giữ nguyên JSON thô
type Event struct {
    Type string          \`json:"type"\`
    Data json.RawMessage \`json:"data"\`     // đọc Type trước rồi mới giải mã Data theo loại
}`}</Code>
          <ul className="plain">
            <li>Chỉ field <b>viết hoa</b> mới được mã hóa. Quên đổi sang chữ hoa là lỗi hay gặp nhất.</li>
            <li>Số nguyên lớn (id 64 bit) nên truyền dạng chuỗi với JavaScript, vì JS mất độ chính xác trên 2^53.</li>
            <li>Cần kiểm soát cách mã hóa riêng (ví dụ tiền, enum) thì cài <code>MarshalJSON</code>/<code>UnmarshalJSON</code> cho kiểu đó.</li>
          </ul>
        </section>

        <section id="gl-time">
          <h2><span className="n">03</span>time</h2>
          <Code lang="go">{`d := 5 * time.Second                       // Duration là một kiểu, không phải số trần
timeout := 2*time.Minute + 30*time.Second

start := time.Now()
doWork()
elapsed := time.Since(start)                // Duration đã trôi qua
fmt.Println(elapsed.Milliseconds())

// Định dạng theo MẪU CỐ ĐỊNH: 2006-01-02 15:04:05 (đây là thời điểm mẫu của Go, không phải chữ giả)
t.Format("2006-01-02 15:04:05")
t.Format(time.RFC3339)                      // 2026-10-26T09:30:00+07:00, dùng cho API
parsed, err := time.Parse(time.RFC3339, "2026-10-26T09:30:00+07:00")

// Múi giờ
loc, _ := time.LoadLocation("Asia/Ho_Chi_Minh")
local := t.In(loc)                          // chỉ đổi cách hiển thị, cùng một thời điểm
utc := t.UTC()

// Cộng trừ, so sánh
tomorrow := t.Add(24 * time.Hour)
t.Before(other); t.After(other); t.Equal(other)   // dùng Equal, đừng dùng == với time.Time

// Timer và ticker
timer := time.NewTimer(3 * time.Second)
defer timer.Stop()
tick := time.NewTicker(time.Second)
defer tick.Stop()                           // luôn Stop để giải phóng tài nguyên`}</Code>
          <div className="pp">
            <div><span className="pl">Nên làm</span>Lưu và truyền thời gian ở <b>UTC</b> (Coordinated Universal Time), dùng <code>RFC3339</code> trong API, đổi sang múi giờ người dùng ở tầng hiển thị.</div>
            <div className="warnc"><span className="pl">Tránh</span><code>time.After</code> trong vòng lặp nóng (mỗi lần tạo một timer mới, giữ tới khi hết hạn); dùng <code>time.NewTimer</code> và <code>Reset</code>. Và đừng so sánh <code>time.Time</code> bằng <code>==</code>.</div>
          </div>
        </section>

        <section id="gl-slog">
          <h2><span className="n">04</span>log/slog</h2>
          <p><code>slog</code> (từ Go 1.21) là logger có cấu trúc trong thư viện chuẩn: mỗi dòng log là các cặp khóa-giá trị, xuất ra JSON để công cụ log đọc được. Xem thêm nhóm Vận hành về structured logging.</p>
          <Code lang="go">{`logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
    Level: slog.LevelInfo,                  // chỉ in Info trở lên
}))
slog.SetDefault(logger)

slog.Info("tạo đơn hàng", "order_id", id, "total", 1200)
// {"time":"...","level":"INFO","msg":"tạo đơn hàng","order_id":"o-1","total":1200}

// Gắn sẵn các trường chung cho mọi dòng log của một thành phần
orderLog := logger.With("service", "order-svc")
orderLog.Error("thanh toán thất bại", "order_id", id, "err", err)

// Truyền ngữ cảnh để handler lấy request id từ context
slog.ErrorContext(ctx, "gọi payment lỗi", "err", err)

// Nhóm các trường liên quan
slog.Info("request", slog.Group("http", "method", "GET", "path", "/users/1", "status", 200))`}</Code>
          <div className="note"><b>Đừng log dữ liệu nhạy cảm</b> (mật khẩu, token, số thẻ). Log lỗi một lần ở tầng ngoài cùng thay vì ở mỗi tầng, để không có một lỗi bị ghi nhiều lần.</div>
        </section>

        <section id="gl-misc">
          <h2><span className="n">05</span>strings, slices, maps</h2>
          <Code lang="go">{`// strings
strings.Split("a,b,c", ",")                 // ["a" "b" "c"]
strings.Join([]string{"a", "b"}, "-")       // "a-b"
strings.Contains(s, "x"); strings.HasPrefix(s, "go"); strings.TrimSpace(s)
strings.ToLower(s); strings.ReplaceAll(s, "a", "b")

var sb strings.Builder                      // ghép chuỗi trong vòng lặp: dùng Builder, đừng dùng +=
for i := 0; i < 3; i++ {
    fmt.Fprintf(&sb, "%d,", i)
}
result := sb.String()

// strconv
n, err := strconv.Atoi("42")
s := strconv.Itoa(42)
f, err := strconv.ParseFloat("3.14", 64)

// slices và maps (Go 1.21+)
xs := []int{3, 1, 2}
slices.Sort(xs)                             // [1 2 3]
slices.Contains(xs, 2)                      // true
i, found := slices.BinarySearch(xs, 2)
slices.Reverse(xs)
ys := slices.Clone(xs)                      // bản sao độc lập

m := map[string]int{"a": 1, "b": 2}
keys := slices.Sorted(maps.Keys(m))         // Go 1.23: lấy key rồi sắp xếp cho thứ tự ổn định
delete(m, "a")
maps.Copy(dst, m)

// Sắp xếp theo tiêu chí riêng
slices.SortFunc(users, func(a, b User) int {
    return strings.Compare(a.Name, b.Name)
})`}</Code>
        </section>

        <section id="gl-map">
          <h2><span className="n">06</span>Bản đồ các package</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Cần làm</th><th>Package</th></tr>
              </thead>
              <tbody>
                <tr><td>Đọc ghi file, biến môi trường, tham số</td><td><code>os</code>, <code>flag</code>, <code>path/filepath</code>, <code>bufio</code></td></tr>
                <tr><td>HTTP server và client</td><td><code>net/http</code>, <code>net/http/httptest</code>, <code>net/url</code></td></tr>
                <tr><td>Mã hóa dữ liệu</td><td><code>encoding/json</code>, <code>encoding/base64</code>, <code>encoding/csv</code></td></tr>
                <tr><td>Băm, mã hóa, ngẫu nhiên an toàn</td><td><code>crypto/sha256</code>, <code>crypto/hmac</code>, <code>crypto/rand</code></td></tr>
                <tr><td>Đồng thời, hủy việc</td><td><code>sync</code>, <code>sync/atomic</code>, <code>context</code></td></tr>
                <tr><td>Lỗi</td><td><code>errors</code>, <code>fmt</code> (<code>%w</code>)</td></tr>
                <tr><td>Biểu thức chính quy</td><td><code>regexp</code> (chậm hơn so sánh chuỗi, dùng khi thật sự cần)</td></tr>
                <tr><td>Nhúng file vào binary</td><td><code>embed</code> (<code>{"//go:embed"}</code>)</td></tr>
                <tr><td>Chẩn đoán</td><td><code>runtime/pprof</code>, <code>net/http/pprof</code>, <code>runtime/trace</code></td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
