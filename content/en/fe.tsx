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
    <svg viewBox="0 0 900 590" role="img" aria-label="Micro-frontends: the page has a header from the Shell, a product list from Catalog, a mini cart from Cart, quick checkout from Checkout and an account panel from Account; the Shell loads each micro-frontend's remoteEntry at runtime; each micro-frontend is owned by one team, deployed separately to a CDN and calls its own backend service; shared pieces are the design system, an event bus, the React library and the login token">
      <defs>
        <marker id="mfa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker>
      </defs>

      {/* What the customer sees: one page, five owners */}
      <rect className="s-box" x="16" y="10" width="868" height="196" rx="8" />
      <circle cx="32" cy="24" r="4" style={{ fill: "var(--bad)" }} />
      <circle cx="46" cy="24" r="4" style={{ fill: "var(--warn)" }} />
      <circle cx="60" cy="24" r="4" style={{ fill: "var(--ok)" }} />
      <text className="s-tm" x="80" y="28">shop.vn/dien-thoai</text>
      <Region x={28} y={38} w={844} h={34} team="shell" title="Header · logo · search · menu" />
      <text className="s-tm" x="300" y="59">Shell</text>
      <Region x={752} y={42} w={112} h={26} team="cart" title="Cart (3)" />
      <Region x={28} y={80} w={520} h={116} team="catalog" title="Product list" sub="catalog-mfe" />
      {[0, 1, 2, 3].map(i => (
        <rect key={i} x={40 + i * 126} y={124} width={114} height={62} rx="5" style={{ fill: "var(--surface)", stroke: "var(--new)", strokeWidth: 1 }} />
      ))}
      <Region x={560} y={80} w={312} h={54} team="account" title="Hi, Lan · 1,200 points" sub="account-mfe" />
      <Region x={560} y={142} w={312} h={54} team="checkout" title="Buy now · one-tap checkout" sub="checkout-mfe" />

      {/* Shell composes the remotes at runtime */}
      <path className="s-ln" d="M450 206 V226" markerEnd="url(#mfa)" />
      <rect className="s-hl" x="16" y="228" width="868" height="46" rx="7" />
      <text className="s-tb" x="28" y="248">Shell (host app) · Module Federation</text>
      <text className="s-tm" x="28" y="265">routing, layout, login; at runtime loads each micro-frontend's remoteEntry.js from the CDN</text>

      {MFES.map((m, i) => {
        const x = 16 + i * 222;
        const [stroke, fill] = TEAM[m.team];
        return (
          <g key={m.name}>
            <path className="s-ln" d={`M${x + 100} 274 V298`} markerEnd="url(#mfa)" />
            <rect x={x} y={300} width={200} height={72} rx="7" style={{ fill, stroke, strokeWidth: 1.5 }} />
            <text className="s-tb" x={x + 10} y={321}>{m.name}</text>
            <text className="s-tm" x={x + 10} y={339}>{m.owner} · own repo</text>
            <text className="s-tm" x={x + 10} y={356}>deployed separately to CDN</text>
            <path d={`M${x + 100} 372 V408`} style={{ stroke, strokeWidth: 1.8, strokeDasharray: "5 4" }} markerEnd="url(#mfa)" />
            <rect className="s-box" x={x} y={410} width={200} height={42} rx="7" />
            <text className="s-tb" x={x + 10} y={436}>{m.api}</text>
          </g>
        );
      })}
      <text className="s-tm" x="16" y="474">Each micro-frontend calls its own team's service through the API Gateway (see the diagram on the Overview page)</text>

      {/* Shared pieces */}
      <rect className="s-bg" x="16" y="490" width="868" height="76" rx="8" />
      <text className="s-lane" x="28" y="508">SHARED · KEEP IT AS SMALL AS POSSIBLE</text>
      {[["Design system", "@shop/ui · buttons, colors, fonts"], ["Event bus", "CustomEvent cart:updated"], ["Shared libraries", "react, react-dom (singleton)"], ["Login", "token issued by the Shell"]].map(([t, s], i) => (
        <g key={t}>
          <rect className="s-box" x={28 + i * 214} y={516} width={202} height={42} rx="6" />
          <text className="s-tb" x={38 + i * 214} y={533}>{t}</text>
          <text className="s-tm" x={38 + i * 214} y={550}>{s}</text>
        </g>
      ))}
      <text className="s-tm" x="16" y="584">Each color is one team: it owns everything from the UI, repo and deploy pipeline to the backend service</text>
    </svg>
  );
}

export default function FrontendOverviewPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Micro-frontend contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#mf-what"><span>01</span>What micro-frontends are</a></li>
          <li><a href="#mf-compose"><span>02</span>Composition</a></li>
          <li><a href="#mf-code"><span>03</span>Module Federation</a></li>
          <li><a href="#mf-page"><span>04</span>Shell + 2 pages example</a></li>
          <li><a href="#mf-talk"><span>05</span>Communication between parts</a></li>
          <li><a href="#mf-when"><span>06</span>When to use</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">frontend · overview</div>
          <h1>Micro-frontends for an online shop</h1>
          <p className="lede">Microservices applied to the UI: one web page is assembled from several parts, each built by one team with its own repo and release schedule. Customers still see a single page.</p>
          <div className="tape" aria-hidden="true">
            <div>shell</div>
            <div>catalog-mfe</div>
            <div>cart-mfe</div>
            <div className="hw">Module Federation</div>
            <div className="leo">CustomEvent</div>
          </div>
        </header>

        <section id="mf-what">
          <h2><span className="n">01</span>What micro-frontends are</h2>
          <figure className="fig">
            <div className="scroll">
              <MicroFrontendDiagram />
            </div>
            <figcaption>Top: the page the customer sees, colored by owning team. Middle: the Shell composes the parts at runtime. Bottom: each part calls its own team's backend service.</figcaption>
          </figure>
          <ul className="plain">
            <li><b>Shell (host)</b>: page frame, header, routing, login. It holds no business logic; it only decides which part shows where.</li>
            <li><b>Remotes</b> (catalog, cart, checkout, account): each part is a small app that builds a <code>remoteEntry.js</code> and pushes it to a CDN.</li>
            <li>Team Cart changes the cart and deploys <b>without rebuilding</b> the Shell or other teams' parts.</li>
            <li>Split by <b>business domain</b> like the backend: team Cart owns both <code>cart-mfe</code> and <code>cart-svc</code> (see the diagram on the <Link className="plink" href="/en/">Overview</Link>).</li>
          </ul>
        </section>

        <section id="mf-compose">
          <h2><span className="n">02</span>Ways to compose the parts</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Approach</th>
                  <th>Composed when</th>
                  <th>Pros</th>
                  <th>Cons</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>npm package</b></td><td>When the Shell is built</td><td>Simple, type safe</td><td>Every change by a team means rebuilding and redeploying the Shell; not a real micro-frontend</td></tr>
                <tr><td><b>Module Federation</b></td><td>At runtime, in the browser</td><td>Independent deploys, one shared copy of React</td><td>Shared library versions must match; complex build configuration</td></tr>
                <tr><td><b>Multi-zone / server composition</b></td><td>Per request, on the server or edge</td><td>One app per path (<code>/cart</code>, <code>/account</code>), good SEO</td><td>Moving between zones reloads the page</td></tr>
                <tr><td><b>Web Components</b></td><td>At runtime</td><td>Framework independent; teams can use React or Vue</td><td>Heavy bundles if each part ships its own framework</td></tr>
                <tr><td><b>iframe</b></td><td>At runtime</td><td>Complete CSS and JS isolation</td><td>Hard to share state, hard to make responsive, poor SEO</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="mf-code">
          <h2><span className="n">03</span>Module Federation</h2>
          <p><b>Module Federation</b> is a bundler plugin that lets one app use another app's code <b>at runtime</b>, without installing it from npm. The app that lends code (the <b>remote</b>) declares <code>exposes</code> and produces a <code>remoteEntry.js</code> file; the app that borrows (the <b>host</b>, here the Shell) declares <code>remotes</code> to know where to load that file. Every participating project has its own plugin declaration.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Bundler</th>
                  <th>Approach</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Webpack 5, Rspack</td><td><code>{"new ModuleFederationPlugin({ ... })"}</code></td></tr>
                <tr><td>Rsbuild (used in these notes)</td><td><code>{"pluginModuleFederation({ ... })"}</code></td></tr>
                <tr><td>Vite</td><td><code>{"federation({ ... })"}</code></td></tr>
              </tbody>
            </table>
          </div>
          <p>The function names differ, but the options inside (<code>name</code>, <code>exposes</code>, <code>remotes</code>, <code>shared</code>) are the same.</p>
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
          <div className="note"><code>{"singleton: true"}</code>: the whole page has <b>one copy of React</b>, and every micro-frontend uses the copy the Shell loaded. Without it each part loads its own React: the page is heavier and hooks and context break across part boundaries (“Invalid hook call”). Because there is only one shared copy, teams must agree on the same React major version.</div>
          <Code lang="tsx">{`// shell/src/Header.tsx — loaded over the network at runtime
const MiniCart = lazy(() => import("cart/MiniCart"));

export function Header() {
  return (
    <header>
      <Logo /> <Search />
      <ErrorBoundary fallback={<a href="/cart">Cart</a>}>
        <Suspense fallback={<CartSkeleton />}>
          <MiniCart />
        </Suspense>
      </ErrorBoundary>
    </header>
  );
}`}</Code>
          <div className="note">Always wrap remotes in an <code>ErrorBoundary</code>: if team Cart's CDN fails, the header still renders and only the mini cart is missing.</div>
        </section>

        <section id="mf-page">
          <h2><span className="n">04</span>Example: Shell + shopping page + checkout page</h2>
          <p>Three projects run separately. Customers open only the Shell; the Shell loads the two other pages from two other addresses at runtime.</p>
          <Code lang="text">{`shop-mfe/      shopping page      runs on :3001   team A
checkout-mfe/  checkout page      runs on :3002   team B
shell/         frame + router     runs on :3000   platform team

Browser ──► shell :3000  (header, footer, router)
                  ├─ visit /          → load :3001/remoteEntry.js → show ShopPage
                  └─ visit /checkout  → load :3002/remoteEntry.js → show CheckoutPage`}</Code>

          <h3>Step 1: shop-mfe lends its page</h3>
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
      <h1>Phones</h1>
      <button onClick={() => add("PHONE-01")}>Add iPhone to cart</button>
      <button onClick={onCheckout}>Checkout</button>   {/* does not navigate itself, tells the Shell */}
    </div>
  );
}`}</Code>

          <h3>Step 2: checkout-mfe does the same</h3>
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
      <h1>Checkout</h1>
      <p>Total: {cart.total} VND</p>
      <button onClick={pay}>Place order</button>
    </div>
  );
}`}</Code>

          <h3>Step 3: the Shell declares two remotes and mounts them on routes</h3>
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
      <ErrorBoundary fallback={<p>Could not load the page, please try again.</p>}>
        <Suspense fallback={<p>Loading…</p>}>
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

          <h3>Step 4: Run</h3>
          <Code lang="bash">{`cd shop-mfe && npm run dev       # :3001
cd checkout-mfe && npm run dev   # :3002
cd shell && npm run dev          # :3000  ← customers open only this address`}</Code>

          <ul className="plain">
            <li><b>The Shell owns the router.</b> The two pages never navigate themselves; they call callbacks (<code>onCheckout</code>, <code>onDone</code>) and the Shell navigates.</li>
            <li><b>The pages never import each other's code.</b> The cart travels through the backend: the shopping page writes to cart-svc, the checkout page reads from it.</li>
            <li><b>Independent deploys.</b> Team B changes the checkout page and deploys (in practice to a CDN instead of <code>:3002</code>); the next time a customer visits <code>/checkout</code>, the Shell loads the new version.</li>
          </ul>

          <h3>When a page needs SEO: multi-zone</h3>
          <p>The approach above renders in the browser, so search engines struggle to read it. For product and category pages that need SEO, give that team its own server-rendered Next.js app and let the Shell just rewrite the path to it:</p>
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
                  <th>Page type</th>
                  <th>Use</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Product, category, home</td><td><b>Multi-zone</b></td><td>Needs SEO and a fast first load; render on the server</td></tr>
                <tr><td>Cart, account, checkout</td><td><b>Module Federation</b></td><td>Behind login, no SEO needed, smooth navigation</td></tr>
                <tr><td>Small widgets: mini cart, recommendations</td><td><b>Module Federation</b></td><td>Embedded into another team's page</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="mf-talk">
          <h2><span className="n">05</span>Communication between parts</h2>
          <p>Parts never import each other's code. They talk through <b>browser events</b>, the URL, or by going back to the backend, just as backend services talk through Kafka.</p>
          <Code lang="ts">{`// catalog-mfe: customer clicks "Add to cart"
await fetch("/api/cart/items", { method: "POST", body: JSON.stringify({ sku, qty: 1 }) });
window.dispatchEvent(new CustomEvent("cart:updated", { detail: { sku, qty: 1 } }));

// cart-mfe: refresh the badge when anyone changes the cart
window.addEventListener("cart:updated", () => refetchCart());`}</Code>
          <ul className="plain">
            <li>Name events like a contract (<code>cart:updated</code>) and document them centrally, like a backend event schema.</li>
            <li>Avoid a global store (a shared Redux): it ties the teams back together.</li>
          </ul>
        </section>

        <section id="mf-when">
          <h2><span className="n">06</span>When to use</h2>
          <div className="pp">
            <div><span className="pl">Use it</span>Many teams (typically 4–5 or more) working on one large product; each team needs its own release rhythm; you want to replace an old frontend piece by piece.</div>
            <div className="warnc"><span className="pl">Avoid it</span>Small team, one product: a single Next.js app with clear modules is enough. Micro-frontends add cost: many pipelines, heavier bundles, harder to keep the UI consistent.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
