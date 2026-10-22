import { CodeCompare } from "@/components/CodeCompare";
import { Box, Label, Markers } from "@/components/Svg";

// Tri-colour objects: [name, x, y, colour]
const OBJ: [string, number, number, "black" | "grey" | "white"][] = [
  ["A", 280, 70, "black"], ["B", 280, 170, "black"],
  ["C", 430, 50, "grey"], ["D", 430, 150, "grey"],
  ["E", 580, 50, "white"], ["F", 580, 150, "white"], ["X", 740, 110, "white"],
];
const EDGES: [number, number, number, number][] = [
  [180, 90, 262, 75], [180, 150, 262, 165], [298, 66, 412, 54], [298, 172, 412, 154], [448, 50, 562, 50], [448, 150, 562, 150],
];
const FILL = { black: "var(--ink)", grey: "var(--muted)", white: "var(--surface)" };

// GC cycle phases on a timeline: [label, x, width, stop-the-world]
const PHASES: [string, number, number, boolean][] = [
  ["STW", 40, 50, true], ["Mark (song song)", 90, 400, false], ["STW", 490, 50, true], ["Sweep (song song, lười)", 540, 320, false],
];

export default function GoMemoryPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục bộ nhớ và GC">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#gm-escape"><span>01</span>Stack, heap, escape</a></li>
          <li><a href="#gm-tricolor"><span>02</span>GC ba màu</a></li>
          <li><a href="#gm-cycle"><span>03</span>Chu kỳ GC, STW</a></li>
          <li><a href="#gm-tune"><span>04</span>GOGC, GOMEMLIMIT</a></li>
          <li><a href="#gm-reduce"><span>05</span>Giảm áp lực GC</a></li>
          <li><a href="#gm-padding"><span>06</span>Struct padding</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · memory</div>
          <h1>Bộ nhớ, Escape Analysis và GC</h1>
          <p className="lede">Biến trên stack gần như miễn phí; biến trên heap phải được GC dọn. Phần lớn tối ưu hiệu năng trong Go là bớt cấp phát heap, và hiểu GC để chỉnh GOGC, GOMEMLIMIT đúng chỗ.</p>
          <div className="tape" aria-hidden="true">
            <div>-gcflags=-m</div>
            <div>tri-color</div>
            <div>write barrier</div>
            <div className="hw">GOMEMLIMIT</div>
            <div>sync.Pool</div>
            <div>Green Tea</div>
          </div>
        </header>

        <section id="gm-escape">
          <h2><span className="n">01</span>Stack, heap và escape analysis</h2>
          <p>Go không cho bạn chọn cấp phát ở đâu. Compiler chạy <b>escape analysis</b>: nếu chứng minh được biến không sống lâu hơn hàm tạo ra nó thì đặt trên stack (tự mất khi hàm return); nếu không chắc thì biến <b>escape</b> lên heap và GC phải quản lý.</p>
          <CodeCompare go={`func newInt() *int {
    x := 1      // nhỏ, nhưng vẫn lên heap: con trỏ tới x sống sau khi hàm return
    return &x
}

func log(v int) {
    fmt.Println(v) // v bị bọc vào interface any → thường escape
}

func buf(n int) []byte {
    return make([]byte, n) // kích thước không biết lúc biên dịch → heap
}

// go build -gcflags='-m' ./...
// ./main.go:2:5: moved to heap: x
// ./main.go:7:16: v escapes to heap`} js={`// V8 does escape analysis in the JIT; you cannot see or force it.
// Objects live on the heap, small integers (Smi) are stored inline.
function newInt() {
  const x = { v: 1 }; // heap object, collected once unreachable
  return x;
}

// Inspect the heap instead
// node --trace-gc app.js
// node --heapsnapshot-signal=SIGUSR2 app.js
console.log(process.memoryUsage().heapUsed);`} />
          <div className="pp">
            <div><span className="pl">Hay escape</span>Trả con trỏ tới biến local; gán vào interface; closure bắt biến và sống lâu hơn hàm; lưu vào biến global, map, channel; slice có kích thước động hoặc quá lớn.</div>
            <div><span className="pl">Không escape</span>Giá trị trả về theo value; con trỏ chỉ truyền xuống hàm con không giữ lại; <code>make([]T, 64)</code> với hằng số nhỏ.</div>
          </div>
        </section>

        <section id="gm-tricolor">
          <h2><span className="n">02</span>GC: tri-color mark &amp; sweep</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 250" role="img" aria-label="Đánh dấu ba màu: roots trỏ tới A, B đã quét xong màu đen; C, D màu xám đang chờ quét; E, F màu trắng sẽ được đánh dấu tiếp; X trắng không ai trỏ tới nên bị thu hồi">
                <Markers id="tc" />
                <Box x={20} y={60} w={160} h={110} title="Roots" sub="stack, global" cls="s-hl" />
                {EDGES.map(([x1, y1, x2, y2], i) => <path key={i} className="s-ln" d={`M${x1} ${y1} L${x2} ${y2}`} markerEnd="url(#tca)" />)}
                {OBJ.map(([n, x, y, c]) => (
                  <g key={n}>
                    <circle cx={x} cy={y} r="18" style={{ fill: FILL[c], stroke: "var(--ink)", strokeWidth: 1.5, strokeDasharray: n === "X" ? "4 3" : undefined }} />
                    <text className="s-tb" x={x} y={y + 5} textAnchor="middle" style={{ fill: c === "white" ? "var(--ink)" : "var(--surface)" }}>{n}</text>
                  </g>
                ))}
                <Label x={280} y={222} anchor="middle">đen: đã quét</Label>
                <Label x={430} y={222} anchor="middle">xám: chờ quét</Label>
                <Label x={580} y={222} anchor="middle">trắng: chưa thấy</Label>
                <Label x={740} y={160} anchor="middle" color="var(--bad)">không ai trỏ tới</Label>
                <Label x={740} y={176} anchor="middle" color="var(--bad)">→ sweep thu hồi</Label>
              </svg>
            </div>
            <figcaption>Bắt đầu mọi object là trắng; roots chuyển thành xám; lấy dần object xám ra quét, đánh dấu con của nó thành xám, bản thân thành đen. Hết xám thì object còn trắng là rác.</figcaption>
          </figure>
          <ul className="plain">
            <li><b>Concurrent:</b> mark chạy song song với code của bạn (mặc định dùng khoảng 25% CPU). Vì chương trình vẫn đổi con trỏ trong lúc mark, compiler chèn <b>write barrier</b> để object đen không bao giờ trỏ tới object trắng mà GC không biết.</li>
            <li><b>Non-generational, non-compacting:</b> không chia thế hệ trẻ/già như Java, không dời object. Bù lại cấp phát theo size class giúp ít phân mảnh.</li>
            <li><b>GC assist:</b> goroutine cấp phát quá nhanh trong lúc mark bị bắt làm phụ việc mark, nên latency của chính request đó tăng. Đây thường là nguồn gây trễ hơn cả STW.</li>
            <li><b>Green Tea GC</b> (mặc định từ 1.26): quét theo từng trang bộ nhớ thay vì nhảy theo từng object, tận dụng cache CPU tốt hơn, giảm 10–40% thời gian GC.</li>
          </ul>
        </section>

        <section id="gm-cycle">
          <h2><span className="n">03</span>Chu kỳ GC và STW</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 150" role="img" aria-label="Chu kỳ GC: STW ngắn để bật write barrier, mark song song, STW ngắn kết thúc mark, sweep song song">
                {PHASES.map(([t, x, w, stw], i) => (
                  <g key={i}>
                    <rect className={stw ? "s-bad" : "s-hl"} x={x} y={40} width={w} height={44} rx="5" />
                    <text className="s-tb" x={x + w / 2} y={67} textAnchor="middle">{t}</text>
                  </g>
                ))}
                <Label x={65} y={104} anchor="middle">bật write barrier</Label>
                <Label x={515} y={104} anchor="middle">mark termination</Label>
                <Label x={290} y={120} anchor="middle">25% CPU + GC assist, app vẫn chạy</Label>
                <Label x={700} y={120} anchor="middle">trang được dọn dần khi cấp phát</Label>
                <Label x={40} y={26}>mỗi STW thường chỉ vài chục tới vài trăm µs</Label>
              </svg>
            </div>
          </figure>
          <p>STW chỉ có hai lần ngắn: đầu chu kỳ (kết thúc sweep cũ, bật write barrier) và cuối mark (tắt write barrier, chuẩn bị sweep). Thời gian STW gần như không phụ thuộc kích thước heap. Nếu thấy pause dài, thường là do goroutine không thể dừng (trước 1.14) hoặc máy thiếu CPU.</p>
        </section>

        <section id="gm-tune">
          <h2><span className="n">04</span>GOGC và GOMEMLIMIT</h2>
          <div className="cmp">
            <div><h4>GOGC (mặc định 100)</h4>Chạy GC tiếp theo khi heap tăng thêm GOGC% so với heap còn sống sau lần GC trước. Live 200 MB, GOGC=100 → GC ở 400 MB. Tăng GOGC: ít GC hơn, tốn RAM hơn. <code>GOGC=off</code> tắt GC.</div>
            <div><h4>GOMEMLIMIT (1.19)</h4>Giới hạn mềm cho tổng bộ nhớ runtime. Gần chạm giới hạn thì GC chạy dày hơn bất kể GOGC. Đặt khoảng 80–90% memory limit của container để tránh bị OOM kill.</div>
          </div>
          <CodeCompare goLang="bash" jsLang="bash" go={`# container 1 GiB: GC thưa khi còn dư RAM, dày lên khi gần 900 MiB
GOGC=200 GOMEMLIMIT=900MiB ./app

# xem từng lần GC: thời gian, heap trước/sau, % CPU
GODEBUG=gctrace=1 ./app
# gc 12 @3.1s 2%: 0.03+1.8+0.02 ms clock, ... 180->184->95 MB, 190 MB goal, 8 P`} js={`# container 1 GiB: cap the old space so V8 collects before the OOM killer
node --max-old-space-size=900 app.js

# trace each GC: type, heap before -> after, time
node --trace-gc app.js
# ... Mark-Compact 180.0 (190.2) -> 95.1 (110.4) MB, 8.2 ms`} />
          <div className="note">Chỉ đặt GOMEMLIMIT mà heap sống thật sự gần chạm giới hạn thì GC chạy liên tục (death spiral), CPU lên cao. Giới hạn mềm không thay được việc sửa leak.</div>
        </section>

        <section id="gm-reduce">
          <h2><span className="n">05</span>Giảm áp lực GC</h2>
          <CodeCompare go={`// 1. Cấp phát trước đủ dung lượng
out := make([]Item, 0, len(in))

// 2. Tái sử dụng buffer qua sync.Pool (bị xoá dần sau mỗi lần GC, chỉ dùng cho dữ liệu tạm)
var bufPool = sync.Pool{New: func() any { return new(bytes.Buffer) }}

func render(v any) []byte {
    b := bufPool.Get().(*bytes.Buffer)
    b.Reset()
    defer bufPool.Put(b)
    json.NewEncoder(b).Encode(v)
    return bytes.Clone(b.Bytes()) // copy ra trước khi trả buffer về pool
}

// 3. Nối chuỗi bằng strings.Builder, append vào []byte có sẵn (strconv.AppendInt...)
// 4. Tránh []*T khi []T đủ dùng: ít object cho GC quét
// 5. Đo trước khi tối ưu
//    go test -bench=. -benchmem   →  allocs/op
//    func BenchmarkX(b *testing.B) { for b.Loop() { X() } }  // b.Loop từ 1.24`} js={`// 1. Preallocate
const out = new Array(input.length);

// 2. Buffers: Buffer.allocUnsafe draws from an internal pool; copy out what you keep
function render(v) {
  return Buffer.from(JSON.stringify(v));
}

// 3. Join strings with array.join, write into a preallocated Buffer
// 4. Prefer flat arrays of numbers (typed arrays) over arrays of objects: less for GC to trace
// 5. Measure before optimizing
//    node --cpu-prof app.js   ·   node --heap-prof app.js
//    benchmark with tinybench or mitata`} />
        </section>

        <section id="gm-padding">
          <h2><span className="n">06</span>Data alignment và struct padding</h2>
          <p>Mỗi field phải nằm ở địa chỉ chia hết cho kích thước căn lề của nó (int64 là 8 byte), nên compiler chèn byte trống giữa các field. Xếp field từ lớn tới nhỏ giảm phần thừa.</p>
          <CodeCompare go={`type Bad struct {  // 24 byte
    a bool         // 1 + 7 byte đệm
    b int64        // 8
    c bool         // 1 + 7 byte đệm
}

type Good struct { // 16 byte
    b int64        // 8
    a bool         // 1
    c bool         // 1 + 6 byte đệm
}

fmt.Println(unsafe.Sizeof(Bad{}), unsafe.Sizeof(Good{})) // 24 16
// Công cụ: fieldalignment (golang.org/x/tools) tự gợi ý thứ tự tốt hơn`} js={`// JS objects have no manual layout: V8 picks hidden classes.
// Keep the object shape stable so inline caches stay fast.
const bad = { a: true };
bad.b = 1;                       // adding a field later changes the shape
const good = { a: true, b: 1 };  // same fields, same order, from the start

// Need an exact layout? Use a DataView over an ArrayBuffer
const buf = new DataView(new ArrayBuffer(16));
buf.setBigInt64(0, 1n); // b at offset 0
buf.setUint8(8, 1);     // a at offset 8
buf.setUint8(9, 1);     // c at offset 9
console.log(buf.byteLength); // 16`} />
          <p className="sub">Đáng làm với struct có hàng triệu bản trong bộ nhớ hoặc nằm trong slice lớn. Với struct thường, ưu tiên thứ tự dễ đọc.</p>
        </section>
      </main>
    </div>
  );
}
