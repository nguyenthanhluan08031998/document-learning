import { CodeCompare } from "@/components/CodeCompare";
import { Box, Label, Markers } from "@/components/Svg";

const COLS = [40, 330, 620];
const QUEUE = [3, 3, 0];

const G = ({ x, y, cls = "s-box" }: { x: number; y: number; cls?: string }) => (
  <g>
    <circle className={cls} cx={x} cy={y} r="13" />
    <text className="s-tm" x={x} y={y + 4} textAnchor="middle" style={{ fill: "var(--ink)" }}>G</text>
  </g>
);

export default function GoRuntimePage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục runtime Go">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#gr-goroutine"><span>01</span>Goroutine</a></li>
          <li><a href="#gr-gmp"><span>02</span>Mô hình GMP</a></li>
          <li><a href="#gr-pick"><span>03</span>Chọn G để chạy</a></li>
          <li><a href="#gr-syscall"><span>04</span>Syscall, netpoller</a></li>
          <li><a href="#gr-preempt"><span>05</span>Preemption</a></li>
          <li><a href="#gr-procs"><span>06</span>GOMAXPROCS</a></li>
          <li><a href="#gr-qa"><span>07</span>Hỏi đáp</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · runtime</div>
          <h1>Goroutine và scheduler GMP</h1>
          <p className="lede">Go chạy hàng trăm nghìn goroutine trên vài OS thread nhờ scheduler M:N trong runtime. Hiểu G, M, P giải thích được vì sao goroutine rẻ, syscall chặn không làm treo chương trình và vì sao GOMAXPROCS quan trọng.</p>
          <div className="tape" aria-hidden="true">
            <div>G · goroutine</div>
            <div>M · OS thread</div>
            <div className="hw">P · processor</div>
            <div>work stealing</div>
            <div>netpoller</div>
            <div>sysmon</div>
          </div>
        </header>

        <section id="gr-goroutine">
          <h2><span className="n">01</span>Goroutine khác thread thế nào</h2>
          <div className="tbl">
            <table>
              <thead><tr><th></th><th>Goroutine</th><th>OS thread</th></tr></thead>
              <tbody>
                <tr><td><b>Ai quản lý</b></td><td>Runtime Go (user space)</td><td>Kernel</td></tr>
                <tr><td><b>Stack</b></td><td>Bắt đầu khoảng 2 KB, tự lớn lên/thu nhỏ (copy sang vùng mới)</td><td>Cố định, thường 1–8 MB</td></tr>
                <tr><td><b>Tạo, chuyển ngữ cảnh</b></td><td>Vài trăm ns, không vào kernel</td><td>Vài µs, phải qua kernel</td></tr>
                <tr><td><b>Số lượng thực tế</b></td><td>Hàng trăm nghìn tới hàng triệu</td><td>Vài nghìn</td></tr>
                <tr><td><b>Định danh</b></td><td>Không có ID công khai, không kill từ ngoài được; muốn dừng phải dùng context/channel</td><td>Có thread ID</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="gr-gmp">
          <h2><span className="n">02</span>Mô hình GMP</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 360" role="img" aria-label="Mô hình GMP: global run queue ở trên, ba P mỗi P có hàng đợi goroutine riêng và gắn với một M là OS thread chạy trên một CPU core; P thứ ba hết việc nên lấy một nửa hàng đợi của P khác">
                <Markers id="gmp" />
                <Box x={330} y={10} w={240} h={46} title="Global run queue" sub="P xem mỗi 61 lượt" cls="s-disk" />
                {COLS.map((x0, i) => (
                  <g key={x0}>
                    <Box x={x0} y={90} w={240} h={46} title={`P${i}`} sub="logical processor" cls="s-hl" />
                    {Array.from({ length: QUEUE[i] }, (_, k) => <G key={k} x={x0 + 30 + k * 36} y={170} />)}
                    {QUEUE[i] === 0 && <Label x={x0 + 20} y={174}>hàng đợi rỗng</Label>}
                    <path className="s-ln" d={`M${x0 + 120} 136 V218`} />
                    <Box x={x0 + 40} y={220} w={160} h={46} title={`M${i}`} sub="OS thread, chạy 1 G" />
                    <path className="s-dl" d={`M${x0 + 120} 266 V298`} />
                    <Box x={x0 + 40} y={300} w={160} h={40} title="CPU core" cls="s-bg" />
                  </g>
                ))}
                <path className="s-dl2" d="M455 170 H636" markerEnd="url(#gmpd)" />
                <Label x={548} y={160} color="var(--warn)" anchor="middle">work stealing: lấy 1/2</Label>
              </svg>
            </div>
            <figcaption>Mỗi M phải giữ một P mới chạy được code Go. Số P = GOMAXPROCS, nên tối đa GOMAXPROCS goroutine chạy song song cùng lúc.</figcaption>
          </figure>
          <div className="pp">
            <div><span className="pl">G · goroutine</span>Struct trong runtime giữ stack, con trỏ lệnh và trạng thái (runnable, running, waiting...). Tạo bằng từ khoá <code>go</code>.</div>
            <div><span className="pl">M · machine</span>Một OS thread thật. M có thể nhiều hơn P (ví dụ khi có M kẹt trong syscall), mặc định tối đa 10 000.</div>
            <div><span className="pl">P · processor</span>Giấy phép để chạy code Go, giữ local run queue (tối đa 256 G), ô runnext và cache cấp phát bộ nhớ (mcache).</div>
            <div><span className="pl">sysmon</span>Thread nền không cần P: phát hiện G chạy quá lâu, M kẹt syscall, và poll mạng khi không ai poll.</div>
          </div>
        </section>

        <section id="gr-pick">
          <h2><span className="n">03</span>P chọn goroutine nào để chạy</h2>
          <ol className="steps">
            <li><div><b>Mỗi 61 lượt, xem global queue trước</b><div className="d">Để goroutine trong global queue không bị bỏ đói.</div></div></li>
            <li><div><b>runnext, rồi local run queue</b><div className="d">G vừa được tạo hoặc vừa được đánh thức nằm ở runnext để chạy ngay, giữ cache CPU còn nóng.</div></div></li>
            <li><div><b>Global run queue</b><div className="d">Lấy một lô về local queue.</div></div></li>
            <li><div><b>Netpoller</b><div className="d">Lấy các G có socket đã sẵn sàng đọc/ghi.</div></div></li>
            <li><div><b>Work stealing</b><div className="d">Chọn ngẫu nhiên một P khác và lấy một nửa hàng đợi của nó. Không có gì để làm thì M đi ngủ, P được trả về danh sách rảnh.</div></div></li>
          </ol>
        </section>

        <section id="gr-syscall">
          <h2><span className="n">04</span>Syscall chặn và network poller</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 250" role="img" aria-label="G1 gọi syscall chặn trên M0; sysmon tách P0 khỏi M0 và gắn P0 cho M1 để chạy G2; còn G3 chờ socket thì được park trong netpoller, không giữ thread nào">
                <Markers id="sc" />
                <rect className="s-bg" x="8" y="8" width="270" height="230" rx="10" />
                <text className="s-lane" x="22" y="30">TRƯỚC</text>
                <Box x={60} y={50} w={160} h={44} title="P0" cls="s-hl" />
                <path className="s-ln" d="M140 94 V126" />
                <Box x={60} y={128} w={160} h={50} title="M0 + G1" sub="gọi read(file)" />
                <Label x={30} y={214}>syscall chặn cả OS thread</Label>

                <path className="s-ln" d="M282 120 H318" markerEnd="url(#sca)" />

                <rect className="s-bg" x="322" y="8" width="320" height="230" rx="10" />
                <text className="s-lane" x="336" y="30">SAU HANDOFF</text>
                <Box x={340} y={128} w={130} h={50} title="M0 + G1" sub="kẹt trong kernel" cls="s-bad" />
                <Box x={490} y={50} w={130} h={44} title="P0" cls="s-hl" />
                <path className="s-ln" d="M555 94 V126" />
                <Box x={490} y={128} w={130} h={50} title="M1 + G2" sub="M rảnh hoặc M mới" />
                <Label x={336} y={206}>sysmon thấy syscall quá ~20 µs</Label>
                <Label x={336} y={222}>→ tách P0 sang M1, CPU không bị phí</Label>

                <rect className="s-bg2" x="656" y="8" width="236" height="230" rx="10" />
                <text className="s-lane2" x="670" y="30">I/O MẠNG</text>
                <Box x={690} y={50} w={170} h={50} title="Netpoller" sub="epoll · kqueue · IOCP" cls="s-disk" />
                <G x={740} y={150} />
                <Label x={760} y={154}>G3 chờ socket</Label>
                <path className="s-dl2" d="M740 136 V102" markerEnd="url(#scd)" />
                <Label x={670} y={206}>G3 bị park, M đi chạy G khác;</Label>
                <Label x={670} y={222}>socket sẵn sàng → G3 runnable</Label>
              </svg>
            </div>
            <figcaption>Đọc file, cgo, syscall không qua netpoller làm kẹt một M, nên runtime đổi P sang M khác. I/O mạng thì không kẹt M nào: code trông như đồng bộ nhưng bên dưới là non-blocking.</figcaption>
          </figure>
          <div className="note">Hệ quả: hàng nghìn goroutine đọc file hoặc gọi cgo cùng lúc có thể tạo ra hàng nghìn OS thread. Giới hạn số goroutine làm loại việc này (semaphore, worker pool).</div>
        </section>

        <section id="gr-preempt">
          <h2><span className="n">05</span>Preemption</h2>
          <ul className="plain">
            <li><b>Trước 1.14 (cooperative):</b> goroutine chỉ nhường CPU ở điểm gọi hàm, khi chặn trên channel/lock/I/O. Một vòng lặp <code>for {"{}"}</code> không gọi hàm giữ P mãi, và GC chờ nó nên cả chương trình đứng.</li>
            <li><b>Từ 1.14 (asynchronous):</b> sysmon thấy G chạy liên tục quá 10 ms thì gửi signal (SIGURG) tới M; handler lưu trạng thái và đưa G về hàng đợi.</li>
            <li><code>runtime.Gosched()</code> nhường CPU chủ động; hiếm khi cần trong code thường.</li>
          </ul>
        </section>

        <section id="gr-procs">
          <h2><span className="n">06</span>GOMAXPROCS</h2>
          <ul className="plain">
            <li>Mặc định bằng số CPU nhìn thấy. Từ <b>1.25</b> runtime đọc thêm CPU limit của cgroup: pod Kubernetes giới hạn 2 CPU trên node 64 core sẽ có GOMAXPROCS=2 (trước đó là 64, gây throttle và tăng latency; phải dùng thư viện automaxprocs).</li>
            <li>Tăng GOMAXPROCS không làm I/O nhanh hơn; nó chỉ là số goroutine chạy code Go song song.</li>
            <li><code>runtime.LockOSThread()</code> ghim goroutine vào một M, cần khi gọi thư viện C dùng thread-local (OpenGL, một số driver).</li>
          </ul>
          <CodeCompare go={`fmt.Println(runtime.GOMAXPROCS(0), runtime.NumGoroutine(), runtime.NumCPU())

// Xem scheduler làm gì mỗi 1000 ms
// GODEBUG=schedtrace=1000 ./app
// SCHED 2005ms: gomaxprocs=8 idleprocs=6 threads=12 runqueue=0 [0 1 0 0 0 0 0 0]`} js={`import os from "node:os";
import { monitorEventLoopDelay } from "node:perf_hooks";

console.log(os.availableParallelism(), process.getActiveResourcesInfo().length);
// One JS thread + the libuv thread pool (UV_THREADPOOL_SIZE, default 4)

// Measure the event loop instead of a scheduler trace
const h = monitorEventLoopDelay();
h.enable();
setInterval(() => console.log("p99 delay ms:", h.percentile(99) / 1e6), 1000);`} />
        </section>

        <section id="gr-qa">
          <h2><span className="n">07</span>Hỏi đáp phỏng vấn</h2>
          <div className="review">
            <div className="row"><div className="loglabel">Hỏi</div><div><b>Vì sao cần P, sao không gắn G thẳng vào M?</b><div className="d">Trước 1.1 chỉ có G và M với một hàng đợi global có lock, rất nghẽn khi nhiều core. P đem lại hàng đợi riêng không cần lock, cache cấp phát riêng, và có thể chuyển nguyên P sang M khác khi M kẹt syscall.</div></div></div>
            <div className="row"><div className="loglabel">Hỏi</div><div><b>Goroutine có chạy song song không?</b><div className="d">Có, tối đa GOMAXPROCS cái cùng lúc. Concurrency là cấu trúc chương trình; parallelism là chạy thật cùng lúc trên nhiều core.</div></div></div>
            <div className="row"><div className="loglabel">Hỏi</div><div><b>main return thì goroutine khác thế nào?</b><div className="d">Bị dừng ngay, không chạy defer. Phải chờ bằng WaitGroup/errgroup hoặc channel.</div></div></div>
            <div className="row"><div className="loglabel">Hỏi</div><div><b>Panic trong goroutine con có recover ở main được không?</b><div className="d">Không. recover chỉ bắt panic trong cùng goroutine; mỗi goroutine cần defer recover riêng, nếu không cả process chết.</div></div></div>
          </div>
        </section>
      </main>
    </div>
  );
}
