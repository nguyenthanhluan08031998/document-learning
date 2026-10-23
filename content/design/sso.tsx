import { Code } from "@/components/Code";
import { Box, Label, Markers } from "@/components/Svg";

// Lifelines of the login flow: [title, x]
const ACTORS: [string, number][] = [["Browser / App", 110], ["IdP (SSO)", 330], ["API Gateway", 560], ["Service", 790]];

// Messages: [from x, to x, y, label, dashed]
const MSGS: [number, number, number, string, boolean][] = [
  [110, 330, 100, "1 /authorize + code_challenge", false],
  [330, 110, 135, "2 đăng nhập, redirect ?code", true],
  [110, 330, 170, "3 POST /token (code + verifier)", false],
  [330, 110, 205, "4 access / id / refresh token", true],
  [110, 560, 240, "5 Authorization: Bearer <access>", false],
  [560, 790, 275, "6 chuyển tiếp + claims đã xác thực", false],
  [560, 330, 310, "7 lấy JWKS (cache)", true],
];

export default function DesignSsoPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục SSO và microservice">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#sso-what"><span>01</span>SSO là gì</a></li>
          <li><a href="#sso-flow"><span>02</span>Luồng đăng nhập (OIDC)</a></li>
          <li><a href="#sso-token"><span>03</span>Các loại token</a></li>
          <li><a href="#sso-where"><span>04</span>Xác thực ở đâu</a></li>
          <li><a href="#sso-s2s"><span>05</span>Service gọi service</a></li>
          <li><a href="#sso-logout"><span>06</span>Logout và thu hồi</a></li>
          <li><a href="#sso-authz"><span>07</span>Phân quyền</a></li>
          <li><a href="#sso-checklist"><span>08</span>Checklist</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">design · sso &amp; microservice</div>
          <h1>SSO và kiến trúc microservice</h1>
          <p className="lede">Hệ thống có nhiều service và nhiều ứng dụng, nhưng người dùng chỉ muốn đăng nhập một lần. Cách làm chuẩn: một Identity Provider (IdP) lo đăng nhập và cấp token; gateway và các service chỉ <b>kiểm tra token</b>, không tự giữ mật khẩu.</p>
          <div className="tape" aria-hidden="true">
            <div>OIDC</div>
            <div>OAuth 2.0</div>
            <div className="hw">JWT</div>
            <div>JWKS</div>
            <div>mTLS</div>
          </div>
        </header>

        <section id="sso-what">
          <h2><span className="n">01</span>SSO là gì</h2>
          <p><b>Single Sign-On</b>: đăng nhập một lần ở IdP (Identity Provider), dùng được cho mọi ứng dụng tin tưởng IdP đó. Trong microservice, mỗi service tự làm đăng nhập sẽ lặp code, lệch chính sách và khó đổi (thêm MFA (Multi-Factor Authentication), social login). Gom về một IdP giải quyết cả ba.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Chuẩn</th><th>Làm gì</th><th>Ghi chú</th></tr>
              </thead>
              <tbody>
                <tr><td><b>OAuth 2.0</b></td><td>Ủy quyền: cấp <i>access token</i> để gọi API (Application Programming Interface)</td><td>Không nói người dùng là ai</td></tr>
                <tr><td><b>OpenID Connect (OIDC)</b></td><td>Xác thực, xây trên OAuth 2.0: thêm <i>ID token</i> chứa danh tính</td><td>Lựa chọn mặc định hiện nay</td></tr>
                <tr><td><b>SAML (Security Assertion Markup Language) 2.0</b></td><td>SSO (Single Sign-On) bằng XML (Extensible Markup Language), hay gặp ở hệ thống doanh nghiệp cũ</td><td>Dùng khi đối tác bắt buộc</td></tr>
              </tbody>
            </table>
          </div>
          <p>IdP có sẵn: Keycloak (tự host), Auth0, Okta, AWS Cognito, Azure AD / Entra ID, Google.</p>
        </section>

        <section id="sso-flow">
          <h2><span className="n">02</span>Luồng đăng nhập: Authorization Code + PKCE</h2>
          <p>Đây là luồng nên dùng cho web, SPA và mobile. <b>PKCE (Proof Key for Code Exchange)</b> (code verifier và code challenge) chặn việc kẻ gian chặn được <code>code</code> rồi đem đổi lấy token.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 350" role="img" aria-label="Luồng OIDC: trình duyệt gửi yêu cầu authorize tới IdP, đăng nhập, nhận code, đổi code lấy token, rồi gọi API Gateway kèm Bearer token; gateway kiểm tra chữ ký bằng JWKS của IdP rồi chuyển tiếp tới service">
                <Markers id="sso" />
                {ACTORS.map(([t, x]) => (
                  <g key={t}>
                    <Box x={x - 70} y={8} w={140} h={36} title={t} cls="s-hl" />
                    <path d={`M${x} 44 V338`} style={{ stroke: "var(--line)", strokeWidth: 1.5, strokeDasharray: "4 4" }} />
                  </g>
                ))}
                {MSGS.map(([x1, x2, y, label, dashed]) => (
                  <g key={label}>
                    <path className="s-ln" d={`M${x1} ${y} H${x2}`} markerEnd="url(#ssoa)" style={dashed ? { strokeDasharray: "6 4" } : undefined} />
                    <Label x={(x1 + x2) / 2} y={y - 6} anchor="middle">{label}</Label>
                  </g>
                ))}
              </svg>
            </div>
            <figcaption>Bước 1 đến 4 là đăng nhập một lần ở IdP. Từ bước 5, mỗi request chỉ mang token; gateway kiểm tra chữ ký bằng khóa công khai (JWKS) đã cache, không gọi IdP cho từng request.</figcaption>
          </figure>
          <Code lang="ts">{`// 1. Tạo URL authorize (PKCE)
const verifier = randomString(64);                       // giữ trong bộ nhớ/session
const challenge = base64url(sha256(verifier));

const url = new URL("https://idp.example.com/authorize");
url.search = new URLSearchParams({
  response_type: "code",
  client_id: "web-app",
  redirect_uri: "https://app.example.com/callback",
  scope: "openid profile email offline_access",
  state: randomString(16),                               // chống CSRF, kiểm tra lại khi quay về
  code_challenge: challenge,
  code_challenge_method: "S256",
}).toString();

// 3. Đổi code lấy token (sau khi redirect về /callback?code=...)
const res = await fetch("https://idp.example.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code, client_id: "web-app", redirect_uri, code_verifier: verifier,
  }),
});
const { access_token, id_token, refresh_token } = await res.json();`}</Code>
          <div className="note"><b>Không dùng</b> Implicit flow (token nằm trên URL) và Password grant (app cầm mật khẩu). Cả hai đã bị OAuth 2.1 loại bỏ.</div>
        </section>

        <section id="sso-token">
          <h2><span className="n">03</span>Các loại token</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Token</th><th>Dành cho</th><th>Sống bao lâu</th></tr>
              </thead>
              <tbody>
                <tr><td><b>ID token</b> (JWT)</td><td>App client: biết người dùng là ai. <b>Không</b> gửi cho API</td><td>Vài phút</td></tr>
                <tr><td><b>Access token</b> (thường JWT)</td><td>Gửi tới gateway và service trong header <code>Authorization: Bearer</code></td><td>5 đến 15 phút</td></tr>
                <tr><td><b>Refresh token</b></td><td>Đổi lấy access token mới, chỉ gửi tới IdP. Nên xoay vòng (rotation)</td><td>Ngày đến tuần</td></tr>
              </tbody>
            </table>
          </div>
          <p>JWT (JSON Web Token) gồm ba phần <code>header.payload.signature</code>. Payload chỉ được <b>mã hóa base64, không bí mật</b>; ai cũng đọc được, nên đừng nhét dữ liệu nhạy cảm. Chữ ký mới là thứ chứng minh token do IdP phát.</p>
          <Code lang="json">{`{
  "iss": "https://idp.example.com/",
  "sub": "user-1842",
  "aud": "orders-api",
  "exp": 1767225900,
  "scope": "orders:read orders:write",
  "roles": ["customer"]
}`}</Code>
        </section>

        <section id="sso-where">
          <h2><span className="n">04</span>Xác thực ở đâu</h2>
          <div className="pp">
            <div><span className="pl">Chỉ ở gateway</span>Gateway kiểm tra token một lần rồi chuyển tiếp thông tin user cho service qua header. Đơn giản, nhưng service tin mù vào mạng nội bộ: ai gọi thẳng được vào service là qua mặt.</div>
            <div><span className="pl">Gateway và từng service</span>Gateway chặn sớm, mỗi service vẫn tự kiểm tra chữ ký JWT (zero trust). Tốn thêm vài micro giây, đổi lại an toàn khi lộ mạng nội bộ. <b>Nên dùng.</b></div>
          </div>
          <p>Kiểm tra token là việc nội bộ, không cần gọi IdP: lấy khóa công khai từ <code>/.well-known/jwks.json</code> (cache, tự làm mới khi gặp <code>kid</code> lạ) rồi xác minh chữ ký.</p>
          <Code lang="ts">{`import { createRemoteJWKSet, jwtVerify } from "jose";

const jwks = createRemoteJWKSet(new URL("https://idp.example.com/.well-known/jwks.json")); // đã cache

export async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  if (!token) return res.status(401).end();
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: "https://idp.example.com/",   // ai đã phát hành
      audience: "orders-api",               // token có dành cho service NÀY không
    });                                      // đồng thời kiểm tra chữ ký và exp
    req.user = payload;
    next();
  } catch {
    res.status(401).end();
  }
}`}</Code>
          <div className="note tip"><b>Luôn kiểm tra <code>aud</code>:</b> token phát cho service A không được dùng được ở service B.</div>
        </section>

        <section id="sso-s2s">
          <h2><span className="n">05</span>Service gọi service</h2>
          <ul className="plain">
            <li><b>Chuyển tiếp token của user:</b> đơn giản, giữ được danh tính người dùng, nhưng token có audience rộng và lộ ra nhiều nơi.</li>
            <li><b>Token exchange (RFC 8693):</b> service đổi token user lấy token mới có <code>aud</code> là service đích, phạm vi nhỏ hơn. Giữ được danh tính mà vẫn giảm rủi ro.</li>
            <li><b>Client credentials:</b> khi không có người dùng (job nền, worker). Service có client id/secret riêng, xin token của chính nó.</li>
            <li><b>mTLS (mutual Transport Layer Security) (service mesh):</b> bên dưới tầng token, xác thực <i>workload</i> bằng chứng chỉ hai chiều (Istio, Linkerd). Chứng minh &quot;ai là service gọi&quot;, còn token chứng minh &quot;thay mặt người dùng nào&quot;.</li>
          </ul>
          <Code lang="ts">{`// Client credentials: worker tự xin token riêng (không có người dùng)
const res = await fetch("https://idp.example.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "client_credentials",
    client_id: "notification-worker",
    client_secret: process.env.CLIENT_SECRET!,
    audience: "orders-api",
  }),
});`}</Code>
        </section>

        <section id="sso-logout">
          <h2><span className="n">06</span>Logout và thu hồi token</h2>
          <p>JWT tự chứa thông tin và được kiểm tra offline nên <b>không thể thu hồi ngay</b> trước khi hết hạn. Cách xử lý:</p>
          <ul className="plain">
            <li><b>Access token ngắn hạn</b> (5 đến 15 phút) là biện pháp chính; thu hồi refresh token ở IdP để không xin được token mới.</li>
            <li><b>Back-channel logout:</b> IdP gọi tới các ứng dụng khi người dùng đăng xuất ở nơi khác để hủy session.</li>
            <li><b>Token introspection</b> (<code>/introspect</code>) hoặc blocklist trong Redis cho thao tác nhạy cảm (chuyển tiền, đổi mật khẩu): chấp nhận thêm một lần gọi để có thu hồi tức thì.</li>
          </ul>
        </section>

        <section id="sso-authz">
          <h2><span className="n">07</span>Phân quyền</h2>
          <p>Xác thực trả lời &quot;bạn là ai&quot;, phân quyền trả lời &quot;được làm gì&quot;. Chuẩn nhất là để <b>mỗi service tự quyết định</b> dựa trên claim, vì chỉ service mới hiểu nghiệp vụ của mình.</p>
          <Code lang="ts">{`// Kiểm tra scope: quyền thô lấy từ token
const requireScope = (scope: string) => (req, res, next) =>
  req.user.scope?.split(" ").includes(scope) ? next() : res.status(403).end();

app.get("/orders", authenticate, requireScope("orders:read"), listOrders);

// Kiểm tra quyền sở hữu: chi tiết, cần dữ liệu nghiệp vụ nên nằm trong service
async function getOrder(req, res) {
  const order = await db.orders.findById(req.params.id);
  if (order.userId !== req.user.sub && !req.user.roles.includes("admin")) {
    return res.status(403).end();
  }
  res.json(order);
}`}</Code>
          <p>401 là chưa xác thực hoặc token sai; 403 là xác thực rồi nhưng không đủ quyền.</p>
        </section>

        <section id="sso-checklist">
          <h2><span className="n">08</span>Checklist</h2>
          <ul className="plain">
            <li>Dùng Authorization Code + PKCE; không dùng Implicit, Password.</li>
            <li>Access token ngắn hạn, refresh token xoay vòng, lưu an toàn (cookie <code>HttpOnly</code> + <code>Secure</code> + <code>SameSite</code>, không để trong localStorage nếu tránh được).</li>
            <li>Mỗi service tự kiểm tra chữ ký, <code>iss</code>, <code>aud</code>, <code>exp</code>; không tin header user do client gửi.</li>
            <li>Cache JWKS (JSON Web Key Set), xoay khóa ký định kỳ, thuật toán cố định (RS256 hoặc ES256), từ chối <code>alg: none</code>.</li>
            <li>Token exchange hoặc client credentials cho gọi giữa service; mTLS ở tầng mạng.</li>
            <li>Kiểm tra <code>state</code> và <code>redirect_uri</code> khớp danh sách đăng ký sẵn.</li>
            <li>Không log token; ghi <code>sub</code> và request id vào log để truy vết.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
