import Link from "next/link";
import { Code } from "@/components/Code";
import { Flow } from "@/components/Flow";

export default function OsThreadPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục kernel và OS thread">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#ot-kernel"><span>01</span>Kernel là gì</a></li>
          <li><a href="#ot-syscall"><span>02</span>System call</a></li>
          <li><a href="#ot-process"><span>03</span>Process và thread</a></li>
          <li><a href="#ot-cost"><span>04</span>Chi phí của OS thread</a></li>
          <li><a href="#ot-node"><span>05</span>Node.js dùng thread</a></li>
          <li><a href="#ot-go"><span>06</span>Go: goroutine</a></li>
          <li><a href="#ot-where"><span>07</span>Thread nằm ở máy nào</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">đồng thời · kernel &amp; os thread</div>
          <h1>Kernel, process và OS thread</h1>
          <p className="lede">Mọi đoạn code đồng thời, dù là event loop của Node.js hay goroutine của Go, cuối cùng đều chạy trên <b>OS thread</b> do <b>kernel</b> lập lịch lên các core CPU. Nắm hai khái niệm này thì hiểu được vì sao Node chặn khi tính toán nặng, vì sao goroutine rẻ, và vì sao server cần nhiều vCPU.</p>
          <div className="tape" aria-hidden="true">
            <div>app</div>
            <div>syscall</div>
            <div className="hw">kernel</div>
            <div>cpu</div>
          </div>
        </header>

        <section id="ot-kernel">
          <h2><span className="n">01</span>Kernel là gì</h2>
          <p><b>Kernel</b> (nhân hệ điều hành) là phần lõi của hệ điều hành và là chương trình duy nhất được toàn quyền điều khiển phần cứng: CPU, RAM, ổ đĩa, card mạng. Linux, Windows NT, XNU (macOS) đều là kernel.</p>
          <Flow id="otlayers" label="Các tầng: app, kernel, phần cứng" steps={[
            { title: "App", sub: "user space" },
            { title: "System call", sub: "ranh giới" },
            { title: "Kernel", sub: "kernel space", hl: true },
            { title: "Phần cứng", sub: "CPU, RAM, disk, NIC" },
          ]} caption="App không đụng thẳng vào phần cứng; mọi thứ đi qua kernel." />
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>User space</th>
                  <th>Kernel space</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Chạy gì</b></td>
                  <td>App của bạn: <code>node</code>, binary Go, Chrome, VS Code</td>
                  <td>Kernel: scheduler, quản lý bộ nhớ, file system, network, driver</td>
                </tr>
                <tr>
                  <td><b>Quyền</b></td>
                  <td>Hạn chế, chỉ thấy vùng nhớ của mình</td>
                  <td>Toàn quyền với phần cứng và mọi vùng nhớ</td>
                </tr>
                <tr>
                  <td><b>Lỗi thì sao</b></td>
                  <td>Chỉ process đó chết</td>
                  <td>Cả máy treo (kernel panic, màn hình xanh)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Docker</b> container dùng chung kernel với máy host, chỉ cô lập process, mạng và file system. Vì vậy container nhẹ hơn máy ảo, vốn phải chạy cả một kernel riêng.</div>
        </section>

        <section id="ot-syscall">
          <h2><span className="n">02</span>System call: cách app nhờ kernel</h2>
          <p>Muốn đọc file, mở socket, xin thêm RAM hay tạo thread, app phải gọi <b>system call</b> (<code>read</code>, <code>write</code>, <code>open</code>, <code>socket</code>, <code>mmap</code>, <code>clone</code>...). CPU chuyển từ user mode sang kernel mode, kernel làm việc rồi trả kết quả về. Lần chuyển này đắt hơn nhiều so với một lời gọi hàm thường.</p>
          <Code lang="ts">{`// Node.js: one line of JS...
const data = await fs.promises.readFile("orders.json");

// ...ends up as system calls handled by the kernel (seen with: strace -f node app.js)
// openat(AT_FDCWD, "orders.json", O_RDONLY) = 21
// read(21, "[{\\"id\\":1,...", 65536)         = 4096
// close(21)                                  = 0`}</Code>
          <Code lang="go">{`// Go: same story, os.ReadFile -> open/read/close syscalls
data, err := os.ReadFile("orders.json")`}</Code>
        </section>

        <section id="ot-process">
          <h2><span className="n">03</span>Process và thread</h2>
          <p><b>Process</b> là một chương trình đang chạy, có vùng nhớ riêng. <b>Thread</b> là một luồng thực thi bên trong process. Các thread của cùng process dùng chung heap và biến toàn cục, nhưng mỗi thread có <b>stack</b> và thanh ghi riêng. <b>OS thread</b> là thread do kernel tạo và lập lịch.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Process</th>
                  <th>Thread</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Bộ nhớ</b></td>
                  <td>Riêng, process khác không đọc được</td>
                  <td>Dùng chung heap với các thread khác trong process</td>
                </tr>
                <tr>
                  <td><b>Giao tiếp</b></td>
                  <td>Qua pipe, socket, shared memory (IPC)</td>
                  <td>Đọc ghi chung biến, nên cần lock để tránh race condition</td>
                </tr>
                <tr>
                  <td><b>Một cái chết</b></td>
                  <td>Process khác không ảnh hưởng</td>
                  <td>Crash thì cả process chết theo</td>
                </tr>
                <tr>
                  <td><b>Chi phí tạo</b></td>
                  <td>Đắt nhất (vùng nhớ mới)</td>
                  <td>Rẻ hơn process, nhưng vẫn phải gọi vào kernel</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Kernel scheduler quyết định thread nào chạy trên core nào, mỗi lượt bao lâu (time slice). Máy có 4 core thì tại một thời điểm chỉ có tối đa 4 thread chạy thật; các thread còn lại chờ đến lượt.</p>
        </section>

        <section id="ot-cost">
          <h2><span className="n">04</span>Chi phí của OS thread</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Tiêu chí</th>
                  <th>OS thread</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>Ai quản lý</b></td><td>Kernel</td></tr>
                <tr><td><b>Stack</b></td><td>Cố định, thường 1–8 MB (Linux mặc định 8 MB vùng ảo)</td></tr>
                <tr><td><b>Tạo mới</b></td><td>Vài micro giây, phải gọi system call</td></tr>
                <tr><td><b>Context switch</b></td><td>Kernel lưu và nạp lại thanh ghi, cache CPU bị nguội</td></tr>
                <tr><td><b>Số lượng thực tế</b></td><td>Vài nghìn thì máy bắt đầu đuối</td></tr>
                <tr><td><b>Song song thật</b></td><td>Có, mỗi core chạy một thread tại một thời điểm</td></tr>
              </tbody>
            </table>
          </div>
          <div className="note">Mô hình <b>một request một thread</b> (Java servlet, Apache cũ) gặp giới hạn này khi có 10.000 kết nối cùng lúc. Node.js (event loop) và Go (goroutine) là hai cách khác nhau để tránh nó.</div>
        </section>

        <section id="ot-node">
          <h2><span className="n">05</span>Node.js dùng thread thế nào</h2>
          <Flow id="otnode" label="Node.js: một thread chạy JS và thread pool của libuv" steps={[
            { title: "Main thread", sub: "event loop, chạy JS", hl: true },
            { title: "libuv pool", sub: "4 thread mặc định" },
            { title: "Kernel", sub: "epoll / IOCP cho network" },
          ]} />
          <ul>
            <li>Code JS của bạn chạy trên <b>một</b> OS thread. Một vòng lặp tính toán nặng sẽ chặn mọi request khác.</li>
            <li>Network I/O không cần thread riêng: libuv nhờ kernel báo khi socket sẵn sàng (epoll trên Linux, IOCP trên Windows).</li>
            <li>File, DNS (<code>dns.lookup</code>), <code>crypto</code>, <code>zlib</code> chạy trên <b>thread pool</b> của libuv, mặc định 4 thread.</li>
            <li>Muốn chạy JS song song thật thì dùng <code>worker_threads</code> (mỗi worker là một OS thread kèm một V8 isolate riêng) hoặc chạy nhiều process (cluster, PM2).</li>
          </ul>
          <Code lang="ts">{`// Raise the libuv pool when many file/crypto calls run at once (set before startup)
// UV_THREADPOOL_SIZE=16 node server.js

// CPU-heavy work: move it off the main thread
import { Worker } from "node:worker_threads";
const worker = new Worker("./resize-image.js", { workerData: { path } });
worker.on("message", (out) => res.json(out));`}</Code>
        </section>

        <section id="ot-go">
          <h2><span className="n">06</span>Go: goroutine chạy trên OS thread</h2>
          <p>Goroutine <b>không phải</b> OS thread. Goroutine do <b>runtime Go</b> quản lý ở user space: stack ban đầu khoảng 2 KB, tạo và chuyển đổi không cần gọi vào kernel, nên chạy được hàng trăm nghìn tới hàng triệu cái. Scheduler GMP xếp các goroutine (G) lên một số ít OS thread (M) thông qua P, mặc định có <code>GOMAXPROCS</code> P bằng số core.</p>
          <Flow id="otgo" label="Goroutine được xếp lên OS thread rồi chạy trên core" steps={[
            { title: "Goroutine (G)", sub: "hàng nghìn, runtime Go" },
            { title: "P", sub: "GOMAXPROCS cái" },
            { title: "OS thread (M)", sub: "kernel quản lý", hl: true },
            { title: "Core CPU", sub: "chạy thật" },
          ]} />
          <p>Chi tiết G, M, P, work stealing, syscall chặn: xem <Link className="plink" href="/golang/runtime/">Go → Runtime &amp; GMP</Link>.</p>
        </section>

        <section id="ot-where">
          <h2><span className="n">07</span>Thread nằm ở máy nào</h2>
          <p>Thread luôn được tạo trên <b>máy đang chạy đoạn code đó</b>, do kernel của chính máy đó quản lý.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Code của bạn</th>
                  <th>Thread nằm ở đâu</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>Backend Go / Node deploy lên EC2</b></td><td>Trên EC2, kernel Linux của EC2 lập lịch lên các vCPU của nó</td></tr>
                <tr><td><b><code>npm run dev</code>, <code>go run</code> trên laptop</b></td><td>Trên laptop của bạn</td></tr>
                <tr><td><b>JS frontend (React, client component)</b></td><td>Trên máy người dùng, trong process của browser</td></tr>
                <tr><td><b>Backend trong Docker trên EC2</b></td><td>Vẫn trên EC2: container dùng chung kernel với host</td></tr>
                <tr><td><b>Lambda, Fargate</b></td><td>Trên máy ảo do AWS quản lý</td></tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Hệ quả:</b> 10.000 người dùng gọi API thì mọi thread xử lý đều nằm trên server, máy người dùng mạnh hay yếu không giúp gì. Server chịu tải nặng thì phải nâng vCPU/RAM hoặc thêm instance sau load balancer. Chạy local thấy nhanh chưa chắc lên EC2 cũng nhanh: laptop có thể 8–16 core, EC2 nhỏ chỉ 2 vCPU.</div>
        </section>
      </main>
    </div>
  );
}
