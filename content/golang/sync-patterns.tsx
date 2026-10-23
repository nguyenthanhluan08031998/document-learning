import { Code } from "@/components/Code";

export default function GoSyncPatternsPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục concurrency thực hành trong Go">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#gs-sync"><span>01</span>sync: Mutex, WaitGroup, Once</a></li>
          <li><a href="#gs-select"><span>02</span>select</a></li>
          <li><a href="#gs-errgroup"><span>03</span>errgroup</a></li>
          <li><a href="#gs-race"><span>04</span>Race detector</a></li>
          <li><a href="#gs-rules"><span>05</span>Quy tắc dùng goroutine</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · concurrency in practice</div>
          <h1>Concurrency thực hành</h1>
          <p className="lede">Trang channel và context nói cơ chế bên dưới. Trang này là bộ công cụ dùng hằng ngày: bảo vệ dữ liệu chung bằng <code>sync</code>, chờ nhiều việc với <code>select</code>, chạy song song có lỗi và giới hạn với <code>errgroup</code>, và bắt data race bằng <code>-race</code>.</p>
          <div className="tape" aria-hidden="true">
            <div>Mutex</div>
            <div>WaitGroup</div>
            <div className="hw">select</div>
            <div>errgroup</div>
            <div>-race</div>
          </div>
        </header>

        <section id="gs-sync">
          <h2><span className="n">01</span>sync: Mutex, WaitGroup, Once</h2>
          <Code lang="go">{`// Mutex: bảo vệ dữ liệu dùng chung
type Counter struct {
    mu sync.Mutex                // zero value dùng được ngay; không bao giờ copy struct chứa nó
    n  map[string]int
}
func (c *Counter) Inc(key string) {
    c.mu.Lock()
    defer c.mu.Unlock()           // mở khóa ở mọi nhánh, kể cả khi panic
    c.n[key]++
}

// RWMutex: nhiều reader HOẶC một writer. Chỉ đáng dùng khi đọc nhiều hơn ghi
type Cache struct {
    mu sync.RWMutex
    m  map[string]string
}
func (c *Cache) Get(k string) (string, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()
    v, ok := c.m[k]
    return v, ok
}

// WaitGroup: chờ một nhóm goroutine
var wg sync.WaitGroup
for _, url := range urls {
    wg.Add(1)                     // Add TRƯỚC khi chạy goroutine
    go func() {
        defer wg.Done()
        fetch(url)
    }()
}
wg.Wait()

// Once: chạy đúng một lần, an toàn khi đồng thời (khởi tạo lười, singleton)
var (
    once sync.Once
    cfg  *Config
)
func GetConfig() *Config {
    once.Do(func() { cfg = loadConfig() })
    return cfg
}`}</Code>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Công cụ</th><th>Dùng khi</th></tr>
              </thead>
              <tbody>
                <tr><td><code>sync.Mutex</code></td><td>Bảo vệ một vùng dữ liệu chung ngắn gọn</td></tr>
                <tr><td><code>sync/atomic</code></td><td>Một bộ đếm hoặc cờ đơn giản (<code>atomic.Int64</code>, <code>atomic.Bool</code>)</td></tr>
                <tr><td><code>sync.Map</code></td><td>Hiếm: key ghi một lần đọc nhiều, hoặc các goroutine dùng key rời nhau. Mặc định dùng <code>map</code> + <code>Mutex</code></td></tr>
                <tr><td><code>sync.Pool</code></td><td>Tái sử dụng object tạm để giảm GC (Garbage Collector) (buffer)</td></tr>
                <tr><td>channel</td><td>Chuyển dữ liệu hoặc quyền sở hữu giữa goroutine</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="gs-select">
          <h2><span className="n">02</span>select</h2>
          <p><code>select</code> chờ nhiều channel cùng lúc và chạy nhánh nào sẵn sàng trước. Ba mẫu dùng nhiều nhất: timeout, hủy bằng context, và thử không chặn.</p>
          <Code lang="go">{`// 1. Timeout
select {
case res := <-results:
    handle(res)
case <-time.After(2 * time.Second):
    return errors.New("timeout")
}

// 2. Vòng lặp worker dừng khi bị hủy
func worker(ctx context.Context, jobs <-chan Job) {
    for {
        select {
        case <-ctx.Done():
            return                      // luôn có đường thoát, nếu không goroutine bị leak
        case j, ok := <-jobs:
            if !ok { return }           // channel đã đóng
            process(j)
        }
    }
}

// 3. Gửi không chặn: bỏ đi thay vì chờ
select {
case events <- e:
default:
    metrics.Dropped.Inc()               // buffer đầy
}

// Việc định kỳ
t := time.NewTicker(10 * time.Second)
defer t.Stop()
for {
    select {
    case <-t.C:
        flush()
    case <-ctx.Done():
        return
    }
}`}</Code>
          <div className="note"><b>Lưu ý:</b> nếu nhiều nhánh cùng sẵn sàng, Go chọn <b>ngẫu nhiên</b>, không theo thứ tự viết. Nhận từ channel <code>nil</code> sẽ chặn mãi; đôi khi người ta cố ý gán <code>nil</code> để tắt một nhánh.</div>
        </section>

        <section id="gs-errgroup">
          <h2><span className="n">03</span>errgroup</h2>
          <p><code>golang.org/x/sync/errgroup</code> là <code>WaitGroup</code> có thêm <b>trả về lỗi đầu tiên</b>, <b>hủy context khi có lỗi</b> và <b>giới hạn số goroutine chạy cùng lúc</b>. Đây là công cụ nên dùng thay vì tự ghép WaitGroup và channel lỗi.</p>
          <Code lang="go">{`func fetchAll(ctx context.Context, ids []int) ([]*User, error) {
    g, ctx := errgroup.WithContext(ctx)    // ctx bị hủy khi có task trả về lỗi
    g.SetLimit(8)                          // tối đa 8 task chạy cùng lúc (backpressure)

    users := make([]*User, len(ids))       // mỗi goroutine ghi vào chỉ số riêng: không cần khóa
    for i, id := range ids {
        g.Go(func() error {                // Go 1.22+: i và id riêng cho mỗi vòng lặp
            u, err := getUser(ctx, id)
            if err != nil {
                return fmt.Errorf("user %d: %w", id, err)
            }
            users[i] = u
            return nil
        })
    }
    if err := g.Wait(); err != nil {       // chờ tất cả, trả về lỗi đầu tiên
        return nil, err
    }
    return users, nil
}`}</Code>
          <div className="pp">
            <div><span className="pl">Có ích khi</span>Gọi song song nhiều service/DB rồi gộp kết quả; xử lý một batch lớn với số worker giới hạn.</div>
            <div className="warnc"><span className="pl">Nhớ</span>Truyền <code>ctx</code> mà errgroup trả về vào các lời gọi bên trong, nếu không việc hủy khi có lỗi không có tác dụng.</div>
          </div>
        </section>

        <section id="gs-race">
          <h2><span className="n">04</span>Race detector</h2>
          <p>Data race là hai goroutine truy cập cùng biến, ít nhất một bên ghi, mà không đồng bộ. Kết quả không xác định và hay chỉ lộ ra ở production. Go có sẵn công cụ phát hiện:</p>
          <Code lang="bash">{`go test -race ./...        # chạy test kèm race detector (CI nên luôn làm vậy)
go run -race main.go
go build -race             # binary bật race cho staging; chậm ~5-10 lần, tốn thêm bộ nhớ`}</Code>
          <Code lang="go">{`// Lỗi điển hình mà detector bắt được
var hits int
for i := 0; i < 100; i++ {
    go func() { hits++ }()           // CẢNH BÁO: DATA RACE
}
// Cách sửa: dùng atomic.Int64 cho bộ đếm, hoặc bọc phần cập nhật bằng Mutex
var hits2 atomic.Int64
go func() { hits2.Add(1) }()`}</Code>
          <div className="note tip"><b>Chỉ phát hiện được race đã xảy ra</b> khi chạy, nên cần test có độ phủ và chạy lặp (<code>-count=10</code>). Không thấy cảnh báo chưa chứng minh code an toàn.</div>
        </section>

        <section id="gs-rules">
          <h2><span className="n">05</span>Quy tắc dùng goroutine</h2>
          <ul className="plain">
            <li><b>Luôn biết goroutine kết thúc thế nào:</b> hết việc, nhận <code>ctx.Done()</code>, hoặc channel đóng. Không có đường thoát là goroutine leak.</li>
            <li><b>Bên gửi đóng channel</b>, bên nhận không đóng. Gửi vào channel đã đóng sẽ panic.</li>
            <li><b>Đừng khởi tạo goroutine trong thư viện mà người gọi không điều khiển được.</b> Để người gọi quyết định <code>go f()</code>.</li>
            <li><b>Giới hạn song song</b> (<code>SetLimit</code>, semaphore, worker pool) thay vì mở một goroutine cho mỗi item của input chưa biết kích thước.</li>
            <li><b>Ưu tiên truyền dữ liệu hơn chia sẻ bộ nhớ</b> khi cần chuyển quyền sở hữu; dùng mutex khi chỉ bảo vệ một trạng thái chung nhỏ.</li>
            <li>Chạy <code>go test -race</code> trong CI (Continuous Integration).</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
