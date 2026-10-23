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
      <nav className="toc" aria-label="Go runtime contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#gr-goroutine"><span>01</span>Goroutines</a></li>
          <li><a href="#gr-gmp"><span>02</span>The GMP model</a></li>
          <li><a href="#gr-pick"><span>03</span>Picking a G</a></li>
          <li><a href="#gr-syscall"><span>04</span>Syscalls, netpoller</a></li>
          <li><a href="#gr-preempt"><span>05</span>Preemption</a></li>
          <li><a href="#gr-procs"><span>06</span>GOMAXPROCS</a></li>
          <li><a href="#gr-qa"><span>07</span>Q&amp;A</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · runtime</div>
          <h1>Goroutines and the GMP scheduler</h1>
          <p className="lede">Go runs hundreds of thousands of goroutines on a handful of OS (Operating System) threads thanks to an M:N scheduler in the runtime. Knowing G, M and P explains why goroutines are cheap, why a blocking syscall does not freeze the program, and why GOMAXPROCS matters.</p>
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
          <h2><span className="n">01</span>How a goroutine differs from a thread</h2>
          <div className="tbl">
            <table>
              <thead><tr><th></th><th>Goroutine</th><th>OS thread</th></tr></thead>
              <tbody>
                <tr><td><b>Managed by</b></td><td>The Go runtime (user space)</td><td>The kernel</td></tr>
                <tr><td><b>Stack</b></td><td>Starts around 2 KB, grows and shrinks (copied to a new region)</td><td>Fixed, usually 1–8 MB</td></tr>
                <tr><td><b>Create, switch</b></td><td>A few hundred ns, no kernel involved</td><td>A few µs, through the kernel</td></tr>
                <tr><td><b>Practical count</b></td><td>Hundreds of thousands to millions</td><td>A few thousand</td></tr>
                <tr><td><b>Identity</b></td><td>No public ID, cannot be killed from outside; stop it with a context or channel</td><td>Has a thread ID</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="gr-gmp">
          <h2><span className="n">02</span>The GMP model</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 360" role="img" aria-label="GMP model: a global run queue on top, three Ps each with its own goroutine queue, each attached to an M (an OS thread) running on a CPU core; the third P has run out of work and steals half of another P's queue">
                <Markers id="gmp" />
                <Box x={330} y={10} w={240} h={46} title="Global run queue" sub="checked every 61 ticks" cls="s-disk" />
                {COLS.map((x0, i) => (
                  <g key={x0}>
                    <Box x={x0} y={90} w={240} h={46} title={`P${i}`} sub="logical processor" cls="s-hl" />
                    {Array.from({ length: QUEUE[i] }, (_, k) => <G key={k} x={x0 + 30 + k * 36} y={170} />)}
                    {QUEUE[i] === 0 && <Label x={x0 + 20} y={174}>queue empty</Label>}
                    <path className="s-ln" d={`M${x0 + 120} 136 V218`} />
                    <Box x={x0 + 40} y={220} w={160} h={46} title={`M${i}`} sub="OS thread, runs 1 G" />
                    <path className="s-dl" d={`M${x0 + 120} 266 V298`} />
                    <Box x={x0 + 40} y={300} w={160} h={40} title="CPU core" cls="s-bg" />
                  </g>
                ))}
                <path className="s-dl2" d="M455 170 H636" markerEnd="url(#gmpd)" />
                <Label x={548} y={160} color="var(--warn)" anchor="middle">work stealing: take 1/2</Label>
              </svg>
            </div>
            <figcaption>An M must hold a P to run Go code. The number of Ps is GOMAXPROCS, so at most GOMAXPROCS goroutines run in parallel at once.</figcaption>
          </figure>
          <div className="pp">
            <div><span className="pl">G · goroutine</span>A runtime struct holding the stack, instruction pointer and state (runnable, running, waiting...). Created with the <code>go</code> keyword.</div>
            <div><span className="pl">M · machine</span>A real OS thread. There can be more Ms than Ps (for example when an M is stuck in a syscall), up to 10,000 by default.</div>
            <div><span className="pl">P · processor</span>The licence to run Go code. Holds a local run queue (up to 256 Gs), a runnext slot and an allocation cache (mcache).</div>
            <div><span className="pl">sysmon</span>A background thread that needs no P: spots Gs running too long, Ms stuck in syscalls, and polls the network when nobody else does.</div>
          </div>
        </section>

        <section id="gr-pick">
          <h2><span className="n">03</span>Which goroutine a P runs next</h2>
          <ol className="steps">
            <li><div><b>Every 61 ticks, check the global queue first</b><div className="d">So goroutines in the global queue are not starved.</div></div></li>
            <li><div><b>runnext, then the local run queue</b><div className="d">A G just created or just woken sits in runnext and runs right away, while the CPU (Central Processing Unit) cache is still warm.</div></div></li>
            <li><div><b>Global run queue</b><div className="d">Grab a batch into the local queue.</div></div></li>
            <li><div><b>Netpoller</b><div className="d">Pick up Gs whose sockets are ready to read or write.</div></div></li>
            <li><div><b>Work stealing</b><div className="d">Pick another P at random and take half its queue. If there is nothing to do, the M sleeps and the P goes back to the idle list.</div></div></li>
          </ol>
        </section>

        <section id="gr-syscall">
          <h2><span className="n">04</span>Blocking syscalls and the network poller</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 250" role="img" aria-label="G1 makes a blocking syscall on M0; sysmon detaches P0 from M0 and hands P0 to M1 to run G2; G3 waiting on a socket is parked in the netpoller and holds no thread">
                <Markers id="sc" />
                <rect className="s-bg" x="8" y="8" width="270" height="230" rx="10" />
                <text className="s-lane" x="22" y="30">BEFORE</text>
                <Box x={60} y={50} w={160} h={44} title="P0" cls="s-hl" />
                <path className="s-ln" d="M140 94 V126" />
                <Box x={60} y={128} w={160} h={50} title="M0 + G1" sub="calls read(file)" />
                <Label x={30} y={214}>the syscall blocks the OS thread</Label>

                <path className="s-ln" d="M282 120 H318" markerEnd="url(#sca)" />

                <rect className="s-bg" x="322" y="8" width="320" height="230" rx="10" />
                <text className="s-lane" x="336" y="30">AFTER HANDOFF</text>
                <Box x={340} y={128} w={130} h={50} title="M0 + G1" sub="stuck in kernel" cls="s-bad" />
                <Box x={490} y={50} w={130} h={44} title="P0" cls="s-hl" />
                <path className="s-ln" d="M555 94 V126" />
                <Box x={490} y={128} w={130} h={50} title="M1 + G2" sub="idle or new M" />
                <Label x={336} y={206}>sysmon sees the syscall over ~20 µs</Label>
                <Label x={336} y={222}>→ moves P0 to M1, no CPU wasted</Label>

                <rect className="s-bg2" x="656" y="8" width="236" height="230" rx="10" />
                <text className="s-lane2" x="670" y="30">NETWORK I/O (Input/Output)</text>
                <Box x={690} y={50} w={170} h={50} title="Netpoller" sub="epoll · kqueue · IOCP" cls="s-disk" />
                <G x={740} y={150} />
                <Label x={760} y={154}>G3 waits on socket</Label>
                <path className="s-dl2" d="M740 136 V102" markerEnd="url(#scd)" />
                <Label x={670} y={206}>G3 is parked, the M runs others;</Label>
                <Label x={670} y={222}>socket ready → G3 runnable</Label>
              </svg>
            </div>
            <figcaption>File reads, cgo and syscalls that bypass the netpoller pin an M, so the runtime hands the P to another M. Network I/O pins no M at all: the code looks synchronous but is non-blocking underneath.</figcaption>
          </figure>
          <div className="note">Consequence: thousands of goroutines reading files or calling cgo at once can create thousands of OS threads. Bound the number of goroutines doing that kind of work (semaphore, worker pool).</div>
        </section>

        <section id="gr-preempt">
          <h2><span className="n">05</span>Preemption</h2>
          <ul className="plain">
            <li><b>Before 1.14 (cooperative):</b> a goroutine only yielded at function calls or when blocking on a channel, lock or I/O. A <code>for {"{}"}</code> loop without calls held its P forever, and since the GC (Garbage Collector) waited for it, the whole program stalled.</li>
            <li><b>Since 1.14 (asynchronous):</b> when sysmon sees a G running continuously for over 10 ms it sends a signal (SIGURG) to the M; the handler saves state and puts the G back in a queue.</li>
            <li><code>runtime.Gosched()</code> yields explicitly; ordinary code rarely needs it.</li>
          </ul>
        </section>

        <section id="gr-procs">
          <h2><span className="n">06</span>GOMAXPROCS</h2>
          <ul className="plain">
            <li>Defaults to the number of visible CPUs. Since <b>1.25</b> the runtime also reads the cgroup CPU limit: a Kubernetes pod limited to 2 CPUs on a 64-core node gets GOMAXPROCS=2 (it used to be 64, causing throttling and latency; you needed the automaxprocs library).</li>
            <li>Raising GOMAXPROCS does not speed up I/O; it is only how many goroutines run Go code in parallel.</li>
            <li><code>runtime.LockOSThread()</code> pins a goroutine to one M, needed for C libraries that use thread-local state (OpenGL, some drivers).</li>
          </ul>
          <CodeCompare go={`fmt.Println(runtime.GOMAXPROCS(0), runtime.NumGoroutine(), runtime.NumCPU())

// Print what the scheduler is doing every 1000 ms
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
          <h2><span className="n">07</span>Interview Q&amp;A</h2>
          <div className="review">
            <div className="row"><div className="loglabel">Q</div><div><b>Why have P at all; why not bind G straight to M?</b><div className="d">Before 1.1 there were only G and M with one global, locked queue, a bottleneck on many cores. P brings lock-free local queues, a per-P allocation cache, and lets the whole P move to another M when one is stuck in a syscall.</div></div></div>
            <div className="row"><div className="loglabel">Q</div><div><b>Do goroutines run in parallel?</b><div className="d">Yes, up to GOMAXPROCS at a time. Concurrency is how the program is structured; parallelism is actually running at the same time on several cores.</div></div></div>
            <div className="row"><div className="loglabel">Q</div><div><b>What happens to other goroutines when main returns?</b><div className="d">They stop immediately and their defers do not run. Wait with a WaitGroup/errgroup or a channel.</div></div></div>
            <div className="row"><div className="loglabel">Q</div><div><b>Can main recover a panic from a child goroutine?</b><div className="d">No. recover only catches panics in the same goroutine; each goroutine needs its own deferred recover, or the whole process dies.</div></div></div>
          </div>
        </section>
      </main>
    </div>
  );
}
