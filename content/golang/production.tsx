import Link from "next/link";
import { CodeCompare } from "@/components/CodeCompare";
import { Box, Label, Markers } from "@/components/Svg";

const WORKERS = [30, 90, 150];

export default function GoProductionPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục Go production">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#gp-pool"><span>01</span>Worker pool</a></li>
          <li><a href="#gp-db"><span>02</span>Connection pool</a></li>
          <li><a href="#gp-sf"><span>03</span>Cache stampede</a></li>
          <li><a href="#gp-pprof"><span>04</span>pprof, trace</a></li>
          <li><a href="#gp-incident"><span>05</span>CPU 100%, OOM</a></li>
          <li><a href="#gp-alloc"><span>06</span>Ít cấp phát</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · production</div>
          <h1>Go trên production</h1>
          <p className="lede">Những bài toán senior hay gặp: xử lý hàng triệu job mà không cạn tài nguyên, cấu hình pool kết nối DB (Database), chống dồn request khi cache hết hạn, và debug CPU (Central Processing Unit) 100% hay OOM (Out Of Memory) bằng pprof.</p>
          <div className="tape" aria-hidden="true">
            <div>errgroup</div>
            <div>backpressure</div>
            <div>SetMaxOpenConns</div>
            <div className="hw">singleflight</div>
            <div>pprof</div>
            <div>go tool trace</div>
          </div>
        </header>

        <section id="gp-pool">
          <h2><span className="n">01</span>Worker pool và pipeline</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 220" role="img" aria-label="Producer đẩy job vào channel có buffer; N worker cố định đọc job, xử lý, đẩy kết quả sang channel results; buffer đầy thì producer bị chặn, tạo backpressure">
                <Markers id="wp" />
                <Box x={20} y={80} w={140} h={56} title="Producer" sub="Kafka, DB, file" />
                <Box x={220} y={80} w={160} h={56} title="jobs chan" sub="buffer = 2 × N" cls="s-disk" />
                <path className="s-ln" d="M160 108 H218" markerEnd="url(#wpa)" />
                {WORKERS.map((y, i) => (
                  <g key={y}>
                    <Box x={460} y={y} w={140} h={44} title={`worker ${i + 1}`} cls="s-hl" />
                    <path className="s-ln" d={`M380 108 L458 ${y + 22}`} markerEnd="url(#wpa)" />
                    <path className="s-ln" d={`M600 ${y + 22} L678 108`} markerEnd="url(#wpa)" />
                  </g>
                ))}
                <Box x={680} y={80} w={200} h={56} title="results chan" sub="gom, ghi theo lô" cls="s-disk" />
                <Label x={220} y={170} color="var(--warn)">đầy → producer chờ (backpressure)</Label>
                <Label x={460} y={214}>N cố định ≈ giới hạn của tài nguyên chậm nhất (DB, API)</Label>
              </svg>
            </div>
          </figure>
          <CodeCompare go={`func Run(ctx context.Context, jobs <-chan Job, workers int) error {
    g, ctx := errgroup.WithContext(ctx) // golang.org/x/sync/errgroup
    g.SetLimit(workers)                  // tối đa N goroutine cùng lúc
    for {
        select {
        case <-ctx.Done():               // một job lỗi → huỷ tất cả
            return g.Wait()
        case j, ok := <-jobs:
            if !ok { return g.Wait() }
            g.Go(func() error { return handle(ctx, j) }) // Go chặn khi đã đủ N
        }
    }
}`} js={`// p-limit: at most N jobs at once, first failure aborts the rest
import pLimit from "p-limit";

async function run(signal, jobs /* AsyncIterable<Job> */, workers) {
  const limit = pLimit(workers);
  const ac = new AbortController();
  const all = AbortSignal.any([signal, ac.signal]);
  const tasks = [];
  let firstErr;
  for await (const j of jobs) {
    if (all.aborted) break;
    tasks.push(limit(() => handle(all, j)).catch((e) => { firstErr ??= e; ac.abort(); }));
  }
  await Promise.all(tasks);
  if (firstErr) throw firstErr;
}`} />
          <ul className="plain">
            <li><b>Đừng</b> <code>go handle(j)</code> cho mỗi job: một triệu job là một triệu goroutine cùng mở kết nối DB.</li>
            <li>Số worker theo nút cổ chai: việc CPU-bound ≈ GOMAXPROCS; việc I/O (Input/Output)-bound theo giới hạn của DB/API phía sau, đo rồi chỉnh.</li>
            <li>Gom kết quả ghi theo lô (batch insert), dùng <code>context</code> để dừng gọn khi deploy (graceful shutdown).</li>
          </ul>
        </section>

        <section id="gp-db">
          <h2><span className="n">02</span>Connection pool của database/sql</h2>
          <CodeCompare go={`db, _ := sql.Open("pgx", dsn)       // sql.DB là pool, tạo một lần, dùng chung toàn app
db.SetMaxOpenConns(25)              // mặc định 0 = không giới hạn
db.SetMaxIdleConns(25)              // mặc định 2
db.SetConnMaxLifetime(30 * time.Minute)
db.SetConnMaxIdleTime(5 * time.Minute)

rows, err := db.QueryContext(ctx, q)
if err != nil { return err }
defer rows.Close()                  // quên Close → kết nối không trả về pool`} js={`import pg from "pg";

const pool = new pg.Pool({          // created once, shared by the whole app
  connectionString: dsn,
  max: 25,                          // default 10
  idleTimeoutMillis: 5 * 60_000,
  maxLifetimeSeconds: 30 * 60,
});

const client = await pool.connect();
try {
  const { rows } = await client.query(q);
} finally {
  client.release();                 // forgetting release: the connection never returns to the pool
}`} />
          <div className="tbl">
            <table>
              <thead><tr><th>Cấu hình sai</th><th>Hậu quả</th></tr></thead>
              <tbody>
                <tr><td>MaxOpenConns không giới hạn</td><td>Lúc tải cao mở hàng nghìn kết nối, Postgres báo <code>too many connections</code>, mọi instance cùng lỗi</td></tr>
                <tr><td>MaxIdleConns = 2 (mặc định) khi tải cao</td><td>Kết nối liên tục bị đóng rồi mở lại, tốn TLS (Transport Layer Security) handshake, latency tăng</td></tr>
                <tr><td>Không đặt ConnMaxLifetime</td><td>Kết nối chết sau khi DB failover hoặc bị proxy/LB cắt, lỗi <code>bad connection</code></td></tr>
                <tr><td>MaxOpenConns quá nhỏ, quên rows.Close / tx.Commit</td><td>Request xếp hàng chờ kết nối; <code>db.Stats().WaitCount</code> tăng</td></tr>
              </tbody>
            </table>
          </div>
          <p className="sub">Tổng kết nối = MaxOpenConns × số instance; phải nhỏ hơn <code>max_connections</code> của DB (hoặc đặt PgBouncer phía trước). Lock nhiều instance: <Link href="/concurrency/db-lock/" className="plink">lock trong DB</Link>, <Link href="/concurrency/distributed-lock/" className="plink">distributed lock</Link>.</p>
        </section>

        <section id="gp-sf">
          <h2><span className="n">03</span>Cache stampede và singleflight</h2>
          <p>Một key nóng hết hạn, 1 000 request cùng thấy cache miss và cùng query DB (thundering herd). <code>singleflight</code> gộp các lời gọi cùng key đang chạy: chỉ một lời gọi thật, các request khác chờ và dùng chung kết quả.</p>
          <CodeCompare go={`var group singleflight.Group // golang.org/x/sync/singleflight

func (s *Service) Product(ctx context.Context, id string) (*Product, error) {
    if p, ok := s.cache.Get(id); ok {
        return p, nil
    }
    v, err, _ := group.Do("product:"+id, func() (any, error) {
        p, err := s.repo.Find(ctx, id)
        if err == nil { s.cache.Set(id, p, 5*time.Minute+jitter()) }
        return p, err
    })
    if err != nil { return nil, err }
    return v.(*Product), nil
}`} js={`const inflight = new Map(); // key -> Promise, the singleflight group

async function product(id) {
  const hit = cache.get(id);
  if (hit) return hit;

  const key = "product:" + id;
  if (!inflight.has(key)) {
    inflight.set(key, (async () => {
      try {
        const p = await repo.find(id);
        cache.set(id, p, 5 * 60_000 + jitter());
        return p;
      } finally {
        inflight.delete(key);
      }
    })());
  }
  return inflight.get(key);
}`} />
          <ul className="plain">
            <li>singleflight chỉ gộp trong <b>một process</b>. Nhiều instance thì thêm lock ngắn trên Redis, hoặc làm mới cache trước khi hết hạn.</li>
            <li>TTL có jitter ngẫu nhiên để các key không hết hạn cùng lúc.</li>
            <li>Lưu ý ctx: request đầu bị huỷ thì lời gọi chung cũng lỗi; dùng <code>context.WithoutCancel</code> bên trong nếu cần.</li>
          </ul>
        </section>

        <section id="gp-pprof">
          <h2><span className="n">04</span>pprof và execution tracer</h2>
          <CodeCompare go={`import _ "net/http/pprof" // đăng ký /debug/pprof/* vào DefaultServeMux

go func() { log.Println(http.ListenAndServe("localhost:6060", nil)) }() // chỉ mở nội bộ`} js={`import inspector from "node:inspector";

// Built-in profiler: attach DevTools to this port (internal only)
inspector.open(9229, "127.0.0.1");

// Or profile from the command line
// node --cpu-prof --heap-prof app.js`} />
          <div className="tbl">
            <table>
              <thead><tr><th>Profile</th><th>Trả lời câu hỏi</th><th>Lệnh</th></tr></thead>
              <tbody>
                <tr><td><b>CPU</b></td><td>Hàm nào ăn CPU</td><td><code>go tool pprof http://host:6060/debug/pprof/profile?seconds=30</code></td></tr>
                <tr><td><b>Heap</b></td><td>inuse_space: ai đang giữ bộ nhớ; alloc_space: ai cấp phát nhiều nhất</td><td><code>go tool pprof -sample_index=inuse_space .../heap</code></td></tr>
                <tr><td><b>Goroutine</b></td><td>Bao nhiêu goroutine, đang kẹt ở dòng nào</td><td><code>curl .../goroutine?debug=2</code></td></tr>
                <tr><td><b>goroutineleak</b> (1.27)</td><td>Goroutine chặn mãi trên thứ không còn ai với tới</td><td><code>.../goroutineleak</code></td></tr>
                <tr><td><b>Block / Mutex</b></td><td>Chờ channel, chờ lock bao lâu; phải bật <code>runtime.SetBlockProfileRate</code>, <code>SetMutexProfileFraction</code></td><td><code>.../block</code>, <code>.../mutex</code></td></tr>
                <tr><td><b>Trace</b></td><td>Từng goroutine chạy trên P nào, GC (Garbage Collector), syscall, chờ scheduler theo thời gian thực</td><td><code>curl .../trace?seconds=5 &gt; t.out; go tool trace t.out</code></td></tr>
              </tbody>
            </table>
          </div>
          <p className="sub">Trong pprof: <code>top</code>, <code>list TênHàm</code>, <code>-http=:8080</code> mở flame graph. So hai heap profile bằng <code>-diff_base</code> để thấy cái gì tăng. Bắt sự cố hiếm: <code>trace.FlightRecorder</code> (1.25) giữ vài giây trace gần nhất trong RAM (Random Access Memory), ghi ra khi có lỗi.</p>
        </section>

        <section id="gp-incident">
          <h2><span className="n">05</span>Tình huống: CPU 100% hoặc OOM</h2>
          <div className="cmp">
            <div>
              <h4>CPU 100%</h4>
              <ol className="steps">
                <li><div><b>Khoanh vùng</b><div className="d">Từ lúc nào, sau deploy nào, endpoint nào, tất cả instance hay một cái.</div></div></li>
                <li><div><b>CPU profile 30 s</b><div className="d">Xem top hàm. Hay gặp: JSON/regex trong vòng lặp nóng, vòng lặp bận chờ, log quá nhiều.</div></div></li>
                <li><div><b>GC chiếm CPU?</b><div className="d">Nếu runtime.gcBgMarkWorker, mallocgc đứng đầu: cấp phát quá nhiều, hoặc GOMEMLIMIT quá sát heap sống.</div></div></li>
                <li><div><b>Lock contention</b><div className="d">Mutex profile, trace để thấy goroutine xếp hàng.</div></div></li>
              </ol>
            </div>
            <div>
              <h4>OOM</h4>
              <ol className="steps">
                <li><div><b>Đọc metric</b><div className="d">RSS tăng đều (leak) hay vọt lên (một request lớn)? So go_memstats_heap_inuse với RSS.</div></div></li>
                <li><div><b>Số goroutine</b><div className="d">Tăng theo thời gian → goroutine leak, xem goroutine profile.</div></div></li>
                <li><div><b>Heap profile, inuse_space</b><div className="d">Lấy hai lần cách nhau vài phút, so bằng -diff_base. Hay gặp: cache không giới hạn, map không xoá, slice con giữ mảng lớn, đọc cả body/file vào RAM.</div></div></li>
                <li><div><b>Chặn tạm</b><div className="d">GOMEMLIMIT ≈ 90% limit container, giới hạn kích thước request, rồi mới sửa gốc.</div></div></li>
              </ol>
            </div>
          </div>
        </section>

        <section id="gp-alloc">
          <h2><span className="n">06</span>Kỹ thuật zero/low allocation</h2>
          <ul className="plain">
            <li>Cấp phát trước <code>make([]T, 0, n)</code>, <code>strings.Builder.Grow</code>; dùng lại buffer qua <code>sync.Pool</code>.</li>
            <li>Dùng API (Application Programming Interface) dạng <code>Append</code>: <code>strconv.AppendInt</code>, <code>time.AppendFormat</code>, ghi thẳng vào <code>[]byte</code> có sẵn.</li>
            <li>Tránh chuyển <code>[]byte</code> ↔ <code>string</code> thừa; tránh <code>fmt.Sprintf</code> trong hot path; tránh interface và closure không cần thiết.</li>
            <li>Truyền struct lớn bằng con trỏ, struct nhỏ bằng value (value nằm trên stack, không cho GC việc).</li>
            <li>Xác nhận bằng <code>-benchmem</code> và <code>-gcflags=-m</code>; xem thêm trang <Link className="plink" href="/golang/memory/">Bộ nhớ &amp; GC</Link>.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
