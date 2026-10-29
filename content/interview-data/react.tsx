import { Flow } from "@/components/Flow";
import type { InterviewData } from "@/components/InterviewList";
import type { Locale } from "@/lib/notebook";

const SNAPSHOT = "https://react.dev/learn/state-as-a-snapshot";
const HOOKS = "https://react.dev/reference/rules/rules-of-hooks";
const EFFECT = "https://react.dev/learn/you-might-not-need-an-effect";
const LISTS = "https://react.dev/learn/rendering-lists";
const MEMO = "https://react.dev/reference/react/useMemo";

export default function build(l: Locale): InterviewData {
  const t = (vi: string, en: string) => (l === "vi" ? vi : en);
  return {
    eyebrow: t("phỏng vấn · react", "interview · react"),
    title: t("Phỏng vấn React", "React interview"),
    lede: t(
      "Bấm vào câu hỏi để xem đáp án, ví dụ và sơ đồ. Nguồn là react.dev.",
      "Click a question to see the answer, an example and a diagram. The source is react.dev.",
    ),
    items: [
      {
        q: t("State là snapshot nghĩa là gì?", "What does “state is a snapshot” mean?"),
        a: t(
          "Mỗi lần render có một bản state cố định. Trong event handler của lần render đó, state không đổi dù đã gọi setState, kể cả trong setTimeout. setState chỉ xếp hàng một lần render lại.",
          "Each render gets one fixed copy of state. Inside that render's event handlers, state does not change even after calling setState, including inside setTimeout. setState only queues another render.",
        ),
        code: { lang: "jsx", src: `function Counter() {
  const [n, setN] = useState(0);

  function handleClick() {
    setN(n + 1);
    console.log(n);          // ${t("vẫn là 0: snapshot của lần render này", "still 0: the snapshot of this render")}
    setTimeout(() => alert(n), 1000);   // ${t("cũng là 0", "also 0")}
  }
  return <button onClick={handleClick}>{n}</button>;
}` },
        href: SNAPSHOT, label: "State as a snapshot",
      },
      {
        q: t("Gọi setCount(count + 1) ba lần được bao nhiêu?", "What does calling setCount(count + 1) three times do?"),
        a: t(
          "Chỉ tăng 1, vì cả ba lần đều dùng cùng giá trị snapshot. Muốn cộng dồn dùng hàm cập nhật: setCount(n => n + 1) đọc giá trị mới nhất trong hàng đợi.",
          "It adds only 1, because all three calls use the same snapshot value. To accumulate, use an updater function: setCount(n => n + 1) reads the latest queued value.",
        ),
        code: { lang: "jsx", src: `// count = 0
setCount(count + 1);
setCount(count + 1);
setCount(count + 1);          // ${t("kết quả: 1", "result: 1")}

setCount(n => n + 1);
setCount(n => n + 1);
setCount(n => n + 1);         // ${t("kết quả: 3", "result: 3")}` },
        href: SNAPSHOT, label: "State as a snapshot",
      },
      {
        q: t("Quy tắc của Hooks?", "What are the rules of Hooks?"),
        a: t(
          "Chỉ gọi ở cấp cao nhất của function component hoặc custom Hook, không trong vòng lặp, điều kiện, hàm lồng, event handler hay sau return có điều kiện. Chỉ gọi từ component hoặc custom Hook (tên bắt đầu bằng use). Dùng eslint-plugin-react-hooks để bắt lỗi.",
          "Call Hooks only at the top level of a function component or custom Hook: never in loops, conditions, nested functions, event handlers or after a conditional return. Call them only from components or custom Hooks (names starting with use). Use eslint-plugin-react-hooks to catch violations.",
        ),
        code: { lang: "jsx", src: `function Counter({ cond }) {
  const [count, setCount] = useState(0);   // ${t("đúng: cấp cao nhất, trước mọi return", "correct: top level, before any return")}

  if (cond) return null;
  // const [x, setX] = useState(0);        // ${t("sai: sau return có điều kiện", "wrong: after a conditional return")}

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}` },
        href: HOOKS, label: "Rules of Hooks",
      },
      {
        q: t("Khi nào dùng useEffect, khi nào không?", "When should you use useEffect, and when not?"),
        a: t(
          "Effect dùng để đồng bộ với hệ thống bên ngoài (API trình duyệt, widget không phải React, mạng). Không dùng để tính giá trị suy ra từ props/state (tính ngay trong render), cũng không dùng cho logic do hành động người dùng (đặt trong event handler).",
          "Effects synchronize with external systems (browser APIs, non-React widgets, network). Do not use them to compute values derived from props or state (compute during render) or for logic triggered by user actions (put it in the event handler).",
        ),
        code: { lang: "jsx", src: `// ${t("Đúng: đồng bộ với hệ thống ngoài, có cleanup", "Good: sync with an external system, with cleanup")}
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);

// ${t("Sai: submit là việc của event handler", "Bad: submitting belongs in the event handler")}
useEffect(() => {
  if (submitted) post("/api/order", form);
}, [submitted]);` },
        href: EFFECT, label: "You Might Not Need an Effect",
      },
      {
        q: t("Giá trị suy ra từ state nên để ở đâu?", "Where should derived values live?"),
        a: t(
          "Tính trực tiếp khi render. Sao chép vào state rồi đồng bộ bằng Effect gây thêm một lần render và dễ lệch dữ liệu. Tính toán nặng thì dùng useMemo.",
          "Compute them during render. Copying them into state and syncing with an Effect causes an extra render and can drift. For expensive calculations, use useMemo.",
        ),
        code: { lang: "jsx", src: `// ${t("Tránh: state thừa + Effect", "Avoid: redundant state + Effect")}
const [fullName, setFullName] = useState("");
useEffect(() => setFullName(first + " " + last), [first, last]);

// ${t("Tốt: tính ngay khi render", "Good: calculated during rendering")}
const fullName = first + " " + last;` },
        href: EFFECT, label: "You Might Not Need an Effect",
      },
      {
        q: t("Làm sao reset state khi prop đổi?", "How do you reset state when a prop changes?"),
        a: t(
          "Đặt key theo ID trên component: key đổi thì React tạo lại component với state mới. Tránh Effect gọi setState mỗi khi prop thay đổi.",
          "Give the component a key based on an ID: when the key changes React recreates the component with fresh state. Avoid Effects that call setState whenever a prop changes.",
        ),
        code: { lang: "jsx", src: `// ${t("userId đổi thì Profile (và state bên trong) được tạo lại", "when userId changes, Profile (and its state) is recreated")}
<Profile key={userId} userId={userId} />` },
        href: EFFECT, label: "You Might Not Need an Effect",
      },
      {
        q: t("key trong danh sách để làm gì? Dùng index được không?", "What are keys for? Can you use the index?"),
        a: t(
          "Key cho React biết phần tử nào ứng với dữ liệu nào giữa các lần render, để nhận ra phần tử bị thêm, xoá, dời. Key phải duy nhất trong cùng danh sách, ổn định (không Math.random) và dựa trên dữ liệu như ID. Index hỏng khi danh sách đổi thứ tự hoặc chèn xoá.",
          "Keys tell React which item matches which data across renders, so it can detect inserted, removed or moved items. A key must be unique among siblings, stable (no Math.random) and based on data such as an ID. The index breaks when the list is reordered, inserted into or deleted from.",
        ),
        code: { lang: "jsx", src: `{people.map(p => <li key={p.id}>{p.name}</li>)}          // ${t("tốt: ID từ dữ liệu", "good: ID from the data")}
{people.map((p, i) => <li key={i}>{p.name}</li>)}        // ${t("tránh khi list đổi thứ tự", "avoid when the list reorders")}
{people.map(p => <li key={Math.random()}>{p.name}</li>)} // ${t("sai: key đổi mỗi lần render", "wrong: key changes every render")}` },
        href: LISTS, label: "Rendering lists",
      },
      {
        q: t("useMemo, useCallback, memo khác nhau?", "useMemo vs useCallback vs memo?"),
        a: t(
          "useMemo cache kết quả tính toán; useCallback cache chính hàm (tương đương useMemo(() => fn, deps)); memo bỏ qua render lại component con khi props không đổi. Chỉ là tối ưu hiệu năng, dùng khi thật sự chậm hoặc để giữ tham chiếu object, hàm ổn định cho memo và dependency.",
          "useMemo caches a computed value; useCallback caches the function itself (same as useMemo(() => fn, deps)); memo skips re-rendering a child when its props are unchanged. They are performance optimizations: use them for genuinely slow work or to keep object and function references stable for memo and dependencies.",
        ),
        code: { lang: "jsx", src: `const visible = useMemo(() => filter(todos, tab), [todos, tab]);
const onAdd = useCallback(text => add(text), [add]);

const List = memo(function List({ items, onAdd }) {
  // ${t("chỉ render lại khi items hoặc onAdd đổi", "re-renders only when items or onAdd change")}
  return /* ... */;
});` },
        href: MEMO, label: "useMemo",
      },
      {
        q: t("Khi nào component render lại?", "When does a component re-render?"),
        a: t(
          "Khi state của nó đổi, hoặc component cha render lại (mặc định con render theo). memo chặn được việc con render theo cha nếu props không đổi theo so sánh Object.is.",
          "When its own state changes or its parent re-renders (children re-render with the parent by default). memo prevents the child from following the parent when props are unchanged under Object.is.",
        ),
        diagram: <Flow id="rrr" label="Re-render" steps={[
          { title: t("State đổi", "State changes"), sub: "setState" },
          { title: t("Cha render lại", "Parent re-renders"), hl: true },
          { title: t("Con render lại", "Child re-renders"), sub: t("trừ khi memo", "unless memo") },
        ]} caption={t("memo so sánh props bằng Object.is và bỏ qua nếu không đổi.", "memo compares props with Object.is and skips the render if nothing changed.")} />,
        href: MEMO, label: "useMemo",
      },
    ],
  };
}
