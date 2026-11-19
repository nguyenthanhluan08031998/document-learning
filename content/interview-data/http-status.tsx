import { Flow } from "@/components/Flow";
import type { InterviewData } from "@/components/InterviewList";
import type { Locale } from "@/lib/notebook";

const STATUS = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status";
const REDIRECTS = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Redirections";
const CACHING = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Conditional_requests";
const S401 = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/401";
const S422 = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/422";
const S409 = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/409";
const S429 = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429";
const S502 = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/502";
const IDEMPOTENT = "https://developer.mozilla.org/en-US/docs/Glossary/Idempotent";
const PROBLEM = "https://www.rfc-editor.org/rfc/rfc9457";

export default function build(l: Locale): InterviewData {
  const t = (vi: string, en: string) => (l === "vi" ? vi : en);
  return {
    eyebrow: t("phỏng vấn · http status code", "interview · http status codes"),
    title: t("Phỏng vấn HTTP status code", "HTTP status code interview"),
    lede: t(
      "Bấm vào câu hỏi để xem đáp án, bảng so sánh và ví dụ. Ví dụ viết bằng Express (TypeScript) quanh hệ thống bán hàng. Bài học chi tiết ở BE → API → REST.",
      "Click a question to see the answer, a comparison table and an example. Examples use Express (TypeScript) around the shop system. The full lesson is in BE → API → REST.",
    ),
    sections: [
      {
        id: "hs-basics",
        title: t("Tổng quan", "Overview"),
        items: [
          {
            q: t("Status code chia thành mấy nhóm? Nhìn chữ số đầu biết được gì?", "What are the status code classes? What does the first digit tell you?"),
            a: t(
              "Chữ số đầu cho biết kết quả thuộc loại nào, nên client xử lý được cả những mã nó chưa biết: gặp 4xx lạ thì coi như 400, gặp 5xx lạ thì coi như 500. Câu hỏi quan trọng nhất khi nhìn một mã là: lỗi do ai, và gửi lại có ích không.",
              "The first digit tells the class of result, so a client can handle codes it has never seen: an unknown 4xx is treated as 400, an unknown 5xx as 500. The key questions for any code: whose fault is it, and will retrying help?",
            ),
            table: {
              head: [t("Nhóm", "Class"), t("Ý nghĩa", "Meaning"), t("Lỗi do ai", "Whose fault"), t("Gửi lại y hệt?", "Retry as is?")],
              rows: [
                ["1xx", t("Thông tin, request đang được xử lý tiếp", "Informational, keep going"), "-", "-"],
                ["2xx", t("Thành công", "Success"), "-", t("Không cần", "Not needed")],
                ["3xx", t("Chuyển hướng, cần đi tiếp tới chỗ khác", "Redirection, go somewhere else"), "-", t("Theo Location", "Follow Location")],
                ["4xx", t("Lỗi phía client", "Client error"), "Client", t("Vẫn sai, phải sửa request", "Fails again; fix the request")],
                ["5xx", t("Lỗi phía server", "Server error"), "Server", t("Có thể được, thử lại sau", "May work later")],
              ],
            },
            href: STATUS, label: "HTTP response status codes (MDN)",
          },
          {
            q: t("Sao không trả 200 cho mọi thứ rồi để lỗi trong body?", "Why not return 200 for everything and put errors in the body?"),
            a: [
              t(
                "Vì cả hệ thống xung quanh đọc status code chứ không đọc body. Cache và CDN chỉ cache response 2xx; load balancer và health check dựa vào 5xx để loại instance hỏng; monitoring và alert đếm tỉ lệ 5xx; client HTTP như fetch, axios, retry library quyết định ném lỗi hay retry dựa trên mã.",
                "Because everything around your API reads the status code, not the body. Caches and CDNs only cache 2xx; load balancers and health checks use 5xx to drop broken instances; monitoring and alerts count the 5xx rate; HTTP clients like fetch, axios and retry libraries decide whether to throw or retry from the code.",
              ),
              t(
                "Trả 200 kèm { error: ... } thì cache có thể lưu lại lỗi, dashboard báo mọi thứ ổn trong khi người dùng gặp lỗi, và client phải tự đọc body để đoán. Ngoại lệ hay gặp: GraphQL thường trả 200 kèm mảng errors vì một request có thể thành công một phần.",
                "Returning 200 with { error: ... } lets caches store errors, makes dashboards look green while users fail, and forces clients to parse the body to guess. A common exception: GraphQL usually returns 200 with an errors array because one request can partly succeed.",
              ),
            ],
            href: STATUS, label: "HTTP response status codes (MDN)",
          },
        ],
      },
      {
        id: "hs-2xx",
        title: t("2xx: thành công", "2xx: success"),
        items: [
          {
            q: t("200, 201, 202 và 204 dùng khi nào?", "When do you use 200, 201, 202 and 204?"),
            a: t(
              "Cả bốn đều là thành công, khác nhau ở chỗ đã làm xong chưa và có trả body hay không.",
              "All four mean success; they differ in whether the work is done and whether there is a body.",
            ),
            table: {
              head: [t("Mã", "Code"), t("Ý nghĩa", "Meaning"), t("Ví dụ trong shop", "Shop example")],
              rows: [
                ["200 OK", t("Xong, có dữ liệu trả về", "Done, with data"), t("GET /orders/42, PATCH cập nhật địa chỉ", "GET /orders/42, PATCH an address")],
                ["201 Created", t("Đã tạo tài nguyên mới, kèm header Location", "Created a resource, with a Location header"), "POST /orders"],
                ["202 Accepted", t("Đã nhận, sẽ xử lý sau (bất đồng bộ)", "Accepted, processed later (async)"), t("POST /reports/export, gửi email hàng loạt", "POST /reports/export, bulk email")],
                ["204 No Content", t("Xong, không có body", "Done, no body"), t("DELETE /cart/items/7", "DELETE /cart/items/7")],
              ],
            },
            code: { lang: "ts", src: `app.post("/orders", async (req, res) => {
  const order = await orders.create(req.body);
  res.status(201).location("/orders/" + order.id).json(order);
});

app.post("/reports/export", async (req, res) => {
  const job = await queue.add("export", req.body);
  res.status(202).json({ jobId: job.id, status: "/jobs/" + job.id });   // ${t("client hỏi lại sau", "client polls later")}
});

app.delete("/cart/items/:id", async (req, res) => {
  await cart.remove(req.params.id);
  res.status(204).end();                                                // ${t("không có body", "no body")}
});` },
            href: STATUS, label: "HTTP response status codes (MDN)",
          },
        ],
      },
      {
        id: "hs-3xx",
        title: t("3xx: chuyển hướng và cache", "3xx: redirects and caching"),
        items: [
          {
            q: t("301, 302, 307 và 308 khác nhau thế nào?", "How do 301, 302, 307 and 308 differ?"),
            a: t(
              "Khác nhau ở hai điểm: chuyển hướng tạm thời hay vĩnh viễn, và có giữ nguyên method cùng body không. Với 301 và 302, trình duyệt có thể đổi POST thành GET khi đi theo chuyển hướng (lý do lịch sử). 307 và 308 ra đời để bắt buộc giữ nguyên method. Chuyển hướng vĩnh viễn được trình duyệt và Google ghi nhớ, nên dùng nhầm 301 cho chuyển hướng tạm thời rất khó gỡ.",
              "They differ in two ways: temporary or permanent, and whether method and body are kept. With 301 and 302 a browser may turn POST into GET when following (historical reasons). 307 and 308 exist to force the same method. Permanent redirects are remembered by browsers and Google, so a 301 used for a temporary move is hard to undo.",
            ),
            table: {
              head: [t("Mã", "Code"), t("Thời hạn", "Duration"), t("Giữ method + body", "Keeps method + body"), t("Dùng khi", "Use for")],
              rows: [
                ["301", t("Vĩnh viễn", "Permanent"), t("Không chắc (POST có thể thành GET)", "Not guaranteed (POST may become GET)"), t("Đổi domain, đổi URL trang", "Domain or page URL change")],
                ["302", t("Tạm thời", "Temporary"), t("Không chắc", "Not guaranteed"), t("Chuyển sau đăng nhập, A/B test", "After login, A/B tests")],
                ["307", t("Tạm thời", "Temporary"), t("Có", "Yes"), t("Chuyển tạm một API POST/PUT", "Temporarily move a POST/PUT API")],
                ["308", t("Vĩnh viễn", "Permanent"), t("Có", "Yes"), t("Đổi hẳn URL của API", "Permanently move an API")],
              ],
            },
            href: REDIRECTS, label: "Redirections in HTTP (MDN)",
          },
          {
            q: t("304 Not Modified hoạt động thế nào?", "How does 304 Not Modified work?"),
            a: t(
              "Lần đầu server trả 200 kèm header ETag (dấu vân tay của nội dung) hoặc Last-Modified. Lần sau client gửi lại dấu đó trong If-None-Match hoặc If-Modified-Since. Nếu nội dung chưa đổi, server trả 304 không có body và client dùng bản đã cache. Tiết kiệm băng thông, nhưng vẫn mất một vòng request; muốn bỏ hẳn request thì dùng Cache-Control: max-age.",
              "The first response is 200 with an ETag (a fingerprint of the content) or Last-Modified. Next time the client sends it back in If-None-Match or If-Modified-Since. If nothing changed, the server returns 304 with no body and the client uses its cached copy. It saves bandwidth but still costs a round trip; to skip the request entirely use Cache-Control: max-age.",
            ),
            diagram: <Flow id="hs304" label="ETag and 304" steps={[
              { title: "GET /products/1", sub: t("lần đầu", "first time") },
              { title: "200 + ETag", sub: '"v7"' },
              { title: "If-None-Match", sub: '"v7"' },
              { title: "304", sub: t("không body, dùng cache", "no body, use cache"), hl: true },
            ]} />,
            code: { lang: "http", src: `GET /products/1 HTTP/1.1
If-None-Match: "v7"

HTTP/1.1 304 Not Modified
ETag: "v7"
Cache-Control: max-age=60` },
            href: CACHING, label: "HTTP conditional requests (MDN)",
          },
        ],
      },
      {
        id: "hs-4xx",
        title: t("4xx: lỗi phía client", "4xx: client errors"),
        items: [
          {
            q: t("401 khác 403 thế nào?", "401 vs 403?"),
            a: t(
              "401 Unauthorized thực chất là \"chưa xác thực\": không có token, token sai hoặc hết hạn. Client nên đăng nhập lại hoặc refresh token rồi gửi lại. 403 Forbidden là \"đã biết bạn là ai nhưng bạn không có quyền\". Đăng nhập lại cũng không giúp gì, phải có thêm quyền. Ví dụ: chưa gửi token thì 401; user thường gọi API xoá sản phẩm của admin thì 403.",
              "401 Unauthorized really means \"not authenticated\": no token, a bad one or an expired one. The client should log in or refresh the token and retry. 403 Forbidden means \"I know who you are, but you may not do this\". Logging in again does not help; you need more permissions. Example: no token gives 401; a regular user calling the admin delete-product API gets 403.",
            ),
            diagram: <Flow id="hs401" label="401 or 403" steps={[
              { title: t("Có token hợp lệ?", "Valid token?"), sub: t("không → 401", "no → 401") },
              { title: t("Đủ quyền?", "Allowed?"), sub: t("không → 403", "no → 403"), hl: true },
              { title: t("Xử lý", "Handle"), sub: "200 / 201 / 204" },
            ]} />,
            code: { lang: "ts", src: `function auth(req: Request, res: Response, next: NextFunction) {
  const user = verifyToken(req.headers.authorization);
  if (!user) return res.status(401).set("WWW-Authenticate", "Bearer").end();  // ${t("ai đây?", "who are you?")}
  req.user = user;
  next();
}

const requireRole = (role: string) => (req: Request, res: Response, next: NextFunction) =>
  req.user.roles.includes(role) ? next() : res.status(403).end();             // ${t("biết rồi, nhưng không được", "known, but not allowed")}

app.delete("/products/:id", auth, requireRole("admin"), deleteProduct);` },
            href: S401, label: "401 Unauthorized (MDN)",
          },
          {
            q: t("400 khác 422 thế nào?", "400 vs 422?"),
            a: t(
              "400 Bad Request: server không hiểu được request, ví dụ JSON hỏng, sai kiểu dữ liệu, thiếu tham số bắt buộc. 422 Unprocessable Content: request đúng cú pháp, server hiểu, nhưng dữ liệu vi phạm quy tắc nghiệp vụ, ví dụ số lượng âm, ngày giao hàng ở quá khứ. Nhiều team gộp cả hai thành 400 cho đơn giản; điều quan trọng là thống nhất trong toàn API và trả chi tiết lỗi từng trường.",
              "400 Bad Request: the server cannot understand the request, e.g. broken JSON, wrong types, a missing required field. 422 Unprocessable Content: the syntax is fine and understood, but the data breaks business rules, e.g. a negative quantity or a delivery date in the past. Many teams use 400 for both for simplicity; what matters is being consistent across the API and returning per-field details.",
            ),
            table: {
              head: [t("Request", "Request"), t("Mã", "Code"), t("Lý do", "Why")],
              rows: [
                ['{ "qty": 2, ', "400", t("JSON hỏng, không parse được", "Broken JSON, cannot parse")],
                ['{ "qty": "hai" }', "400", t("Sai kiểu dữ liệu", "Wrong type")],
                ['{ "qty": -3 }', "422", t("Đúng kiểu, sai nghiệp vụ", "Right type, breaks a rule")],
                ['{ "deliverAt": "2020-01-01" }', "422", t("Ngày giao ở quá khứ", "Delivery date in the past")],
              ],
            },
            href: S422, label: "422 Unprocessable Content (MDN)",
          },
          {
            q: t("409 Conflict dùng khi nào?", "When do you use 409 Conflict?"),
            a: t(
              "Khi request hợp lệ nhưng xung đột với trạng thái hiện tại của tài nguyên. Ví dụ: đăng ký email đã tồn tại, huỷ đơn đã giao, cập nhật bản ghi mà người khác vừa sửa (optimistic lock: version gửi lên không khớp version trong DB). Client thường phải tải lại dữ liệu mới rồi quyết định.",
              "When the request is valid but conflicts with the resource's current state. Examples: signing up with an existing email, cancelling a shipped order, updating a record someone else just changed (optimistic locking: the sent version does not match the DB). The client usually has to reload fresh data and decide.",
            ),
            code: { lang: "ts", src: `// ${t("Optimistic lock: chỉ cập nhật khi version còn khớp", "Optimistic lock: update only if the version still matches")}
const { rowCount } = await db.query(
  "UPDATE orders SET address = $1, version = version + 1 WHERE id = $2 AND version = $3",
  [address, id, version],
);
if (rowCount === 0) return res.status(409).json({ title: "Order was changed by someone else" });` },
            href: S409, label: "409 Conflict (MDN)",
          },
          {
            q: t("Muốn giấu tài nguyên của người khác thì trả 403 hay 404?", "To hide someone else's resource, 403 or 404?"),
            a: t(
              "Trả 404. Nếu user A gọi GET /orders/123 của user B mà nhận 403, A biết đơn 123 có tồn tại, và có thể dò ra số lượng đơn, ID hợp lệ. Trả 404 thì không lộ gì. GitHub làm vậy với repo private. 403 hợp lý khi việc tài nguyên tồn tại không phải bí mật, ví dụ trang admin.",
              "Return 404. If user A calls GET /orders/123 belonging to user B and gets 403, A learns order 123 exists and can probe order counts and valid IDs. A 404 reveals nothing. GitHub does this for private repos. 403 is fine when the resource's existence is not a secret, e.g. an admin page.",
            ),
            code: { lang: "ts", src: `const order = await orders.findOne({ id: req.params.id, userId: req.user.id });  // ${t("lọc theo chủ sở hữu", "filter by owner")}
if (!order) return res.status(404).end();   // ${t("không có hoặc không phải của bạn: như nhau", "missing or not yours: same answer")}` },
            href: STATUS, label: "HTTP response status codes (MDN)",
          },
          {
            q: t("429 Too Many Requests: client nên làm gì?", "429 Too Many Requests: what should the client do?"),
            a: t(
              "429 nghĩa là vượt rate limit. Server nên gửi kèm Retry-After (số giây hoặc thời điểm) để client biết khi nào thử lại. Client phải chờ đúng thời gian đó, không retry ngay (càng retry càng bị chặn). Nếu không có Retry-After thì dùng exponential backoff có jitter.",
              "429 means the rate limit was exceeded. The server should send Retry-After (seconds or a date) so the client knows when to try again. The client must wait that long rather than retry immediately (which only gets it blocked longer). Without Retry-After, use exponential backoff with jitter.",
            ),
            code: { lang: "http", src: `HTTP/1.1 429 Too Many Requests
Retry-After: 30
RateLimit-Limit: 100
RateLimit-Remaining: 0` },
            href: S429, label: "429 Too Many Requests (MDN)",
          },
          {
            q: t("Còn những mã 4xx nào hay gặp?", "Which other 4xx codes come up often?"),
            a: t(
              "Những mã dưới đây ít được hỏi riêng nhưng hay gặp khi debug.",
              "These are rarely asked on their own but show up often while debugging.",
            ),
            table: {
              head: [t("Mã", "Code"), t("Ý nghĩa", "Meaning"), t("Ví dụ", "Example")],
              rows: [
                ["404 Not Found", t("Không có tài nguyên", "No such resource"), "GET /products/999999"],
                ["405 Method Not Allowed", t("Sai method, kèm header Allow", "Wrong method, with an Allow header"), t("DELETE vào API chỉ hỗ trợ GET", "DELETE on a GET-only endpoint")],
                ["408 Request Timeout", t("Client gửi request quá chậm", "The client sent the request too slowly"), t("Mạng yếu, upload bị treo", "Slow network, stalled upload")],
                ["413 Content Too Large", t("Body vượt giới hạn", "Body over the limit"), t("Upload ảnh 50 MB khi giới hạn 10 MB", "50 MB image with a 10 MB limit")],
                ["415 Unsupported Media Type", t("Sai Content-Type", "Wrong Content-Type"), t("Gửi form-data vào API cần JSON", "form-data sent to a JSON API")],
              ],
            },
            href: STATUS, label: "HTTP response status codes (MDN)",
          },
        ],
      },
      {
        id: "hs-5xx",
        title: t("5xx: lỗi phía server", "5xx: server errors"),
        items: [
          {
            q: t("500, 502, 503 và 504 khác nhau thế nào?", "How do 500, 502, 503 and 504 differ?"),
            a: t(
              "Phân biệt bằng câu hỏi: ai trả mã đó. 500 do chính app của bạn trả khi code lỗi. 502 và 504 do gateway (Nginx, ALB, API Gateway) trả khi nói chuyện với app phía sau thất bại: 502 là app trả về thứ không hợp lệ hoặc đóng kết nối (app crash, sai port), 504 là app trả lời quá chậm, vượt timeout của gateway. 503 là \"tạm thời không phục vụ\": quá tải, đang deploy, đang bảo trì, hoặc không còn instance khỏe.",
              "Tell them apart by asking who returned it. 500 comes from your own app when the code fails. 502 and 504 come from the gateway (Nginx, ALB, API Gateway) when talking to the app behind it fails: 502 means the app returned something invalid or dropped the connection (crash, wrong port), 504 means the app answered too slowly, past the gateway's timeout. 503 means \"temporarily unavailable\": overloaded, deploying, in maintenance, or no healthy instances.",
            ),
            diagram: <Flow id="hs5xx" label="Who returns which 5xx" steps={[
              { title: "Client", sub: t("nhận mã", "gets the code") },
              { title: "Gateway / LB", sub: t("trả 502, 503, 504", "returns 502, 503, 504"), hl: true },
              { title: "App", sub: t("trả 500, 503", "returns 500, 503") },
              { title: "DB / service khác", sub: t("chậm hoặc chết", "slow or down") },
            ]} />,
            table: {
              head: [t("Mã", "Code"), t("Ai trả", "Returned by"), t("Nguyên nhân hay gặp", "Typical cause"), t("Xem ở đâu", "Where to look")],
              rows: [
                ["500", "App", t("Exception không bắt, bug, null", "Uncaught exception, bug, null"), t("Log và stack trace của app", "App logs and stack trace")],
                ["502", "Gateway", t("App crash, OOM, sai port, đóng kết nối", "App crashed, OOM, wrong port, closed connection"), t("Log gateway, trạng thái container", "Gateway logs, container status")],
                ["503", t("Gateway hoặc app", "Gateway or app"), t("Quá tải, đang deploy, health check fail hết", "Overloaded, deploying, all health checks failing"), t("Target group, autoscaling", "Target group, autoscaling")],
                ["504", "Gateway", t("App hoặc DB chậm, query nặng, vượt timeout", "Slow app or DB, heavy query, timeout exceeded"), t("Tracing, slow query log", "Tracing, slow query log")],
              ],
            },
            href: S502, label: "502 Bad Gateway (MDN)",
          },
          {
            q: t("Lỗi nào nên tự động retry?", "Which errors should be retried automatically?"),
            a: [
              t(
                "Retry khi lỗi có thể tự hết: 502, 503, 504, 429 (theo Retry-After), lỗi mạng, timeout. Không retry 4xx còn lại vì gửi lại y hệt vẫn sai. 500 thì tùy: thường là bug nên retry ít tác dụng, nhưng có thể do lỗi tạm thời như deadlock.",
                "Retry when the failure may go away: 502, 503, 504, 429 (honoring Retry-After), network errors, timeouts. Do not retry other 4xx; the same request fails again. 500 depends: usually a bug, so retries rarely help, but it can be transient like a deadlock.",
              ),
              t(
                "Điều kiện quan trọng: chỉ retry an toàn với request idempotent (GET, PUT, DELETE). POST tạo đơn hay trừ tiền mà retry có thể tạo hai đơn, nên phải gửi kèm Idempotency-Key để server nhận ra request trùng. Retry luôn kèm exponential backoff có jitter và giới hạn số lần.",
                "The key condition: retries are only safe for idempotent requests (GET, PUT, DELETE). Retrying a POST that creates an order or charges money can create two, so send an Idempotency-Key so the server can spot duplicates. Always retry with exponential backoff, jitter and a cap.",
              ),
            ],
            code: { lang: "ts", src: `const RETRYABLE = new Set([429, 502, 503, 504]);

async function call(url: string, init: RequestInit, attempts = 4) {
  for (let i = 0; ; i++) {
    const res = await fetch(url, init).catch(() => null);          // ${t("lỗi mạng", "network error")}
    if (res && !RETRYABLE.has(res.status)) return res;
    if (i === attempts - 1) throw new Error("gave up after " + attempts + " attempts");
    const retryAfter = Number(res?.headers.get("retry-after")) * 1000;
    const backoff = 2 ** i * 200 + Math.random() * 100;             // exponential + jitter
    await new Promise(r => setTimeout(r, retryAfter || backoff));
  }
}

// ${t("POST tạo đơn: kèm khoá để server bỏ qua request trùng", "POST creating an order: send a key so the server drops duplicates")}
await call("/orders", {
  method: "POST",
  headers: { "Idempotency-Key": crypto.randomUUID(), "Content-Type": "application/json" },
  body: JSON.stringify(order),
});` },
            href: IDEMPOTENT, label: "Idempotent (MDN)",
          },
        ],
      },
      {
        id: "hs-practice",
        title: t("Thiết kế API thực tế", "Real-world API design"),
        items: [
          {
            q: t("Body của response lỗi nên trông thế nào?", "What should an error response body look like?"),
            a: t(
              "Status code nói loại lỗi, body nói chi tiết. Nên dùng một định dạng thống nhất cho toàn API; chuẩn có sẵn là RFC 9457 (application/problem+json) với các trường type, title, status, detail, instance, cộng thêm trường riêng như errors cho từng field. Không trả stack trace hay câu SQL ra ngoài; ghi chúng vào log kèm request ID và trả request ID cho client để tra cứu.",
              "The status code says what kind of error; the body gives details. Use one format across the API; the standard one is RFC 9457 (application/problem+json) with type, title, status, detail, instance, plus custom fields such as per-field errors. Never return stack traces or SQL; log them with a request ID and return that ID so the client can report it.",
            ),
            code: { lang: "json", src: `HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json

{
  "type": "https://api.shop.vn/errors/validation",
  "title": "${t("Dữ liệu không hợp lệ", "Invalid data")}",
  "status": 422,
  "instance": "/orders",
  "requestId": "req_8f2a91",
  "errors": [
    { "field": "items[0].qty", "message": "${t("phải lớn hơn 0", "must be greater than 0")}" },
    { "field": "deliverAt", "message": "${t("không được ở quá khứ", "cannot be in the past")}" }
  ]
}` },
            href: PROBLEM, label: "RFC 9457: Problem Details for HTTP APIs",
          },
          {
            q: t("Bảng tra nhanh các mã hay dùng", "Quick reference of common codes"),
            a: t(
              "Gom lại các mã ở trên để ôn nhanh trước buổi phỏng vấn.",
              "All the codes above in one place for a last-minute review.",
            ),
            table: {
              head: [t("Mã", "Code"), t("Tên", "Name"), t("Dùng khi", "Use when")],
              rows: [
                ["101", "Switching Protocols", t("Nâng cấp lên WebSocket", "Upgrading to WebSocket")],
                ["200", "OK", t("Thành công, có dữ liệu", "Success with data")],
                ["201", "Created", t("POST tạo mới, kèm Location", "POST created, with Location")],
                ["202", "Accepted", t("Nhận rồi, xử lý sau", "Accepted, processed later")],
                ["204", "No Content", t("Thành công, không body", "Success, no body")],
                ["301 / 308", "Moved / Permanent Redirect", t("Đổi URL vĩnh viễn (308 giữ method)", "Permanent move (308 keeps the method)")],
                ["302 / 307", "Found / Temporary Redirect", t("Chuyển tạm (307 giữ method)", "Temporary move (307 keeps the method)")],
                ["304", "Not Modified", t("Dùng bản cache (ETag)", "Use the cached copy (ETag)")],
                ["400", "Bad Request", t("Request sai cú pháp, sai kiểu", "Malformed request, wrong types")],
                ["401", "Unauthorized", t("Chưa đăng nhập, token sai/hết hạn", "Not logged in, bad/expired token")],
                ["403", "Forbidden", t("Đăng nhập rồi nhưng không có quyền", "Logged in but not allowed")],
                ["404", "Not Found", t("Không có, hoặc giấu tài nguyên", "Missing, or hiding the resource")],
                ["409", "Conflict", t("Xung đột trạng thái, trùng dữ liệu", "State conflict, duplicate data")],
                ["422", "Unprocessable Content", t("Sai quy tắc nghiệp vụ", "Breaks business rules")],
                ["429", "Too Many Requests", t("Vượt rate limit, xem Retry-After", "Rate limited, see Retry-After")],
                ["500", "Internal Server Error", t("Bug trong app", "A bug in the app")],
                ["502", "Bad Gateway", t("App sau gateway crash / trả lỗi", "App behind the gateway crashed / misbehaved")],
                ["503", "Service Unavailable", t("Quá tải, deploy, bảo trì", "Overloaded, deploying, maintenance")],
                ["504", "Gateway Timeout", t("App sau gateway quá chậm", "App behind the gateway too slow")],
              ],
            },
            href: STATUS, label: "HTTP response status codes (MDN)",
          },
        ],
      },
    ],
  };
}
