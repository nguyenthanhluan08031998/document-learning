import { Flow } from "@/components/Flow";
import type { InterviewData } from "@/components/InterviewList";
import type { Locale } from "@/lib/notebook";

const FAQ = "https://go.dev/doc/faq";
const MEM = "https://go.dev/ref/mem";
const GC = "https://go.dev/doc/gc-guide";
const CTX = "https://go.dev/blog/context";
const PIPE = "https://go.dev/blog/pipelines";
const SLICES = "https://go.dev/blog/slices-intro";
const ERRS = "https://go.dev/blog/go1.13-errors";
const DEFER = "https://go.dev/blog/defer-panic-and-recover";
const RACE = "https://go.dev/doc/articles/race_detector";
const PPROF = "https://go.dev/blog/pprof";
const DIAG = "https://go.dev/doc/diagnostics";
const SYNC = "https://pkg.go.dev/sync";
const GENERICS = "https://go.dev/doc/tutorial/generics";
const DB = "https://go.dev/doc/database/manage-connections";
const ROUTING = "https://go.dev/blog/routing-enhancements";
const TESTING = "https://go.dev/doc/tutorial/add-a-test";
const EFFECTIVE = "https://go.dev/doc/effective_go";
const LOOPVAR = "https://go.dev/blog/loopvar-preview";
const MODS = "https://go.dev/doc/modules/gomod-ref";
const HTTP = "https://pkg.go.dev/net/http#Server.Shutdown";
const XSYNC = "https://pkg.go.dev/golang.org/x/sync/singleflight";
const ERRGROUP = "https://pkg.go.dev/golang.org/x/sync/errgroup";
const MAPS = "https://go.dev/blog/maps";

export default function build(l: Locale): InterviewData {
  const t = (vi: string, en: string) => (l === "vi" ? vi : en);
  return {
    eyebrow: t("phỏng vấn · go", "interview · go"),
    title: t("Phỏng vấn Go", "Go interview"),
    lede: t(
      "Bấm vào câu hỏi để xem đáp án, ví dụ và sơ đồ. Mỗi đáp án đi từ ý chính, giải thích vì sao, rồi tới lỗi hay gặp. Nguồn là tài liệu chính thức của Go.",
      "Click a question to see the answer, an example and a diagram. Each answer goes from the key idea, to why it works that way, to the usual pitfalls. The source is the official Go docs.",
    ),
    items: [
      // ---------- Runtime & scheduler ----------
      {
        q: t("Goroutine khác thread của hệ điều hành chỗ nào?", "How is a goroutine different from an OS thread?"),
        a: [
          t(
            "Thread là thứ hệ điều hành (OS, Operating System) quản lý: tạo tốn khoảng 1 MB stack, chuyển qua lại giữa các thread phải vào kernel nên chậm. Goroutine là “luồng nhẹ” do runtime của Go quản lý: stack chỉ khởi đầu vài KB và tự lớn lên khi cần, nên một chương trình mở được hàng trăm nghìn goroutine.",
            "A thread is managed by the operating system (OS): it costs about 1 MB of stack and switching between threads goes through the kernel, which is slow. A goroutine is a “lightweight thread” managed by the Go runtime: its stack starts at a few KB and grows on demand, so one program can run hundreds of thousands of them.",
          ),
          t(
            "Runtime của Go xếp nhiều goroutine chạy trên ít thread thật (mô hình M:N). Khi một goroutine phải chờ (channel, mạng, sleep), runtime đổi sang goroutine khác ngay trong user space, không cần nhờ kernel.",
            "The Go runtime multiplexes many goroutines onto a few real threads (an M:N model). When a goroutine has to wait (channel, network, sleep), the runtime switches to another one in user space without asking the kernel.",
          ),
        ],
        code: { lang: "go", src: `func main() {
    var wg sync.WaitGroup
    for i := 0; i < 100_000; i++ { // ${t("100 nghìn goroutine vẫn nhẹ; 100 nghìn thread thì không", "100k goroutines are fine; 100k threads are not")}
        wg.Add(1)
        go func() {
            defer wg.Done()
            time.Sleep(time.Second)
        }()
    }
    wg.Wait()
}` },
        href: FAQ + "#goroutines", label: "Go FAQ: goroutines",
      },
      {
        q: t("G, M, P là gì và scheduler chạy thế nào?", "What are G, M and P, and how does the scheduler work?"),
        a: [
          t(
            "Ba chữ cái này là ba “vai” trong scheduler (bộ lập lịch) của Go. G là goroutine (việc cần làm). M là OS thread (người thợ thật sự chạy code). P là processor logic: một “giấy phép chạy code Go”, kèm một hàng đợi riêng chứa các G đang chờ.",
            "These three letters are the three roles in Go's scheduler. G is a goroutine (the work to do). M is an OS thread (the worker that really runs code). P is a logical processor: a “permit to run Go code”, carrying its own queue of runnable Gs.",
          ),
          t(
            "Quy tắc: một M muốn chạy G thì phải cầm một P. Số P bằng GOMAXPROCS (mặc định bằng số CPU), nên tại một thời điểm có tối đa bấy nhiêu goroutine chạy song song. M thì có thể nhiều hơn P, ví dụ khi có M đang kẹt trong syscall.",
            "The rule: an M must hold a P to run a G. The number of Ps equals GOMAXPROCS (the CPU count by default), so that is the maximum number of goroutines running in parallel. There can be more Ms than Ps, for example when some Ms are stuck in syscalls.",
          ),
        ],
        diagram: <Flow id="gmp" label="GMP" steps={[
          { title: "go f()", sub: t("tạo G", "creates a G") },
          { title: t("Hàng đợi của P", "P's run queue"), sub: t("G chờ", "G waits") },
          { title: t("M cầm P", "M holds P"), sub: t("lấy G ra", "takes the G"), hl: true },
          { title: t("Chạy code", "Runs code"), sub: "CPU" },
          { title: t("G xong/chặn", "G ends/blocks"), sub: t("lấy G kế", "pick next G") },
        ]} caption={t("Mỗi P có hàng đợi riêng nên các P ít phải tranh nhau một khóa chung.", "Each P has its own queue, so Ps rarely fight over one shared lock.")} />,
        href: "https://go.dev/src/runtime/proc.go", label: "runtime/proc.go",
      },
      {
        q: t("Goroutine gọi syscall chặn thì chuyện gì xảy ra?", "What happens when a goroutine makes a blocking syscall?"),
        a: [
          t(
            "Syscall (lời gọi hệ thống, ví dụ đọc file) có thể chặn cả thread. Lúc đó M kẹt cùng G của nó. Nếu để P đứng chờ thì phí CPU, nên khi một syscall kéo dài, bộ giám sát nền sysmon sẽ tách P ra khỏi M đó và giao cho một M khác để chạy tiếp các goroutine còn lại.",
            "A syscall (system call, e.g. reading a file) can block the whole thread. The M is stuck together with its G. Leaving the P idle would waste CPU, so when a syscall runs long the background monitor sysmon detaches the P from that M and hands it to another M to keep running the remaining goroutines.",
          ),
          t(
            "Với I/O (Input/Output) mạng thì Go dùng netpoller (epoll/kqueue): goroutine chờ socket được “đỗ” lại, không giữ M nào. Vì thế server Go giữ được rất nhiều kết nối chỉ với ít thread.",
            "For network I/O Go uses the netpoller (epoll/kqueue): a goroutine waiting on a socket is “parked” and holds no M. That is why a Go server can hold huge numbers of connections with few threads.",
          ),
        ],
        href: "https://go.dev/src/runtime/proc.go", label: "runtime/proc.go",
      },
      {
        q: t("Work stealing là gì? Vì sao cần?", "What is work stealing and why is it needed?"),
        a: t(
          "Khi một P hết việc thì nó không ngồi chơi: đầu tiên xem hàng đợi toàn cục, rồi “ăn trộm” một nửa số goroutine trong hàng đợi của một P khác chọn ngẫu nhiên. Nhờ vậy tải tự cân bằng giữa các CPU mà lập trình viên không phải chia việc thủ công.",
          "When a P runs out of work it does not sit idle: it first checks the global queue, then “steals” half of the goroutines from the queue of another randomly chosen P. This balances load across CPUs without any manual work distribution.",
        ),
        href: "https://go.dev/src/runtime/proc.go", label: "runtime/proc.go",
      },
      {
        q: t("GOMAXPROCS là gì, chạy trong container cần lưu ý gì?", "What is GOMAXPROCS, and what matters inside containers?"),
        a: [
          t(
            "GOMAXPROCS là số P, tức số goroutine tối đa chạy song song. Mặc định bằng số CPU logic của máy.",
            "GOMAXPROCS is the number of Ps, i.e. the maximum goroutines running in parallel. By default it equals the machine's logical CPU count.",
          ),
          t(
            "Cái bẫy kinh điển: container (Docker, Kubernetes) bị giới hạn 2 CPU nhưng máy chủ có 64 core, các bản Go cũ thấy 64 và tạo 64 P, bị kernel bóp (throttle) làm tăng độ trễ. Từ Go 1.25 runtime tự đọc giới hạn CPU của cgroup; với bản cũ hơn dùng thư viện automaxprocs hoặc đặt biến môi trường GOMAXPROCS.",
            "The classic trap: a container (Docker, Kubernetes) is limited to 2 CPUs but the host has 64 cores. Older Go versions saw 64 and created 64 Ps, then got throttled by the kernel, which raised latency. Since Go 1.25 the runtime reads the cgroup CPU limit; on older versions use the automaxprocs library or set the GOMAXPROCS environment variable.",
          ),
        ],
        href: "https://pkg.go.dev/runtime#GOMAXPROCS", label: "runtime.GOMAXPROCS",
      },

      // ---------- Channel & sync ----------
      {
        q: t("Channel không đệm (unbuffered) khác có đệm (buffered)?", "Unbuffered vs buffered channel?"),
        a: [
          t(
            "Hình dung channel như đường ống giữa các goroutine. Unbuffered giống trao tay: người gửi phải đứng đợi đến khi có người nhận đúng lúc, hai bên “gặp nhau” (rendezvous). Vì vậy nó vừa chuyển dữ liệu vừa đồng bộ hai goroutine.",
            "Think of a channel as a pipe between goroutines. Unbuffered is a hand-over: the sender must wait until a receiver is ready, so both “meet” (rendezvous). It transfers data and synchronises the two goroutines at once.",
          ),
          t(
            "Buffered giống hộp thư có sức chứa N: gửi không chặn cho tới khi hộp đầy, nhận không chặn cho tới khi hộp rỗng. Dùng để làm đệm khi hai bên tốc độ lệch nhau, nhưng đừng tăng số đệm chỉ để che lỗi thiết kế.",
            "Buffered is a mailbox with capacity N: sending does not block until the box is full, receiving does not block until it is empty. Use it to absorb speed mismatches, but do not enlarge the buffer just to hide a design flaw.",
          ),
        ],
        code: { lang: "go", src: `unbuf := make(chan int)      // ${t("gửi sẽ chặn đến khi có người nhận", "send blocks until someone receives")}
buf := make(chan int, 2)     // ${t("chứa được 2 phần tử", "holds 2 values")}

buf <- 1
buf <- 2                     // ${t("vẫn chưa chặn", "still not blocking")}
// buf <- 3                  // ${t("chặn: hộp đầy", "blocks: the box is full")}

go func() { unbuf <- 42 }()
fmt.Println(<-unbuf)         // ${t("nhận được 42, hai goroutine đã đồng bộ", "receives 42, the two goroutines are now synchronised")}` },
        href: EFFECTIVE + "#channels", label: "Effective Go: channels",
      },
      {
        q: t("Gửi/nhận trên channel nil hoặc đã đóng thì sao?", "What happens when you send or receive on a nil or closed channel?"),
        a: [
          t(
            "Nhớ bốn quy tắc: (1) gửi hoặc nhận trên channel nil thì chặn mãi mãi. (2) gửi vào channel đã đóng thì panic. (3) nhận từ channel đã đóng thì trả về giá trị còn lại, hết thì trả giá trị zero cùng ok=false. (4) đóng channel đã đóng, hoặc đóng channel nil, đều panic.",
            "Remember four rules: (1) send or receive on a nil channel blocks forever. (2) sending on a closed channel panics. (3) receiving from a closed channel returns remaining values, then the zero value with ok=false. (4) closing a closed or nil channel panics.",
          ),
          t(
            "Hệ quả thiết kế: chỉ bên gửi mới được close (để báo “hết dữ liệu”), vì bên nhận không biết còn ai gửi nữa hay không. Khi có nhiều bên gửi, phải có một goroutine điều phối đóng channel sau khi tất cả gửi xong.",
            "Design consequence: only the sender should close (to say “no more data”), because a receiver cannot know whether others still send. With several senders, one coordinating goroutine must close the channel after all have finished.",
          ),
        ],
        code: { lang: "go", src: `ch := make(chan int, 1)
ch <- 1
close(ch)

v, ok := <-ch   // v=1, ok=true   (${t("còn dữ liệu", "data left")})
v, ok = <-ch    // v=0, ok=false  (${t("đã đóng và hết", "closed and drained")})

for x := range ch { _ = x } // ${t("range tự thoát khi channel đóng và hết", "range exits when the channel is closed and drained")}
// ch <- 2      // panic: send on closed channel` },
        href: SYNC, label: "sync, channels",
      },
      {
        q: t("select dùng để làm gì? Làm timeout thế nào?", "What is select for? How do you add a timeout?"),
        a: [
          t(
            "select giống switch nhưng cho channel: chờ nhiều channel cùng lúc và chạy nhánh nào sẵn sàng trước. Nếu nhiều nhánh sẵn sàng, Go chọn ngẫu nhiên để không nhánh nào bị bỏ đói. Có nhánh default thì select không bao giờ chặn.",
            "select is like switch for channels: it waits on several channels at once and runs whichever is ready first. If several are ready Go picks at random so none starves. With a default branch select never blocks.",
          ),
          t(
            "Timeout làm bằng time.After hoặc, tốt hơn, bằng context có deadline để hủy được cả chuỗi công việc phía sau.",
            "Timeouts use time.After or, better, a context with a deadline so the whole downstream chain can be cancelled.",
          ),
        ],
        code: { lang: "go", src: `select {
case res := <-results:
    handle(res)
case <-time.After(2 * time.Second):
    return errors.New("${t("quá thời gian chờ", "timed out")}")
case <-ctx.Done():
    return ctx.Err()            // ${t("bị hủy từ bên ngoài", "cancelled from outside")}
}` },
        href: EFFECTIVE + "#concurrency", label: "Effective Go: concurrency",
      },
      {
        q: t("Goroutine leak là gì, do đâu, phát hiện thế nào?", "What is a goroutine leak, what causes it and how do you find it?"),
        a: [
          t(
            "Leak xảy ra khi goroutine không bao giờ kết thúc vì bị chặn mãi: gửi vào channel không ai nhận, chờ channel không ai đóng, chờ khóa không ai nhả, hoặc quên hủy context. Goroutine nằm đó giữ bộ nhớ và các tham chiếu, số lượng tăng dần đến khi hết RAM (Random Access Memory).",
            "A leak happens when a goroutine never ends because it is blocked forever: sending on a channel nobody reads, waiting on a channel nobody closes, waiting for a lock nobody releases, or forgetting to cancel a context. The goroutine keeps memory and references, and the count grows until RAM (Random Access Memory) runs out.",
          ),
          t(
            "Cách phát hiện: theo dõi metric số goroutine (runtime.NumGoroutine) có tăng đều không, rồi xem pprof goroutine để thấy chúng đang kẹt ở dòng nào. Cách phòng: mọi goroutine phải có đường thoát rõ ràng, thường là ctx.Done().",
            "To detect: watch the goroutine-count metric (runtime.NumGoroutine) for steady growth, then read the pprof goroutine profile to see which line they are stuck on. To prevent: every goroutine needs a clear exit path, usually ctx.Done().",
          ),
        ],
        code: { lang: "go", src: `// ${t("SAI: nếu không ai đọc ch, goroutine kẹt mãi", "BAD: if nobody reads ch, the goroutine is stuck forever")}
func bad() <-chan int {
    ch := make(chan int)
    go func() { ch <- compute() }()
    return ch
}

// ${t("ĐÚNG: có đường thoát khi bên ngoài hủy", "GOOD: it can exit when the caller cancels")}
func good(ctx context.Context) <-chan int {
    ch := make(chan int, 1)     // ${t("đệm 1 để gửi không bao giờ chặn", "buffer of 1 so the send never blocks")}
    go func() {
        select {
        case ch <- compute():
        case <-ctx.Done():
        }
    }()
    return ch
}` },
        href: DIAG, label: "Diagnostics",
      },
      {
        q: t("context.Context dùng để làm gì và dùng sao cho đúng?", "What is context.Context for and how should you use it?"),
        a: [
          t(
            "Context mang theo ba thứ qua các lời gọi hàm: tín hiệu hủy (cancel), thời hạn (deadline/timeout) và vài giá trị gắn theo request (như request id). Khi người dùng đóng trình duyệt hay hết giờ, một lần cancel ở trên cùng sẽ lan xuống mọi goroutine, query DB và lời gọi HTTP bên dưới để chúng dừng sớm, khỏi tốn tài nguyên vô ích.",
            "A context carries three things through function calls: a cancellation signal, a deadline/timeout and a few request-scoped values (such as a request id). When the user closes the browser or time runs out, one cancel at the top propagates to every goroutine, DB query and HTTP call below so they stop early instead of wasting resources.",
          ),
          t(
            "Quy tắc: ctx luôn là tham số đầu tiên; không lưu ctx trong struct; luôn gọi hàm cancel (thường bằng defer); chỉ dùng context value cho dữ liệu của request, không dùng để truyền tham số nghiệp vụ.",
            "Rules: ctx is always the first parameter; do not store ctx in a struct; always call the cancel function (usually with defer); use context values only for request-scoped data, never to smuggle business parameters.",
          ),
        ],
        diagram: <Flow id="ctx" label="Context cancel" steps={[
          { title: t("Request vào", "Request in"), sub: "ctx" },
          { title: "WithTimeout", sub: "3s" },
          { title: t("Gọi DB", "Call DB"), sub: "QueryContext" },
          { title: t("Hết giờ/hủy", "Timeout/cancel"), sub: "ctx.Done()", hl: true },
          { title: t("Dừng cả chuỗi", "Whole chain stops"), sub: "ctx.Err()" },
        ]} caption={t("Cancel lan xuống mọi hàm nhận cùng ctx.", "Cancel flows down to every function that received the same ctx.")} />,
        code: { lang: "go", src: `func handler(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
    defer cancel()              // ${t("luôn gọi để giải phóng timer", "always call it to release the timer")}

    row := db.QueryRowContext(ctx, "SELECT balance FROM wallets WHERE id=$1", id)
    // ${t("quá 3 giây hoặc client ngắt kết nối: query bị hủy", "after 3s or if the client disconnects: the query is cancelled")}
    _ = row
}` },
        href: CTX, label: "Go blog: Context",
      },
      {
        q: t("Khi nào dùng Mutex, RWMutex, atomic hay channel?", "When to use Mutex, RWMutex, atomic or a channel?"),
        a: [
          t(
            "Câu khẩu quyết của Go: chia sẻ bộ nhớ bằng cách giao tiếp, đừng giao tiếp bằng cách chia sẻ bộ nhớ. Nhưng thực tế hai công cụ đều cần, chọn theo mục đích.",
            "Go's motto: share memory by communicating, do not communicate by sharing memory. In practice you need both tools; pick by purpose.",
          ),
          t(
            "Channel: chuyển quyền sở hữu dữ liệu giữa các goroutine, pipeline, báo hiệu sự kiện. Mutex: bảo vệ một cấu trúc dùng chung (map, counter, cache) trong vùng code ngắn. RWMutex: nhiều reader, ít writer; nhưng chậm hơn Mutex nếu section ngắn hoặc nhiều ghi. atomic: một biến số đơn giản (đếm, cờ bật/tắt), nhanh nhất và không khóa.",
            "Channel: hand data ownership between goroutines, pipelines, signalling events. Mutex: guard a shared structure (map, counter, cache) over a short code region. RWMutex: many readers, few writers; but slower than Mutex when sections are short or writes are frequent. atomic: one simple variable (counter, on/off flag), fastest and lock-free.",
          ),
        ],
        code: { lang: "go", src: `type Counter struct {
    mu sync.Mutex
    n  map[string]int
}

func (c *Counter) Inc(key string) {
    c.mu.Lock()
    defer c.mu.Unlock()         // ${t("defer để không quên nhả khóa khi có lỗi/return sớm", "defer so the lock is released even on early return or panic")}
    c.n[key]++
}

var hits atomic.Int64           // ${t("một con số đơn giản: dùng atomic", "a single number: use atomic")}
hits.Add(1)` },
        href: SYNC, label: "package sync",
      },
      {
        q: t("WaitGroup và errgroup khác nhau thế nào?", "WaitGroup vs errgroup?"),
        a: t(
          "WaitGroup chỉ đếm: chờ cho đến khi N goroutine báo xong, không biết gì về lỗi. errgroup (golang.org/x/sync) làm thêm hai việc: gom lỗi đầu tiên trả về, và hủy context chung để các goroutine còn lại dừng sớm. Có thể giới hạn số goroutine chạy cùng lúc bằng SetLimit.",
          "WaitGroup only counts: it waits until N goroutines report done and knows nothing about errors. errgroup (golang.org/x/sync) adds two things: it returns the first error, and it cancels a shared context so the other goroutines stop early. SetLimit caps how many run at once.",
        ),
        code: { lang: "go", src: `g, ctx := errgroup.WithContext(ctx)
g.SetLimit(5)                       // ${t("tối đa 5 việc chạy cùng lúc", "at most 5 tasks at a time")}
for _, url := range urls {
    g.Go(func() error {
        return fetch(ctx, url)      // ${t("lỗi đầu tiên hủy ctx của những việc còn lại", "the first error cancels ctx for the rest")}
    })
}
if err := g.Wait(); err != nil { // ${t("chờ tất cả, trả lỗi đầu tiên", "waits for all, returns the first error")}
    return err
}` },
        href: ERRGROUP, label: "errgroup",
      },
      {
        q: t("Race condition là gì? Dùng -race thế nào?", "What is a race condition and how do you use -race?"),
        a: [
          t(
            "Data race xảy ra khi hai goroutine cùng truy cập một biến, ít nhất một bên ghi, mà không có đồng bộ. Kết quả không đoán trước được: lúc đúng lúc sai, thường chỉ lộ ra khi tải cao. Vì thế “chạy thử thấy ổn” không chứng minh được gì.",
            "A data race happens when two goroutines access the same variable, at least one writes, and there is no synchronisation. The outcome is unpredictable: right sometimes, wrong other times, often visible only under load. So “it worked when I ran it” proves nothing.",
          ),
          t(
            "Go có race detector: chạy test hoặc chương trình với cờ -race, nó theo dõi truy cập bộ nhớ và in ra chỗ đọc/ghi xung đột cùng stack trace. Chương trình chậm đi vài lần nên dùng trong CI (Continuous Integration) và môi trường staging, không bật ở production.",
            "Go has a race detector: run tests or the program with -race and it tracks memory accesses, then prints the conflicting read/write with stack traces. It slows the program several times over, so use it in CI (Continuous Integration) and staging, not in production.",
          ),
        ],
        code: { lang: "go", src: `var count int
var wg sync.WaitGroup
for i := 0; i < 1000; i++ {
    wg.Add(1)
    go func() { defer wg.Done(); count++ }() // ${t("race: nhiều goroutine ghi cùng lúc", "race: many goroutines write at once")}
}
wg.Wait()
// go test -race ./...   -> WARNING: DATA RACE
// ${t("sửa: dùng atomic.Int64 hoặc Mutex", "fix: use atomic.Int64 or a Mutex")}` },
        href: RACE, label: "Race detector",
      },
      {
        q: t("Pattern worker pool hoạt động ra sao?", "How does the worker pool pattern work?"),
        a: t(
          "Thay vì tạo một goroutine cho mỗi việc (có thể hàng triệu), ta tạo cố định N worker cùng đọc từ một channel công việc. Việc nào tới thì worker rảnh nhận. Cách này giới hạn mức dùng CPU, bộ nhớ và số kết nối DB, và tạo áp lực ngược (backpressure): channel đầy thì bên gửi phải chờ.",
          "Instead of one goroutine per task (possibly millions), you start a fixed number N of workers that all read from one jobs channel. Whichever worker is free takes the next task. This caps CPU, memory and DB connections, and gives backpressure: when the channel is full the sender has to wait.",
        ),
        code: { lang: "go", src: `func run(ctx context.Context, jobs <-chan Job, n int) {
    var wg sync.WaitGroup
    for i := 0; i < n; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for job := range jobs {     // ${t("tự thoát khi jobs đóng", "exits when jobs is closed")}
                if ctx.Err() != nil { return }
                process(job)
            }
        }()
    }
    wg.Wait()
}` },
        href: PIPE, label: "Go blog: Pipelines",
      },

      // ---------- Memory ----------
      {
        q: t("Garbage Collector (GC) của Go hoạt động thế nào?", "How does Go's Garbage Collector (GC) work?"),
        a: [
          t(
            "GC là bộ thu gom rác: tự giải phóng vùng nhớ heap không còn ai tham chiếu. Go dùng concurrent tri-color mark and sweep: chạy song song với chương trình để tạm dừng rất ngắn. Mark: tô vật thể đang được dùng (từ các biến gốc theo con trỏ đi ra) qua ba màu trắng, xám, đen. Sweep: thu hồi những vật thể còn trắng, tức không với tới được.",
            "The GC is the garbage collector: it automatically frees heap memory nobody references any more. Go uses concurrent tri-color mark and sweep, running alongside the program to keep pauses tiny. Mark: colour objects that are in use (following pointers from root variables) white, grey or black. Sweep: reclaim the objects still white, i.e. unreachable.",
          ),
          t(
            "Vì chương trình vẫn chạy trong lúc mark, Go dùng write barrier để ghi nhận các con trỏ bị đổi giữa chừng. Go không chia thế hệ và không dồn bộ nhớ (non-compacting). Có hai lần dừng cả thế giới (Stop-The-World, STW) rất ngắn, thường dưới 1 ms: lúc bật write barrier và lúc kết thúc mark.",
            "Because the program keeps running during mark, Go uses a write barrier to record pointers changed meanwhile. Go is not generational and does not compact memory. There are two very short Stop-The-World (STW) pauses, usually under 1 ms: when enabling the write barrier and at mark termination.",
          ),
        ],
        diagram: <Flow id="gcp" label="GC cycle" steps={[
          { title: "STW 1", sub: t("bật write barrier", "enable write barrier") },
          { title: "Mark", sub: t("chạy song song", "concurrent"), hl: true },
          { title: "STW 2", sub: "mark termination" },
          { title: "Sweep", sub: t("thu hồi", "reclaim") },
          { title: t("Chờ chu kỳ sau", "Wait for next cycle"), sub: "GOGC" },
        ]} caption={t("Phần lớn thời gian GC chạy cùng chương trình; chỉ hai điểm dừng rất ngắn.", "Most of the GC runs alongside the program; only two very short pauses.")} />,
        href: GC, label: "A Guide to the Go GC",
      },
      {
        q: t("Escape analysis là gì? Khi nào biến lên heap?", "What is escape analysis and when does a variable go to the heap?"),
        a: [
          t(
            "Stack (ngăn xếp của hàm) rẻ: hàm return là giải phóng ngay, GC không phải làm gì. Heap thì cần GC dọn. Compiler chạy escape analysis để quyết biến nào ở đâu: nếu nó chứng minh được biến không còn dùng sau khi hàm kết thúc thì để lên stack, ngược lại “thoát” (escape) lên heap.",
            "The stack (a function's call stack) is cheap: it is freed the moment the function returns and the GC does nothing. The heap needs the GC to clean up. The compiler runs escape analysis to decide: if it can prove a variable is not used after the function ends it stays on the stack, otherwise it “escapes” to the heap.",
          ),
          t(
            "Hay gặp: trả về con trỏ tới biến cục bộ, lưu vào interface, gửi vào channel, closure giữ biến, hoặc kích thước không biết lúc compile. Biết điều này giúp giảm áp lực lên GC ở đường nóng.",
            "Common causes: returning a pointer to a local, storing in an interface, sending on a channel, a closure capturing the variable, or a size unknown at compile time. Knowing this helps cut GC pressure on hot paths.",
          ),
        ],
        code: { lang: "go", src: `type User struct{ Name string }

func newUser() *User {
    u := User{Name: "an"}
    return &u        // ${t("u thoát lên heap vì còn dùng sau khi hàm return", "u escapes to the heap because it is used after the function returns")}
}

// go build -gcflags=-m
// ./main.go:5:2: moved to heap: u` },
        href: GC, label: "A Guide to the Go GC",
      },
      {
        q: t("GOGC và GOMEMLIMIT khác nhau thế nào?", "GOGC vs GOMEMLIMIT?"),
        a: [
          t(
            "GOGC (mặc định 100) quyết định GC chạy khi nào theo tỉ lệ: heap được phép tăng thêm bao nhiêu phần trăm so với lượng dữ liệu còn sống sau lần GC trước. 100 nghĩa là để heap gấp đôi mới dọn lại. Tăng GOGC thì GC thưa hơn, tốn ít CPU nhưng tốn RAM hơn.",
            "GOGC (default 100) decides when the GC runs, proportionally: how much the heap may grow relative to the live data left after the previous GC. 100 means the heap may double before the next collection. Raising GOGC means rarer GC, less CPU but more RAM.",
          ),
          t(
            "GOMEMLIMIT là giới hạn mềm cho tổng bộ nhớ của Go. Khi gần chạm giới hạn, GC chạy dày hơn để cố ở dưới mức đó. Thực tế hay dùng: đặt GOMEMLIMIT khoảng 80–90% giới hạn RAM của container để tránh bị OOM (Out Of Memory) kill. Nó không phải trần cứng: nếu dữ liệu sống thật sự vượt giới hạn, chương trình vẫn dùng hơn.",
            "GOMEMLIMIT is a soft limit on Go's total memory. When near it, the GC runs more often to stay below. In practice set it to roughly 80–90% of the container's RAM limit to avoid an OOM (Out Of Memory) kill. It is not a hard ceiling: if live data really exceeds it, the program still uses more.",
          ),
        ],
        code: { lang: "bash", src: `GOGC=200 ./app                       # ${t("GC thưa hơn, tốn thêm RAM", "rarer GC, more RAM")}
GOMEMLIMIT=900MiB ./app              # ${t("container 1GiB: chừa chỗ cho stack, cgo...", "1GiB container: leave room for stacks, cgo...")}
GODEBUG=gctrace=1 ./app              # ${t("in thông tin từng lần GC", "print each GC cycle")}` },
        href: GC, label: "A Guide to the Go GC",
      },

      // ---------- Data structures ----------
      {
        q: t("Truyền slice vào hàm thì chuyện gì xảy ra?", "What happens when you pass a slice to a function?"),
        a: [
          t(
            "Slice thực chất là một struct nhỏ gồm ba trường: con trỏ tới mảng bên dưới, độ dài (len) và sức chứa (cap). Truyền slice là copy cái struct đó (header), còn mảng bên dưới thì dùng chung.",
            "A slice is really a small struct of three fields: a pointer to an underlying array, a length (len) and a capacity (cap). Passing a slice copies that struct (the header) while the underlying array is shared.",
          ),
          t(
            "Hệ quả: sửa phần tử s[i] trong hàm thì bên gọi thấy thay đổi. Nhưng append có thể làm header trong hàm khác header của bên gọi (nếu vượt cap thì cấp mảng mới), nên bên gọi không thấy phần tử thêm vào, trừ khi bạn trả slice mới về và gán lại.",
            "Consequence: modifying s[i] inside the function is visible to the caller. But append can make the function's header differ from the caller's (exceeding cap allocates a new array), so the caller does not see the appended element unless you return the new slice and reassign it.",
          ),
        ],
        code: { lang: "go", src: `func change(s []int) {
    s[0] = 99          // ${t("bên gọi thấy: cùng mảng", "caller sees it: same array")}
    s = append(s, 4)   // ${t("bên gọi KHÔNG thấy: header của hàm đã khác", "caller does NOT see it: this function's header is now different")}
}

a := []int{1, 2, 3}
change(a)
fmt.Println(a)         // [99 2 3]` },
        href: SLICES, label: "Go blog: Slices",
      },
      {
        q: t("Hai slice dùng chung mảng: bẫy aliasing là gì?", "Two slices sharing one array: what is the aliasing trap?"),
        a: t(
          "Cắt slice (a[1:3]) không copy dữ liệu, kết quả vẫn trỏ vào cùng mảng. Nếu còn dư cap, append trên slice con sẽ ghi đè phần tử của slice gốc mà bạn không để ý. Muốn tách hẳn thì copy ra slice mới, hoặc dùng full slice expression a[1:3:3] để cap bằng len, ép append phải cấp mảng mới.",
          "Slicing (a[1:3]) does not copy data; the result still points into the same array. If spare cap remains, appending to the sub-slice overwrites elements of the original without you noticing. To separate them, copy into a new slice, or use the full slice expression a[1:3:3] so cap equals len and append is forced to allocate a new array.",
        ),
        code: { lang: "go", src: `a := []int{1, 2, 3, 4}
b := a[:2]              // [1 2], cap = 4
b = append(b, 100)      // ${t("ghi đè a[2]!", "overwrites a[2]!")}
fmt.Println(a)          // [1 2 100 4]

c := a[:2:2]            // ${t("cap = 2", "cap = 2")}
c = append(c, 7)        // ${t("buộc cấp mảng mới, a không bị đổi", "forces a new array, a is untouched")}` },
        href: SLICES, label: "Go blog: Slices",
      },
      {
        q: t("Vì sao map không thread-safe? Khi nào dùng sync.Map?", "Why is map not thread-safe? When to use sync.Map?"),
        a: [
          t(
            "Map của Go tối ưu cho trường hợp một goroutine dùng nên không có khóa. Đọc/ghi đồng thời từ nhiều goroutine, chỉ cần có một bên ghi, sẽ gây lỗi nghiêm trọng “concurrent map writes” làm chương trình crash (fatal error, không recover được).",
            "Go's map is optimised for single-goroutine use so it has no lock. Concurrent access from several goroutines, as soon as one writes, triggers a “concurrent map writes” fatal error that crashes the program (not recoverable).",
          ),
          t(
            "Cách thường dùng: map thường + sync.RWMutex (dễ hiểu, kiểm soát được). sync.Map chỉ đáng dùng cho hai kiểu: key ghi một lần rồi đọc nhiều, hoặc nhiều goroutine thao tác trên tập key rời nhau. Ngoài ra, thứ tự duyệt map là ngẫu nhiên có chủ ý, đừng dựa vào nó.",
            "The usual approach: a plain map plus sync.RWMutex (simple and controllable). sync.Map is worth it only for two cases: keys written once then read many times, or goroutines working on disjoint key sets. Also, map iteration order is deliberately random, never rely on it.",
          ),
        ],
        code: { lang: "go", src: `type Cache struct {
    mu sync.RWMutex
    m  map[string]string
}

func (c *Cache) Get(k string) (string, bool) {
    c.mu.RLock()                // ${t("nhiều reader cùng lúc được", "many readers at once")}
    defer c.mu.RUnlock()
    v, ok := c.m[k]
    return v, ok
}

func (c *Cache) Set(k, v string) {
    c.mu.Lock()                 // ${t("writer độc quyền", "exclusive writer")}
    defer c.mu.Unlock()
    c.m[k] = v
}` },
        href: MAPS, label: "Go blog: Maps in action",
      },
      {
        q: t("Interface chứa gì bên trong? Vì sao có lỗi “nil interface khác nil”?", "What is inside an interface? Why is a “nil interface not nil”?"),
        a: [
          t(
            "Một giá trị interface gồm hai ngăn: (kiểu cụ thể, giá trị). Interface rỗng any lưu con trỏ kiểu và con trỏ dữ liệu; interface có method thêm bảng method (itab) để gọi đúng hàm. Interface chỉ bằng nil khi CẢ HAI ngăn đều rỗng.",
            "An interface value has two slots: (concrete type, value). The empty interface any stores a type pointer and a data pointer; an interface with methods adds a method table (itab) to dispatch the right function. An interface equals nil only when BOTH slots are empty.",
          ),
          t(
            "Bẫy kinh điển: hàm trả về error nhưng bên trong gán một con trỏ kiểu *MyErr có giá trị nil. Lúc đó ngăn kiểu đã có (*MyErr) nên interface KHÁC nil, câu lệnh if err != nil chạy sai. Cách tránh: trả về nil literal khi không có lỗi, đừng trả con trỏ nil có kiểu.",
            "The classic trap: a function returns error but internally returns a nil pointer of type *MyErr. The type slot is already set (*MyErr), so the interface is NOT nil and if err != nil takes the wrong branch. Avoid it by returning a literal nil when there is no error, never a typed nil pointer.",
          ),
        ],
        code: { lang: "go", src: `type MyErr struct{}
func (*MyErr) Error() string { return "boom" }

func bad() error {
    var e *MyErr = nil
    return e            // ${t("interface = (*MyErr, nil) -> khác nil!", "interface = (*MyErr, nil) -> not nil!")}
}

func good() error {
    return nil          // ${t("interface = (nil, nil)", "interface = (nil, nil)")}
}

fmt.Println(bad() == nil)  // false
fmt.Println(good() == nil) // true` },
        href: FAQ + "#nil_error", label: "Go FAQ: nil error",
      },
      {
        q: t("Receiver kiểu giá trị hay con trỏ?", "Value receiver or pointer receiver?"),
        a: [
          t(
            "Receiver giá trị (func (u User)) làm việc trên bản sao: sửa trong hàm không ảnh hưởng bên ngoài. Receiver con trỏ (func (u *User)) làm việc trên bản gốc.",
            "A value receiver (func (u User)) works on a copy: changes inside do not leak out. A pointer receiver (func (u *User)) works on the original.",
          ),
          t(
            "Dùng con trỏ khi method cần sửa struct, khi struct lớn (đỡ copy), hoặc khi struct chứa mutex (copy mutex là lỗi). Nên thống nhất: nếu một method dùng con trỏ thì cả kiểu dùng con trỏ. Lưu ý: chỉ *T mới có đủ method set để thỏa interface khi method khai báo bằng con trỏ.",
            "Use a pointer when the method mutates the struct, when the struct is large (avoids copying), or when it contains a mutex (copying a mutex is a bug). Be consistent: if one method uses a pointer, the whole type should. Note: only *T has the full method set to satisfy an interface when methods are declared with pointers.",
          ),
        ],
        href: EFFECTIVE + "#pointers_vs_values", label: "Effective Go: pointers vs values",
      },
      {
        q: t("Biến vòng lặp bị closure bắt: lỗi kinh điển của goroutine trong for", "Loop variable captured by a closure: the classic goroutine-in-for bug"),
        a: [
          t(
            "Trước Go 1.22, mọi vòng lặp dùng chung MỘT biến i. Goroutine tạo trong vòng lặp thường chạy muộn, lúc đó i đã tăng tới giá trị cuối, nên tất cả in ra cùng một số.",
            "Before Go 1.22, every iteration shared ONE variable i. Goroutines created in the loop usually run late, by which time i has reached its final value, so they all print the same number.",
          ),
          t(
            "Từ Go 1.22 (go.mod khai báo go 1.22 trở lên), mỗi vòng lặp có biến riêng nên lỗi này biến mất. Nếu dự án còn ở phiên bản cũ thì truyền i làm tham số hoặc copy i := i.",
            "Since Go 1.22 (go.mod declaring go 1.22 or later) each iteration has its own variable, so the bug is gone. If the project is on an older version pass i as a parameter or copy i := i.",
          ),
        ],
        code: { lang: "go", src: `for i := 0; i < 3; i++ {
    go func() { fmt.Println(i) }()
}
// go < 1.22 : ${t("thường in 3 3 3", "usually prints 3 3 3")}
// go >= 1.22: ${t("in 0 1 2 (thứ tự có thể khác)", "prints 0 1 2 (order may vary)")}

for i := 0; i < 3; i++ {
    go func(n int) { fmt.Println(n) }(i) // ${t("cách an toàn mọi phiên bản", "safe on every version")}
}` },
        href: LOOPVAR, label: "Go blog: loopvar",
      },

      // ---------- Errors, defer, generics ----------
      {
        q: t("Xử lý lỗi trong Go: wrap, errors.Is và errors.As?", "Error handling in Go: wrapping, errors.Is and errors.As?"),
        a: [
          t(
            "Go coi lỗi là giá trị bình thường (kiểu error) được trả về, không có exception. Khi chuyển lỗi lên tầng trên, hãy thêm ngữ cảnh bằng fmt.Errorf với %w: lỗi gốc vẫn nằm trong chuỗi nên không mất thông tin.",
            "Go treats errors as ordinary values (type error) that you return; there are no exceptions. When passing an error upward, add context with fmt.Errorf and %w: the original stays in the chain so no information is lost.",
          ),
          t(
            "errors.Is(err, target) hỏi “trong chuỗi có đúng lỗi này không” (so sánh với sentinel như sql.ErrNoRows). errors.As(err, &x) hỏi “trong chuỗi có lỗi thuộc kiểu này không” và lấy ra để đọc thêm trường. Đừng so sánh err == ErrX vì sẽ hỏng khi lỗi đã bị wrap.",
            "errors.Is(err, target) asks “is this exact error somewhere in the chain” (compare with a sentinel such as sql.ErrNoRows). errors.As(err, &x) asks “is there an error of this type in the chain” and extracts it so you can read its fields. Do not compare err == ErrX because it breaks once the error is wrapped.",
          ),
        ],
        diagram: <Flow id="errw" label="Error wrap" steps={[
          { title: "sql.ErrNoRows", sub: t("lỗi gốc", "root error") },
          { title: t("repo wrap", "repo wraps"), sub: "%w" },
          { title: t("service wrap", "service wraps"), sub: "%w" },
          { title: "handler", sub: "errors.Is", hl: true },
          { title: "404", sub: t("trả đúng mã", "right status") },
        ]} caption={t("Mỗi tầng thêm ngữ cảnh, tầng trên cùng vẫn nhận ra lỗi gốc.", "Each layer adds context and the top layer still recognises the root error.")} />,
        code: { lang: "go", src: `var ErrNotFound = errors.New("not found")

func (r *Repo) Get(id string) (*User, error) {
    u, err := r.query(id)
    if errors.Is(err, sql.ErrNoRows) {
        return nil, fmt.Errorf("get user %s: %w", id, ErrNotFound) // ${t("thêm ngữ cảnh, giữ lỗi gốc", "add context, keep the cause")}
    }
    return u, err
}

if errors.Is(err, ErrNotFound) { /* ${t("trả 404", "return 404")} */ }

var pe *fs.PathError
if errors.As(err, &pe) { fmt.Println(pe.Path) }` },
        href: ERRS, label: "Go blog: Working with errors",
      },
      {
        q: t("defer, panic, recover: thứ tự chạy và các bẫy?", "defer, panic, recover: execution order and pitfalls?"),
        a: [
          t(
            "defer hoãn một lời gọi cho tới khi hàm kết thúc (return hoặc panic). Nhiều defer chạy theo thứ tự ngược (vào sau ra trước). Tham số của lời gọi defer được tính ngay lúc khai báo, không phải lúc chạy.",
            "defer postpones a call until the function ends (return or panic). Several defers run in reverse order (last in, first out). The arguments of a deferred call are evaluated at the defer statement, not when it runs.",
          ),
          t(
            "panic dừng luồng bình thường và chạy các defer đi lên stack; recover chỉ có tác dụng bên trong defer, để bắt panic và chạy tiếp. Dùng recover ở ranh giới (ví dụ middleware HTTP) để một request lỗi không làm sập cả server; đừng dùng panic thay cho trả lỗi thông thường. Bẫy: defer trong vòng lặp chỉ chạy khi cả hàm kết thúc, dễ giữ file mở quá lâu.",
            "panic stops normal flow and runs deferred calls up the stack; recover works only inside a deferred function, to catch the panic and continue. Use recover at boundaries (e.g. HTTP middleware) so one bad request does not take down the server; do not use panic instead of returning errors. Pitfall: a defer inside a loop runs only when the whole function ends, easily keeping files open too long.",
          ),
        ],
        code: { lang: "go", src: `func demo() (err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("recovered: %v", r)   // ${t("biến panic thành lỗi", "turn the panic into an error")}
        }
    }()
    defer fmt.Println("1")      // ${t("chạy thứ hai", "runs second")}
    defer fmt.Println("2")      // ${t("chạy đầu tiên (LIFO)", "runs first (LIFO)")}
    panic("boom")
}` },
        href: DEFER, label: "Go blog: Defer, Panic, Recover",
      },
      {
        q: t("Generics trong Go: khi nào nên dùng?", "Generics in Go: when should you use them?"),
        a: [
          t(
            "Generics (Go 1.18+) cho phép viết một hàm hoặc kiểu dùng được với nhiều kiểu dữ liệu mà vẫn kiểm tra kiểu lúc compile, bằng tham số kiểu và ràng buộc (constraint).",
            "Generics (Go 1.18+) let one function or type work with many data types while keeping compile-time type checking, using type parameters and constraints.",
          ),
          t(
            "Nên dùng cho: cấu trúc dữ liệu dùng chung (Set, Cache, Queue), hàm tiện ích trên slice/map (Map, Filter, Keys). Không nên dùng khi interface thông thường đã đủ, vì generics làm code khó đọc hơn. Quy tắc thực dụng: viết cụ thể trước, thấy lặp lại ở ba kiểu khác nhau mới tổng quát hóa.",
            "Use them for: shared data structures (Set, Cache, Queue) and utilities over slices/maps (Map, Filter, Keys). Avoid them when a plain interface is enough, since generics make code harder to read. A pragmatic rule: write the concrete version first and generalise only after seeing the same code repeat for three types.",
          ),
        ],
        code: { lang: "go", src: `type Number interface{ ~int | ~int64 | ~float64 }

func Sum[T Number](xs []T) T {
    var total T
    for _, x := range xs { total += x }
    return total
}

Sum([]int{1, 2, 3})          // 6
Sum([]float64{1.5, 2.5})     // 4` },
        href: GENERICS, label: "Tutorial: generics",
      },
      {
        q: t("Go không có kế thừa, vậy embedding là gì?", "Go has no inheritance, so what is embedding?"),
        a: t(
          "Go dùng composition (ghép) thay cho kế thừa. Khi nhúng một kiểu vào struct khác (không đặt tên trường), các field và method của kiểu nhúng được “đẩy lên” để gọi trực tiếp. Nhưng đây không phải quan hệ “là một” như class: kiểu ngoài không thể gán vào biến kiểu trong. Muốn đa hình thì dùng interface. Nhúng interface vào struct cũng là cách hay để ghi đè từng method khi test.",
          "Go uses composition instead of inheritance. When you embed a type in another struct (no field name), the embedded type's fields and methods are “promoted” and callable directly. This is not an “is-a” relationship as with classes: the outer type cannot be assigned to a variable of the inner type. For polymorphism use interfaces. Embedding an interface in a struct is also a neat way to override single methods in tests.",
        ),
        code: { lang: "go", src: `type Logger struct{ prefix string }
func (l Logger) Info(msg string) { fmt.Println(l.prefix, msg) }

type Service struct {
    Logger          // ${t("nhúng: Service có luôn method Info", "embedded: Service gets Info for free")}
    db *sql.DB
}

s := Service{Logger: Logger{prefix: "[svc]"}}
s.Info("started")   // ${t("gọi trực tiếp, không cần s.Logger.Info", "called directly, no s.Logger.Info needed")}` },
        href: EFFECTIVE + "#embedding", label: "Effective Go: embedding",
      },

      // ---------- Production ----------
      {
        q: t("Graceful shutdown cho HTTP server làm thế nào?", "How do you shut an HTTP server down gracefully?"),
        a: [
          t(
            "Khi deploy, Kubernetes gửi tín hiệu SIGTERM. Nếu tắt ngay thì các request đang xử lý bị cắt giữa chừng (có thể đang trừ tiền). Graceful shutdown nghĩa là: ngừng nhận kết nối mới, chờ request đang chạy xong trong một thời hạn, rồi mới thoát.",
            "On deploy, Kubernetes sends SIGTERM. Exiting immediately cuts in-flight requests mid-way (perhaps while charging money). Graceful shutdown means: stop accepting new connections, wait for running requests to finish within a deadline, then exit.",
          ),
          t(
            "Trong Go: bắt tín hiệu bằng signal.NotifyContext, rồi gọi server.Shutdown(ctx) với một ctx có timeout. Sau đó đóng các tài nguyên khác (DB, consumer queue) theo thứ tự ngược lúc khởi tạo.",
            "In Go: catch the signal with signal.NotifyContext, then call server.Shutdown(ctx) with a timeout context. After that close other resources (DB, queue consumers) in reverse order of creation.",
          ),
        ],
        code: { lang: "go", src: `ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
defer stop()

srv := &http.Server{Addr: ":8080", Handler: mux}
go func() {
    if err := srv.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
        log.Fatal(err)
    }
}()

<-ctx.Done()                                    // ${t("nhận SIGTERM", "SIGTERM received")}
shutdownCtx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
defer cancel()
_ = srv.Shutdown(shutdownCtx)                   // ${t("chờ request đang chạy xong", "wait for in-flight requests")}
// ${t("rồi đóng DB, consumer...", "then close the DB, consumers...")}` },
        href: HTTP, label: "http.Server.Shutdown",
      },
      {
        q: t("Cache stampede là gì? singleflight giải quyết ra sao?", "What is a cache stampede and how does singleflight help?"),
        a: [
          t(
            "Cache stampede: một key nóng hết hạn, hàng nghìn request cùng lúc thấy cache trống và cùng chạy xuống DB để tính lại, DB quá tải. Giống cả đám đông xô vào một cánh cửa cùng lúc.",
            "Cache stampede: a hot key expires, thousands of requests see an empty cache at once and all hit the DB to recompute it, overloading it. Like a crowd rushing through one door at the same moment.",
          ),
          t(
            "singleflight gộp các lời gọi trùng key trong cùng process: chỉ một goroutine thật sự chạy hàm, những goroutine còn lại chờ và nhận cùng kết quả. Kết hợp thêm: TTL (Time To Live) có thêm số ngẫu nhiên (jitter) để các key không hết hạn cùng giây, và khóa phân tán ngắn khi có nhiều instance.",
            "singleflight merges duplicate calls for the same key within a process: only one goroutine actually runs the function while the others wait and share the result. Combine it with a TTL (Time To Live) plus random jitter so keys do not all expire in the same second, and a short distributed lock when running several instances.",
          ),
        ],
        code: { lang: "go", src: `var group singleflight.Group

func GetUser(ctx context.Context, id string) (*User, error) {
    v, err, _ := group.Do("user:"+id, func() (any, error) {
        return loadFromDB(ctx, id)      // ${t("1000 request cùng key chỉ chạy hàm này 1 lần", "1000 requests for one key run this only once")}
    })
    if err != nil { return nil, err }
    return v.(*User), nil
}` },
        href: XSYNC, label: "singleflight",
      },
      {
        q: t("Service Go CPU 100% hoặc tốn RAM tăng mãi: điều tra thế nào?", "A Go service pins the CPU or leaks RAM: how do you investigate?"),
        a: [
          t(
            "Đi theo thứ tự, đừng đoán: (1) xem metric/dashboard để biết triệu chứng bắt đầu khi nào, có trùng đợt deploy không. (2) Lấy profile bằng pprof: CPU để biết hàm nào ngốn CPU, heap để biết ai đang giữ bộ nhớ, goroutine để biết có leak không. (3) So sánh hai profile cách nhau vài phút (go tool pprof -base) để thấy phần tăng. (4) Sửa gốc rồi đo lại.",
            "Go in order, do not guess: (1) look at metrics/dashboards to see when it started and whether it matches a deploy. (2) Capture pprof profiles: CPU to see which functions burn CPU, heap to see who holds memory, goroutine to spot leaks. (3) Compare two profiles taken minutes apart (go tool pprof -base) to isolate the growth. (4) Fix the root cause and measure again.",
          ),
          t(
            "Biện pháp tạm khi đang cháy: đặt GOMEMLIMIT để tránh OOM kill, tăng số replica, rollback bản deploy. Nhớ bảo vệ endpoint /debug/pprof, không mở ra internet.",
            "Stop-gaps during an incident: set GOMEMLIMIT to avoid an OOM kill, add replicas, roll back the deploy. Remember to protect the /debug/pprof endpoint and never expose it to the internet.",
          ),
        ],
        diagram: <Flow id="prof" label="Investigate" steps={[
          { title: "Metric", sub: t("triệu chứng", "symptom") },
          { title: "pprof", sub: "cpu / heap / goroutine", hl: true },
          { title: t("So sánh", "Diff"), sub: "-base" },
          { title: t("Sửa gốc", "Fix root cause"), sub: t("không đoán", "no guessing") },
          { title: t("Đo lại", "Measure again"), sub: t("xác nhận", "confirm") },
        ]} caption={t("Luôn có số liệu trước và sau khi sửa.", "Always have numbers before and after the fix.")} />,
        code: { lang: "bash", src: `# ${t("trong code: import _ \"net/http/pprof\" để đăng ký /debug/pprof", "in code: import _ \"net/http/pprof\" to register /debug/pprof")}
go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30   # CPU
go tool pprof http://localhost:6060/debug/pprof/heap                 # ${t("bộ nhớ", "memory")}
go tool pprof http://localhost:6060/debug/pprof/goroutine            # ${t("leak goroutine", "goroutine leaks")}
go tool pprof -base old.pb.gz new.pb.gz                              # ${t("so sánh hai lần lấy", "compare two captures")}` },
        href: PPROF, label: "Go blog: Profiling",
      },
      {
        q: t("Cấu hình connection pool của database/sql ra sao?", "How do you tune the database/sql connection pool?"),
        a: [
          t(
            "database/sql tự quản lý một pool kết nối. Nếu không cấu hình, số kết nối mở không giới hạn: tải cao có thể mở quá nhiều làm DB từ chối kết nối. Bốn thông số cần biết: SetMaxOpenConns (trần tổng số kết nối), SetMaxIdleConns (số kết nối rảnh giữ lại), SetConnMaxLifetime (tuổi tối đa của một kết nối) và SetConnMaxIdleTime.",
            "database/sql manages a connection pool itself. Left unconfigured, the number of open connections is unlimited: under heavy load it may open so many that the DB refuses connections. Four settings matter: SetMaxOpenConns (cap on total connections), SetMaxIdleConns (idle ones kept), SetConnMaxLifetime (max age of a connection) and SetConnMaxIdleTime.",
          ),
          t(
            "Quy tắc: tổng MaxOpen của mọi instance phải nhỏ hơn giới hạn kết nối của DB. Đặt ConnMaxLifetime để xoay kết nối, tránh kết nối bị load balancer hoặc DB cắt âm thầm. Luôn truyền context vào query và đóng rows để trả kết nối về pool.",
            "Rules: the sum of MaxOpen across all instances must stay below the DB's connection limit. Set ConnMaxLifetime to rotate connections and avoid ones silently dropped by a load balancer or the DB. Always pass a context to queries and close rows so connections return to the pool.",
          ),
        ],
        code: { lang: "go", src: `db.SetMaxOpenConns(20)                   // ${t("trần kết nối của instance này", "this instance's connection cap")}
db.SetMaxIdleConns(10)
db.SetConnMaxLifetime(30 * time.Minute)
db.SetConnMaxIdleTime(5 * time.Minute)

rows, err := db.QueryContext(ctx, "SELECT id FROM orders WHERE status=$1", "PAID")
if err != nil { return err }
defer rows.Close()                       // ${t("quên dòng này là rò rỉ kết nối", "forgetting this leaks a connection")}` },
        href: DB, label: "Managing connections",
      },

      // ---------- Design choices ----------
      {
        q: t("ORM (GORM, Ent) hay SQL (sqlx, pgx, sqlc)?", "ORM (GORM, Ent) or SQL (sqlx, pgx, sqlc)?"),
        a: [
          t(
            "ORM (Object-Relational Mapping) tự sinh SQL từ code Go nên viết CRUD (Create, Read, Update, Delete) rất nhanh, nhưng query sinh ra khó đoán, dễ dính lỗi N+1 và nhiều lỗi chỉ lộ lúc chạy. Cách viết SQL thật (sqlx, pgx) cho bạn kiểm soát hoàn toàn; sqlc đọc file .sql của bạn và sinh hàm Go có kiểu chặt, nên vừa an toàn vừa nhanh.",
            "An ORM (Object-Relational Mapping) generates SQL from Go code so CRUD (Create, Read, Update, Delete) is quick to write, but the generated queries are hard to predict, prone to N+1, and many errors show only at runtime. Writing real SQL (sqlx, pgx) gives full control; sqlc reads your .sql files and generates strictly typed Go functions, so it is both safe and fast.",
          ),
          t(
            "Câu trả lời senior: hệ thống thanh toán tải cao cần kiểm soát transaction và khóa (SELECT ... FOR UPDATE) nên chọn sqlc + pgx; công cụ admin nội bộ dùng ORM cho nhanh. Điều quan trọng là nêu được lý do và team thống nhất một cách.",
            "A senior answer: a high-load payment system needs control over transactions and locks (SELECT ... FOR UPDATE) so choose sqlc + pgx; an internal admin tool can use an ORM for speed. What matters is giving the reason and having the team agree on one approach.",
          ),
        ],
        code: { lang: "sql", src: `-- query.sql (${t("sqlc đọc file này", "sqlc reads this file")})
-- name: LockWallet :one
SELECT id, balance FROM wallets WHERE id = $1 FOR UPDATE;

-- ${t("sinh ra hàm Go có kiểu: q.LockWallet(ctx, id) (Wallet, error)", "generates a typed Go function: q.LockWallet(ctx, id) (Wallet, error)")}` },
        href: "https://docs.sqlc.dev/", label: "sqlc docs",
      },
      {
        q: t("net/http, Gin, Echo hay Fiber?", "net/http, Gin, Echo or Fiber?"),
        a: [
          t(
            "Từ Go 1.22 router chuẩn của net/http đã có method và path param (GET /users/{id}) nên đủ cho phần lớn API, không cần phụ thuộc ngoài. Middleware chỉ là func(http.Handler) http.Handler.",
            "Since Go 1.22 the standard net/http router supports methods and path parameters (GET /users/{id}), enough for most APIs with no external dependency. Middleware is just func(http.Handler) http.Handler.",
          ),
          t(
            "Gin, Echo, Chi dựa trên net/http và thêm binding, validation, nhóm route. Fiber dựa trên fasthttp nên không tương thích http.Handler: không dùng chung được middleware và hệ sinh thái chuẩn (OpenTelemetry, pprof). Nhanh trên benchmark nhưng hiếm khi tầng HTTP là nút cổ chai thật sự, nên bắt đầu từ chuẩn rồi mới thêm khi cần.",
            "Gin, Echo and Chi build on net/http and add binding, validation and route groups. Fiber is built on fasthttp so it is not http.Handler compatible: standard middleware and ecosystem tools (OpenTelemetry, pprof) do not plug in. It is fast in benchmarks but the HTTP layer is rarely the real bottleneck, so start from the standard library and add more only when needed.",
          ),
        ],
        code: { lang: "go", src: `mux := http.NewServeMux()
mux.HandleFunc("GET /users/{id}", func(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")      // ${t("path param của Go 1.22", "Go 1.22 path parameter")}
    fmt.Fprintf(w, "user %s", id)
})
log.Fatal(http.ListenAndServe(":8080", mux))` },
        href: ROUTING, label: "Go blog: routing",
      },
      {
        q: t("gRPC hay REST (Representational State Transfer)?", "gRPC or REST (Representational State Transfer)?"),
        a: t(
          "gRPC dùng HTTP/2 và Protobuf nhị phân: nhanh, hợp đồng (file .proto) chặt, hỗ trợ streaming hai chiều và sinh code client/server. Hợp để các service nội bộ gọi nhau. REST + JSON thì ai cũng gọi được, trình duyệt gọi trực tiếp, dễ debug và cache. Hợp cho API công khai, đối tác, frontend. Hệ thống thật thường dùng cả hai: REST ở biên, gRPC ở bên trong.",
          "gRPC uses HTTP/2 and binary Protobuf: fast, with a strict contract (.proto file), bidirectional streaming and generated client/server code. It suits internal services calling each other. REST + JSON can be called by anyone, directly from browsers, and is easy to debug and cache. It suits public APIs, partners and frontends. Real systems often use both: REST at the edge, gRPC inside.",
        ),
        href: "https://grpc.io/docs/what-is-grpc/introduction/", label: "gRPC introduction",
      },

      // ---------- Testing & maintenance ----------
      {
        q: t("Chiến lược test: unit test mock hay integration test?", "Testing strategy: mocked unit tests or integration tests?"),
        a: [
          t(
            "Unit test + mock: mock các interface nhỏ ở tầng service (gomock, testify hoặc tự viết fake). Nhanh, chạy mỗi lần lưu file, kiểm tra logic nghiệp vụ. Nhược điểm: dễ mock quá tay, test xanh nhưng SQL thật sai.",
            "Unit tests + mocks: mock small interfaces at the service layer (gomock, testify or hand-written fakes). Fast, run on every save, verify business logic. Downside: easy to over-mock, tests pass while the real SQL is wrong.",
          ),
          t(
            "Integration test + Testcontainers: dựng Postgres, Redis, Kafka thật bằng Docker ngay trong test. Bắt được lỗi SQL, migration, transaction, khóa. Chậm hơn nên chạy ở CI. Kim tự tháp hợp lý: nhiều unit test, ít hơn nhưng có integration test cho các đường quan trọng (thanh toán, đặt hàng).",
            "Integration tests + Testcontainers: spin up real Postgres, Redis, Kafka in Docker inside the test. They catch SQL, migration, transaction and lock bugs. Slower, so run them in CI. A sensible pyramid: many unit tests, fewer integration tests for critical paths (payments, orders).",
          ),
        ],
        code: { lang: "go", src: `// ${t("Table-driven test: mỗi dòng là một ca, chạy song song", "Table-driven test: one row per case, run in parallel")}
func TestCalcFee(t *testing.T) {
    cases := []struct {
        name         string
        amount, want int64
    }{
        {"zero", 0, 0},
        {"normal", 10_000, 150},
    }
    for _, c := range cases {
        t.Run(c.name, func(t *testing.T) {
            t.Parallel()
            if got := CalcFee(c.amount); got != c.want {
                t.Fatalf("CalcFee(%d) = %d, want %d", c.amount, got, c.want)
            }
        })
    }
}
// go test -race -cover ./...` },
        href: TESTING, label: "Tutorial: add a test",
      },
      {
        q: t("Refactor code cũ và nâng phiên bản Go an toàn thế nào?", "How do you refactor legacy code and upgrade Go safely?"),
        a: [
          t(
            "Làm theo bước nhỏ, mỗi bước có thể kiểm chứng: (1) viết test bao quanh hành vi hiện tại trước (characterization test) rồi mới sửa. (2) Nâng dòng go trong go.mod từng bước, đọc release notes, chạy go vet và test -race. (3) Dùng công cụ tự động: go fix đổi sang cú pháp mới, hoặc gopls/gofmt -r cho thay đổi hàng loạt.",
            "Work in small verifiable steps: (1) write tests around current behaviour first (characterization tests), then change code. (2) Bump the go line in go.mod one version at a time, read the release notes, run go vet and test -race. (3) Use automation: go fix for newer syntax, or gopls/gofmt -r for bulk edits.",
          ),
          t(
            "Hiện đại hóa có chọn lọc: log sang log/slog, router tự viết sang ServeMux mới, hàm lặp cho nhiều kiểu sang generics, nhiều module trong một repo sang go.work. Không viết lại chỉ vì có cú pháp mới; chỉ đổi khi nó làm code rõ hơn hoặc an toàn hơn.",
            "Modernise selectively: log to log/slog, hand-rolled routers to the new ServeMux, repeated per-type functions to generics, multi-module repos to go.work. Do not rewrite just because new syntax exists; change only when it makes code clearer or safer.",
          ),
        ],
        code: { lang: "bash", src: `go vet ./...                       # ${t("bắt lỗi phổ biến", "catch common mistakes")}
go test -race ./...                # ${t("test + phát hiện race", "tests + race detection")}
go fix ./...                       # ${t("đổi sang cú pháp/API mới", "migrate to newer syntax/APIs")}
go mod tidy                        # ${t("dọn phụ thuộc", "tidy dependencies")}` },
        href: MODS, label: "go.mod reference",
      },
      {
        q: t("Go Memory Model nói gì? happens-before là gì?", "What does the Go Memory Model say? What is happens-before?"),
        a: [
          t(
            "Memory Model là bộ quy tắc nói khi nào một goroutine được đảm bảo THẤY giá trị mà goroutine khác đã ghi. Thiếu đảm bảo này, compiler và CPU được phép sắp xếp lại thứ tự lệnh nên goroutine B có thể không bao giờ thấy ghi của A.",
            "The Memory Model is the set of rules saying when one goroutine is guaranteed to SEE a value written by another. Without such a guarantee, the compiler and CPU may reorder instructions so goroutine B might never see A's write.",
          ),
          t(
            "Quan hệ happens-before được tạo ra bởi các thao tác đồng bộ: gửi trên channel xảy ra trước nhận tương ứng; đóng channel xảy ra trước nhận được giá trị zero; Unlock xảy ra trước Lock kế tiếp; sync.Once; WaitGroup.Wait. Mẹo thực hành: mọi dữ liệu chia sẻ đều phải đi qua một trong các thao tác này, đừng dùng biến cờ không đồng bộ.",
            "Happens-before is created by synchronisation operations: a send on a channel happens before the matching receive; closing a channel happens before a receive that returns the zero value; Unlock happens before the next Lock; sync.Once; WaitGroup.Wait. Practical tip: all shared data must pass through one of these, never an unsynchronised flag variable.",
          ),
        ],
        code: { lang: "go", src: `var data string
done := make(chan struct{})

go func() {
    data = "hello"      // (1) ${t("ghi", "write")}
    close(done)         // (2) ${t("đóng channel", "close channel")}
}()

<-done                  // (3) ${t("nhận: bảo đảm (1) đã xảy ra trước", "receive: guarantees (1) happened before")}
fmt.Println(data)       // ${t("luôn in hello", "always prints hello")}` },
        href: MEM, label: "The Go Memory Model",
      },
    ],
  };
}
