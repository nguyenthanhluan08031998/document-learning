import { Flow } from "@/components/Flow";
import type { InterviewData } from "@/components/InterviewList";
import type { Locale } from "@/lib/notebook";

const LOOP = "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick";
const WORKER = "https://nodejs.org/api/worker_threads.html";
const CLUSTER = "https://nodejs.org/api/cluster.html";
const STREAM = "https://nodejs.org/api/stream.html";

export default function build(l: Locale): InterviewData {
  const t = (vi: string, en: string) => (l === "vi" ? vi : en);
  return {
    eyebrow: t("phỏng vấn · node.js", "interview · node.js"),
    title: t("Phỏng vấn Node.js", "Node.js interview"),
    lede: t(
      "Bấm vào câu hỏi để xem đáp án, ví dụ và sơ đồ. Nguồn là tài liệu chính thức của Node.js.",
      "Click a question to see the answer, an example and a diagram. The source is the official Node.js docs.",
    ),
    items: [
      {
        q: t("Các pha của event loop trong Node.js?", "What are the phases of the Node.js event loop?"),
        a: t(
          "Theo thứ tự: timers, pending callbacks, idle/prepare (nội bộ), poll, check, close callbacks, rồi quay lại timers. process.nextTick không thuộc pha nào.",
          "In order: timers, pending callbacks, idle/prepare (internal), poll, check, close callbacks, then back to timers. process.nextTick belongs to no phase.",
        ),
        diagram: <Flow id="ndph" label="Event loop phases" steps={[
          { title: "timers", sub: "setTimeout" },
          { title: "pending", sub: "callbacks" },
          { title: "idle/prepare", sub: t("nội bộ", "internal") },
          { title: "poll", sub: "I/O", hl: true },
          { title: "check", sub: "setImmediate" },
          { title: "close", sub: "callbacks" },
        ]} caption={t("Hết pha close thì vòng lặp quay lại timers.", "After close, the loop returns to timers.")} />,
        href: LOOP, label: "Event loop, timers, nextTick",
      },
      {
        q: t("process.nextTick, setImmediate, setTimeout(fn, 0) khác nhau?", "process.nextTick vs setImmediate vs setTimeout(fn, 0)?"),
        a: t(
          "nextTick: hàng đợi của nó được xả ngay sau thao tác hiện tại, trước khi loop đi tiếp. setImmediate chạy ở pha check, ngay sau poll. setTimeout chạy ở pha timers khi đã qua ít nhất ms chỉ định (là ngưỡng, không chính xác tuyệt đối).",
          "nextTick: its queue is drained right after the current operation, before the loop moves on. setImmediate runs in the check phase, right after poll. setTimeout runs in the timers phase once at least the given ms have elapsed (a threshold, not an exact time).",
        ),
        code: { lang: "js", src: `setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
process.nextTick(() => console.log("nextTick"));
Promise.resolve().then(() => console.log("promise"));
console.log("sync");
// ${t("sync → nextTick → promise → (timeout / immediate: thứ tự không chắc ở module chính)", "sync → nextTick → promise → (timeout / immediate: order not guaranteed in the main module)")}` },
        href: LOOP, label: "Event loop, timers, nextTick",
      },
      {
        q: t("setImmediate hay setTimeout 0 chạy trước?", "Which runs first, setImmediate or setTimeout 0?"),
        a: t(
          "Trong callback I/O (Input/Output), setImmediate luôn chạy trước. Gọi từ module chính thì thứ tự không xác định.",
          "Inside an I/O (Input/Output) callback, setImmediate always runs first. From the main module the order is non-deterministic.",
        ),
        code: { lang: "js", src: `const fs = require("node:fs");

fs.readFile(__filename, () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate"));
});
// ${t("luôn in: immediate rồi timeout (vì đang ở pha poll, kế tiếp là check)", "always prints: immediate then timeout (we are in poll, check comes next)")}` },
        href: LOOP, label: "Event loop, timers, nextTick",
      },
      {
        q: t("Gọi đệ quy process.nextTick có sao không?", "Is recursive process.nextTick a problem?"),
        a: t(
          "Có: hàng đợi nextTick không bao giờ cạn nên loop không tới được pha poll, I/O bị bỏ đói. Docs khuyên dùng setImmediate trong đa số trường hợp.",
          "Yes: the nextTick queue never empties, so the loop cannot reach the poll phase and I/O is starved. The docs recommend setImmediate in most cases.",
        ),
        code: { lang: "js", src: `function spin() {
  process.nextTick(spin);     // ${t("sai: I/O và timer không bao giờ được chạy", "bad: I/O and timers never get to run")}
}

function polite() {
  setImmediate(polite);       // ${t("đúng: nhường cho loop giữa các lần", "good: yields to the loop between runs")}
}` },
        href: LOOP, label: "Event loop, timers, nextTick",
      },
      {
        q: t("Việc tốn CPU làm thế nào trong Node.js?", "How do you handle CPU-heavy work in Node.js?"),
        a: t(
          "Chuyển sang worker threads: chạy JavaScript song song và có thể chia sẻ bộ nhớ qua ArrayBuffer hoặc SharedArrayBuffer. Worker không giúp việc I/O vì I/O bất đồng bộ của Node đã hiệu quả. Nên dùng pool worker, tạo worker cho từng tác vụ thì chi phí lớn hơn lợi ích.",
          "Move it to worker threads: they run JavaScript in parallel and can share memory through ArrayBuffer or SharedArrayBuffer. Workers do not help with I/O, since Node's async I/O is already efficient. Use a worker pool; creating a worker per task costs more than it saves.",
        ),
        code: { lang: "js", src: `const { Worker, isMainThread, parentPort, workerData } = require("node:worker_threads");

if (isMainThread) {
  const w = new Worker(__filename, { workerData: 40 });
  w.on("message", result => console.log("fib =", result));   // ${t("main thread vẫn rảnh", "the main thread stays free")}
} else {
  const fib = n => (n < 2 ? n : fib(n - 1) + fib(n - 2));
  parentPort.postMessage(fib(workerData));
}` },
        href: WORKER, label: "Worker threads",
      },
      {
        q: t("cluster dùng để làm gì?", "What is cluster for?"),
        a: t(
          "Fork nhiều process Node.js cùng chia sẻ một cổng để tận dụng nhiều lõi CPU. Mặc định (trừ Windows) process chính nhận kết nối rồi chia vòng tròn (round-robin) cho các worker.",
          "It forks several Node.js processes that share one port so the app can use multiple CPU cores. By default (except on Windows) the primary process accepts connections and distributes them round-robin to the workers.",
        ),
        diagram: <Flow id="ndcl" label="Cluster" steps={[
          { title: "Client", sub: t("kết nối đến", "incoming") },
          { title: "Primary", sub: "round-robin", hl: true },
          { title: "Workers", sub: t("mỗi lõi một process", "one process per core") },
        ]} />,
        code: { lang: "js", src: `const cluster = require("node:cluster");
const http = require("node:http");
const os = require("node:os");

if (cluster.isPrimary) {
  for (let i = 0; i < os.availableParallelism(); i++) cluster.fork();
} else {
  http.createServer((req, res) => res.end("pid " + process.pid)).listen(3000);
}` },
        href: CLUSTER, label: "Cluster",
      },
      {
        q: t("Có những loại stream nào?", "What stream types exist?"),
        a: t(
          "Readable (nguồn đọc), Writable (đích ghi), Duplex (vừa đọc vừa ghi, như net.Socket) và Transform (Duplex biến đổi dữ liệu, như zlib). Stream xử lý từng phần nên không cần nạp cả file vào RAM.",
          "Readable (source), Writable (destination), Duplex (both, e.g. net.Socket) and Transform (a Duplex that modifies data, e.g. zlib). Streams process data in chunks, so a whole file need not fit in RAM.",
        ),
        code: { lang: "js", src: `const fs = require("node:fs");
const zlib = require("node:zlib");
const { pipeline } = require("node:stream/promises");

async function compress() {
  await pipeline(
    fs.createReadStream("big.log"),      // Readable
    zlib.createGzip(),                   // Transform
    fs.createWriteStream("big.log.gz"),  // Writable
  );
}` },
        href: STREAM, label: "Stream",
      },
      {
        q: t("Backpressure là gì?", "What is backpressure?"),
        a: t(
          "Tín hiệu bên ghi chậm hơn bên đọc: write() trả false khi buffer đạt highWaterMark. Bên đọc nên dừng tới khi có sự kiện 'drain', hoặc dùng pipe() để tự xử lý.",
          "The signal that the writer is slower than the reader: write() returns false once the buffer reaches highWaterMark. The reader should pause until the 'drain' event, or use pipe() which handles it automatically.",
        ),
        diagram: <Flow id="ndbp" label="Backpressure" steps={[
          { title: "Readable", sub: t("đọc nhanh", "reads fast") },
          { title: "write() → false", sub: "highWaterMark", hl: true },
          { title: "'drain'", sub: t("ghi tiếp", "resume") },
        ]} />,
        code: { lang: "js", src: `function writeAll(writer, chunks) {
  let i = 0;
  (function next() {
    while (i < chunks.length) {
      if (!writer.write(chunks[i++])) {      // ${t("buffer đầy", "buffer is full")}
        writer.once("drain", next);          // ${t("đợi xả rồi ghi tiếp", "wait for drain, then continue")}
        return;
      }
    }
    writer.end();
  })();
}
// ${t("hoặc đơn giản", "or simply")}: readable.pipe(writable)` },
        href: STREAM, label: "Stream",
      },
    ],
  };
}
