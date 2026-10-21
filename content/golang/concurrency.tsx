import Link from "next/link";
import { Code } from "@/components/Code";
import { Box, Label, Markers } from "@/components/Svg";

const FIELDS: [string, string][] = [
  ["qcount", "số phần tử đang có"],
  ["dataqsiz", "sức chứa (cap)"],
  ["buf", "con trỏ tới ring buffer"],
  ["sendx · recvx", "ô ghi · ô đọc kế tiếp"],
  ["recvq · sendq", "hàng đợi G đang chờ"],
  ["closed", "đã close chưa"],
  ["lock", "mutex bảo vệ cả struct"],
];
const SLOTS = ["A", "B", "C", "", "", ""];

export default function GoConcurrencyPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục channel và context">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#gc-hchan"><span>01</span>Bên trong channel</a></li>
          <li><a href="#gc-buffer"><span>02</span>Buffered, unbuffered</a></li>
          <li><a href="#gc-rules"><span>03</span>Bảng hành vi</a></li>
          <li><a href="#gc-mutex"><span>04</span>Channel hay Mutex</a></li>
          <li><a href="#gc-leak"><span>05</span>Goroutine leak</a></li>
          <li><a href="#gc-context"><span>06</span>Context</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · concurrency</div>
          <h1>Channel, Mutex và Context</h1>
          <p className="lede">“Đừng giao tiếp bằng cách chia sẻ bộ nhớ; hãy chia sẻ bộ nhớ bằng cách giao tiếp.” Channel là cách Go khuyến khích, nhưng Mutex vẫn là lựa chọn đúng trong nhiều chỗ. Context là cách dừng cả cây goroutine.</p>
          <div className="tape" aria-hidden="true">
            <div>hchan</div>
            <div>sudog</div>
            <div>select</div>
            <div className="hw">sync.Mutex</div>
            <div>errgroup</div>
            <div>context.WithCancel</div>
          </div>
        </header>

        <section id="gc-hchan">
          <h2><span className="n">01</span>Bên trong channel: hchan</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 300" role="img" aria-label="Struct hchan gồm qcount, dataqsiz, buf, sendx, recvx, recvq, sendq, closed, lock; buf trỏ tới ring buffer 6 ô đang chứa A, B, C; recvx trỏ ô A, sendx trỏ ô trống tiếp theo; sendq chứa các goroutine đang chờ gửi khi buffer đầy">
                <Markers id="hc" />
                <rect className="s-hl" x="16" y="16" width="300" height="270" rx="8" />
                <text className="s-tb" x="32" y="42">hchan</text>
                {FIELDS.map(([f, d], i) => (
                  <g key={f}>
                    <text className="s-tm" x="32" y={72 + i * 30} style={{ fill: "var(--ink)", fontWeight: 600 }}>{f}</text>
                    <text className="s-tm" x="150" y={72 + i * 30}>{d}</text>
                  </g>
                ))}

                <text className="s-lane" x="400" y="40">BUF · RING BUFFER (cap 6)</text>
                {SLOTS.map((v, i) => (
                  <g key={i}>
                    <rect className={v ? "s-disk" : "s-box"} x={400 + i * 70} y="56" width="62" height="44" rx="5" />
                    <text className="s-tb" x={431 + i * 70} y="83" textAnchor="middle">{v}</text>
                  </g>
                ))}
                <path className="s-ln" d="M316 130 C350 130 360 78 398 78" markerEnd="url(#hca)" />
                <path className="s-ln" d="M431 132 V104" markerEnd="url(#hca)" />
                <Label x={431} y={146} anchor="middle">recvx</Label>
                <path className="s-ln" d="M641 132 V104" markerEnd="url(#hca)" />
                <Label x={641} y={146} anchor="middle">sendx</Label>

                <text className="s-lane2" x="400" y="190">RECVQ · SENDQ (danh sách sudog)</text>
                <Box x={400} y={204} w={110} h={44} title="sudog" sub="G7, &elem" />
                <Box x={530} y={204} w={110} h={44} title="sudog" sub="G9, &elem" />
                <path className="s-dl" d="M510 226 H528" />
                <Label x={660} y={222}>G chờ được park, không tốn CPU;</Label>
                <Label x={660} y={238}>bên kia tới thì đánh thức</Label>
              </svg>
            </div>
            <figcaption>Mọi thao tác send, receive, close đều lấy <code>lock</code> trước. Channel là hàng đợi có khoá, không phải phép màu lock-free.</figcaption>
          </figure>
        </section>

        <section id="gc-buffer">
          <h2><span className="n">02</span>Buffered và unbuffered ở cấp runtime</h2>
          <div className="cmp">
            <div><h4>Unbuffered <code>make(chan T)</code></h4>Không có buf. Send chỉ xong khi có receiver: nếu receiver đã chờ trong recvq, runtime <b>copy thẳng giá trị từ stack người gửi sang stack người nhận</b> rồi đánh thức nó. Đây là điểm đồng bộ (handoff): hai bên chắc chắn đã gặp nhau.</div>
            <div><h4>Buffered <code>make(chan T, n)</code></h4>Send copy vào <code>buf[sendx]</code> và trả về ngay nếu còn chỗ; chỉ chặn khi đầy. Receive lấy từ <code>buf[recvx]</code>. Nếu đang có receiver chờ thì vẫn copy thẳng như unbuffered. Buffer hấp thụ dao động tốc độ, không phải để “sửa” deadlock.</div>
          </div>
        </section>

        <section id="gc-rules">
          <h2><span className="n">03</span>Bảng hành vi cần thuộc</h2>
          <div className="tbl">
            <table>
              <thead><tr><th>Thao tác</th><th>nil channel</th><th>Đã close</th><th>Đang mở</th></tr></thead>
              <tbody>
                <tr><td><b>send</b></td><td>Chặn mãi</td><td className="c-bad">panic</td><td>Gửi hoặc chặn</td></tr>
                <tr><td><b>receive</b></td><td>Chặn mãi</td><td>Trả zero value, ok = false (sau khi đọc hết buffer)</td><td>Nhận hoặc chặn</td></tr>
                <tr><td><b>close</b></td><td className="c-bad">panic</td><td className="c-bad">panic</td><td>Đánh thức mọi receiver và sender đang chờ (sender sẽ panic)</td></tr>
              </tbody>
            </table>
          </div>
          <p>Quy tắc: <b>chỉ bên gửi được close</b>, và chỉ khi không còn ai gửi nữa. nil channel hữu ích trong <code>select</code> để tắt một nhánh.</p>
        </section>

        <section id="gc-mutex">
          <h2><span className="n">04</span>Khi nào dùng Channel, khi nào dùng Mutex</h2>
          <div className="cmp">
            <div><h4>Channel</h4>Chuyển quyền sở hữu dữ liệu giữa các goroutine (pipeline, worker pool), phát tín hiệu xong/huỷ, giới hạn số việc chạy cùng lúc (semaphore), kết hợp nhiều nguồn sự kiện bằng <code>select</code>.</div>
            <div><h4>sync.Mutex · RWMutex · atomic</h4>Bảo vệ một trạng thái dùng chung (cache, counter, map). Ngắn, nhanh và dễ đọc hơn dùng channel. RWMutex khi đọc nhiều hơn ghi rất nhiều; với counter đơn giản dùng <code>atomic.Int64</code>.</div>
          </div>
          <Code lang="go">{`type Counter struct {
    mu sync.Mutex
    m  map[string]int
}

func (c *Counter) Inc(key string) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.m[key]++
}
// Không copy struct chứa Mutex (truyền *Counter). go vet báo lỗi copylocks.`}</Code>
        </section>

        <section id="gc-leak">
          <h2><span className="n">05</span>Goroutine leak</h2>
          <p>Goroutine bị chặn mãi trên channel hay lock không bao giờ được GC thu hồi: stack và mọi thứ nó tham chiếu nằm lại trong bộ nhớ. Số goroutine tăng dần theo thời gian là dấu hiệu rõ nhất.</p>
          <Code lang="go">{`// Leak: hết timeout thì không ai đọc ch nữa, goroutine kẹt mãi ở ch <- r
func fetch(ctx context.Context) (Result, error) {
    ch := make(chan Result)            // sửa: make(chan Result, 1)
    go func() { ch <- slowCall() }()
    select {
    case r := <-ch:
        return r, nil
    case <-ctx.Done():
        return Result{}, ctx.Err()
    }
}`}</Code>
          <ul className="plain">
            <li>Nguyên nhân hay gặp: gửi vào channel không ai đọc; đọc channel không ai close; quên <code>cancel()</code> của context; worker <code>for range ch</code> mà producer không close; quên <code>ticker.Stop()</code> (trước 1.23).</li>
            <li>Cách phát hiện: theo dõi <code>runtime.NumGoroutine()</code>, xem <code>/debug/pprof/goroutine?debug=2</code>, test bằng <code>go.uber.org/goleak</code>. Từ <b>1.27</b> có profile <code>goroutineleak</code> chính thức: runtime dùng GC để tìm goroutine chặn trên thứ không còn ai với tới.</li>
          </ul>
        </section>

        <section id="gc-context">
          <h2><span className="n">06</span>Context: lan truyền huỷ</h2>
          <p>Context tạo thành một cây. Mỗi <code>WithCancel</code>/<code>WithTimeout</code> tạo node con, đăng ký vào danh sách <code>children</code> của cha. Khi cha bị huỷ, nó đóng channel <code>Done()</code> của mình rồi gọi cancel cho mọi con, cứ thế xuống tới lá. Huỷ con không ảnh hưởng cha.</p>
          <Code lang="go">{`func (h *Handler) GetOrder(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second) // client ngắt → r.Context() huỷ
    defer cancel()                       // luôn gọi, kể cả khi đã timeout: gỡ khỏi cây cha, dừng timer

    order, err := h.repo.Find(ctx, r.PathValue("id")) // driver DB tôn trọng ctx
    ...
}

// Worker nền: nhận ctx, thoát khi ctx.Done()
func worker(ctx context.Context, jobs <-chan Job) {
    for {
        select {
        case <-ctx.Done():
            return
        case j, ok := <-jobs:
            if !ok { return }
            process(ctx, j)
        }
    }
}`}</Code>
          <ul className="plain">
            <li><b>Leak context:</b> quên gọi <code>cancel</code> làm node con nằm trong cây cha (và timer) tới khi cha bị huỷ; với context gốc sống mãi thì là leak thật. <code>go vet</code> có kiểm tra lostcancel.</li>
            <li>Không lưu context trong struct; truyền làm tham số đầu tiên. <code>context.Value</code> chỉ cho dữ liệu theo request (trace ID, user), không truyền tham số nghiệp vụ.</li>
            <li>Mới: <code>WithCancelCause</code> (1.20), <code>WithoutCancel</code>, <code>AfterFunc</code> (1.21) để chạy việc nền tiếp sau khi request kết thúc mà vẫn giữ value.</li>
            <li>Chặn race khi chạy nhiều instance cần lock ngoài process: xem <Link href="/concurrency/distributed-lock/" className="plink">Distributed lock</Link>.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
