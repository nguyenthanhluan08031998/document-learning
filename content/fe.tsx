import Link from "next/link";
import { Code } from "@/components/Code";

// Team colours: [stroke, soft fill]
const TEAM = {
  shell: ["var(--accent)", "var(--accent-soft)"],
  catalog: ["var(--new)", "var(--new-soft)"],
  cart: ["var(--warn)", "var(--warn-soft)"],
  checkout: ["var(--ok)", "var(--ok-soft)"],
  account: ["var(--bad)", "var(--bad-soft)"],
} as const;
type Team = keyof typeof TEAM;

const Region = ({ x, y, w, h, team, title, sub }: { x: number; y: number; w: number; h: number; team: Team; title: string; sub?: string }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx="6" style={{ fill: TEAM[team][1], stroke: TEAM[team][0], strokeWidth: 1.5 }} />
    <text className="s-tb" x={x + 10} y={y + 20}>{title}</text>
    {sub && <text className="s-tm" x={x + 10} y={y + 37}>{sub}</text>}
  </g>
);

const MFES: { team: Team; name: string; owner: string; api: string }[] = [
  { team: "catalog", name: "catalog-mfe", owner: "Team Catalog", api: "catalog-svc" },
  { team: "cart", name: "cart-mfe", owner: "Team Cart", api: "cart-svc" },
  { team: "checkout", name: "checkout-mfe", owner: "Team Checkout", api: "order + payment" },
  { team: "account", name: "account-mfe", owner: "Team Account", api: "user-svc" },
];

function MicroFrontendDiagram() {
  return (
    <svg viewBox="0 0 900 590" role="img" aria-label="Micro-frontend: trang web gồm header của Shell, danh sách sản phẩm của Catalog, giỏ hàng mini của Cart, thanh toán nhanh của Checkout, tài khoản của Account; Shell tải remoteEntry của từng micro-frontend lúc chạy; mỗi micro-frontend do một team sở hữu, deploy riêng lên CDN và gọi service backend của mình; dùng chung design system, event bus, thư viện React và token đăng nhập">
      <defs>
        <marker id="mfa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker>
      </defs>

      {/* What the customer sees: one page, five owners */}
      <rect className="s-box" x="16" y="10" width="868" height="196" rx="8" />
      <circle cx="32" cy="24" r="4" style={{ fill: "var(--bad)" }} />
      <circle cx="46" cy="24" r="4" style={{ fill: "var(--warn)" }} />
      <circle cx="60" cy="24" r="4" style={{ fill: "var(--ok)" }} />
      <text className="s-tm" x="80" y="28">shop.vn/dien-thoai</text>
      <Region x={28} y={38} w={844} h={34} team="shell" title="Header · logo · tìm kiếm · menu" />
      <text className="s-tm" x="300" y="59">Shell</text>
      <Region x={752} y={42} w={112} h={26} team="cart" title="Giỏ (3)" />
      <Region x={28} y={80} w={520} h={116} team="catalog" title="Danh sách sản phẩm" sub="catalog-mfe" />
      {[0, 1, 2, 3].map(i => (
        <rect key={i} x={40 + i * 126} y={124} width={114} height={62} rx="5" style={{ fill: "var(--surface)", stroke: "var(--new)", strokeWidth: 1 }} />
      ))}
      <Region x={560} y={80} w={312} h={54} team="account" title="Xin chào, Lan · 1.200 điểm" sub="account-mfe" />
      <Region x={560} y={142} w={312} h={54} team="checkout" title="Mua ngay · thanh toán 1 chạm" sub="checkout-mfe" />

      {/* Shell composes the remotes at runtime */}
      <path className="s-ln" d="M450 206 V226" markerEnd="url(#mfa)" />
      <rect className="s-hl" x="16" y="228" width="868" height="46" rx="7" />
      <text className="s-tb" x="28" y="248">Shell (host app) · Module Federation</text>
      <text className="s-tm" x="28" y="265">routing, layout, đăng nhập; lúc chạy tải remoteEntry.js của từng micro-frontend từ CDN</text>

      {MFES.map((m, i) => {
        const x = 16 + i * 222;
        const [stroke, fill] = TEAM[m.team];
        return (
          <g key={m.name}>
            <path className="s-ln" d={`M${x + 100} 274 V298`} markerEnd="url(#mfa)" />
            <rect x={x} y={300} width={200} height={72} rx="7" style={{ fill, stroke, strokeWidth: 1.5 }} />
            <text className="s-tb" x={x + 10} y={321}>{m.name}</text>
            <text className="s-tm" x={x + 10} y={339}>{m.owner} · repo riêng</text>
            <text className="s-tm" x={x + 10} y={356}>deploy riêng lên CDN</text>
            <path d={`M${x + 100} 372 V408`} style={{ stroke, strokeWidth: 1.8, strokeDasharray: "5 4" }} markerEnd="url(#mfa)" />
            <rect className="s-box" x={x} y={410} width={200} height={42} rx="7" />
            <text className="s-tb" x={x + 10} y={436}>{m.api}</text>
          </g>
        );
      })}
      <text className="s-tm" x="16" y="474">Mỗi micro-frontend gọi service của chính team mình qua API Gateway (xem sơ đồ ở trang Tổng quan)</text>

      {/* Shared pieces */}
      <rect className="s-bg" x="16" y="490" width="868" height="76" rx="8" />
      <text className="s-lane" x="28" y="508">DÙNG CHUNG · GIỮ CÀNG ÍT CÀNG TỐT</text>
      {[["Design system", "@shop/ui · nút, màu, font"], ["Event bus", "CustomEvent cart:updated"], ["Thư viện chung", "react, react-dom (singleton)"], ["Đăng nhập", "token do Shell cấp"]].map(([t, s], i) => (
        <g key={t}>
          <rect className="s-box" x={28 + i * 214} y={516} width={202} height={42} rx="6" />
          <text className="s-tb" x={38 + i * 214} y={533}>{t}</text>
          <text className="s-tm" x={38 + i * 214} y={550}>{s}</text>
        </g>
      ))}
      <text className="s-tm" x="16" y="584">Mỗi màu là một team: team đó sở hữu từ giao diện, repo, pipeline deploy tới service backend</text>
    </svg>
  );
}

export default function FrontendOverviewPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục micro-frontend">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#mf-what"><span>01</span>Micro-frontend là gì</a></li>
          <li><a href="#mf-compose"><span>02</span>Cách ghép</a></li>
          <li><a href="#mf-code"><span>03</span>Module Federation</a></li>
          <li><a href="#mf-page"><span>04</span>Ví dụ shell + 2 trang</a></li>
          <li><a href="#mf-talk"><span>05</span>Giao tiếp giữa các phần</a></li>
          <li><a href="#mf-when"><span>06</span>Khi nào dùng</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">frontend · tổng quan</div>
          <h1>Micro-frontend cho sàn bán hàng</h1>
          <p className="lede">Microservice áp dụng cho giao diện: một trang web được ghép từ nhiều phần, mỗi phần do một team làm, có repo và lịch deploy riêng. Khách hàng vẫn chỉ thấy một trang.</p>
          <div className="tape" aria-hidden="true">
            <div>shell</div>
            <div>catalog-mfe</div>
            <div>cart-mfe</div>
            <div className="hw">Module Federation</div>
            <div className="leo">CustomEvent</div>
          </div>
        </header>

        <section id="mf-what">
          <h2><span className="n">01</span>Micro-frontend là gì</h2>
          <figure className="fig">
            <div className="scroll">
              <MicroFrontendDiagram />
            </div>
            <figcaption>Trên: trang khách nhìn thấy, tô màu theo team sở hữu. Giữa: Shell ghép các phần lúc chạy. Dưới: mỗi phần đi tới service backend của chính team đó.</figcaption>
          </figure>
          <ul className="plain">
            <li><b>Shell (host)</b>: khung trang, header, routing, đăng nhập. Nó không chứa nghiệp vụ, chỉ quyết định phần nào hiện ở đâu.</li>
            <li><b>Remote</b> (catalog, cart, checkout, account): mỗi phần là một app nhỏ, build ra <code>remoteEntry.js</code> và đẩy lên CDN.</li>
            <li>Team Cart sửa giỏ hàng rồi deploy mà <b>không cần build lại</b> Shell hay các team khác.</li>
            <li>Chia theo <b>nghiệp vụ</b> giống backend: team Cart sở hữu cả <code>cart-mfe</code> lẫn <code>cart-svc</code> (xem sơ đồ ở <Link className="plink" href="/">Tổng quan</Link>).</li>
          </ul>
        </section>

        <section id="mf-compose">
          <h2><span className="n">02</span>Cách ghép các phần</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Cách</th>
                  <th>Ghép lúc nào</th>
                  <th>Ưu</th>
                  <th>Nhược</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>Gói npm</b></td><td>Lúc build Shell</td><td>Đơn giản, type an toàn</td><td>Mỗi lần team con đổi, Shell phải build và deploy lại; không phải micro-frontend thật</td></tr>
                <tr><td><b>Module Federation</b></td><td>Lúc chạy, trong trình duyệt</td><td>Deploy độc lập, dùng chung React một bản</td><td>Phải khớp phiên bản thư viện chung; cấu hình build phức tạp</td></tr>
                <tr><td><b>Multi-zone / ghép ở server</b></td><td>Lúc request, ở server hoặc edge</td><td>Mỗi đường dẫn một app (<code>/cart</code>, <code>/account</code>), SEO tốt</td><td>Chuyển giữa các zone là tải lại trang</td></tr>
                <tr><td><b>Web Components</b></td><td>Lúc chạy</td><td>Không phụ thuộc framework, team dùng React hay Vue đều được</td><td>Bundle nặng nếu mỗi phần mang framework riêng</td></tr>
                <tr><td><b>iframe</b></td><td>Lúc chạy</td><td>Cô lập hoàn toàn về CSS và JS</td><td>Khó chia sẻ trạng thái, khó responsive, SEO kém</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="mf-code">
          <h2><span className="n">03</span>Module Federation</h2>
          <p><b>Module Federation</b> là plugin của bundler cho phép một app dùng code của app khác <b>lúc đang chạy</b>, không cần cài qua npm. App cho mượn (<b>remote</b>) khai báo <code>exposes</code> và sinh ra file <code>remoteEntry.js</code>; app đi mượn (<b>host</b>, ở đây là Shell) khai báo <code>remotes</code> để biết tải file đó ở đâu. Mỗi project tham gia đều có một khai báo plugin riêng.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Bundler</th>
                  <th>Cách viết</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Webpack 5, Rspack</td><td><code>{"new ModuleFederationPlugin({ ... })"}</code></td></tr>
                <tr><td>Rsbuild (dùng trong tài liệu này)</td><td><code>{"pluginModuleFederation({ ... })"}</code></td></tr>
                <tr><td>Vite</td><td><code>{"federation({ ... })"}</code></td></tr>
              </tbody>
            </table>
          </div>
          <p>Tên hàm khác nhau, còn các tuỳ chọn bên trong (<code>name</code>, <code>exposes</code>, <code>remotes</code>, <code>shared</code>) giống nhau.</p>
          <Code lang="ts">{`// cart-mfe/rsbuild.config.ts — the remote exposes a component
pluginModuleFederation({
  name: "cart",
  exposes: { "./MiniCart": "./src/MiniCart.tsx" },
  shared: { react: { singleton: true }, "react-dom": { singleton: true } },
});

// shell/rsbuild.config.ts — the host knows where each remote lives
pluginModuleFederation({
  name: "shell",
  remotes: {
    cart: "cart@https://cdn.shop.vn/cart/remoteEntry.js",
    catalog: "catalog@https://cdn.shop.vn/catalog/remoteEntry.js",
  },
  shared: { react: { singleton: true }, "react-dom": { singleton: true } },
});`}</Code>
          <div className="note"><code>{"singleton: true"}</code>: cả trang chỉ có <b>một bản React</b>, mọi micro-frontend dùng chung bản Shell đã nạp. Không có nó, mỗi phần tải React riêng: trang nặng hơn và hook, context không chạy được qua ranh giới các phần (lỗi “Invalid hook call”). Vì chỉ có một bản dùng chung, các team phải thống nhất cùng major version của React.</div>
          <Code lang="tsx">{`// shell/src/Header.tsx — loaded over the network at runtime
const MiniCart = lazy(() => import("cart/MiniCart"));

export function Header() {
  return (
    <header>
      <Logo /> <Search />
      <ErrorBoundary fallback={<a href="/cart">Giỏ hàng</a>}>
        <Suspense fallback={<CartSkeleton />}>
          <MiniCart />
        </Suspense>
      </ErrorBoundary>
    </header>
  );
}`}</Code>
          <div className="note">Luôn bọc remote bằng <code>ErrorBoundary</code>: CDN của team Cart lỗi thì header vẫn hiện, chỉ mất giỏ hàng mini.</div>
        </section>

        <section id="mf-page">
          <h2><span className="n">04</span>Ví dụ: Shell + trang mua hàng + trang thanh toán</h2>
          <p>Ba project chạy riêng. Khách chỉ mở Shell; Shell tải hai trang còn lại từ hai địa chỉ khác lúc chạy.</p>
          <Code lang="text">{`shop-mfe/      trang mua hàng     chạy ở :3001   team A
checkout-mfe/  trang thanh toán   chạy ở :3002   team B
shell/         khung + router     chạy ở :3000   team nền tảng

Trình duyệt ──► shell :3000  (header, footer, router)
                  ├─ vào /          → tải :3001/remoteEntry.js → hiện ShopPage
                  └─ vào /checkout  → tải :3002/remoteEntry.js → hiện CheckoutPage`}</Code>

          <h3>Bước 1: shop-mfe cho mượn trang của mình</h3>
          <Code lang="ts">{`// shop-mfe/rsbuild.config.ts
export default defineConfig({
  plugins: [pluginReact(), pluginModuleFederation({
    name: "shop",
    exposes: { "./ShopPage": "./src/ShopPage.tsx" },   // component other apps may load
    shared: { react: { singleton: true }, "react-dom": { singleton: true } },
  })],
  server: { port: 3001 },
});`}</Code>
          <Code lang="tsx">{`// shop-mfe/src/ShopPage.tsx
export default function ShopPage({ onCheckout }: { onCheckout: () => void }) {
  const add = (sku: string) =>
    fetch("/api/cart/items", { method: "POST", body: JSON.stringify({ sku, qty: 1 }) });
  return (
    <div>
      <h1>Điện thoại</h1>
      <button onClick={() => add("PHONE-01")}>Thêm iPhone vào giỏ</button>
      <button onClick={onCheckout}>Thanh toán</button>   {/* does not navigate itself, tells the Shell */}
    </div>
  );
}`}</Code>

          <h3>Bước 2: checkout-mfe làm tương tự</h3>
          <Code lang="ts">{`// checkout-mfe/rsbuild.config.ts
export default defineConfig({
  plugins: [pluginReact(), pluginModuleFederation({
    name: "checkout",
    exposes: { "./CheckoutPage": "./src/CheckoutPage.tsx" },
    shared: { react: { singleton: true }, "react-dom": { singleton: true } },
  })],
  server: { port: 3002 },
});`}</Code>
          <Code lang="tsx">{`// checkout-mfe/src/CheckoutPage.tsx
export default function CheckoutPage({ onDone }: { onDone: (orderId: string) => void }) {
  const cart = useCart();                    // reads the cart from cart-svc, not from shop-mfe
  const pay = async () => {
    const res = await fetch("/api/orders", { method: "POST", body: JSON.stringify(cart) });
    onDone((await res.json()).id);
  };
  return (
    <div>
      <h1>Thanh toán</h1>
      <p>Tổng: {cart.total}đ</p>
      <button onClick={pay}>Đặt hàng</button>
    </div>
  );
}`}</Code>

          <h3>Bước 3: Shell khai báo hai remote và gắn vào route</h3>
          <Code lang="ts">{`// shell/rsbuild.config.ts
export default defineConfig({
  plugins: [pluginReact(), pluginModuleFederation({
    name: "shell",
    remotes: {
      shop: "shop@http://localhost:3001/remoteEntry.js",
      checkout: "checkout@http://localhost:3002/remoteEntry.js",
    },
    shared: { react: { singleton: true }, "react-dom": { singleton: true } },
  })],
  server: { port: 3000 },
});`}</Code>
          <Code lang="tsx">{`// shell/src/App.tsx
const ShopPage = lazy(() => import("shop/ShopPage"));             // loaded from :3001 at runtime
const CheckoutPage = lazy(() => import("checkout/CheckoutPage"));  // loaded from :3002 at runtime

export default function App() {
  const navigate = useNavigate();
  return (
    <>
      <Header />
      <ErrorBoundary fallback={<p>Không tải được trang, thử lại sau.</p>}>
        <Suspense fallback={<p>Đang tải…</p>}>
          <Routes>
            <Route path="/" element={<ShopPage onCheckout={() => navigate("/checkout")} />} />
            <Route path="/checkout" element={<CheckoutPage onDone={id => navigate(\`/orders/\${id}\`)} />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <Footer />
    </>
  );
}`}</Code>
          <Code lang="ts">{`// shell/src/remotes.d.ts — types for the remote modules
declare module "shop/ShopPage" {
  const ShopPage: React.FC<{ onCheckout: () => void }>;
  export default ShopPage;
}
declare module "checkout/CheckoutPage" {
  const CheckoutPage: React.FC<{ onDone: (orderId: string) => void }>;
  export default CheckoutPage;
}`}</Code>

          <h3>Bước 4: Chạy</h3>
          <Code lang="bash">{`cd shop-mfe && npm run dev       # :3001
cd checkout-mfe && npm run dev   # :3002
cd shell && npm run dev          # :3000  ← khách chỉ mở địa chỉ này`}</Code>

          <ul className="plain">
            <li><b>Shell giữ router.</b> Hai trang con không tự chuyển trang mà gọi callback (<code>onCheckout</code>, <code>onDone</code>) để Shell điều hướng.</li>
            <li><b>Hai trang không import code của nhau.</b> Giỏ hàng đi qua backend: trang mua hàng ghi vào cart-svc, trang thanh toán đọc ra.</li>
            <li><b>Deploy độc lập.</b> Team B sửa trang thanh toán rồi deploy (thực tế là lên CDN thay vì <code>:3002</code>); lần sau khách vào <code>/checkout</code>, Shell tự tải bản mới.</li>
          </ul>

          <h3>Khi trang cần SEO: multi-zone</h3>
          <p>Cách trên render trong trình duyệt nên Google khó đọc. Trang sản phẩm, danh mục cần SEO thì cho team đó một app Next.js riêng render ở server, Shell chỉ chuyển hướng đường dẫn sang:</p>
          <Code lang="ts">{`// shell/next.config.ts
export default {
  async rewrites() {
    return [{ source: "/p/:path*", destination: "https://shop.internal.shop.vn/p/:path*" }];
  },
};`}</Code>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Loại trang</th>
                  <th>Nên dùng</th>
                  <th>Lý do</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Sản phẩm, danh mục, trang chủ</td><td><b>Multi-zone</b></td><td>Cần SEO và tải nhanh lần đầu, render ở server</td></tr>
                <tr><td>Giỏ hàng, tài khoản, thanh toán</td><td><b>Module Federation</b></td><td>Nằm sau đăng nhập, không cần SEO, chuyển trang mượt</td></tr>
                <tr><td>Widget nhỏ: giỏ mini, gợi ý sản phẩm</td><td><b>Module Federation</b></td><td>Nhúng vào trang của team khác</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="mf-talk">
          <h2><span className="n">05</span>Giao tiếp giữa các phần</h2>
          <p>Các phần không import code của nhau. Chúng nói chuyện qua <b>sự kiện trình duyệt</b>, URL, hoặc gọi lại backend, giống service backend nói chuyện qua Kafka.</p>
          <Code lang="ts">{`// catalog-mfe: customer clicks "Thêm vào giỏ"
await fetch("/api/cart/items", { method: "POST", body: JSON.stringify({ sku, qty: 1 }) });
window.dispatchEvent(new CustomEvent("cart:updated", { detail: { sku, qty: 1 } }));

// cart-mfe: refresh the badge when anyone changes the cart
window.addEventListener("cart:updated", () => refetchCart());`}</Code>
          <ul className="plain">
            <li>Đặt tên sự kiện như một hợp đồng (<code>cart:updated</code>) và ghi vào tài liệu chung, giống schema của event backend.</li>
            <li>Tránh một store toàn cục (Redux chung): các team lại bị trói vào nhau.</li>
          </ul>
        </section>

        <section id="mf-when">
          <h2><span className="n">06</span>Khi nào dùng</h2>
          <div className="pp">
            <div><span className="pl">Nên dùng</span>Nhiều team (thường từ 4–5 team trở lên) cùng làm một sản phẩm lớn; mỗi team cần release theo nhịp riêng; muốn thay dần một frontend cũ từng phần.</div>
            <div className="warnc"><span className="pl">Không nên</span>Team nhỏ, một sản phẩm: một app Next.js chia module rõ ràng là đủ. Micro-frontend thêm chi phí: nhiều pipeline, bundle nặng hơn, khó giữ giao diện đồng nhất.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
