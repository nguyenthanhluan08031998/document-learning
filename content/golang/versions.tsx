import { CodeCompare } from "@/components/CodeCompare";

// Every release from 1.0 to the current one: [version, release month, highlights]
const RELEASES: [string, string, string][] = [
  ["1.0", "03/2012", "Bản ổn định đầu tiên. Cam kết tương thích Go 1: code viết cho 1.0 vẫn build được ở mọi bản 1.x."],
  ["1.1", "05/2013", "Race detector (go test -race). int là 64-bit trên máy 64-bit."],
  ["1.2", "12/2013", "Scheduler có thể chuyển goroutine ở đầu lời gọi hàm (preemption một phần). Slice ba chỉ số a[i:j:k]."],
  ["1.3", "06/2014", "Stack liên tục (copy stack khi lớn lên) thay cho segmented stack. GC chính xác cho heap."],
  ["1.4", "12/2014", "Runtime phần lớn viết lại bằng Go. go generate, thư mục internal/."],
  ["1.5", "08/2015", "Compiler tự viết bằng Go (bỏ C). GC chạy song song (concurrent), pause từ hàng trăm ms xuống dưới 10 ms. GOMAXPROCS mặc định bằng số CPU."],
  ["1.6", "02/2016", "net/http hỗ trợ HTTP/2 mặc định. vendor/ bật mặc định."],
  ["1.7", "08/2016", "Gói context vào thư viện chuẩn. Backend SSA cho amd64, binary nhanh và nhỏ hơn."],
  ["1.8", "02/2017", "GC pause thường dưới 100 µs. sort.Slice. http.Server.Shutdown (graceful shutdown)."],
  ["1.9", "08/2017", "Type alias (type A = B). sync.Map. math/bits."],
  ["1.10", "02/2018", "Build cache và test cache."],
  ["1.11", "08/2018", "Go modules (go.mod) dạng thử nghiệm. WebAssembly."],
  ["1.12", "02/2019", "TLS 1.3 (bật tuỳ chọn). Cải tiến modules."],
  ["1.13", "09/2019", "Error wrapping: %w, errors.Is, errors.As. GOPROXY mặc định proxy.golang.org. Literal 0b1010, 1_000_000."],
  ["1.14", "02/2020", "Asynchronous preemption: goroutine chạy vòng lặp dài không còn chiếm P mãi. Modules sẵn sàng cho production. defer gần như không tốn chi phí."],
  ["1.15", "08/2020", "Linker nhanh hơn, binary nhỏ hơn."],
  ["1.16", "02/2021", "//go:embed. Modules bật mặc định (GO111MODULE=on). io/fs. Hỗ trợ Apple M1."],
  ["1.17", "08/2021", "Gọi hàm truyền tham số qua thanh ghi (register ABI), nhanh hơn khoảng 5%. Module graph pruning."],
  ["1.18", "03/2022", "Generics (type parameter). Fuzzing (go test -fuzz). Workspaces (go.work). any = interface{}."],
  ["1.19", "08/2022", "GOMEMLIMIT (giới hạn bộ nhớ mềm). Kiểu atomic.Int64, atomic.Pointer[T]."],
  ["1.20", "02/2023", "PGO bản xem trước. errors.Join (gộp nhiều lỗi). context.WithCancelCause."],
  ["1.21", "08/2023", "min, max, clear. Gói log/slog, slices, maps, cmp. PGO chính thức. Dòng toolchain trong go.mod; số phiên bản đổi sang dạng 1.21.0."],
  ["1.22", "02/2024", "Biến vòng lặp for tạo mới mỗi vòng (hết bug closure bắt nhầm biến). for i := range 10. ServeMux định tuyến theo method và wildcard: \"GET /users/{id}\". math/rand/v2."],
  ["1.23", "08/2024", "Range over function (iterator), gói iter. Gói unique. Timer/Ticker không còn bị giữ lại khi không Stop."],
  ["1.24", "02/2025", "Generic type alias. Map đổi sang Swiss Tables (nhanh hơn). sync.Map viết lại. Dòng tool trong go.mod. os.Root, gói weak, runtime.AddCleanup, testing.B.Loop, json omitzero."],
  ["1.25", "08/2025", "GOMAXPROCS tự theo giới hạn CPU của container (cgroup). Green Tea GC thử nghiệm. testing/synctest chính thức. sync.WaitGroup.Go. Trace flight recorder."],
  ["1.26", "02/2026", "new(expr) nhận giá trị khởi tạo. Generic type tự tham chiếu. Green Tea GC mặc định (giảm 10–40% chi phí GC). cgo nhanh hơn ~30%. errors.AsType. go fix viết lại với modernizer."],
  ["1.27", "08/2026", "Generic method (method có type parameter riêng). encoding/json/v2 chính thức, encoding/json chạy trên v2. Gói uuid. Profile goroutineleak chính thức. Cấp phát object nhỏ nhanh hơn tới 30%. crypto/mldsa (chữ ký hậu lượng tử)."],
];

export default function GoVersionsPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục phiên bản Go">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#gv-intro"><span>01</span>Go là gì</a></li>
          <li><a href="#gv-table"><span>02</span>Các phiên bản</a></li>
          <li><a href="#gv-milestones"><span>03</span>Bước ngoặt</a></li>
          <li><a href="#gv-diff"><span>04</span>Code khác nhau</a></li>
          <li><a href="#gv-support"><span>05</span>Hỗ trợ, nâng cấp</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · phiên bản</div>
          <h1>Go: phiên bản và năm ra mắt</h1>
          <p className="lede">Go ra một bản lớn mỗi sáu tháng (tháng 2 và tháng 8). Bản hiện tại là <b>Go 1.27</b> (08/2026). Trang này liệt kê từng bản, những thay đổi đáng nhớ và code khác nhau giữa các đời.</p>
          <div className="tape" aria-hidden="true">
            <div>1.5 concurrent GC</div>
            <div>1.11 modules</div>
            <div>1.14 preemption</div>
            <div className="hw">1.18 generics</div>
            <div>1.22 loopvar</div>
            <div>1.23 iterators</div>
            <div>1.27 generic methods</div>
          </div>
        </header>

        <section id="gv-intro">
          <h2><span className="n">01</span>Go là gì</h2>
          <p>Go (Golang) là ngôn ngữ biên dịch, kiểu tĩnh, có garbage collector, do Robert Griesemer, Rob Pike và Ken Thompson thiết kế ở Google từ 2007. Công bố mã nguồn mở <b>11/2009</b>, bản ổn định <b>Go 1.0 ra 03/2012</b>.</p>
          <div className="pp">
            <div><span className="pl">Biên dịch ra một file</span>Binary tĩnh, không cần runtime cài sẵn, rất hợp Docker image nhỏ.</div>
            <div><span className="pl">Concurrency rẻ</span>Goroutine chỉ tốn vài KB stack, chạy hàng trăm nghìn cái cùng lúc. Giao tiếp qua channel.</div>
            <div><span className="pl">Ngôn ngữ nhỏ</span>Ít từ khoá, một cách format (gofmt), không có kế thừa class; dùng struct, interface và composition.</div>
            <div><span className="pl">Dùng ở đâu</span>Backend, microservice, CLI, hạ tầng: Docker, Kubernetes, Terraform, Prometheus đều viết bằng Go.</div>
          </div>
        </section>

        <section id="gv-table">
          <h2><span className="n">02</span>Các phiên bản</h2>
          <div className="tbl">
            <table>
              <thead><tr><th>Bản</th><th>Ra mắt</th><th>Điểm chính</th></tr></thead>
              <tbody>
                {RELEASES.map(([v, d, h]) => (
                  <tr key={v}><td className="v" style={{ whiteSpace: "nowrap" }}>Go {v}</td><td className="v">{d}</td><td>{h}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="sub">Từ 1.21, bản đầu tiên của mỗi đời có đuôi .0 (go1.21.0); các bản vá là 1.21.1, 1.21.2... Trước đó bản đầu là go1.20, vá là go1.20.1.</p>
        </section>

        <section id="gv-milestones">
          <h2><span className="n">03</span>Những bước ngoặt cần nhớ</h2>
          <div className="tbl">
            <table>
              <thead><tr><th>Mốc</th><th>Trước</th><th>Sau</th></tr></thead>
              <tbody>
                <tr><td><b>1.5</b> · GC</td><td>Stop-the-world, pause hàng trăm ms với heap lớn</td><td>Concurrent mark &amp; sweep, pause dưới 10 ms (1.8: dưới 100 µs)</td></tr>
                <tr><td><b>1.11–1.16</b> · Modules</td><td>GOPATH: mọi code nằm trong một thư mục, không khoá phiên bản thư viện</td><td>go.mod, go.sum: mỗi project tự khai báo phiên bản, đặt ở đâu cũng được</td></tr>
                <tr><td><b>1.13</b> · Lỗi</td><td>So chuỗi lỗi, mất lỗi gốc khi bọc</td><td><code>fmt.Errorf(&quot;...: %w&quot;, err)</code>, <code>errors.Is</code>, <code>errors.As</code></td></tr>
                <tr><td><b>1.14</b> · Preemption</td><td>Vòng lặp không gọi hàm có thể giữ P mãi, GC phải chờ</td><td>Runtime gửi signal để ngắt goroutine chạy quá 10 ms</td></tr>
                <tr><td><b>1.18</b> · Generics</td><td>Viết lại hàm cho từng kiểu hoặc dùng interface{} + ép kiểu</td><td><code>func Map[T, U any](s []T, f func(T) U) []U</code></td></tr>
                <tr><td><b>1.21</b> · Thư viện chuẩn</td><td>Cần thư viện ngoài cho log có cấu trúc, xử lý slice</td><td>log/slog, slices, maps, min/max có sẵn</td></tr>
                <tr><td><b>1.22</b> · Biến vòng lặp</td><td>Mọi vòng lặp dùng chung một biến, goroutine/closure bắt nhầm giá trị cuối</td><td>Mỗi vòng một biến mới</td></tr>
                <tr><td><b>1.23</b> · Iterator</td><td>Tự viết Next()/channel để duyệt</td><td><code>for v := range seq</code> với <code>iter.Seq[T]</code></td></tr>
                <tr><td><b>1.24</b> · Map</td><td>Bucket 8 ô + overflow bucket</td><td>Swiss Tables, nhanh hơn và tốn ít bộ nhớ hơn</td></tr>
                <tr><td><b>1.25–1.26</b> · Container, GC</td><td>GOMAXPROCS = số CPU của máy, kể cả khi container chỉ được 2 CPU</td><td>Tự theo CPU limit; Green Tea GC mặc định</td></tr>
                <tr><td><b>1.27</b> · Generic method</td><td>Method không có type parameter riêng, phải viết hàm rời</td><td><code>func (c *Cache) Get[T any](key string) (T, bool)</code></td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="gv-diff">
          <h2><span className="n">04</span>Code khác nhau giữa các đời</h2>
          <h3>Biến vòng lặp (1.22)</h3>
          <CodeCompare go={`for _, v := range []int{1, 2, 3} {
    go func() { fmt.Println(v) }()
}
// trước 1.22: thường in 3 3 3 (mọi goroutine dùng chung biến v), phải viết v := v
// từ 1.22:    in 1 2 3 theo thứ tự bất kỳ (mỗi vòng một biến v mới)`} js={`for (const v of [1, 2, 3]) {
  setTimeout(() => console.log(v)); // let/const are per-iteration: prints 1 2 3
}
// The old var behavior matched Go before 1.22:
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3`} />

          <h3>Range over int (1.22) và iterator (1.23)</h3>
          <CodeCompare go={`for i := range 3 { fmt.Println(i) } // 0 1 2

// Iterator: hàm nhận yield, trả false để dừng sớm
func Evens(n int) iter.Seq[int] {
    return func(yield func(int) bool) {
        for i := 0; i < n; i += 2 {
            if !yield(i) { return }
        }
    }
}
for v := range Evens(10) { fmt.Println(v) }
keys := slices.Sorted(maps.Keys(m)) // các gói chuẩn đã trả iterator`} js={`for (let i = 0; i < 3; i++) console.log(i); // 0 1 2

// Iterator: a generator; the loop calls return() when it breaks early
function* evens(n) {
  for (let i = 0; i < n; i += 2) yield i;
}
for (const v of evens(10)) console.log(v);
const keys = [...map.keys()].sort(); // built-ins already return iterators`} />

          <h3>Generics (1.18), generic type alias (1.24), generic method (1.27)</h3>
          <CodeCompare jsLang="ts" go={`// 1.18: hàm và kiểu generic
func Map[T, U any](s []T, f func(T) U) []U {
    out := make([]U, 0, len(s))
    for _, v := range s { out = append(out, f(v)) }
    return out
}

// 1.24: alias có type parameter
type Set[T comparable] = map[T]struct{}

// 1.27: method có type parameter riêng
type Store struct{ data map[string]any }
func (s *Store) Get[T any](key string) (T, bool) {
    v, ok := s.data[key].(T)
    return v, ok
}
n, _ := store.Get[int]("count")`} js={`// TypeScript generics
function map<T, U>(s: T[], f: (v: T) => U): U[] {
  return s.map(f);
}

// Alias with a type parameter
type Set<T> = Map<T, true>;

// Method with its own type parameter
class Store {
  private data = new Map<string, unknown>();
  get<T>(key: string): T | undefined {
    return this.data.get(key) as T | undefined;
  }
}
const n = store.get<number>("count");`} />

          <h3>Router chuẩn (1.22), WaitGroup.Go (1.25), new(expr) (1.26)</h3>
          <CodeCompare go={`mux := http.NewServeMux()
mux.HandleFunc("GET /users/{id}", func(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id") // trước 1.22 phải dùng gorilla/mux, chi...
})

var wg sync.WaitGroup
wg.Go(func() { work() }) // thay cho wg.Add(1); go func() { defer wg.Done(); work() }()
wg.Wait()

p := new(int64(30)) // 1.26: con trỏ tới giá trị khởi tạo, hữu ích cho field tuỳ chọn *T`} js={`import express from "express";

const app = express();
app.get("/users/:id", (req, res) => {
  const id = req.params.id; // Node has no stdlib router with path params
});

// WaitGroup: Promise.all
await Promise.all([work(), work()]);

// new(30): no pointers in JS; an optional field is just undefined
const p = 30;`} />
        </section>

        <section id="gv-support">
          <h2><span className="n">05</span>Hỗ trợ và nâng cấp</h2>
          <ul className="plain">
            <li>Mỗi bản lớn được vá lỗi bảo mật cho tới khi có <b>hai bản mới hơn</b>. Hiện tại (10/2026) chỉ 1.26 và 1.27 còn được hỗ trợ.</li>
            <li>Dòng <code>go 1.27</code> trong go.mod là phiên bản ngôn ngữ tối thiểu; nó quyết định cả các hành vi như loopvar. Dòng <code>toolchain go1.27.1</code> cho go tự tải đúng toolchain.</li>
            <li>Nâng cấp: đổi go.mod, chạy <code>go mod tidy</code>, <code>go vet ./...</code>, <code>go test -race ./...</code>, rồi <code>go fix ./...</code> để modernizer tự đổi code sang cú pháp mới (min/max, range int, slices.Contains...).</li>
            <li>Thay đổi hành vi được bật/tắt qua GODEBUG. Có thể nâng toolchain trước nhưng giữ hành vi cũ bằng dòng <code>godebug default=go1.25</code> trong go.mod, rồi sửa dần.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
