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
        a: t(
          "Mỗi job chạy trọn vẹn trên call stack rồi mới tới job khác. Khi stack rỗng, microtask (callback của promise) được xả hết, sau đó mới lấy task tiếp theo (timer, I/O (Input/Output), sự kiện).",
          "Each job runs to completion on the call stack before another starts. When the stack is empty, the microtask queue (promise callbacks) is drained fully, and only then is the next task (timer, I/O (Input/Output), event) taken.",
        ),
        diagram: <Flow id="jsel" label={t("Call stack, microtask, task", "Call stack, microtask, task")} steps={[
          { title: "Call stack", sub: t("chạy code đồng bộ", "sync code") },
          { title: "Microtask", sub: "promise, await", hl: true },
          { title: "Task queue", sub: "timer, I/O, event" },
        ]} caption={t("Stack rỗng → xả microtask → lấy task kế tiếp → lặp lại.", "Stack empty → drain microtasks → take next task → repeat.")} />,
        code: { lang: "js", src: `console.log("1 sync");
setTimeout(() => console.log("4 task"), 0);
Promise.resolve().then(() => console.log("3 microtask"));
console.log("2 sync");
// ${t("kết quả", "output")}: 1 → 2 → 3 → 4` },
        href: EVENT_LOOP, label: "Event loop (MDN)",
      },
      {
        q: t("await thực chất làm gì?", "What does await actually do?"),
        a: t(
          "Tạm dừng hàm async và trả quyền cho event loop; phần code sau await chạy tiếp dưới dạng microtask khi promise xong. Vì thế await không chặn code khác.",
          "It suspends the async function and hands control back to the event loop; the code after await resumes as a microtask once the promise settles. So await does not block other code.",
        ),
        code: { lang: "js", src: `async function main() {
  console.log("A");
  await fetchData();   // ${t("dừng ở đây, event loop chạy tiếp", "pause here, the event loop keeps going")}
  console.log("C");    // ${t("chạy tiếp như một microtask", "resumes as a microtask")}
}
main();
console.log("B");      // ${t("thứ tự in", "print order")}: A, B, C` },
        href: EVENT_LOOP, label: "Event loop (MDN)",
      },
      {
        q: t("Closure là gì?", "What is a closure?"),
        a: t(
          "Hàm cùng tham chiếu tới môi trường từ vựng bao quanh nó, nên vẫn đọc và sửa được biến ngoài kể cả khi hàm ngoài đã return.",
          "A function bundled with a reference to its surrounding lexical environment, so it can still read and change outer variables after the outer function has returned.",
        ),
        code: { lang: "js", src: `function makeCounter() {
  let count = 0;            // ${t("biến riêng, không truy cập được từ ngoài", "private, not reachable from outside")}
  return () => ++count;
}
const next = makeCounter();
next(); // 1
next(); // 2` },
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
    ],
  };
}
