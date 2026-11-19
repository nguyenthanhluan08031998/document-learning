import Link from "next/link";
import { Code } from "@/components/Code";
import { Flow } from "@/components/Flow";

export default function OsThreadPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Kernel and OS thread contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#ot-kernel"><span>01</span>What a kernel is</a></li>
          <li><a href="#ot-syscall"><span>02</span>System calls</a></li>
          <li><a href="#ot-process"><span>03</span>Process and thread</a></li>
          <li><a href="#ot-cost"><span>04</span>Cost of an OS thread</a></li>
          <li><a href="#ot-node"><span>05</span>Threads in Node.js</a></li>
          <li><a href="#ot-go"><span>06</span>Go: goroutines</a></li>
          <li><a href="#ot-where"><span>07</span>Which machine runs it</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">concurrency · kernel &amp; os thread</div>
          <h1>Kernel, process and OS thread</h1>
          <p className="lede">All concurrent code, whether Node.js&apos;s event loop or Go&apos;s goroutines, ends up running on <b>OS threads</b> that the <b>kernel</b> schedules onto CPU cores. With these two ideas you can explain why Node blocks on heavy computation, why goroutines are cheap, and why servers need more vCPUs.</p>
          <div className="tape" aria-hidden="true">
            <div>app</div>
            <div>syscall</div>
            <div className="hw">kernel</div>
            <div>cpu</div>
          </div>
        </header>

        <section id="ot-kernel">
          <h2><span className="n">01</span>What a kernel is</h2>
          <p>The <b>kernel</b> is the core of the operating system and the only program with full control of the hardware: CPU, RAM, disks, network cards. Linux, Windows NT and XNU (macOS) are kernels.</p>
          <Flow id="otlayers" label="Layers: app, kernel, hardware" steps={[
            { title: "App", sub: "user space" },
            { title: "System call", sub: "the boundary" },
            { title: "Kernel", sub: "kernel space", hl: true },
            { title: "Hardware", sub: "CPU, RAM, disk, NIC" },
          ]} caption="Apps never touch hardware directly; everything goes through the kernel." />
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
                  <td><b>Runs</b></td>
                  <td>Your apps: <code>node</code>, a Go binary, Chrome, VS Code</td>
                  <td>The kernel: scheduler, memory management, file system, network, drivers</td>
                </tr>
                <tr>
                  <td><b>Privileges</b></td>
                  <td>Limited, sees only its own memory</td>
                  <td>Full access to hardware and all memory</td>
                </tr>
                <tr>
                  <td><b>On a crash</b></td>
                  <td>Only that process dies</td>
                  <td>The whole machine stops (kernel panic, blue screen)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Docker</b> containers share the host&apos;s kernel and only isolate processes, network and file system. That is why containers are lighter than virtual machines, which each run a kernel of their own.</div>
        </section>

        <section id="ot-syscall">
          <h2><span className="n">02</span>System calls: how apps ask the kernel</h2>
          <p>To read a file, open a socket, get more memory or create a thread, an app makes a <b>system call</b> (<code>read</code>, <code>write</code>, <code>open</code>, <code>socket</code>, <code>mmap</code>, <code>clone</code>...). The CPU switches from user mode to kernel mode, the kernel does the work and returns. That switch costs far more than a normal function call.</p>
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
          <h2><span className="n">03</span>Process and thread</h2>
          <p>A <b>process</b> is a running program with its own memory. A <b>thread</b> is a path of execution inside a process. Threads of the same process share the heap and globals, but each has its own <b>stack</b> and registers. An <b>OS thread</b> is a thread created and scheduled by the kernel.</p>
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
                  <td><b>Memory</b></td>
                  <td>Private; other processes cannot read it</td>
                  <td>Shares the heap with other threads in the process</td>
                </tr>
                <tr>
                  <td><b>Communication</b></td>
                  <td>Pipes, sockets, shared memory (IPC)</td>
                  <td>Reads and writes shared variables, so it needs locks to avoid races</td>
                </tr>
                <tr>
                  <td><b>One crashes</b></td>
                  <td>Other processes are unaffected</td>
                  <td>The whole process goes down</td>
                </tr>
                <tr>
                  <td><b>Creation cost</b></td>
                  <td>Highest (new address space)</td>
                  <td>Cheaper than a process, but still a call into the kernel</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>The kernel scheduler decides which thread runs on which core and for how long (a time slice). On a 4-core machine at most 4 threads truly run at any instant; the rest wait their turn.</p>
        </section>

        <section id="ot-cost">
          <h2><span className="n">04</span>Cost of an OS thread</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Aspect</th>
                  <th>OS thread</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>Managed by</b></td><td>The kernel</td></tr>
                <tr><td><b>Stack</b></td><td>Fixed, usually 1–8 MB (Linux reserves 8 MB of virtual memory by default)</td></tr>
                <tr><td><b>Creation</b></td><td>A few microseconds, needs a system call</td></tr>
                <tr><td><b>Context switch</b></td><td>The kernel saves and restores registers; CPU caches go cold</td></tr>
                <tr><td><b>Practical count</b></td><td>A few thousand before the machine struggles</td></tr>
                <tr><td><b>True parallelism</b></td><td>Yes, one thread per core at any instant</td></tr>
              </tbody>
            </table>
          </div>
          <div className="note">The <b>one thread per request</b> model (Java servlets, old Apache) hits this limit at 10,000 concurrent connections. Node.js (event loop) and Go (goroutines) are two different ways around it.</div>
        </section>

        <section id="ot-node">
          <h2><span className="n">05</span>How Node.js uses threads</h2>
          <Flow id="otnode" label="Node.js: one thread runs JS, plus the libuv thread pool" steps={[
            { title: "Main thread", sub: "event loop, runs JS", hl: true },
            { title: "libuv pool", sub: "4 threads by default" },
            { title: "Kernel", sub: "epoll / IOCP for network" },
          ]} />
          <ul>
            <li>Your JS runs on <b>one</b> OS thread. A heavy computation loop blocks every other request.</li>
            <li>Network I/O needs no extra threads: libuv asks the kernel to report when sockets are ready (epoll on Linux, IOCP on Windows).</li>
            <li>Files, DNS (<code>dns.lookup</code>), <code>crypto</code> and <code>zlib</code> run on the libuv <b>thread pool</b>, 4 threads by default.</li>
            <li>For truly parallel JS use <code>worker_threads</code> (each worker is an OS thread with its own V8 isolate) or run several processes (cluster, PM2).</li>
          </ul>
          <Code lang="ts">{`// Raise the libuv pool when many file/crypto calls run at once (set before startup)
// UV_THREADPOOL_SIZE=16 node server.js

// CPU-heavy work: move it off the main thread
import { Worker } from "node:worker_threads";
const worker = new Worker("./resize-image.js", { workerData: { path } });
worker.on("message", (out) => res.json(out));`}</Code>
        </section>

        <section id="ot-go">
          <h2><span className="n">06</span>Go: goroutines run on OS threads</h2>
          <p>A goroutine is <b>not</b> an OS thread. Goroutines are managed by the <b>Go runtime</b> in user space: the stack starts around 2 KB, and creating or switching one needs no call into the kernel, so hundreds of thousands to millions can run. The GMP scheduler places goroutines (G) onto a few OS threads (M) through Ps, with <code>GOMAXPROCS</code> Ps by default, equal to the core count.</p>
          <Flow id="otgo" label="Goroutines are placed on OS threads, which run on cores" steps={[
            { title: "Goroutine (G)", sub: "thousands, Go runtime" },
            { title: "P", sub: "GOMAXPROCS of them" },
            { title: "OS thread (M)", sub: "kernel-managed", hl: true },
            { title: "CPU core", sub: "actually runs" },
          ]} />
          <p>For G, M, P, work stealing and blocking syscalls, see <Link className="plink" href="/en/golang/runtime/">Go → Runtime &amp; GMP</Link>.</p>
        </section>

        <section id="ot-where">
          <h2><span className="n">07</span>Which machine runs the thread</h2>
          <p>A thread is always created on <b>the machine running that code</b>, managed by that machine&apos;s kernel.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Your code</th>
                  <th>Where the threads live</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>Go / Node backend deployed to EC2</b></td><td>On EC2; its Linux kernel schedules them onto its vCPUs</td></tr>
                <tr><td><b><code>npm run dev</code>, <code>go run</code> on a laptop</b></td><td>On your laptop</td></tr>
                <tr><td><b>Frontend JS (React, client components)</b></td><td>On the user&apos;s machine, inside the browser process</td></tr>
                <tr><td><b>Backend in Docker on EC2</b></td><td>Still on EC2: containers share the host kernel</td></tr>
                <tr><td><b>Lambda, Fargate</b></td><td>On AWS-managed virtual machines</td></tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>So:</b> when 10,000 users call your API, every handling thread is on the server; a fast user machine does not help. A loaded server needs more vCPU/RAM or more instances behind a load balancer. Fast locally does not mean fast on EC2: a laptop may have 8–16 cores while a small EC2 has 2 vCPUs.</div>
        </section>
      </main>
    </div>
  );
}
