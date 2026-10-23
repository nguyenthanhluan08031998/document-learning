import { Code } from "@/components/Code";
import { Box, Label, Markers } from "@/components/Svg";

// Lifelines of the login flow: [title, x]
const ACTORS: [string, number][] = [["Browser / App", 110], ["IdP (SSO)", 330], ["API Gateway", 560], ["Service", 790]];

// Messages: [from x, to x, y, label, dashed]
const MSGS: [number, number, number, string, boolean][] = [
  [110, 330, 100, "1 /authorize + code_challenge", false],
  [330, 110, 135, "2 login, redirect ?code", true],
  [110, 330, 170, "3 POST /token (code + verifier)", false],
  [330, 110, 205, "4 access / id / refresh token", true],
  [110, 560, 240, "5 Authorization: Bearer <access>", false],
  [560, 790, 275, "6 forward + verified claims", false],
  [560, 330, 310, "7 fetch JWKS (cached)", true],
];

export default function DesignSsoPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="SSO and microservices contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#sso-what"><span>01</span>What is SSO</a></li>
          <li><a href="#sso-flow"><span>02</span>Login flow (OIDC)</a></li>
          <li><a href="#sso-token"><span>03</span>Token types</a></li>
          <li><a href="#sso-where"><span>04</span>Where to authenticate</a></li>
          <li><a href="#sso-s2s"><span>05</span>Service to service</a></li>
          <li><a href="#sso-logout"><span>06</span>Logout and revocation</a></li>
          <li><a href="#sso-authz"><span>07</span>Authorization</a></li>
          <li><a href="#sso-checklist"><span>08</span>Checklist</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">design · sso &amp; microservice</div>
          <h1>SSO and microservice architecture</h1>
          <p className="lede">A system has many services and apps, but users want to sign in once. The standard approach: one Identity Provider (IdP) handles login and issues tokens; the gateway and services only <b>verify tokens</b> and never hold passwords.</p>
          <div className="tape" aria-hidden="true">
            <div>OIDC</div>
            <div>OAuth 2.0</div>
            <div className="hw">JWT</div>
            <div>JWKS</div>
            <div>mTLS</div>
          </div>
        </header>

        <section id="sso-what">
          <h2><span className="n">01</span>What is SSO</h2>
          <p><b>Single Sign-On</b>: sign in once at the IdP and use every application that trusts it. In microservices, letting each service implement login duplicates code, drifts in policy and is hard to change (adding MFA, social login). One IdP fixes all three.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Standard</th><th>What it does</th><th>Note</th></tr>
              </thead>
              <tbody>
                <tr><td><b>OAuth 2.0</b></td><td>Authorization: issues an <i>access token</i> to call APIs</td><td>Does not say who the user is</td></tr>
                <tr><td><b>OpenID Connect (OIDC)</b></td><td>Authentication on top of OAuth 2.0: adds an <i>ID token</i> carrying identity</td><td>Today&apos;s default choice</td></tr>
                <tr><td><b>SAML 2.0</b></td><td>XML-based SSO, common in older enterprise systems</td><td>Use when a partner requires it</td></tr>
              </tbody>
            </table>
          </div>
          <p>Ready-made IdPs: Keycloak (self-hosted), Auth0, Okta, AWS Cognito, Azure AD / Entra ID, Google.</p>
        </section>

        <section id="sso-flow">
          <h2><span className="n">02</span>Login flow: Authorization Code + PKCE</h2>
          <p>This is the flow to use for web, SPAs and mobile. <b>PKCE</b> (code verifier and code challenge) stops an attacker who intercepts the <code>code</code> from exchanging it for tokens.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 350" role="img" aria-label="OIDC flow: the browser sends an authorize request to the IdP, logs in, receives a code, exchanges it for tokens, then calls the API Gateway with a Bearer token; the gateway verifies the signature with the IdP's JWKS and forwards to the service">
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
            <figcaption>Steps 1 to 4 are the one-time login at the IdP. From step 5 every request just carries the token; the gateway verifies the signature with a cached public key (JWKS) and does not call the IdP per request.</figcaption>
          </figure>
          <Code lang="ts">{`// 1. Build the authorize URL (PKCE)
const verifier = randomString(64);                       // kept in memory/session
const challenge = base64url(sha256(verifier));

const url = new URL("https://idp.example.com/authorize");
url.search = new URLSearchParams({
  response_type: "code",
  client_id: "web-app",
  redirect_uri: "https://app.example.com/callback",
  scope: "openid profile email offline_access",
  state: randomString(16),                               // anti-CSRF, verify on return
  code_challenge: challenge,
  code_challenge_method: "S256",
}).toString();

// 3. Exchange the code for tokens (after redirect to /callback?code=...)
const res = await fetch("https://idp.example.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code, client_id: "web-app", redirect_uri, code_verifier: verifier,
  }),
});
const { access_token, id_token, refresh_token } = await res.json();`}</Code>
          <div className="note"><b>Do not use</b> the Implicit flow (token in the URL) or the Password grant (the app handles the password). OAuth 2.1 removes both.</div>
        </section>

        <section id="sso-token">
          <h2><span className="n">03</span>Token types</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Token</th><th>Meant for</th><th>Lifetime</th></tr>
              </thead>
              <tbody>
                <tr><td><b>ID token</b> (JWT)</td><td>The client app: learn who the user is. <b>Never</b> send it to APIs</td><td>Minutes</td></tr>
                <tr><td><b>Access token</b> (usually JWT)</td><td>Sent to the gateway and services in <code>Authorization: Bearer</code></td><td>5 to 15 minutes</td></tr>
                <tr><td><b>Refresh token</b></td><td>Exchanged for a new access token, sent only to the IdP. Should rotate</td><td>Days to weeks</td></tr>
              </tbody>
            </table>
          </div>
          <p>A JWT has three parts, <code>header.payload.signature</code>. The payload is only <b>base64-encoded, not secret</b>; anyone can read it, so keep sensitive data out. The signature is what proves the IdP issued it.</p>
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
          <h2><span className="n">04</span>Where to authenticate</h2>
          <div className="pp">
            <div><span className="pl">Gateway only</span>The gateway verifies the token once and forwards user info to services in headers. Simple, but services trust the internal network blindly: anyone who can call a service directly bypasses auth.</div>
            <div><span className="pl">Gateway and every service</span>The gateway rejects early, and each service still verifies the JWT signature itself (zero trust). A few microseconds extra, but safe if the internal network is breached. <b>Recommended.</b></div>
          </div>
          <p>Verifying a token is local work and needs no call to the IdP: fetch the public keys from <code>/.well-known/jwks.json</code> (cached, refreshed on an unknown <code>kid</code>) and check the signature.</p>
          <Code lang="ts">{`import { createRemoteJWKSet, jwtVerify } from "jose";

const jwks = createRemoteJWKSet(new URL("https://idp.example.com/.well-known/jwks.json")); // cached

export async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  if (!token) return res.status(401).end();
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: "https://idp.example.com/",   // who issued it
      audience: "orders-api",               // is it meant for THIS service
    });                                      // also checks signature and exp
    req.user = payload;
    next();
  } catch {
    res.status(401).end();
  }
}`}</Code>
          <div className="note tip"><b>Always check <code>aud</code>:</b> a token issued for service A must not work on service B.</div>
        </section>

        <section id="sso-s2s">
          <h2><span className="n">05</span>Service to service</h2>
          <ul className="plain">
            <li><b>Forward the user&apos;s token:</b> simple and keeps the user identity, but the token has a wide audience and is exposed in many places.</li>
            <li><b>Token exchange (RFC 8693):</b> a service swaps the user token for a new one whose <code>aud</code> is the target service, with narrower scope. Keeps identity while reducing risk.</li>
            <li><b>Client credentials:</b> when there is no user (background jobs, workers). The service has its own client id and secret and requests a token for itself.</li>
            <li><b>mTLS (service mesh):</b> below the token layer, authenticates the <i>workload</i> with mutual certificates (Istio, Linkerd). It proves &quot;which service is calling&quot;, while the token proves &quot;on behalf of which user&quot;.</li>
          </ul>
          <Code lang="ts">{`// Client credentials: a worker gets its own token (no user involved)
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
          <h2><span className="n">06</span>Logout and token revocation</h2>
          <p>A JWT is self-contained and verified offline, so it <b>cannot be revoked instantly</b> before it expires. How to cope:</p>
          <ul className="plain">
            <li><b>Short-lived access tokens</b> (5 to 15 minutes) are the main defence; revoke the refresh token at the IdP so no new tokens can be requested.</li>
            <li><b>Back-channel logout:</b> the IdP calls your applications when the user signs out elsewhere so they can kill their sessions.</li>
            <li><b>Token introspection</b> (<code>/introspect</code>) or a Redis blocklist for sensitive actions (money transfer, password change): accept one extra call to get instant revocation.</li>
          </ul>
        </section>

        <section id="sso-authz">
          <h2><span className="n">07</span>Authorization</h2>
          <p>Authentication answers &quot;who are you&quot;, authorization answers &quot;what may you do&quot;. The sound approach is to let <b>each service decide</b> based on claims, because only the service understands its own business rules.</p>
          <Code lang="ts">{`// Scope check: coarse permission from the token
const requireScope = (scope: string) => (req, res, next) =>
  req.user.scope?.split(" ").includes(scope) ? next() : res.status(403).end();

app.get("/orders", authenticate, requireScope("orders:read"), listOrders);

// Ownership check: fine-grained, needs business data, so it lives in the service
async function getOrder(req, res) {
  const order = await db.orders.findById(req.params.id);
  if (order.userId !== req.user.sub && !req.user.roles.includes("admin")) {
    return res.status(403).end();
  }
  res.json(order);
}`}</Code>
          <p>401 means not authenticated or a bad token; 403 means authenticated but not allowed.</p>
        </section>

        <section id="sso-checklist">
          <h2><span className="n">08</span>Checklist</h2>
          <ul className="plain">
            <li>Use Authorization Code + PKCE; no Implicit or Password grants.</li>
            <li>Short-lived access tokens, rotating refresh tokens, stored safely (<code>HttpOnly</code> + <code>Secure</code> + <code>SameSite</code> cookies, avoid localStorage where possible).</li>
            <li>Each service verifies the signature, <code>iss</code>, <code>aud</code> and <code>exp</code> itself; never trust a user header sent by a client.</li>
            <li>Cache JWKS, rotate signing keys regularly, pin the algorithm (RS256 or ES256), reject <code>alg: none</code>.</li>
            <li>Token exchange or client credentials between services; mTLS at the network layer.</li>
            <li>Check that <code>state</code> and <code>redirect_uri</code> match the pre-registered list.</li>
            <li>Never log tokens; log <code>sub</code> and a request id for tracing.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
