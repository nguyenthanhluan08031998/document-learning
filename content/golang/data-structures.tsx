import { CodeCompare } from "@/components/CodeCompare";
import { Box, Label, Markers } from "@/components/Svg";

const ARR = ["10", "20", "30", "40", "50", "", ""];

export default function GoDataStructuresPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục slice, map, interface">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#gd-slice"><span>01</span>Slice</a></li>
          <li><a href="#gd-append"><span>02</span>append, truyền slice</a></li>
          <li><a href="#gd-map"><span>03</span>Map</a></li>
          <li><a href="#gd-syncmap"><span>04</span>Map và goroutine</a></li>
          <li><a href="#gd-iface"><span>05</span>Interface</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · data structures</div>
          <h1>Slice, Map và Interface bên dưới</h1>
          <p className="lede">Ba kiểu dùng nhiều nhất cũng là ba nguồn bug kinh điển: slice dùng chung mảng, map không an toàn khi nhiều goroutine ghi, interface chứa con trỏ nil mà vẫn khác nil.</p>
          <div className="tape" aria-hidden="true">
            <div>ptr · len · cap</div>
            <div>append</div>
            <div className="hw">Swiss Tables</div>
            <div>sync.Map</div>
            <div>eface · iface</div>
            <div>itab</div>
          </div>
        </header>

        <section id="gd-slice">
          <h2><span className="n">01</span>Slice là một header ba trường</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 240" role="img" aria-label="Mảng nền 7 ô; slice a có ptr trỏ ô đầu, len 5, cap 7; slice b bằng a[1:3] trỏ ô thứ hai, len 2, cap 6, dùng chung mảng nền với a">
                <Markers id="sl" />
                <Box x={20} y={20} w={190} h={60} title="a  []int" sub="ptr · len=5 · cap=7" cls="s-hl" />
                <Box x={20} y={150} w={190} h={60} title="b := a[1:3]" sub="ptr · len=2 · cap=6" cls="s-hl" />
                <text className="s-lane" x="620" y="96">MẢNG NỀN (backing array)</text>
                {ARR.map((v, i) => (
                  <g key={i}>
                    <rect className={i >= 1 && i < 3 ? "s-disk" : "s-box"} x={300 + i * 80} y={108} width={72} height={44} rx="5" />
                    <text className="s-tb" x={336 + i * 80} y={135} textAnchor="middle">{v}</text>
                    <text className="s-tm" x={336 + i * 80} y={168} textAnchor="middle">[{i}]</text>
                  </g>
                ))}
                <path className="s-ln" d="M210 50 C260 50 300 70 330 106" markerEnd="url(#sla)" />
                <path className="s-ln" d="M210 180 C300 180 380 170 410 154" markerEnd="url(#sla)" />
                <Label x={300} y={210}>b[0] = 99 đổi luôn a[1]: hai slice cùng trỏ vào một mảng</Label>
              </svg>
            </div>
            <figcaption>Slice header gồm con trỏ tới mảng, <code>len</code> (số phần tử dùng được) và <code>cap</code> (từ ptr tới cuối mảng). 24 byte trên máy 64-bit.</figcaption>
          </figure>
        </section>

        <section id="gd-append">
          <h2><span className="n">02</span>append và truyền slice vào hàm</h2>
          <ul className="plain">
            <li>Còn cap: <code>append</code> ghi vào mảng cũ, tăng len. Hết cap: cấp phát mảng mới, copy sang, trả header mới trỏ vào mảng mới. Vì vậy phải viết <code>s = append(s, x)</code>.</li>
            <li>Cách tăng (từ 1.18): cap dưới 256 thì gấp đôi; lớn hơn thì tăng dần từ 2x xuống khoảng 1.25x, sau đó làm tròn lên theo size class của bộ cấp phát.</li>
          </ul>
          <CodeCompare go={`func modify(s []int) {
    s[0] = 100          // header được copy, nhưng ptr trỏ cùng mảng → caller thấy thay đổi
    s = append(s, 4)    // chỉ đổi len/ptr của bản copy → caller không thấy
}

s := make([]int, 3, 10)
modify(s)
fmt.Println(s, len(s)) // [100 0 0] 3  — phần tử thứ 4 nằm trong mảng nhưng ngoài len

// Bẫy: append vào slice con ghi đè dữ liệu của slice cha
a := []int{1, 2, 3, 4}
b := a[:2]
b = append(b, 99)      // còn cap → ghi vào a[2]
fmt.Println(a)         // [1 2 99 4]
c := a[:2:2]           // slice ba chỉ số: cap = 2, append buộc phải cấp mảng mới

// Bẫy bộ nhớ: giữ slice nhỏ của mảng lớn giữ cả mảng lớn sống
head := bytes.Clone(big[:64])`} js={`// Arrays are passed by reference: both changes are visible to the caller
function modify(arr) {
  arr[0] = 100;
  arr.push(4);
}
const s = new Array(3).fill(0);
modify(s);
console.log(s, s.length); // [100, 0, 0, 4] 4

// slice() copies; a typed-array view shares memory like a Go sub-slice
const a = new Int32Array([1, 2, 3, 4]);
const b = a.subarray(0, 2); // shares the buffer with a
b[0] = 99;                  // a[0] is now 99
const c = a.slice(0, 2);    // independent copy

// A small view keeps the whole ArrayBuffer alive: copy it to release the big one
const head = big.slice(0, 64);`} />
        </section>

        <section id="gd-map">
          <h2><span className="n">03</span>Map bên dưới</h2>
          <div className="cmp">
            <div><h4>Trước 1.24: hmap + bucket</h4><code>hmap</code> giữ mảng 2<sup>B</sup> bucket. Mỗi bucket (bmap) 8 ô key/value và 8 byte tophash; đầy thì nối overflow bucket. Khi trung bình hơn 6.5 phần tử/bucket thì tăng gấp đôi; quá nhiều overflow thì tạo lại cùng kích thước. <b>Evacuation</b> diễn ra dần: mỗi lần ghi chuyển vài bucket cũ sang mảng mới, không dừng cả map.</div>
            <div><h4>Từ 1.24: Swiss Tables</h4>Ô được chia thành nhóm 8 ô, mỗi nhóm có một control word chứa 7 bit hash của từng ô, so khớp cả 8 ô một lúc. Map lớn được chia thành nhiều table nhỏ (tối đa 1024 ô), table nào đầy thì chỉ table đó tách đôi, nên tăng kích thước rải đều, không có lần copy lớn. Nhanh hơn, ít bộ nhớ hơn.</div>
          </div>
          <ul className="plain">
            <li>Thứ tự duyệt <b>cố ý ngẫu nhiên</b>; cần thứ tự thì <code>slices.Sorted(maps.Keys(m))</code>.</li>
            <li>Không lấy địa chỉ phần tử map được (<code>&amp;m[k]</code> lỗi biên dịch) vì phần tử có thể bị dời khi map lớn lên.</li>
            <li>Map không tự thu nhỏ: xoá hết phần tử vẫn giữ bộ nhớ của bucket. Map lớn tạm thời thì tạo map mới.</li>
          </ul>
        </section>

        <section id="gd-syncmap">
          <h2><span className="n">04</span>Map và nhiều goroutine</h2>
          <p>Map không có lock bên trong để giữ nhanh cho trường hợp phổ biến (một goroutine). Hai goroutine cùng ghi, hoặc một ghi một đọc, runtime phát hiện và dừng cả chương trình bằng <code>fatal error: concurrent map writes</code> (hoặc <code>concurrent map read and map write</code>), không recover được.</p>
          <div className="tbl">
            <table>
              <thead><tr><th>Cách</th><th>Hợp khi</th><th>Lưu ý</th></tr></thead>
              <tbody>
                <tr><td><b>map + sync.RWMutex</b></td><td>Phần lớn trường hợp; cần kiểu tĩnh, cần đếm len, duyệt có kiểm soát</td><td>Ghi nhiều thì lock thành điểm nghẽn → chia shard (N map, N lock theo hash key)</td></tr>
                <tr><td><b>sync.Map</b></td><td>Key ghi một lần đọc rất nhiều (cache), hoặc mỗi goroutine làm việc với tập key riêng</td><td>Kiểu <code>any</code>, không có len. Từ 1.24 dùng hash-trie đồng thời, ghi nhanh hơn trước</td></tr>
              </tbody>
            </table>
          </div>
          <CodeCompare jsLang="bash" go={`// Phát hiện data race khi test và chạy thử
go test -race ./...
go run -race .`} js={`# A single JS thread has no data race; races are logical (await interleaving).
# Test with real concurrency (worker_threads) through the built-in runner:
node --test`} />
        </section>

        <section id="gd-iface">
          <h2><span className="n">05</span>Interface: eface và iface</h2>
          <div className="cmp">
            <div><h4>eface · <code>any</code></h4>Hai word: <code>_type</code> (kiểu động) và <code>data</code> (con trỏ tới giá trị).</div>
            <div><h4>iface · interface có method</h4>Hai word: <code>tab *itab</code> và <code>data</code>. itab chứa kiểu interface, kiểu động và bảng con trỏ hàm <code>fun[]</code>; được tính một lần rồi cache.</div>
          </div>
          <p><b>Interface satisfaction</b> là ngầm định: kiểu có đủ method thì thoả, không cần khai báo <code>implements</code>. Kiểm tra lúc biên dịch bằng <code>var _ Repo = (*PgRepo)(nil)</code>.</p>
          <p><b>Chi phí gọi qua interface:</b> một lần gọi gián tiếp qua itab, compiler không inline được (trừ khi PGO (Profile-Guided Optimization) devirtualize), và gán giá trị vào interface thường làm nó escape lên heap. Đáng kể trong vòng lặp nóng; không đáng kể ở tầng service/repository.</p>
          <CodeCompare go={`// Bẫy nil interface: interface chỉ nil khi cả _type và data đều nil
func find() error {
    var err *NotFoundError = nil
    return err             // trả iface{tab: *NotFoundError, data: nil}
}
fmt.Println(find() == nil) // false!  → trả thẳng nil khi không có lỗi

// 1.26: errors.AsType thay cho errors.As với biến tạm
if nf, ok := errors.AsType[*NotFoundError](err); ok { ... }`} js={`// No nil-interface trap: null is a plain value
function find() {
  const err = null;
  return err;                   // null
}
console.log(find() === null);   // true

// Pitfall instead: null vs undefined
console.log(null == undefined, null === undefined); // true false

// Typed errors: instanceof replaces errors.As
if (err instanceof NotFoundError) { ... }`} />
        </section>
      </main>
    </div>
  );
}
