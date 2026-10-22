import { Code } from "@/components/Code";

export default function JsToolboxPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục công cụ hằng ngày của JavaScript">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#jt-destructure"><span>01</span>Destructuring và spread</a></li>
          <li><a href="#jt-array"><span>02</span>map, filter, reduce</a></li>
          <li><a href="#jt-rate"><span>03</span>Debounce và throttle</a></li>
          <li><a href="#jt-memory"><span>04</span>Quản lý bộ nhớ</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">javascript · toolbox</div>
          <h1>Công cụ dùng hằng ngày</h1>
          <p className="lede">Bốn thứ xuất hiện trong gần như mọi dự án: bóc tách dữ liệu gọn bằng destructuring, xử lý mảng bằng map/filter/reduce, kiểm soát tần suất gọi hàm, và tránh rò rỉ bộ nhớ.</p>
          <div className="tape" aria-hidden="true">
            <div>destructuring</div>
            <div>spread</div>
            <div className="hw">reduce</div>
            <div>debounce</div>
            <div>WeakMap</div>
          </div>
        </header>

        <section id="jt-destructure">
          <h2><span className="n">01</span>Destructuring và spread</h2>
          <p>Destructuring rút giá trị từ array hoặc object ra biến. Spread (<code>...</code>) trải phần tử ra để copy hoặc gộp. Cả hai đều là <b>shallow</b>: object lồng bên trong vẫn dùng chung tham chiếu.</p>
          <Code lang="js">{`const [a, b = 0, ...rest] = [1, undefined, 3, 4]; // a=1, b=0 (default), rest=[3,4]

const { name, age, address: { city } = {}, ...others } = user;
const { id: userId } = user;                      // rename while extracting

// In function parameters, with defaults
function createUser({ name, role = "member" } = {}) {
  return { name, role };
}

// Swap without a temp variable
[x, y] = [y, x];

// Spread: copy and merge (later keys win)
const merged = { ...defaults, ...overrides };
const next = [...list, newItem];                  // does not mutate list`}</Code>
          <div className="note tip"><b>Cập nhật state bất biến:</b> <code>{"{ ...state, count: state.count + 1 }"}</code> tạo object mới thay vì sửa object cũ. React, Redux dựa vào cách này để phát hiện thay đổi.</div>
        </section>

        <section id="jt-array">
          <h2><span className="n">02</span>map, filter, reduce</h2>
          <p>Biến đổi, lọc và gộp mảng mà không sửa mảng gốc. Mỗi hàm nhận callback và trả về kết quả mới.</p>
          <Code lang="js">{`const nums = [1, 2, 3, 4];

nums.map((n) => n * 2);               // [2, 4, 6, 8]   one in, one out
nums.filter((n) => n % 2 === 0);      // [2, 4]         keep matches
nums.reduce((sum, n) => sum + n, 0);  // 10             fold into one value

// Group by with reduce
const byRole = users.reduce((acc, u) => {
  (acc[u.role] ??= []).push(u);
  return acc;
}, {});

nums.find((n) => n > 2);   // 3 (first match, or undefined)
nums.some((n) => n > 3);   // true
nums.every((n) => n > 0);  // true
nums.flatMap((n) => [n, n]);                     // map then flatten one level
users.map((u) => u.id).filter(Boolean);          // chain them`}</Code>
          <div className="pp">
            <div className="warnc"><span className="pl">Lưu ý</span>Luôn truyền giá trị khởi tạo cho <code>reduce</code>; không có thì mảng rỗng ném <code>TypeError</code>. <code>sort</code>, <code>push</code>, <code>splice</code> thì <b>có</b> sửa mảng gốc.</div>
            <div><span className="pl">Bản không sửa gốc</span><code>toSorted</code>, <code>toReversed</code>, <code>toSpliced</code>, <code>with</code> (ES2023) trả về mảng mới.</div>
          </div>
        </section>

        <section id="jt-rate">
          <h2><span className="n">03</span>Debounce và throttle</h2>
          <p>Sự kiện như gõ phím, scroll, resize bắn rất dày. Hai kỹ thuật này giới hạn số lần hàm thật sự chạy.</p>
          <div className="pp">
            <div><span className="pl">Debounce</span>Chờ tới khi ngừng gọi một khoảng thời gian rồi mới chạy <b>một lần</b>. Hợp với ô tìm kiếm: chờ người dùng gõ xong mới gọi API.</div>
            <div><span className="pl">Throttle</span>Chạy tối đa <b>một lần mỗi khoảng</b>, dù bị gọi liên tục. Hợp với scroll, resize, kéo thả.</div>
          </div>
          <Code lang="js">{`function debounce(fn, delay) {
  let timer;                                   // kept alive by the closure
  return (...args) => {
    clearTimeout(timer);                       // every call resets the wait
    timer = setTimeout(() => fn(...args), delay);
  };
}

function throttle(fn, interval) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= interval) {              // enough time passed since last run
      last = now;
      fn(...args);
    }
  };
}

input.addEventListener("input", debounce((e) => search(e.target.value), 300));
window.addEventListener("scroll", throttle(updateProgressBar, 100));`}</Code>
        </section>

        <section id="jt-memory">
          <h2><span className="n">04</span>Quản lý bộ nhớ</h2>
          <p>JS tự dọn bộ nhớ bằng garbage collector: dữ liệu nào <b>không còn reachable</b> từ các root (biến global, stack, ...) sẽ bị thu hồi. Rò rỉ xảy ra khi còn một tham chiếu vô tình giữ dữ liệu lại.</p>
          <ul className="plain">
            <li>Biến global tạo ra do quên khai báo.</li>
            <li><code>setInterval</code> hoặc event listener không được gỡ khi component/trang đã bỏ.</li>
            <li>Closure giữ tham chiếu tới object lớn mà không cần dùng nữa.</li>
            <li>Cache hoặc <code>Map</code> phình không giới hạn.</li>
          </ul>
          <Code lang="js">{`const onClick = () => {};
button.addEventListener("click", onClick);
// cleanup when the element or component goes away
button.removeEventListener("click", onClick);

const id = setInterval(tick, 1000);
clearInterval(id);

// WeakMap: keys do not keep objects alive
const meta = new WeakMap();
meta.set(someObject, { seenAt: Date.now() });   // entry disappears with someObject

// Remove many listeners at once with an AbortController
const ctrl = new AbortController();
window.addEventListener("resize", onResize, { signal: ctrl.signal });
window.addEventListener("scroll", onScroll, { signal: ctrl.signal });
ctrl.abort();                                    // removes every listener using this signal`}</Code>
          <div className="note tip"><b>Tìm rò rỉ:</b> Chrome DevTools, tab Memory, chụp heap snapshot hai lần và so sánh. Trong Node.js dùng <code>node --inspect</code> hoặc <code>process.memoryUsage()</code>.</div>
        </section>
      </main>
    </div>
  );
}
