import { AnimFlow } from "@/components/AnimFlow";
import { Flow } from "@/components/Flow";
import type { InterviewData } from "@/components/InterviewList";
import type { Locale } from "@/lib/notebook";

const HOW_WEB = "https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work";
const HTTP_CACHE = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching";
const HSTS = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security";
const DNS = "https://developer.mozilla.org/en-US/docs/Glossary/DNS";
const TLS = "https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security";
const CRP = "https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path";
const CDN = "https://developer.mozilla.org/en-US/docs/Glossary/CDN";

export default function build(l: Locale): InterviewData {
  const t = (vi: string, en: string) => (l === "vi" ? vi : en);
  return {
    eyebrow: t("phỏng vấn · trình duyệt, mạng", "interview · browser, network"),
    title: t("Gõ URL vào trình duyệt thì chuyện gì xảy ra?", "What happens when you type a URL into the browser?"),
    lede: t(
      "Câu hỏi kinh điển để kiểm tra hiểu biết cả FE lẫn BE. Đi lần lượt từng chặng: cache, DNS, kết nối TCP/TLS, request qua CDN và server, rồi trình duyệt vẽ trang. Ví dụ dùng https://shop.vn/products.",
      "A classic question that tests both frontend and backend knowledge. Walk through each leg: caches, DNS, the TCP/TLS connection, the request through CDN and servers, then rendering. The example is https://shop.vn/products.",
    ),
    sections: [
      {
        id: "bf-overview",
        title: t("Toàn cảnh", "The big picture"),
        items: [
          {
            q: t("Gõ shop.vn/products rồi Enter: tóm tắt toàn bộ luồng?", "Type shop.vn/products and press Enter: summarize the whole flow"),
            a: [
              t(
                "Trả lời theo khung 5 chặng, sau đó người phỏng vấn sẽ đào sâu chặng nào họ quan tâm: (1) trình duyệt xử lý URL và tìm trong cache; (2) DNS đổi tên miền thành IP; (3) mở kết nối TCP và bắt tay TLS; (4) gửi HTTP request, đi qua CDN, load balancer tới app server, app đọc cache/DB rồi trả response; (5) trình duyệt parse HTML, tải CSS/JS, dựng DOM, layout, paint ra màn hình.",
                "Answer with a 5-leg frame, then the interviewer drills into whichever leg they care about: (1) the browser parses the URL and checks caches; (2) DNS turns the name into an IP; (3) open a TCP connection and do the TLS handshake; (4) send the HTTP request through CDN and load balancer to the app server, which reads cache/DB and responds; (5) the browser parses HTML, fetches CSS/JS, builds the DOM, lays out and paints.",
              ),
              t(
                "Mỗi chặng đều có thể bị bỏ qua nhờ cache: có bản cache còn hạn thì không cần mạng; DNS đã cache thì không phải hỏi lại; kết nối cũ còn mở (keep-alive) thì không bắt tay lại. Vì vậy lần vào thứ hai thường nhanh hơn hẳn lần đầu.",
                "Every leg can be skipped thanks to caching: a fresh cached copy needs no network; a cached DNS answer needs no lookup; a kept-alive connection needs no new handshake. That is why the second visit is usually much faster than the first.",
              ),
            ],
            diagram: <AnimFlow label={t("Luồng khi gõ một URL", "Flow after typing a URL")} step={0.9} steps={[
              { title: t("Xử lý URL", "Parse URL"), sub: t("thêm https://, kiểm HSTS", "add https://, check HSTS") },
              { title: t("Tìm cache", "Check caches"), sub: "service worker, memory, disk" },
              { title: "DNS", sub: t("shop.vn → 203.0.113.10", "shop.vn → 203.0.113.10") },
              { title: "TCP", sub: "SYN, SYN-ACK, ACK" },
              { title: "TLS", sub: t("kiểm chứng chỉ, tạo khoá", "verify cert, agree keys") },
              { title: "HTTP request", sub: "GET /products" },
              { title: "CDN / Load balancer", sub: t("trả cache hoặc chuyển tiếp", "serve cache or forward") },
              { title: "App server", sub: t("Redis, DB, tạo response", "Redis, DB, build response") },
              { title: "Response", sub: "200 OK + HTML" },
              { title: "Render", sub: "DOM, CSSOM, layout, paint" },
            ]} caption={t("Mỗi bước sáng lần lượt theo đúng thứ tự xảy ra.", "Each step lights up in the order it happens.")} />,
            table: {
              head: [t("Chặng", "Leg"), t("Việc chính", "Main work"), t("Thời gian điển hình", "Typical time")],
              rows: [
                [t("1. Cache", "1. Cache"), t("Tìm bản lưu sẵn, nếu còn hạn thì dùng luôn", "Look for a stored copy; use it if fresh"), "0–5 ms"],
                ["2. DNS", t("Tên miền → IP", "Name → IP"), t("0 ms (cache) – 100 ms", "0 ms (cached) – 100 ms")],
                ["3. TCP + TLS", t("Mở kết nối an toàn", "Open a secure connection"), t("1–2 vòng RTT", "1–2 round trips")],
                [t("4. Request", "4. Request"), t("CDN, LB, app, DB", "CDN, LB, app, DB"), "20–500 ms"],
                [t("5. Render", "5. Render"), t("Parse, tải tài nguyên, vẽ", "Parse, fetch assets, paint"), "100 ms – 2 s"],
              ],
            },
            href: HOW_WEB, label: "How browsers work (MDN)",
          },
        ],
      },
      {
        id: "bf-cache",
        title: t("Chặng 1: URL và cache", "Leg 1: URL and caches"),
        items: [
          {
            q: t("Trước khi ra mạng, trình duyệt kiểm tra những gì?", "What does the browser check before touching the network?"),
            a: [
              t(
                "Đầu tiên trình duyệt quyết định chuỗi gõ vào là URL hay từ khoá tìm kiếm. Là URL thì chuẩn hoá: thêm https://, mã hoá ký tự đặc biệt, đổi tên miền tiếng Việt có dấu sang punycode. Nếu tên miền nằm trong danh sách HSTS (đã từng trả header Strict-Transport-Security, hoặc có sẵn trong preload list) thì luôn dùng HTTPS, không bao giờ thử HTTP.",
                "First the browser decides whether the text is a URL or a search query. For a URL it normalizes it: adds https://, encodes special characters, converts internationalized names to punycode. If the domain is on the HSTS list (it sent Strict-Transport-Security before, or is in the preload list) the browser always uses HTTPS and never tries HTTP.",
              ),
              t(
                "Sau đó tìm bản lưu theo thứ tự: service worker (nếu trang đăng ký, nó chặn được mọi request), memory cache (tab đang mở), disk cache (HTTP cache). Bản cache còn hạn theo Cache-Control: max-age thì dùng luôn, không ra mạng. Hết hạn nhưng có ETag thì gửi request có điều kiện, server trả 304 nếu chưa đổi.",
                "Then it looks for stored copies in order: a service worker (if the site registered one, it can intercept every request), the memory cache (open tabs), the disk cache (HTTP cache). A copy still fresh per Cache-Control: max-age is used with no network at all. A stale copy with an ETag triggers a conditional request; the server answers 304 if nothing changed.",
              ),
            ],
            diagram: <Flow id="bfcache" label={t("Thứ tự tìm cache", "Cache lookup order")} steps={[
              { title: "Service worker", sub: t("nếu có đăng ký", "if registered") },
              { title: "Memory cache", sub: t("trong tab", "in the tab") },
              { title: "Disk cache", sub: "Cache-Control, ETag", hl: true },
              { title: t("Ra mạng", "Network"), sub: t("không có hoặc hết hạn", "missing or stale") },
            ]} />,
            code: { lang: "http", src: `HTTP/1.1 200 OK
Cache-Control: public, max-age=31536000, immutable   ${t("← file tĩnh có hash: cache 1 năm", "← hashed static file: cache 1 year")}
ETag: "a1b2c3"
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` },
            href: HTTP_CACHE, label: "HTTP caching (MDN)",
          },
        ],
      },
      {
        id: "bf-dns",
        title: t("Chặng 2: DNS", "Leg 2: DNS"),
        items: [
          {
            q: t("DNS phân giải shop.vn thành IP như thế nào?", "How does DNS resolve shop.vn to an IP?"),
            a: [
              t(
                "DNS chỉ cần khi thật sự phải gửi request ra mạng: nếu HTTP cache (chặng 1) đã có bản còn hạn thì bỏ qua DNS luôn. Khi cần phân giải, máy tìm trong cache từ gần đến xa và dừng ở tầng đầu tiên có câu trả lời còn hạn: DNS cache của trình duyệt → DNS cache của hệ điều hành (Windows nạp sẵn file hosts vào đây, nên hosts được ưu tiên) → cache trên router.",
                "DNS is only needed when a request really has to go out: if the HTTP cache (leg 1) has a fresh copy, DNS is skipped entirely. When a lookup is needed, the machine checks caches from nearest to farthest and stops at the first fresh answer: the browser's DNS cache → the OS DNS cache (Windows preloads the hosts file into it, so hosts wins) → the router's cache.",
              ),
              t(
                "Không tầng nào có thì mới ra internet: gửi tới recursive resolver (của nhà mạng, hoặc 8.8.8.8, 1.1.1.1). Resolver chưa biết thì đi hỏi lần lượt: root server chỉ tới máy chủ của .vn (TLD), TLD chỉ tới authoritative name server của shop.vn, và authoritative trả về bản ghi A (IPv4) hoặc AAAA (IPv6).",
                "Only when every cache misses does it go to the internet: a recursive resolver (the ISP's, or 8.8.8.8, 1.1.1.1). If the resolver does not know either, it walks the tree: a root server points to the .vn TLD servers, the TLD points to shop.vn's authoritative name server, which returns an A (IPv4) or AAAA (IPv6) record.",
              ),
              t(
                "Mỗi câu trả lời có TTL (thời gian sống), các tầng cache giữ đúng TTL đó. Vì vậy đổi IP server thì phải chờ TTL cũ hết mới có hiệu lực ở mọi nơi; trước khi chuyển server nên hạ TTL xuống thấp (60–300 giây).",
                "Every answer carries a TTL, and each cache keeps it for that long. So changing a server's IP only takes effect everywhere after the old TTL expires; lower the TTL (60–300 seconds) ahead of a migration.",
              ),
            ],
            diagram: <>
              <Flow id="bfdnslocal" label={t("Các tầng cache DNS trên máy", "DNS caches on the machine")} steps={[
                { title: t("Trình duyệt", "Browser"), sub: t("DNS cache riêng", "its own DNS cache") },
                { title: t("Windows", "Windows / OS"), sub: t("DNS cache + hosts", "DNS cache + hosts"), hl: true },
                { title: "Router", sub: t("cache trong mạng", "LAN cache") },
                { title: t("Ra internet", "Internet"), sub: t("chỉ khi đều trượt", "only on a full miss") },
              ]} caption={t("Trên máy: dừng ở tầng đầu tiên có câu trả lời còn hạn.", "On the machine: stop at the first fresh answer.")} />
              <Flow id="bfdns" label={t("Resolver phân giải", "Resolver lookup")} steps={[
                { title: "Resolver", sub: "ISP / 8.8.8.8", hl: true },
                { title: "Root", sub: t("hỏi .vn ở đâu", "where is .vn") },
                { title: "TLD .vn", sub: t("hỏi shop.vn ở đâu", "where is shop.vn") },
                { title: "Authoritative", sub: "A 203.0.113.10" },
              ]} caption={t("Ngoài internet: resolver đi hỏi thay bạn và cache kết quả theo TTL.", "On the internet: the resolver does the walking and caches answers per TTL.")} />
            </>,
            table: {
              head: [t("Tầng cache", "Cache layer"), t("Xem", "Inspect"), t("Xoá", "Clear")],
              rows: [
                [t("DNS cache của Chrome / Edge", "Chrome / Edge DNS cache"), "chrome://net-internals/#dns", t("Nút Clear host cache ở trang đó", "The Clear host cache button there")],
                [t("DNS cache của Windows", "Windows DNS cache"), "ipconfig /displaydns", "ipconfig /flushdns"],
                [t("File hosts", "hosts file"), "C:\\Windows\\System32\\drivers\\etc\\hosts", t("Sửa file (cần quyền admin)", "Edit the file (admin rights)")],
                ["macOS / Linux", "scutil --dns / resolvectl statistics", "sudo dscacheutil -flushcache / resolvectl flush-caches"],
              ],
            },
            note: t(
              "Đổi IP server rồi mà máy vẫn vào server cũ: thường do một tầng cache còn giữ bản ghi cũ chưa hết TTL. Chạy ipconfig /flushdns và xoá host cache của trình duyệt. Khi dev có thể ghi 127.0.0.1 shop.local vào file hosts để trỏ tên miền về máy mình.",
              "Changed the server IP but still reaching the old one: some cache layer still holds the old record until its TTL ends. Run ipconfig /flushdns and clear the browser's host cache. For local development, add 127.0.0.1 shop.local to the hosts file to point a name at your machine.",
            ),
            code: { lang: "bash", src: `$ dig shop.vn +noall +answer
shop.vn.   300   IN   A   203.0.113.10      # TTL 300s

$ dig shop.vn +trace     # ${t("xem từng bước root → .vn → authoritative", "see each hop root → .vn → authoritative")}` },
            href: DNS, label: "DNS (MDN)",
          },
          {
            q: t("Có hàng nghìn đuôi .com, .org, .vn... thì DNS biết hỏi ai?", "There are thousands of endings like .com, .org, .vn: how does DNS know whom to ask?"),
            a: [
              t(
                "DNS là một cây phân cấp, và tên miền được đọc từ phải sang trái. www.shop.com.vn thật ra là www.shop.com.vn. (có dấu chấm cuối là gốc). Gốc (root) biết máy chủ của mọi đuôi cấp cao (TLD); máy chủ TLD biết máy chủ của mọi tên miền đăng ký dưới nó; máy chủ của tên miền (authoritative) giữ bản ghi thật. Không ai phải biết hết mọi thứ, mỗi tầng chỉ biết tầng ngay dưới nó: đó là ủy quyền (delegation).",
                "DNS is a hierarchy, and names are read right to left. www.shop.com.vn is really www.shop.com.vn. (the trailing dot is the root). The root knows the servers of every top-level domain (TLD); a TLD's servers know the servers of every domain registered under it; the domain's own (authoritative) servers hold the real records. Nobody knows everything; each level only knows the level directly below it. That is delegation.",
              ),
              t(
                "Root có 13 tên (a.root-servers.net tới m.root-servers.net) nhưng thực tế là hơn 1.000 máy đặt khắp thế giới dùng chung IP (anycast), nên luôn có một máy gần bạn. Mỗi TLD do một tổ chức quản lý (registry): .com và .net do Verisign, .org do PIR, .vn do VNNIC. Khi bạn mua shop.vn qua nhà đăng ký (registrar), việc khai báo name server (ví dụ của Cloudflare) chính là ghi vào máy chủ của .vn rằng \"hỏi shop.vn thì đến đây\".",
                "The root has 13 names (a.root-servers.net to m.root-servers.net) but is really over 1,000 machines worldwide sharing those IPs (anycast), so one is always nearby. Each TLD is run by an organization (a registry): Verisign runs .com and .net, PIR runs .org, VNNIC runs .vn. When you buy shop.vn through a registrar, setting its name servers (say, Cloudflare's) writes into the .vn servers that \"for shop.vn, ask here\".",
              ),
              t(
                "Thực tế resolver hiếm khi phải hỏi root: danh sách máy chủ của .com, .vn được cache rất lâu (TTL thường 2 ngày). Nên đa số lần phân giải chỉ cần hỏi máy chủ TLD và authoritative, thậm chí chỉ authoritative nếu đã cache cả TLD.",
                "In practice the resolver rarely asks the root: the server lists for .com or .vn are cached for a long time (TTL often 2 days). Most lookups only hit the TLD and authoritative servers, or just the authoritative one if the TLD answer is cached too.",
              ),
            ],
            diagram: <Flow id="bftree" label={t("Đọc tên miền từ phải sang trái", "Reading a name right to left")} steps={[
              { title: t(". (root)", ". (root)"), sub: t("biết mọi TLD", "knows every TLD") },
              { title: ".vn", sub: t("TLD, VNNIC quản lý", "TLD, run by VNNIC") },
              { title: ".com.vn", sub: t("vùng con của .vn", "a zone under .vn") },
              { title: "shop.com.vn", sub: t("authoritative của bạn", "your authoritative"), hl: true },
              { title: "www.shop.com.vn", sub: "A 203.0.113.10" },
            ]} caption={t("Mỗi tầng chỉ trả lời: \"tầng dưới nằm ở máy chủ này, đi hỏi tiếp\".", "Each level only answers: \"the next level lives on this server, go ask there\".")} />,
            table: {
              head: [t("Loại", "Kind"), t("Ví dụ", "Examples"), t("Ai quản lý", "Run by")],
              rows: [
                [t("Root", "Root"), ". (13 tên a–m.root-servers.net)", t("ICANN/IANA và 12 tổ chức vận hành", "ICANN/IANA and 12 operators")],
                [t("gTLD (chung)", "gTLD (generic)"), ".com, .net, .org, .info", t("Verisign (.com, .net), PIR (.org)...", "Verisign (.com, .net), PIR (.org)...")],
                [t("ccTLD (quốc gia)", "ccTLD (country)"), ".vn, .jp, .uk, .io", t("Cơ quan từng nước: VNNIC cho .vn", "Each country's registry: VNNIC for .vn")],
                [t("gTLD mới", "New gTLD"), ".shop, .app, .dev, .xyz", t("Công ty đấu giá được đuôi đó (.app, .dev của Google)", "Whoever won the ending (.app, .dev by Google)")],
                [t("Tên miền cấp 2, 3", "2nd/3rd-level domain"), "shop.vn, shop.com.vn, api.shop.vn", t("Chủ tên miền, khai báo name server qua registrar", "The owner, via name servers set at the registrar")],
              ],
            },
            code: { lang: "bash", src: `$ dig www.shop.vn +trace
.                 518400  IN  NS  a.root-servers.net.     # ${t("1. hỏi root", "1. ask the root")}
vn.               172800  IN  NS  a.dns-servers.vn.       # ${t("2. root: hỏi .vn ở đây (TTL 2 ngày)", "2. root: ask .vn here (TTL 2 days)")}
shop.vn.          3600    IN  NS  ns1.cloudflare.com.     # ${t("3. .vn: hỏi shop.vn ở Cloudflare", "3. .vn: ask Cloudflare for shop.vn")}
www.shop.vn.      300     IN  A   203.0.113.10            # ${t("4. authoritative: đây là IP", "4. authoritative: here is the IP")}` },
            href: DNS, label: "DNS (MDN)",
          },
        ],
      },
      {
        id: "bf-conn",
        title: t("Chặng 3: kết nối TCP và TLS", "Leg 3: TCP and TLS"),
        items: [
          {
            q: t("Có IP rồi, trình duyệt mở kết nối thế nào? TCP và TLS handshake là gì?", "With the IP, how does the browser connect? What are the TCP and TLS handshakes?"),
            a: [
              t(
                "TCP bắt tay 3 bước tới cổng 443: client gửi SYN, server trả SYN-ACK, client gửi ACK. Mất 1 vòng đi về (RTT). Sau đó TLS 1.3 bắt tay thêm 1 RTT: client gửi ClientHello (phiên bản, thuật toán, khoá tạm, tên miền qua SNI); server trả ServerHello kèm chứng chỉ; trình duyệt kiểm chứng chỉ (đúng tên miền, còn hạn, được CA tin cậy ký) rồi hai bên tính ra khoá phiên chung để mã hoá dữ liệu.",
                "TCP does a 3-way handshake to port 443: the client sends SYN, the server replies SYN-ACK, the client sends ACK. That costs one round trip (RTT). TLS 1.3 then adds one more RTT: the client sends ClientHello (versions, ciphers, a key share, the domain via SNI); the server answers ServerHello with its certificate; the browser verifies the certificate (right domain, not expired, signed by a trusted CA) and both sides derive a shared session key to encrypt traffic.",
              ),
              t(
                "HTTP/3 chạy trên QUIC (UDP), gộp bắt tay vận chuyển và TLS làm một, chỉ mất 1 RTT, kết nối lại còn có thể 0-RTT. Kết nối được giữ mở (keep-alive) để các request sau dùng lại, khỏi bắt tay lần nữa.",
                "HTTP/3 runs on QUIC (UDP) and merges the transport and TLS handshakes into one RTT, with 0-RTT possible on reconnects. Connections are kept alive so later requests reuse them without another handshake.",
              ),
            ],
            diagram: <Flow id="bftls" label={t("TCP và TLS handshake", "TCP and TLS handshakes")} steps={[
              { title: "SYN →", sub: "TCP" },
              { title: "← SYN-ACK", sub: "TCP" },
              { title: "ClientHello →", sub: "ACK + TLS 1.3" },
              { title: "← ServerHello", sub: t("+ chứng chỉ, kiểm tra", "+ cert, verified"), hl: true },
              { title: "GET →", sub: t("đã mã hoá", "encrypted") },
            ]} caption={t("HTTPS lần đầu mất khoảng 2 RTT trước khi gửi được request; với HTTP/3 chỉ còn 1.", "A first HTTPS visit costs about 2 RTTs before the request can go; HTTP/3 cuts it to 1.")} />,
            table: {
              head: [t("Giao thức", "Protocol"), t("Vận chuyển", "Transport"), t("RTT trước request đầu", "RTTs before first request"), t("Điểm chính", "Key point")],
              rows: [
                ["HTTP/1.1 + TLS 1.2", "TCP", "3", t("Mỗi kết nối xử lý một request tại một thời điểm", "One request at a time per connection")],
                ["HTTP/2 + TLS 1.3", "TCP", "2", t("Nhiều request song song trên một kết nối (multiplexing)", "Many parallel requests on one connection (multiplexing)")],
                ["HTTP/3", "QUIC (UDP)", t("1 (0 khi kết nối lại)", "1 (0 on resume)"), t("Mất gói không chặn cả kết nối", "Packet loss does not stall the whole connection")],
              ],
            },
            href: TLS, label: "Transport Layer Security (MDN)",
          },
          {
            q: t("HTTP/1.1, HTTP/2 và HTTP/3 khác nhau thế nào?", "How do HTTP/1.1, HTTP/2 and HTTP/3 differ?"),
            a: t(
              "Ngữ nghĩa giữ nguyên qua cả ba đời: vẫn GET/POST, header, status code, nên code backend gần như không phải đổi. Cái thay đổi là cách đóng gói và chở dữ liệu trên đường truyền. Mỗi đời sinh ra để sửa điểm nghẽn lớn nhất của đời trước:",
              "The semantics stay the same across all three: GET/POST, headers, status codes, so backend code barely changes. What changes is how data is framed and carried on the wire. Each version exists to fix the biggest bottleneck of the previous one:",
            ),
            points: [
              {
                title: "HTTP/1.1 (1997)",
                body: t(
                  "dạng văn bản, mỗi kết nối TCP chỉ xử lý một request tại một thời điểm: request sau phải chờ response trước xong (head-of-line blocking ở tầng HTTP). Trình duyệt phải mở tới 6 kết nối mỗi tên miền để tải song song. Header gửi lặp nguyên văn ở mọi request (cookie, user-agent).",
                  "text-based; each TCP connection handles one request at a time, so the next request waits for the previous response (HTTP-level head-of-line blocking). Browsers open up to 6 connections per domain to download in parallel. Headers are resent verbatim on every request (cookies, user agent).",
                ),
                subTitle: t("Mẹo thời HTTP/1.1 (nay không cần)", "HTTP/1.1-era hacks (no longer needed)"),
                sub: [
                  t("Gộp file JS/CSS thành bundle lớn, ghép ảnh thành sprite", "Concatenate JS/CSS into big bundles, combine images into sprites"),
                  t("Chia tài nguyên ra nhiều tên miền (domain sharding) để vượt giới hạn 6 kết nối", "Spread assets across domains (domain sharding) to beat the 6-connection limit"),
                ],
              },
              {
                title: "HTTP/2 (2015)",
                body: t(
                  "nhị phân, chia dữ liệu thành frame và chạy nhiều request song song trên một kết nối TCP (multiplexing), hết cảnh request xếp hàng. Header được nén bằng HPACK (chỉ gửi phần thay đổi). Có độ ưu tiên stream. Trình duyệt chỉ hỗ trợ HTTP/2 qua HTTPS.",
                  "binary; data is split into frames and many requests run in parallel over one TCP connection (multiplexing), so requests no longer queue. Headers are compressed with HPACK (only changes are sent). Streams can be prioritized. Browsers only support HTTP/2 over HTTPS.",
                ),
                subTitle: t("Hạn chế còn lại", "Remaining limitation"),
                sub: [
                  t("Vẫn chạy trên TCP: mất một gói tin thì TCP dừng giao mọi stream cho tới khi gửi lại xong (head-of-line blocking ở tầng TCP), mạng chập chờn (4G, wifi yếu) còn có thể chậm hơn HTTP/1.1", "Still on TCP: one lost packet stalls every stream until it is retransmitted (TCP-level head-of-line blocking); on flaky networks (4G, weak wifi) it can be slower than HTTP/1.1"),
                  t("Server push được đưa ra rồi bị bỏ (Chrome đã gỡ) vì ít hiệu quả", "Server push was introduced and then dropped (Chrome removed it) as it rarely helped"),
                ],
              },
              {
                title: "HTTP/3 (2022)",
                body: t(
                  "bỏ TCP, chạy trên QUIC (xây trên UDP). Mỗi stream độc lập: mất gói của stream này không chặn stream khác. TLS 1.3 nằm sẵn trong QUIC nên bắt tay chỉ mất 1 RTT, kết nối lại có thể 0-RTT. Kết nối gắn với connection ID chứ không gắn với IP, nên chuyển từ wifi sang 4G không bị đứt. Header nén bằng QPACK.",
                  "drops TCP and runs on QUIC (built on UDP). Streams are independent: a lost packet on one does not stall the others. TLS 1.3 is built into QUIC, so the handshake takes 1 RTT and reconnects can be 0-RTT. Connections are tied to a connection ID, not the IP, so switching from wifi to 4G does not drop them. Headers use QPACK.",
                ),
                subTitle: t("Lưu ý khi dùng", "Things to know"),
                sub: [
                  t("Một số mạng công ty, firewall chặn UDP 443; trình duyệt tự lùi về HTTP/2", "Some corporate networks and firewalls block UDP 443; browsers fall back to HTTP/2"),
                  t("Trình duyệt biết server hỗ trợ HTTP/3 qua header Alt-Svc hoặc bản ghi DNS HTTPS, nên lần đầu thường vẫn đi HTTP/2", "Browsers learn about HTTP/3 support via the Alt-Svc header or an HTTPS DNS record, so the first visit usually still uses HTTP/2"),
                  t("Thường bật ở CDN hoặc load balancer (Cloudflare, CloudFront, Nginx mới); app phía sau vẫn nói HTTP/1.1 hoặc HTTP/2", "Usually enabled at the CDN or load balancer (Cloudflare, CloudFront, recent Nginx); the app behind still speaks HTTP/1.1 or HTTP/2"),
                ],
              },
            ],
            diagram: <Flow id="bfhttpv" label={t("Các tầng giao thức của từng phiên bản", "Protocol stack per version")} steps={[
              { title: "HTTP/1.1", sub: "text · TLS · TCP" },
              { title: "HTTP/2", sub: "binary · TLS · TCP" },
              { title: "HTTP/3", sub: "QUIC (TLS 1.3) · UDP", hl: true },
            ]} caption={t("Càng về sau càng ít vòng bắt tay và ít bị một gói tin mất làm nghẽn cả kết nối.", "Each step needs fewer handshakes and suffers less when a single packet is lost.")} />,
            table: {
              head: ["", "HTTP/1.1", "HTTP/2", "HTTP/3"],
              rows: [
                [t("Năm", "Year"), "1997", "2015", "2022"],
                [t("Vận chuyển", "Transport"), "TCP", "TCP", "QUIC (UDP)"],
                [t("Định dạng", "Format"), t("Văn bản", "Text"), t("Nhị phân (frame)", "Binary (frames)"), t("Nhị phân (frame)", "Binary (frames)")],
                [t("Song song", "Concurrency"), t("1 request/kết nối, ~6 kết nối/tên miền", "1 request per connection, ~6 per domain"), t("Nhiều stream trên 1 kết nối", "Many streams on 1 connection"), t("Nhiều stream độc lập", "Many independent streams")],
                ["Head-of-line blocking", t("Có, tầng HTTP", "Yes, HTTP level"), t("Còn, tầng TCP", "Still, TCP level"), t("Không", "No")],
                [t("Nén header", "Header compression"), t("Không", "None"), "HPACK", "QPACK"],
                [t("Bắt tay trước request đầu", "Handshake before first request"), t("TCP + TLS: 2–3 RTT", "TCP + TLS: 2–3 RTT"), t("TCP + TLS 1.3: 2 RTT", "TCP + TLS 1.3: 2 RTT"), t("1 RTT, kết nối lại 0-RTT", "1 RTT, 0-RTT on resume")],
                [t("Đổi mạng (wifi → 4G)", "Network switch (wifi → 4G)"), t("Đứt, kết nối lại", "Drops, reconnect"), t("Đứt, kết nối lại", "Drops, reconnect"), t("Giữ được (connection ID)", "Survives (connection ID)")],
              ],
            },
            code: { lang: "bash", src: `# ${t("Xem server hỗ trợ phiên bản nào", "See which versions a server supports")}
$ curl -sI --http2 https://shop.vn | head -1
HTTP/2 200

$ curl -sI https://shop.vn | grep -i alt-svc
alt-svc: h3=":443"; ma=86400        # ${t("báo trình duyệt: có HTTP/3 ở cổng 443", "tells browsers: HTTP/3 is on port 443")}

# ${t("Trong DevTools: tab Network → bật cột Protocol (h2, h3)", "In DevTools: Network tab → enable the Protocol column (h2, h3)")}` },
            href: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP", label: "Evolution of HTTP (MDN)",
          },
        ],
      },
      {
        id: "bf-server",
        title: t("Chặng 4: request tới server", "Leg 4: the request reaches the server"),
        items: [
          {
            q: t("Request GET /products đi qua những đâu phía server?", "Where does GET /products travel on the server side?"),
            a: [
              t(
                "Request thường gặp CDN đầu tiên (CloudFront, Cloudflare): file tĩnh và trang cache được trả luôn từ điểm gần người dùng. Không có thì CDN chuyển về origin: load balancer chia tải sang một trong các instance khỏe; reverse proxy (Nginx) lo TLS, nén, giới hạn tốc độ; app server (Node, Go) chạy middleware (log, auth), gọi handler; handler đọc Redis trước, không có mới query DB, rồi tạo response.",
                "The request usually meets a CDN first (CloudFront, Cloudflare): static files and cached pages are served from a location near the user. On a miss the CDN goes to the origin: a load balancer picks a healthy instance; a reverse proxy (Nginx) handles TLS, compression and rate limits; the app server (Node, Go) runs middleware (logging, auth) and the handler; the handler checks Redis first, queries the DB on a miss, and builds the response.",
              ),
              t(
                "Response mang status code (200, 304, 404, 500...), header (Content-Type, Cache-Control, Set-Cookie) và body HTML hoặc JSON, được nén gzip hoặc brotli. Lỗi giữa đường có mã riêng: gateway không gọi được app thì 502, app quá chậm thì 504 (xem trang HTTP status code).",
                "The response carries a status code (200, 304, 404, 500...), headers (Content-Type, Cache-Control, Set-Cookie) and an HTML or JSON body, compressed with gzip or brotli. Failures along the way have their own codes: the gateway cannot reach the app gives 502, a slow app gives 504 (see the HTTP status code page).",
              ),
            ],
            diagram: <Flow id="bfserver" label={t("Đường đi phía server", "Server-side path")} steps={[
              { title: "CDN", sub: t("cache gần người dùng", "edge cache") },
              { title: "Load balancer", sub: t("chọn instance khỏe", "pick a healthy instance") },
              { title: "Nginx", sub: t("TLS, nén, rate limit", "TLS, gzip, rate limit") },
              { title: "App server", sub: t("middleware, handler", "middleware, handler"), hl: true },
              { title: "Redis / DB", sub: t("cache trước, DB sau", "cache first, DB second") },
            ]} />,
            code: { lang: "http", src: `GET /products HTTP/2
Host: shop.vn
Accept: text/html
Accept-Encoding: br, gzip
Cookie: session=abc123

HTTP/2 200
Content-Type: text/html; charset=utf-8
Content-Encoding: br
Cache-Control: private, max-age=0, must-revalidate
X-Cache: Miss from cloudfront` },
            href: CDN, label: "CDN (MDN)",
          },
        ],
      },
      {
        id: "bf-render",
        title: t("Chặng 5: trình duyệt vẽ trang", "Leg 5: the browser renders"),
        items: [
          {
            q: t("Nhận HTML rồi, trình duyệt vẽ trang ra màn hình thế nào?", "Once HTML arrives, how does the browser paint the page?"),
            a: [
              t(
                "Đây là critical rendering path: parse HTML thành DOM; gặp <link> CSS thì tải và parse thành CSSOM; ghép DOM với CSSOM thành render tree (chỉ phần tử hiển thị); layout tính vị trí và kích thước từng phần tử; paint tô màu chữ, nền, viền thành các lớp; composite ghép các lớp bằng GPU ra màn hình.",
                "This is the critical rendering path: parse HTML into the DOM; a CSS <link> is fetched and parsed into the CSSOM; DOM and CSSOM combine into the render tree (visible elements only); layout computes each element's position and size; paint fills text, backgrounds and borders into layers; composite merges the layers on the GPU onto the screen.",
              ),
              t(
                "CSS chặn render (chưa có CSSOM thì chưa vẽ). <script> thường chặn cả parse HTML vì JS có thể sửa DOM; dùng defer (chạy sau khi parse xong, đúng thứ tự) hoặc async (chạy ngay khi tải xong) để không chặn. Sau đó JS chạy, gọi thêm API, và mỗi lần đổi DOM hay style có thể kích hoạt lại layout (reflow) và paint.",
                "CSS blocks rendering (no painting without the CSSOM). A plain <script> blocks HTML parsing because JS may change the DOM; use defer (runs after parsing, in order) or async (runs as soon as loaded) to avoid it. Then JS runs, calls more APIs, and every DOM or style change may trigger layout (reflow) and paint again.",
              ),
            ],
            diagram: <Flow id="bfrender" label="Critical rendering path" steps={[
              { title: "HTML → DOM", sub: "parse" },
              { title: "CSS → CSSOM", sub: t("chặn render", "render-blocking") },
              { title: "Render tree", sub: t("phần hiển thị", "visible nodes") },
              { title: "Layout", sub: t("vị trí, kích thước", "position, size"), hl: true },
              { title: "Paint", sub: t("tô màu thành lớp", "fill layers") },
              { title: "Composite", sub: "GPU" },
            ]} />,
            code: { lang: "html", src: `<head>
  <link rel="stylesheet" href="/app.css">          <!-- ${t("chặn render: giữ CSS gọn", "render-blocking: keep CSS small")} -->
  <link rel="preconnect" href="https://api.shop.vn"> <!-- ${t("bắt tay sớm với API", "handshake early with the API")} -->
  <script src="/app.js" defer></script>            <!-- ${t("không chặn parse", "does not block parsing")} -->
  <script src="/analytics.js" async></script>      <!-- ${t("chạy ngay khi tải xong", "runs as soon as loaded")} -->
</head>` },
            href: CRP, label: "Critical rendering path (MDN)",
          },
        ],
      },
      {
        id: "bf-perf",
        title: t("Tối ưu", "Optimization"),
        items: [
          {
            q: t("Làm sao để trang tải nhanh hơn ở từng chặng?", "How do you make each leg faster?"),
            a: t(
              "Người phỏng vấn hay hỏi tiếp câu này để xem bạn có biến kiến thức thành hành động được không. Trả lời theo đúng các chặng vừa kể.",
              "Interviewers often follow up with this to see if you can turn the knowledge into action. Answer leg by leg.",
            ),
            table: {
              head: [t("Chặng", "Leg"), t("Cách tối ưu", "Technique")],
              rows: [
                ["Cache", t("Cache-Control max-age dài + hash trong tên file; ETag cho nội dung động; service worker cho offline", "Long max-age + hashed file names; ETag for dynamic content; a service worker for offline")],
                ["DNS", t("Ít tên miền khác nhau; dns-prefetch cho tên miền bên thứ ba", "Fewer distinct domains; dns-prefetch for third-party domains")],
                ["TCP / TLS", t("HTTP/2 hoặc HTTP/3, keep-alive, preconnect, TLS 1.3, CDN gần người dùng để giảm RTT", "HTTP/2 or HTTP/3, keep-alive, preconnect, TLS 1.3, a nearby CDN to cut RTT")],
                ["Server", t("Cache ở CDN và Redis, index DB, nén brotli, trả HTML sớm (streaming SSR)", "CDN and Redis caching, DB indexes, brotli, send HTML early (streaming SSR)")],
                ["Render", t("CSS quan trọng inline, defer JS, chia nhỏ bundle, lazy-load ảnh, đặt sẵn width/height cho ảnh để tránh layout shift", "Inline critical CSS, defer JS, split bundles, lazy-load images, set image width/height to avoid layout shift")],
              ],
            },
            note: t(
              "Đo trước khi tối ưu: tab Network và Performance của DevTools, Lighthouse, và các chỉ số Core Web Vitals (LCP, INP, CLS) cho biết chặng nào đang chậm thật.",
              "Measure before optimizing: DevTools Network and Performance tabs, Lighthouse, and the Core Web Vitals (LCP, INP, CLS) show which leg is actually slow.",
            ),
            href: HOW_WEB, label: "How browsers work (MDN)",
          },
        ],
      },
    ],
  };
}
