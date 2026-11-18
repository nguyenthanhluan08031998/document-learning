import { Flow } from "@/components/Flow";
import type { InterviewData } from "@/components/InterviewList";
import type { Locale } from "@/lib/notebook";

const EVENT_LOOP = "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop";
const CLOSURES = "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures";
const THIS = "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this";
const PROTO = "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain";
const PROMISE = "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise";
const NARROW = "https://www.typescriptlang.org/docs/handbook/2/narrowing.html";
const EVERYDAY = "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html";
const CLONE = "https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone";
const OWASP_JWT = "https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html#token-storage-on-client-side";

export default function build(l: Locale): InterviewData {
  const t = (vi: string, en: string) => (l === "vi" ? vi : en);
  return {
    eyebrow: t("phỏng vấn · javascript, typescript", "interview · javascript, typescript"),
    title: t("Phỏng vấn JavaScript / TypeScript", "JavaScript / TypeScript interview"),
    lede: t(
      "Bấm vào câu hỏi để xem đáp án, ví dụ và sơ đồ. Nguồn là MDN và tài liệu TypeScript.",
      "Click a question to see the answer, an example and a diagram. Sources are MDN and the TypeScript docs.",
    ),
    items: [
      {
        q: t("Event loop hoạt động thế nào?", "How does the event loop work?"),
        a: [
          t(
            "JavaScript chạy trên một luồng, nên tại mỗi thời điểm chỉ chạy một đoạn code. Event loop là vòng lặp quyết định đoạn code nào được chạy tiếp theo. Bản thân JavaScript không có event loop; nó do môi trường chạy cung cấp (trình duyệt hoặc Node.js).",
            "JavaScript runs on one thread, so only one piece of code runs at a time. The event loop is the loop that decides what runs next. JavaScript itself has no event loop; the host environment (the browser or Node.js) provides it.",
          ),
          t(
            "Có 3 chỗ cần nhớ. Call stack: nơi code đồng bộ đang chạy, mỗi đoạn chạy trọn vẹn rồi mới tới đoạn khác. Microtask queue: callback của Promise (.then, phần sau await), queueMicrotask. Task queue (macrotask): setTimeout, setInterval, sự kiện, kết quả I/O.",
            "There are 3 places to remember. The call stack: where synchronous code runs, each piece to completion before the next. The microtask queue: Promise callbacks (.then, code after await), queueMicrotask. The task (macrotask) queue: setTimeout, setInterval, events, I/O results.",
          ),
          t(
            "Quy tắc: chạy hết code đồng bộ → khi call stack rỗng thì xả HẾT microtask (kể cả microtask mới sinh ra trong lúc xả) → lấy MỘT task tiếp theo → lại xả hết microtask → lặp lại. Vì vậy Promise.then luôn chạy trước setTimeout 0.",
            "The rule: run all synchronous code → when the call stack is empty, drain ALL microtasks (including new ones queued while draining) → take ONE next task → drain microtasks again → repeat. That is why Promise.then always runs before setTimeout 0.",
          ),
        ],
        diagram: <Flow id="jsel" label={t("Call stack, microtask, task", "Call stack, microtask, task")} steps={[
          { title: "Call stack", sub: t("chạy code đồng bộ", "sync code") },
          { title: "Microtask", sub: t("xả hết: promise, await", "drain all: promise, await"), hl: true },
          { title: "Task", sub: t("lấy 1: timer, I/O, event", "take 1: timer, I/O, event") },
        ]} caption={t("Stack rỗng → xả hết microtask → lấy 1 task → lặp lại.", "Stack empty → drain all microtasks → take 1 task → repeat.")} />,
        code: { lang: "js", src: `console.log("1 sync");
setTimeout(() => console.log("5 task"), 0);
Promise.resolve()
  .then(() => console.log("3 microtask"))
  .then(() => console.log("4 microtask"));   // ${t("microtask mới sinh vẫn chạy trước task", "a newly queued microtask still runs before the task")}
console.log("2 sync");
// ${t("kết quả", "output")}: 1 → 2 → 3 → 4 → 5` },
        href: EVENT_LOOP, label: "Event loop (MDN)",
      },
      {
        q: t("Event loop trong trình duyệt và trong Node.js khác nhau những điểm nào?", "How does the event loop differ between the browser and Node.js?"),
        a: [
          t(
            "Giống nhau: đều chạy JS một luồng, và thứ tự luôn là code đồng bộ → microtask → task. Khác nhau ở 7 điểm sau:",
            "Same: both run JS on one thread, and the order is always sync code → microtasks → tasks. They differ in these 7 points:",
          ),
          t(
            "1. Ai cài đặt: trình duyệt làm theo chuẩn HTML (mỗi trình duyệt tự viết); Node.js dùng thư viện libuv viết bằng C.",
            "1. Who implements it: browsers follow the HTML spec (each browser writes its own); Node.js uses the libuv library written in C.",
          ),
          t(
            "2. Cấu trúc vòng lặp: trình duyệt mỗi vòng lấy 1 task từ các hàng đợi task. Node.js đi qua 6 pha cố định theo thứ tự: timers (setTimeout) → pending callbacks → idle/prepare → poll (I/O) → check (setImmediate) → close callbacks.",
            "2. Loop structure: the browser takes 1 task per turn from its task queues. Node.js goes through 6 fixed phases in order: timers (setTimeout) → pending callbacks → idle/prepare → poll (I/O) → check (setImmediate) → close callbacks.",
          ),
          t(
            "3. Bước render: trình duyệt có bước vẽ giao diện giữa các task (requestAnimationFrame → style, layout → paint, khoảng 60 lần/giây). Node.js không có giao diện nên không có bước này.",
            "3. Rendering: the browser has a paint step between tasks (requestAnimationFrame → style, layout → paint, about 60 times a second). Node.js has no UI, so no such step.",
          ),
          t(
            "4. API riêng: trình duyệt có requestAnimationFrame, requestIdleCallback, MessageChannel. Node.js có setImmediate và process.nextTick. process.nextTick có hàng đợi riêng, ưu tiên cao hơn cả Promise.",
            "4. Own APIs: the browser has requestAnimationFrame, requestIdleCallback, MessageChannel. Node.js has setImmediate and process.nextTick. process.nextTick has its own queue with higher priority than even Promises.",
          ),
          t(
            "5. Xử lý I/O: trong trình duyệt, mạng do trình duyệt lo bên trong, JS chỉ nhận kết quả qua fetch/event. Node.js đọc file, DNS, crypto, nén trên thread pool của libuv (mặc định 4 luồng), còn socket mạng dùng cơ chế của hệ điều hành (epoll, kqueue, IOCP).",
            "5. I/O: in the browser, networking is handled internally and JS only gets results via fetch/events. Node.js runs file reads, DNS, crypto and compression on libuv's thread pool (4 threads by default), while network sockets use OS mechanisms (epoll, kqueue, IOCP).",
          ),
          t(
            "6. Timer: trình duyệt ép setTimeout lồng nhau sâu (từ lần thứ 5) tối thiểu 4ms, và tab ẩn bị giảm còn khoảng 1 lần/giây. Node.js tối thiểu 1ms, không bị giảm. Trong Node, setTimeout 0 và setImmediate gọi từ module chính không chắc cái nào chạy trước, nhưng trong callback I/O thì setImmediate luôn chạy trước.",
            "6. Timers: the browser clamps deeply nested setTimeout (from the 5th level) to at least 4ms, and background tabs are throttled to about once a second. Node.js uses a 1ms minimum with no throttling. In Node, setTimeout 0 vs setImmediate from the main module has no guaranteed order, but inside an I/O callback setImmediate always runs first.",
          ),
          t(
            "7. Hậu quả khi chặn event loop: trong trình duyệt, giao diện bị đơ (không click, không cuộn được) cho một người dùng. Trong Node.js, server ngừng trả lời MỌI request của mọi người dùng cùng lúc, nên tác hại lớn hơn nhiều. Việc tính toán nặng nên đưa ra Web Worker (trình duyệt) hoặc worker_threads (Node).",
            "7. Blocking the loop: in the browser the UI freezes (no clicks, no scrolling) for one user. In Node.js the server stops answering EVERY request from every user at once, which is far worse. Move heavy computation to a Web Worker (browser) or worker_threads (Node).",
          ),
          t(
            "Ghi chú lịch sử hay bị hỏi: trước Node 11, microtask chỉ được xả giữa các pha, nên hai setTimeout cùng hạn chạy liền nhau rồi mới tới promise bên trong chúng. Từ Node 11 trở đi, Node xả microtask sau MỖI callback, giống trình duyệt.",
            "A historical note interviewers like: before Node 11, microtasks were only drained between phases, so two timers due together both ran before the promises inside them. Since Node 11, Node drains microtasks after EACH callback, like the browser.",
          ),
        ],
        diagram: <>
          <Flow id="jselb" label={t("Event loop trình duyệt", "Browser event loop")} steps={[
            { title: t("1 task", "1 task"), sub: "timer, click, fetch" },
            { title: "Microtask", sub: t("xả hết", "drain all"), hl: true },
            { title: "rAF", sub: "requestAnimationFrame" },
            { title: "Render", sub: "style → layout → paint", hl: true },
          ]} caption={t("Trình duyệt: task → microtask → (có thể) vẽ giao diện → lặp lại.", "Browser: task → microtasks → (maybe) paint → repeat.")} />
          <Flow id="jseln" label={t("Event loop Node.js", "Node.js event loop")} steps={[
            { title: "timers", sub: "setTimeout" },
            { title: "pending", sub: "callbacks" },
            { title: "poll", sub: "I/O", hl: true },
            { title: "check", sub: "setImmediate", hl: true },
            { title: "close", sub: "callbacks" },
          ]} caption={t("Node.js: đi qua các pha; sau mỗi callback xả nextTick rồi tới promise.", "Node.js: walks the phases; after each callback drains nextTick, then promises.")} />
        </>,
        code: [
          { lang: "markdown", src: t(
`|                     | Trình duyệt                          | Node.js                                 |
|---------------------|--------------------------------------|-----------------------------------------|
| Cài đặt bởi         | trình duyệt, theo chuẩn HTML         | thư viện libuv (C)                      |
| Cấu trúc vòng lặp   | mỗi vòng lấy 1 task                  | 6 pha: timers → poll → check → close... |
| Bước render         | có (rAF, layout, paint)              | không                                   |
| API riêng           | requestAnimationFrame, MessageChannel | setImmediate, process.nextTick         |
| Ưu tiên microtask   | Promise                              | process.nextTick > Promise              |
| I/O                 | trình duyệt lo, JS nhận qua fetch    | thread pool libuv + epoll/kqueue/IOCP   |
| Timer tối thiểu     | 4ms khi lồng sâu, tab ẩn ~1s         | 1ms, không bị giảm                      |
| Chặn event loop     | đơ giao diện của 1 người dùng        | treo mọi request của mọi người dùng     |
| Chạy song song      | Web Worker                           | worker_threads, child_process           |`,
`|                     | Browser                              | Node.js                                 |
|---------------------|--------------------------------------|-----------------------------------------|
| Implemented by      | the browser, per the HTML spec       | the libuv library (C)                   |
| Loop structure      | 1 task per turn                      | 6 phases: timers → poll → check → close... |
| Render step         | yes (rAF, layout, paint)             | no                                      |
| Own APIs            | requestAnimationFrame, MessageChannel | setImmediate, process.nextTick         |
| Microtask priority  | Promise                              | process.nextTick > Promise              |
| I/O                 | handled by the browser, JS via fetch | libuv thread pool + epoll/kqueue/IOCP   |
| Minimum timer       | 4ms when deeply nested, ~1s in hidden tabs | 1ms, no throttling                |
| Blocking the loop   | freezes the UI for 1 user            | stalls every request for every user     |
| Parallel work       | Web Worker                           | worker_threads, child_process           |`) },
          { lang: "js", src: `// ${t("Chỉ có trong trình duyệt: bước render", "Browser only: the render step")}
button.addEventListener("click", () => {
  box.style.left = "100px";
  requestAnimationFrame(() => console.log("${t("chạy ngay trước lần vẽ kế tiếp", "runs right before the next paint")}"));
});

// ${t("Vòng lặp nặng: giao diện đơ, không vẽ được cho tới khi xong", "Heavy loop: the UI freezes and cannot paint until it ends")}
for (let i = 0; i < 1e9; i++) {}` },
          { lang: "js", src: `// ${t("Chỉ có trong Node.js: nextTick, setImmediate, các pha", "Node.js only: nextTick, setImmediate, phases")}
const fs = require("node:fs");

setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("nextTick"));
// nextTick → promise → (timeout / immediate${t(": thứ tự không chắc ở module chính", ": order not guaranteed in the main module")})

fs.readFile(__filename, () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate"));
  // ${t("luôn là immediate → timeout, vì sau pha poll là pha check", "always immediate → timeout, because check comes right after poll")}
});` },
          { lang: "js", src: `// ${t("Cùng một đoạn code, Node < 11 và Node >= 11 / trình duyệt cho kết quả khác", "Same code, different output in Node < 11 vs Node >= 11 / browsers")}
setTimeout(() => { console.log("t1"); Promise.resolve().then(() => console.log("p1")); }, 0);
setTimeout(() => { console.log("t2"); Promise.resolve().then(() => console.log("p2")); }, 0);
// ${t("Trình duyệt, Node >= 11", "Browser, Node >= 11")}: t1 → p1 → t2 → p2
// Node < 11:            t1 → t2 → p1 → p2` },
        ],
        href: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick", label: "Node.js event loop, timers, nextTick",
      },
      {
        q: t("Callback, Promise và async/await liên hệ thế nào? await thực chất làm gì?", "How do callbacks, Promises and async/await relate? What does await actually do?"),
        a: [
          t(
            "Cả ba là ba cách viết cho cùng một việc: chạy tiếp khi tác vụ bất đồng bộ (gọi API, đọc file, timer) xong. Chúng ra đời nối tiếp nhau, cái sau xây trên cái trước.",
            "All three are ways to express the same thing: continue once an asynchronous task (an API call, a file read, a timer) finishes. They came one after another, each built on the previous one.",
          ),
          t(
            "Callback: truyền một hàm vào để được gọi lại khi xong, quy ước Node là callback(err, result). Lồng nhiều bước sẽ thành \"callback hell\" (kim tự tháp thụt lề), phải tự kiểm tra err ở từng tầng, và bạn giao quyền gọi hàm cho code khác (có thể gọi 0 lần hoặc 2 lần).",
            "Callback: pass a function to be called back when done; the Node convention is callback(err, result). Many steps nest into \"callback hell\" (a pyramid of indentation), you must check err at every level, and you hand control to other code (it may call you zero times or twice).",
          ),
          t(
            "Promise: object đại diện cho kết quả tương lai, có 3 trạng thái pending → fulfilled hoặc rejected, và chỉ chốt một lần. .then() trả về promise mới nên các bước nối thành chuỗi phẳng, một .catch() ở cuối bắt lỗi của mọi bước. Bên trong promise vẫn là callback, chỉ là được chuẩn hoá: callback của .then() luôn chạy dưới dạng microtask.",
            "Promise: an object for a future result, with 3 states pending → fulfilled or rejected, settling only once. .then() returns a new promise so steps chain flat, and one .catch() at the end catches errors from every step. Under the hood it is still callbacks, just standardized: .then() callbacks always run as microtasks.",
          ),
          t(
            "async/await: cú pháp viết promise trông như code tuần tự. Hàm async luôn trả về một promise. await tạm dừng hàm async (không chặn cả chương trình), trả quyền cho event loop, và khi promise xong thì phần code sau await chạy tiếp như một microtask, tương đương phần còn lại của hàm được đặt vào .then(). Lỗi bắt bằng try/catch thay vì .catch().",
            "async/await: syntax that makes promise code read like sequential code. An async function always returns a promise. await suspends the async function (not the whole program), hands control to the event loop, and when the promise settles the code after await resumes as a microtask, as if the rest of the function were placed in a .then(). Errors are caught with try/catch instead of .catch().",
          ),
          t(
            "Bẫy hay gặp: await lần lượt các việc độc lập làm chúng chạy tuần tự, nên dùng Promise.all để chạy song song. Có thể chuyển API kiểu callback sang promise bằng new Promise hoặc util.promisify trong Node.",
            "Common traps: awaiting independent tasks one by one runs them sequentially, so use Promise.all to run them in parallel. Callback-style APIs can be turned into promises with new Promise or Node's util.promisify.",
          ),
        ],
        diagram: <Flow id="jsasync" label="Callback, Promise, async/await" steps={[
          { title: "Callback", sub: "fn(err, result)" },
          { title: "Promise", sub: ".then() / .catch()", hl: true },
          { title: "async/await", sub: t("cú pháp trên Promise", "syntax over Promises"), hl: true },
        ]} caption={t("await chỉ dùng được với promise; promise được xây từ callback.", "await only works with promises; promises are built on callbacks.")} />,
        code: [
          { lang: "js", src: `// 1. Callback: ${t("lồng nhau, kiểm tra lỗi từng tầng", "nested, errors checked at every level")}
getUser(1, (err, user) => {
  if (err) return console.error(err);
  getOrders(user.id, (err, orders) => {
    if (err) return console.error(err);
    pay(orders[0], (err, receipt) => {
      if (err) return console.error(err);
      console.log(receipt);
    });
  });
});` },
          { lang: "js", src: `// 2. Promise: ${t("chuỗi phẳng, một .catch cho tất cả", "flat chain, one .catch for all")}
getUser(1)
  .then(user => getOrders(user.id))
  .then(orders => pay(orders[0]))
  .then(receipt => console.log(receipt))
  .catch(err => console.error(err));` },
          { lang: "js", src: `// 3. async/await: ${t("cùng logic, đọc như code tuần tự", "same logic, reads like sequential code")}
async function checkout() {
  try {
    const user = await getUser(1);
    const orders = await getOrders(user.id);
    const receipt = await pay(orders[0]);
    console.log(receipt);
  } catch (err) {
    console.error(err);
  }
}` },
          { lang: "js", src: `// ${t("await không chặn chương trình", "await does not block the program")}
async function main() {
  console.log("A");
  await fetchData();   // ${t("dừng ở đây, event loop chạy tiếp", "pause here, the event loop keeps going")}
  console.log("C");    // ${t("chạy tiếp như một microtask", "resumes as a microtask")}
}
main();
console.log("B");      // ${t("thứ tự in", "print order")}: A, B, C

// ${t("Chuyển callback thành promise", "Turn a callback into a promise")}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// ${t("Việc độc lập: chạy song song thay vì await lần lượt", "Independent work: run in parallel instead of awaiting one by one")}
const [user, products] = await Promise.all([getUser(1), getProducts()]);` },
        ],
        href: PROMISE, label: "Promise (MDN)",
      },
      {
        q: t("Closure là gì?", "What is a closure?"),
        a: [
          t(
            "Định nghĩa: closure là một hàm đi kèm với môi trường từ vựng (lexical environment) nơi nó được khai báo. Nói đơn giản: hàm \"nhớ\" và truy cập được các biến của phạm vi bên ngoài, kể cả khi hàm bên ngoài đó đã chạy xong và return.",
            "Definition: a closure is a function bundled together with the lexical environment in which it was declared. Put simply, the function \"remembers\" and can access variables from its outer scope, even after that outer function has finished and returned.",
          ),
          t(
            "Vì sao có closure: JavaScript dùng phạm vi từ vựng (lexical scope), tức phạm vi được quyết định bởi vị trí viết code, không phải nơi hàm được gọi. Mỗi lần một hàm được tạo ra, JS gắn kèm tham chiếu tới môi trường bao quanh nó. Chừng nào hàm con còn được giữ lại (trả về, gán cho biến, truyền làm callback), các biến nó dùng vẫn còn sống, không bị garbage collector dọn.",
            "Why closures exist: JavaScript uses lexical scope, meaning scope is decided by where code is written, not where a function is called. Every time a function is created, JS attaches a reference to its surrounding environment. As long as the inner function is kept (returned, assigned, passed as a callback), the variables it uses stay alive and are not garbage collected.",
          ),
          t(
            "Closure giữ tham chiếu tới biến, không phải bản sao giá trị: biến ngoài đổi thì closure thấy giá trị mới. Mỗi lần gọi hàm ngoài tạo một môi trường mới, nên mỗi closure có bộ biến riêng.",
            "A closure holds a reference to the variable, not a copy of its value: if the outer variable changes, the closure sees the new value. Each call of the outer function creates a fresh environment, so each closure gets its own variables.",
          ),
          t(
            "Ứng dụng: biến private / module pattern, function factory, giữ state cho callback và event handler, debounce/throttle, memoize, và React hooks (useState, useEffect đều dựa trên closure). Bẫy hay gặp: dùng var trong vòng lặp (mọi closure dùng chung một biến), stale closure trong React (callback giữ state cũ), và rò rỉ bộ nhớ khi closure giữ object lớn quá lâu.",
            "Uses: private variables / the module pattern, function factories, keeping state for callbacks and event handlers, debounce/throttle, memoization, and React hooks (useState and useEffect rely on closures). Common traps: var in a loop (every closure shares one variable), stale closures in React (a callback holding old state), and memory leaks when a closure keeps a large object alive too long.",
          ),
        ],
        diagram: <Flow id="jscl" label="Closure" steps={[
          { title: "makeCounter()", sub: t("tạo biến count", "creates count") },
          { title: t("return hàm con", "returns inner fn"), sub: t("gắn tham chiếu tới count", "keeps a reference to count"), hl: true },
          { title: t("makeCounter xong", "makeCounter ends"), sub: t("count vẫn sống", "count stays alive") },
          { title: "next()", sub: "count++", hl: true },
        ]} caption={t("Hàm ngoài đã return nhưng biến vẫn còn vì hàm con còn giữ nó.", "The outer function has returned, but the variable lives on because the inner function holds it.")} />,
        code: [
          { lang: "js", src: `// ${t("1. Biến private", "1. Private variable")}
function makeCounter() {
  let count = 0;            // ${t("không truy cập được từ ngoài", "not reachable from outside")}
  return {
    next: () => ++count,
    reset: () => { count = 0; },
  };
}
const a = makeCounter();
const b = makeCounter();    // ${t("môi trường riêng, count riêng", "its own environment and count")}
a.next(); a.next();         // 2
b.next();                   // 1
console.log(a.count);       // undefined` },
          { lang: "js", src: `// ${t("2. Function factory", "2. Function factory")}
const makeDiscount = rate => price => price * (1 - rate);
const vip = makeDiscount(0.2);    // ${t("closure nhớ rate = 0.2", "closure remembers rate = 0.2")}
vip(100); // 80

// ${t("3. Giữ tham chiếu, không phải bản sao", "3. Holds a reference, not a copy")}
let tax = 0.1;
const withTax = price => price * (1 + tax);
tax = 0.08;
withTax(100); // 108, ${t("thấy giá trị mới", "sees the new value")}` },
          { lang: "js", src: `// ${t("4. Bẫy var trong vòng lặp", "4. The var-in-a-loop trap")}
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i));   // 3, 3, 3
for (let j = 0; j < 3; j++) setTimeout(() => console.log(j));   // 0, 1, 2
// ${t("var: một biến i dùng chung; let: mỗi vòng một biến j mới", "var: one shared i; let: a fresh j each iteration")}

// ${t("5. Debounce dựa trên closure", "5. Debounce built on a closure")}
function debounce(fn, ms) {
  let timer;                         // ${t("closure giữ timer giữa các lần gọi", "the closure keeps timer between calls")}
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}` },
        ],
        href: CLOSURES, label: "Closures (MDN)",
      },
      {
        q: t("var, let, const khác nhau?", "var vs let vs const?"),
        a: t(
          "var có phạm vi hàm; let và const có phạm vi khối và mỗi vòng lặp tạo một binding mới. Vì vậy closure trong vòng for dùng var thấy chung một biến (lỗi kinh điển). const cấm gán lại, không làm object bất biến.",
          "var is function-scoped; let and const are block-scoped and each loop iteration gets a fresh binding. That is why closures in a for loop with var share one variable (the classic bug). const forbids reassignment; it does not make objects immutable.",
        ),
        code: { lang: "js", src: `for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3
for (let j = 0; j < 3; j++) setTimeout(() => console.log(j)); // 0 1 2

const user = { name: "A" };
user.name = "B";   // ${t("được: chỉ binding là hằng", "allowed: only the binding is constant")}
// user = {};      // TypeError` },
        href: CLOSURES, label: "Closures (MDN)",
      },
      {
        q: t("this được xác định thế nào?", "How is this determined?"),
        a: t(
          "Lúc gọi hàm, không phải lúc định nghĩa: obj.f() thì this là obj; gọi trần thì là undefined (strict mode). call, apply, bind gán this thủ công. Arrow function không có this riêng, lấy từ scope bao quanh.",
          "At call time, not at definition: obj.f() makes this obj; a bare call gives undefined in strict mode. call, apply and bind set it explicitly. Arrow functions have no this of their own and take it from the enclosing scope.",
        ),
        code: { lang: "js", src: `const user = {
  name: "An",
  hello() { return this.name; },
  helloArrow: () => this,          // ${t("this của scope ngoài, không phải user", "outer this, not user")}
};
user.hello();                      // "An"
const f = user.hello;
f();                               // ${t("this mất: undefined (strict)", "this is lost: undefined (strict)")}
f.call({ name: "Bình" });          // "Bình"` },
        href: THIS, label: "this (MDN)",
      },
      {
        q: t("Prototype chain là gì? class là gì?", "What is the prototype chain? What is a class?"),
        a: t(
          "Mỗi object có liên kết [[Prototype]]; tra thuộc tính không thấy thì đi dọc chuỗi tới Object.prototype rồi null. class chỉ là cú pháp bọc quanh cơ chế này: method nằm trên Class.prototype, extends nối prototype.",
          "Every object has a [[Prototype]] link; a missing property is looked up along the chain up to Object.prototype and then null. class is syntax over the same mechanism: methods live on Class.prototype and extends links the prototypes.",
        ),
        diagram: <Flow id="jspr" label="Prototype chain" steps={[
          { title: "dog", sub: t("thuộc tính riêng", "own properties") },
          { title: "Dog.prototype", sub: "bark()" },
          { title: "Object.prototype", sub: "toString()" },
          { title: "null", sub: t("hết chuỗi", "end of chain") },
        ]} caption={t("dog.toString() không thấy ở dog, đi lên tới Object.prototype mới thấy.", "dog.toString() is not on dog, so the lookup climbs to Object.prototype.")} />,
        code: { lang: "js", src: `class Animal { eat() {} }
class Dog extends Animal { bark() {} }
const dog = new Dog();
Object.getPrototypeOf(dog) === Dog.prototype;                 // true
Object.getPrototypeOf(Dog.prototype) === Animal.prototype;    // true` },
        href: PROTO, label: "Prototype chain (MDN)",
      },
      {
        q: t("Shallow copy khác deep copy?", "Shallow copy vs deep copy?"),
        a: [
          t(
            "Shallow copy (sao chép nông) chỉ tạo object mới ở tầng ngoài cùng; các object hoặc mảng lồng bên trong vẫn là cùng một tham chiếu với bản gốc, nên sửa tầng trong ở bản sao thì bản gốc cũng đổi. Các cách tạo shallow copy: spread {...obj} / [...arr], Object.assign, Array.prototype.slice, Array.from.",
            "A shallow copy creates a new object only at the top level; nested objects or arrays are still the same references as the original, so changing a nested value in the copy also changes the original. Ways to make one: spread {...obj} / [...arr], Object.assign, Array.prototype.slice, Array.from.",
          ),
          t(
            "Deep copy (sao chép sâu) tạo bản sao mới ở mọi tầng, hai bên hoàn toàn độc lập. Cách chuẩn hiện nay là structuredClone(): giữ được Date, Map, Set, tham chiếu vòng, nhưng không sao chép được function, DOM node và bỏ mất prototype của class. JSON.parse(JSON.stringify(x)) là cách cũ: làm mất undefined, function, biến Date thành chuỗi, lỗi với tham chiếu vòng.",
            "A deep copy duplicates every level, so the two are fully independent. The standard way today is structuredClone(): it keeps Date, Map, Set and circular references, but cannot copy functions or DOM nodes and drops class prototypes. JSON.parse(JSON.stringify(x)) is the old way: it loses undefined and functions, turns Dates into strings and throws on circular references.",
          ),
          t(
            "Trong React/Redux, cập nhật state bất biến thường chỉ cần shallow copy đúng nhánh bị sửa (spread từng tầng), không cần deep copy cả cây, vì so sánh dựa trên tham chiếu.",
            "In React/Redux, immutable state updates usually need only a shallow copy along the changed path (spread each level), not a deep copy of the whole tree, because comparisons are by reference.",
          ),
        ],
        diagram: <Flow id="jscp" label="Shallow vs deep copy" steps={[
          { title: "order", sub: "{ id, items: [...] }" },
          { title: "{...order}", sub: t("items dùng chung", "items shared"), hl: true },
          { title: "structuredClone", sub: t("items riêng", "items separate") },
        ]} caption={t("Shallow copy chỉ tách tầng ngoài; deep copy tách mọi tầng.", "A shallow copy splits only the top level; a deep copy splits every level.")} />,
        code: [
          { lang: "js", src: `const order = { id: 1, items: [{ sku: "A", qty: 1 }], createdAt: new Date() };

// Shallow copy
const s = { ...order };
s.id = 2;                    // ${t("không ảnh hưởng order", "order unaffected")}
s.items[0].qty = 5;          // ${t("order.items[0].qty cũng thành 5!", "order.items[0].qty is now 5 too!")}
console.log(s.items === order.items);     // true

// Deep copy
const d = structuredClone(order);
d.items[0].qty = 9;          // ${t("order không đổi", "order unchanged")}
console.log(d.items === order.items);     // false
console.log(d.createdAt instanceof Date); // true

// ${t("Cách cũ, có bẫy", "Old way, with traps")}
const j = JSON.parse(JSON.stringify(order));
console.log(typeof j.createdAt);          // "string"` },
          { lang: "js", src: `// ${t("Cập nhật state bất biến: chỉ copy nhánh bị sửa", "Immutable update: copy only the changed path")}
const next = {
  ...order,
  items: order.items.map((it, i) => (i === 0 ? { ...it, qty: it.qty + 1 } : it)),
};` },
        ],
        href: CLONE, label: "structuredClone()",
      },
      {
        q: t("Promise.all, allSettled, race, any khác nhau?", "Promise.all vs allSettled vs race vs any?"),
        a: t(
          "all: đủ giá trị khi tất cả xong, reject ở lỗi đầu tiên. allSettled: đợi tất cả, không bao giờ reject. race: theo promise settle đầu tiên. any: theo promise thành công đầu tiên, chỉ reject (AggregateError) khi tất cả đều lỗi.",
          "all: every value when all fulfill, rejects on the first rejection. allSettled: waits for all and never rejects. race: follows the first promise to settle. any: follows the first fulfillment and rejects (AggregateError) only when all reject.",
        ),
        code: { lang: "js", src: `const ok = Promise.resolve(1);
const bad = Promise.reject(new Error("x"));

await Promise.all([ok, bad]);        // ${t("reject: Error x", "rejects: Error x")}
await Promise.allSettled([ok, bad]); // [{status:"fulfilled",value:1},{status:"rejected",reason:Error}]
await Promise.race([ok, bad]);       // 1 (${t("settle trước", "settles first")})
await Promise.any([bad, ok]);        // 1 (${t("bỏ qua lỗi", "ignores the rejection")})` },
        href: PROMISE, label: "Promise (MDN)",
      },
      {
        q: t("any khác unknown?", "any vs unknown?"),
        a: t(
          "any tắt hoàn toàn kiểm tra kiểu. unknown nhận mọi giá trị nhưng phải thu hẹp kiểu (typeof, instanceof, type predicate) trước khi dùng nên an toàn hơn. Bật noImplicitAny để bắt any ngầm.",
          "any turns type checking off completely. unknown accepts any value but must be narrowed (typeof, instanceof, type predicate) before use, so it is safer. Enable noImplicitAny to catch implicit any.",
        ),
        code: { lang: "ts", src: `let a: any = "hi";
a.toFixed();            // ${t("không báo lỗi, nổ lúc chạy", "no compile error, crashes at runtime")}

let u: unknown = "hi";
// u.toUpperCase();     // ${t("lỗi biên dịch", "compile error")}
if (typeof u === "string") u.toUpperCase();   // OK` },
        href: EVERYDAY, label: "Everyday types",
      },
      {
        q: t("type khác interface?", "type vs interface?"),
        a: t(
          "Cả hai mô tả được object. interface mở rộng bằng extends và có thể khai báo thêm (declaration merging); type không sửa được sau khi tạo nhưng mô tả được union, tuple, kiểu nguyên thuỷ. Tài liệu gợi ý dùng interface cho tới khi cần tính năng của type.",
          "Both describe objects. An interface extends with extends and can be reopened (declaration merging); a type cannot change after creation but can describe unions, tuples and primitives. The docs suggest interface until you need features of type.",
        ),
        code: { lang: "ts", src: `interface Animal { name: string }
interface Animal { age: number }          // ${t("gộp vào Animal ở trên", "merged into Animal above")}
interface Bear extends Animal { honey: boolean }

type ID = number | string;                // ${t("chỉ type làm được", "only type can do this")}
type Cat = Animal & { lives: number };    // ${t("mở rộng bằng intersection", "extend with an intersection")}` },
        href: EVERYDAY, label: "Everyday types",
      },
      {
        q: t("Thu hẹp kiểu (narrowing) có những cách nào?", "Which narrowing techniques exist?"),
        a: t(
          "typeof cho kiểu nguyên thuỷ, in theo sự có mặt của thuộc tính, instanceof theo prototype, discriminated union (trường literal như kind) và type predicate (pet is Fish).",
          "typeof for primitives, in for property presence, instanceof via the prototype chain, discriminated unions (a literal field such as kind) and type predicates (pet is Fish).",
        ),
        code: { lang: "ts", src: `type Shape =
  | { kind: "circle"; r: number }
  | { kind: "square"; side: number };

function area(s: Shape) {
  if (s.kind === "circle") return Math.PI * s.r ** 2;   // s: circle
  return s.side ** 2;                                   // s: square
}

function isString(x: unknown): x is string {            // type predicate
  return typeof x === "string";
}` },
        href: NARROW, label: "Narrowing",
      },
      {
        q: t("Lưu access token và refresh token ở đâu cho an toàn?", "Where should you store the access token and refresh token?"),
        a: [
          t(
            "Access token sống ngắn (5–15 phút), gửi kèm mỗi request. Refresh token sống dài (vài ngày đến vài tuần), chỉ dùng để xin access token mới. Vì refresh token giá trị hơn nhiều, nó phải được bảo vệ kỹ hơn.",
            "The access token is short-lived (5–15 minutes) and sent with every request. The refresh token is long-lived (days to weeks) and used only to get a new access token. Because the refresh token is far more valuable, it needs stronger protection.",
          ),
          t(
            "localStorage / sessionStorage: dễ dùng nhưng mọi JavaScript chạy trên trang đều đọc được, nên chỉ một lỗ XSS (Cross-Site Scripting) hoặc một thư viện bên thứ ba bị nhiễm là token bị đánh cắp. Không nên để refresh token ở đây.",
            "localStorage / sessionStorage: easy, but any JavaScript on the page can read them, so a single XSS (Cross-Site Scripting) hole or a compromised third-party library steals the token. Never keep the refresh token there.",
          ),
          t(
            "Cookie HttpOnly + Secure + SameSite: JavaScript không đọc được nên XSS không lấy được token; Secure chỉ gửi qua HTTPS; SameSite=Strict/Lax chặn phần lớn CSRF (Cross-Site Request Forgery). Đặt Path=/auth/refresh để refresh token chỉ được gửi tới đúng endpoint làm mới. Nếu cần thêm, dùng CSRF token.",
            "HttpOnly + Secure + SameSite cookie: JavaScript cannot read it, so XSS cannot steal it; Secure sends it only over HTTPS; SameSite=Strict/Lax blocks most CSRF (Cross-Site Request Forgery). Set Path=/auth/refresh so the refresh token is only sent to the refresh endpoint. Add a CSRF token if needed.",
          ),
          t(
            "Cách phổ biến cho SPA: access token giữ trong bộ nhớ (biến JS / state), mất khi reload; refresh token trong cookie HttpOnly. Khi tải trang hoặc khi API trả 401, gọi /auth/refresh để lấy access token mới. Server nên xoay vòng refresh token (mỗi lần refresh cấp token mới, huỷ token cũ) và phát hiện token cũ bị dùng lại để thu hồi cả phiên. Cách an toàn nhất là BFF (Backend For Frontend): token nằm hẳn ở server, trình duyệt chỉ giữ cookie phiên.",
            "A common SPA pattern: keep the access token in memory (a JS variable / state), lost on reload; keep the refresh token in an HttpOnly cookie. On page load or on a 401, call /auth/refresh for a new access token. The server should rotate refresh tokens (issue a new one each time, invalidate the old) and detect reuse of an old one to revoke the whole session. The safest option is a BFF (Backend For Frontend): tokens stay on the server and the browser only holds a session cookie.",
          ),
          t(
            "Lưu ý quan trọng: biến trong bộ nhớ vẫn do JavaScript đọc được, nên access token ở đó KHÔNG chống được XSS. Script độc có thể ghi đè fetch để bắt header Authorization, hoặc gọi API thẳng từ trình duyệt nạn nhân. Thứ thực sự được bảo vệ khỏi XSS là refresh token trong cookie HttpOnly. Cách này chỉ giảm thiệt hại: kẻ tấn công lấy được ít hơn (chỉ access token), dùng được ngắn hơn (vài phút), và chủ yếu khi nạn nhân đang mở trang. Phòng thủ chính vẫn là chặn XSS: escape dữ liệu, không dùng innerHTML với dữ liệu người dùng, DOMPurify, CSP (Content-Security-Policy).",
            "Important: an in-memory variable is still readable by JavaScript, so an access token there does NOT protect against XSS. Malicious script can monkey-patch fetch to capture the Authorization header, or call the API straight from the victim's browser. What is truly protected from XSS is the refresh token in the HttpOnly cookie. This pattern only limits the damage: the attacker gets less (only the access token), for a shorter time (minutes), and mostly while the victim has the page open. The main defense is still preventing XSS: escape data, avoid innerHTML with user input, DOMPurify, CSP (Content-Security-Policy).",
          ),
        ],
        diagram: <Flow id="jstk" label="Token refresh" steps={[
          { title: t("Đăng nhập", "Login"), sub: t("nhận 2 token", "gets 2 tokens") },
          { title: "Access token", sub: t("trong bộ nhớ", "in memory"), hl: true },
          { title: "API 401", sub: t("hết hạn", "expired") },
          { title: "/auth/refresh", sub: t("cookie HttpOnly tự gửi", "HttpOnly cookie sent") },
          { title: t("Token mới", "New tokens"), sub: t("refresh xoay vòng", "refresh rotated"), hl: true },
        ]} caption={t("JavaScript không bao giờ chạm vào refresh token.", "JavaScript never touches the refresh token.")} />,
        code: [
          { lang: "http", src: `# ${t("Server trả về khi đăng nhập / refresh", "Server response on login / refresh")}
HTTP/1.1 200 OK
Set-Cookie: refresh_token=r1x...; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh; Max-Age=1209600
Content-Type: application/json

{ "accessToken": "eyJhbGciOi...", "expiresIn": 900 }` },
          { lang: "ts", src: `let accessToken: string | null = null;   // ${t("chỉ trong bộ nhớ", "memory only")}

async function refresh() {
  const res = await fetch("/auth/refresh", { method: "POST", credentials: "include" });
  if (!res.ok) throw new Error("logged out");
  accessToken = (await res.json()).accessToken;
}

export async function api(url: string, init: RequestInit = {}) {
  const call = () => fetch(url, { ...init, headers: { ...init.headers, Authorization: \`Bearer \${accessToken}\` } });
  let res = await call();
  if (res.status === 401) { await refresh(); res = await call(); }   // ${t("thử lại một lần", "retry once")}
  return res;
}` },
        ],
        href: OWASP_JWT, label: "OWASP: token storage on client side",
      },
    ],
  };
}
