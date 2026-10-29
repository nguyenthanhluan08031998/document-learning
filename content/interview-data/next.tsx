import { Flow } from "@/components/Flow";
import type { InterviewData } from "@/components/InterviewList";
import type { Locale } from "@/lib/notebook";

const SC = "https://nextjs.org/docs/app/getting-started/server-and-client-components";
const CACHE = "https://nextjs.org/docs/app/getting-started/caching";
const LAYOUT = "https://nextjs.org/docs/app/getting-started/layouts-and-pages";
const ROUTE = "https://nextjs.org/docs/app/getting-started/route-handlers";
const MUTATE = "https://nextjs.org/docs/app/getting-started/mutating-data";

export default function build(l: Locale): InterviewData {
  const t = (vi: string, en: string) => (l === "vi" ? vi : en);
  return {
    eyebrow: t("phỏng vấn · next.js", "interview · next.js"),
    title: t("Phỏng vấn Next.js", "Next.js interview"),
    lede: t(
      "Bấm vào câu hỏi để xem đáp án, ví dụ và sơ đồ. Nội dung theo docs hiện tại của Next.js (có Cache Components); luôn kiểm tra phiên bản dự án.",
      "Click a question to see the answer, an example and a diagram. Content follows the current Next.js docs (with Cache Components); always check the project's version.",
    ),
    items: [
      {
        q: t("Server Component khác Client Component?", "Server Component vs Client Component?"),
        a: t(
          "Layout và page mặc định là Server Component: lấy dữ liệu gần nguồn, giữ được secret (API key), giảm JavaScript gửi về trình duyệt. Client Component ('use client') dùng khi cần state, event handler, useEffect, API chỉ có ở trình duyệt hoặc custom Hook.",
          "Layouts and pages are Server Components by default: fetch data close to the source, keep secrets (API keys) and send less JavaScript to the browser. Client Components ('use client') are for state, event handlers, useEffect, browser-only APIs or custom Hooks.",
        ),
        diagram: <Flow id="nxsc" label="Server to Client Component" steps={[
          { title: "Server Component", sub: t("fetch, secret", "fetch, secrets"), hl: true },
          { title: "props", sub: t("phải serialize được", "must be serializable") },
          { title: "Client Component", sub: "state, onClick" },
        ]} />,
        code: [
          { lang: "tsx", src: `// app/[id]/page.tsx  (${t("Server Component", "Server Component")})
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);          // ${t("chạy trên server", "runs on the server")}
  return <LikeButton likes={post.likes} />;
}` },
          { lang: "tsx", src: `// app/ui/like-button.tsx
"use client";
import { useState } from "react";

export default function LikeButton({ likes }: { likes: number }) {
  const [n, setN] = useState(likes);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}` },
        ],
        href: SC, label: "Server and Client Components",
      },
      {
        q: t("'use client' đặt ranh giới ở đâu?", "Where does 'use client' draw the boundary?"),
        a: t(
          "Là ranh giới giữa hai module graph: mọi thứ file đó import và component nó render trực tiếp vào bundle client. Chỉ nên gắn ở file component tương tác chứ không gắn cả layout.",
          "Between two module graphs: everything the file imports and the components it renders directly go into the client bundle. Put it on the interactive component file, not on a whole layout.",
        ),
        code: { lang: "tsx", src: `// app/layout.tsx  (Server Component)
import Search from "./search";   // ${t("Client Component", "Client Component")}
import Logo from "./logo";       // ${t("vẫn là Server Component", "stays a Server Component")}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav><Logo /><Search /></nav>
      <main>{children}</main>
    </>
  );
}` },
        href: SC, label: "Server and Client Components",
      },
      {
        q: t("Lồng Server Component vào Client Component?", "How do you nest a Server Component inside a Client Component?"),
        a: t(
          "Truyền Server Component qua children (hoặc prop khác): nó được render trên server, Client Component nhận kết quả đã render. Import trực tiếp thì nó thành một phần của bundle client.",
          "Pass it through children (or another prop): it is rendered on the server and the Client Component receives the rendered output. Importing it directly makes it part of the client bundle.",
        ),
        code: [
          { lang: "tsx", src: `// modal.tsx
"use client";
export default function Modal({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}` },
          { lang: "tsx", src: `// page.tsx  (Server Component)
import Modal from "./modal";
import Cart from "./cart";        // ${t("Server Component, lấy dữ liệu trên server", "Server Component, fetches on the server")}

export default function Page() {
  return <Modal><Cart /></Modal>;
}` },
        ],
        href: SC, label: "Server and Client Components",
      },
      {
        q: t("Hydration và RSC Payload là gì?", "What are hydration and the RSC Payload?"),
        a: t(
          "RSC (React Server Components) Payload là biểu diễn nén của cây Server Component đã render, kèm chỗ trống cho Client Component. Lần tải đầu: HTML hiển thị ngay, RSC Payload đối chiếu hai cây, JavaScript hydrate (gắn event handler) để trang tương tác.",
          "The RSC (React Server Components) Payload is a compact serialized form of the rendered Server Component tree with placeholders for Client Components. On first load: HTML shows immediately, the RSC Payload reconciles both trees, and JavaScript hydrates (attaches event handlers) to make the page interactive.",
        ),
        diagram: <Flow id="nxhy" label="First load" steps={[
          { title: "HTML", sub: t("hiện ngay, chưa tương tác", "shown now, not interactive") },
          { title: "RSC Payload", sub: t("đối chiếu hai cây", "reconcile both trees") },
          { title: "JavaScript", sub: t("hydrate: gắn event", "hydrate: attach events"), hl: true },
        ]} />,
        href: SC, label: "Server and Client Components",
      },
      {
        q: t("Dùng Context ở đâu?", "Where do you use Context?"),
        a: t(
          "Context không dùng được trong Server Component. Tạo provider là Client Component nhận children và đặt càng sâu càng tốt (bọc children, không bọc cả html).",
          "Context is not supported in Server Components. Create a provider as a Client Component that accepts children and render it as deep as possible (wrap children, not the whole html).",
        ),
        code: [
          { lang: "tsx", src: `// theme-provider.tsx
"use client";
import { createContext } from "react";
export const ThemeContext = createContext({});

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>;
}` },
          { lang: "tsx", src: `// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}` },
        ],
        href: SC, label: "Server and Client Components",
      },
      {
        q: t("Biến môi trường và secret?", "Environment variables and secrets?"),
        a: t(
          "Chỉ biến có tiền tố NEXT_PUBLIC_ vào bundle client; biến khác bị thay bằng chuỗi rỗng. Gói server-only làm việc import nhầm code server vào Client Component báo lỗi lúc build.",
          "Only variables prefixed with NEXT_PUBLIC_ reach the client bundle; the rest are replaced with an empty string. The server-only package makes importing server code into a Client Component a build-time error.",
        ),
        code: { lang: "ts", src: `// lib/data.ts
import "server-only";           // ${t("import vào Client Component sẽ lỗi lúc build", "importing this in a Client Component fails the build")}

export async function getData() {
  const res = await fetch("https://external-service.com/data", {
    headers: { authorization: process.env.API_KEY! },   // ${t("không lộ ra client", "never reaches the client")}
  });
  return res.json();
}` },
        href: SC, label: "Server and Client Components",
      },
      {
        q: t("Cache trong Next.js hiện nay?", "How does caching work in Next.js now?"),
        a: t(
          "Với Cache Components (cacheComponents: true, mặc định ở app mới theo docs, ra từ 16.0), dùng directive 'use cache' cho hàm hoặc component kèm cacheLife; dữ liệu cần tươi mỗi request thì bọc Suspense. Mô hình cũ có hướng dẫn riêng, kiểm tra phiên bản dự án trước khi trả lời.",
          "With Cache Components (cacheComponents: true, the default for new apps per the docs, introduced in 16.0), use the 'use cache' directive on a function or component together with cacheLife; wrap data that must be fresh per request in Suspense. The previous model has its own guide, so check the project's version before answering.",
        ),
        code: [
          { lang: "ts", src: `// next.config.ts
const nextConfig = { cacheComponents: true };
export default nextConfig;` },
          { lang: "tsx", src: `import { cacheLife } from "next/cache";
import { Suspense } from "react";

async function getUsers() {
  "use cache";                  // ${t("cache kết quả hàm", "cache the function result")}
  cacheLife("hours");
  return db.query("SELECT * FROM users");
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>   {/* ${t("phần cần dữ liệu tươi mỗi request", "parts that need fresh data per request")} */}
      <LatestPosts />
    </Suspense>
  );
}` },
        ],
        href: CACHE, label: "Caching",
      },
      {
        q: t("Layout khác page, params là gì?", "Layout vs page, and what is params?"),
        a: t(
          "Layout dùng chung cho nhiều page, giữ state và không render lại khi điều hướng. Thư mục là đoạn URL; [slug] là dynamic segment, params là Promise nên phải await. Dùng searchParams thì page phụ thuộc request nên render động.",
          "A layout is shared by several pages, keeps state and does not re-render on navigation. Folders are URL segments; [slug] is a dynamic segment and params is a Promise you must await. Using searchParams makes the page depend on the request, so it renders dynamically.",
        ),
        code: [
          { lang: "text", src: `app/
  layout.tsx              # ${t("root layout (bắt buộc có html, body)", "root layout (must contain html, body)")}
  blog/
    layout.tsx            # ${t("layout lồng cho /blog", "nested layout for /blog")}
    page.tsx              # /blog
    [slug]/page.tsx       # /blog/hello` },
          { lang: "tsx", src: `export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;     // ${t("params là Promise", "params is a Promise")}
  const post = await getPost(slug);
  return <h1>{post.title}</h1>;
}` },
        ],
        href: LAYOUT, label: "Layouts and Pages",
      },
      {
        q: t("Route Handler dùng khi nào?", "When do you use a Route Handler?"),
        a: t(
          "Viết endpoint bằng Request và Response chuẩn trong route.ts (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS). Mặc định không cache. Không đặt route.ts cùng cấp với page.",
          "To write an endpoint with the standard Request and Response in route.ts (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS). Not cached by default. A route.ts cannot sit at the same level as a page.",
        ),
        code: { lang: "ts", src: `// app/api/items/route.ts
export async function GET() {
  const items = await getItems();
  return Response.json({ items });
}

export async function POST(request: Request) {
  const body = await request.json();
  return Response.json(await createItem(body), { status: 201 });
}` },
        href: ROUTE, label: "Route Handlers",
      },
      {
        q: t("Server Action là gì? Cần lưu ý gì?", "What is a Server Action? What to watch out for?"),
        a: t(
          "Hàm async chạy trên server, đánh dấu 'use server', gọi qua form action hoặc event handler, luôn dùng POST. Vì gọi được bằng POST trực tiếp, phải kiểm tra xác thực và phân quyền trong từng action. Sau khi đổi dữ liệu dùng revalidatePath hoặc revalidateTag, redirect.",
          "An async function that runs on the server, marked 'use server', invoked via a form action or event handler, always over POST. Because it can be hit with a direct POST, check authentication and authorization inside every action. After mutating, use revalidatePath or revalidateTag, then redirect.",
        ),
        code: [
          { lang: "ts", src: `// app/actions.ts
"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPost(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");   // ${t("luôn kiểm tra quyền", "always check permissions")}

  await db.post.create({ data: { title: String(formData.get("title")) } });
  revalidatePath("/posts");
  redirect("/posts");
}` },
          { lang: "tsx", src: `import { createPost } from "@/app/actions";

export function Form() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  );
}` },
        ],
        href: MUTATE, label: "Mutating Data",
      },
    ],
  };
}
