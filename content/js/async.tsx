import { Code } from "@/components/Code";

export default function JsAsyncPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục bất đồng bộ trong JavaScript">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#ja-loop"><span>01</span>Event loop</a></li>
          <li><a href="#ja-promise"><span>02</span>Promise</a></li>
          <li><a href="#ja-await"><span>03</span>async / await</a></li>
          <li><a href="#ja-pitfalls"><span>04</span>Lỗi hay gặp</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">javascript · async</div>
          <h1>Bất đồng bộ: Event loop, Promise, async/await</h1>
          <p className="lede">JavaScript chạy trên một luồng, nhưng vẫn gọi mạng, đọc file, đặt timer mà không đứng chờ. Event loop điều phối việc đó, Promise biểu diễn kết quả tương lai, async/await giúp viết code đó như code đồng bộ.</p>
          <div className="tape" aria-hidden="true">
            <div>call stack</div>
            <div className="hw">microtask</div>
            <div>task queue</div>
            <div>Promise</div>
            <div>await</div>
          </div>
        </header>

        <section id="ja-loop">
          <h2><span className="n">01</span>Event loop</h2>
          <p>Event loop liên tục làm một việc: khi <b>call stack</b> trống thì lấy việc tiếp theo từ các hàng đợi.</p>
          <ul className="plain">
            <li><b>Call stack:</b> code đồng bộ đang chạy.</li>
            <li><b>Microtask queue:</b> callback của <code>Promise.then</code>, <code>await</code>, <code>queueMicrotask</code>. Ưu tiên cao.</li>
            <li><b>Task (macrotask) queue:</b> <code>setTimeout</code>, <code>setInterval</code>, I/O (Input/Output), sự kiện UI (User Interface).</li>
          </ul>
          <p>Thứ tự: chạy hết stack, rồi chạy <b>toàn bộ</b> microtask, rồi lấy <b>một</b> task, rồi lặp lại.</p>
          <Code lang="js">{`console.log("1 sync");
setTimeout(() => console.log("4 task"), 0);
Promise.resolve().then(() => console.log("3 microtask"));
console.log("2 sync");
// Output: 1 sync, 2 sync, 3 microtask, 4 task`}</Code>
          <div className="note"><b>Hệ quả:</b> code đồng bộ chạy lâu (vòng lặp lớn, <code>JSON.parse</code> file khổng lồ) chặn event loop: trình duyệt đơ, server Node.js không nhận request mới. Việc nặng nên chia nhỏ hoặc đưa sang worker.</div>
        </section>

        <section id="ja-promise">
          <h2><span className="n">02</span>Promise</h2>
          <p>Promise là object đại diện cho kết quả của một việc chưa xong. Nó có ba trạng thái: <b>pending</b> (đang chờ), <b>fulfilled</b> (thành công, có giá trị) hoặc <b>rejected</b> (thất bại, có lỗi). Đã settle thì không đổi nữa.</p>
          <Code lang="js">{`const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

fetch("/api/user")
  .then((res) => res.json())          // mỗi then trả về một promise mới
  .then((user) => console.log(user))
  .catch((err) => console.error(err)) // bắt mọi lỗi phía trên
  .finally(() => console.log("done"));`}</Code>
          <p>Chạy nhiều promise cùng lúc:</p>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Hàm</th><th>Kết quả</th><th>Khi nào dùng</th></tr>
              </thead>
              <tbody>
                <tr><td><code>Promise.all</code></td><td>Mảng kết quả; reject ngay khi một cái lỗi</td><td>Các việc độc lập, cần tất cả thành công</td></tr>
                <tr><td><code>Promise.allSettled</code></td><td>Mảng <code>{"{ status, value | reason }"}</code>, không bao giờ reject</td><td>Muốn biết kết quả từng cái dù có cái lỗi</td></tr>
                <tr><td><code>Promise.race</code></td><td>Cái đầu tiên settle (thành công hoặc lỗi)</td><td>Timeout</td></tr>
                <tr><td><code>Promise.any</code></td><td>Cái đầu tiên thành công</td><td>Gọi nhiều nguồn dự phòng</td></tr>
              </tbody>
            </table>
          </div>
          <Code lang="js">{`// Timeout bằng race
const withTimeout = (p, ms) =>
  Promise.race([p, wait(ms).then(() => { throw new Error("timeout"); })]);`}</Code>
        </section>

        <section id="ja-await">
          <h2><span className="n">03</span>async / await</h2>
          <p><code>async</code> làm hàm luôn trả về Promise. <code>await</code> tạm dừng hàm đó (không chặn luồng chính) tới khi Promise settle, rồi trả về giá trị hoặc ném lỗi. Lỗi bắt bằng <code>try/catch</code> như code thường.</p>
          <Code lang="js">{`async function getUser(id) {
  try {
    const res = await fetch("/api/users/" + id);
    if (!res.ok) throw new Error("HTTP " + res.status); // fetch không reject khi gặp 404/500
    return await res.json();
  } catch (err) {
    console.error("getUser failed", err);
    throw err;                                          // để nơi gọi tự quyết định
  }
}

// Các lời gọi độc lập: chạy song song, không chạy lần lượt
const [user, orders] = await Promise.all([getUser(1), getOrders(1)]);`}</Code>
          <p>Bên dưới, mỗi <code>await</code> là một điểm mà phần code phía sau được đặt vào microtask queue để chạy tiếp khi Promise xong.</p>
        </section>

        <section id="ja-pitfalls">
          <h2><span className="n">04</span>Lỗi hay gặp</h2>
          <div className="pp">
            <div className="warnc"><span className="pl">Chậm không cần thiết</span><code>await</code> tuần tự trong vòng lặp cho các việc độc lập. Tổng thời gian bằng tổng từng việc.</div>
            <div><span className="pl">Cách sửa</span>Tạo mảng promise rồi <code>Promise.all</code>. Cần giới hạn số lượng đồng thời thì chia batch.</div>
          </div>
          <Code lang="js">{`// Chậm: gọi từng request một
for (const id of ids) results.push(await getUser(id));

// Nhanh: gọi tất cả cùng lúc
const results2 = await Promise.all(ids.map(getUser));

// forEach KHÔNG chờ callback async
ids.forEach(async (id) => { await save(id); }); // kết thúc trước khi các lệnh save xong
for (const id of ids) await save(id);           // chờ xong từng cái, theo thứ tự`}</Code>
          <ul className="plain">
            <li><b>Quên <code>await</code>:</b> nhận về Promise thay vì giá trị, và lỗi bị nuốt thành <i>unhandled rejection</i>.</li>
            <li><b>Nuốt lỗi trong <code>catch</code>:</b> không <code>throw</code> lại thì caller tưởng đã thành công.</li>
            <li><b><code>await</code> ngoài hàm async:</b> chỉ dùng được ở top level của ES module.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
