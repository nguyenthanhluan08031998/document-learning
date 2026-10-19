import { Code } from "@/components/Code";

export default function RestPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục REST">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#rest-principle"><span>01</span>Nguyên tắc REST</a></li>
          <li><a href="#rest-flow"><span>02</span>Luồng một request</a></li>
          <li><a href="#rest-method"><span>03</span>HTTP method</a></li>
          <li><a href="#rest-status"><span>04</span>Status code</a></li>
          <li><a href="#rest-design"><span>05</span>Thiết kế URI</a></li>
          <li><a href="#rest-cache"><span>06</span>{"Cache & điều kiện"}</a></li>
          <li><a href="#rest-security"><span>07</span>Bảo mật</a></li>
          <li><a href="#rest-ref"><span>08</span>Bảng tra nhanh</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">rest · ghi chú học tập</div>
          <h1>Sổ tay REST: tài nguyên, method và status</h1>
          <p className="lede">REST là một <b>phong cách kiến trúc</b> chạy trên HTTP: mọi thứ là <b>tài nguyên</b> có URI riêng, client thao tác bằng các method chuẩn và nhận về biểu diễn của tài nguyên, thường là JSON.</p>
          <div className="tape" aria-hidden="true">
            <div>GET</div>
            <div>/orders</div>
            <div>/42</div>
            <div className="hw">200 OK</div>
            <div className="leo">ETag</div>
          </div>
        </header>
        <section id="rest-principle">
          <h2><span className="n">01</span>Nguyên tắc REST</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Ràng buộc</th>
                  <th>Ý nghĩa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Client–server</b></td>
                  <td>Giao diện và dữ liệu tách nhau, phát triển độc lập.</td>
                </tr>
                <tr>
                  <td><b>Stateless</b></td>
                  <td>Mỗi request tự mang đủ thông tin (token, tham số). Server không nhớ phiên, nên dễ mở rộng ngang.</td>
                </tr>
                <tr>
                  <td><b>Cacheable</b></td>
                  <td>Response tự khai báo có được cache hay không.</td>
                </tr>
                <tr>
                  <td><b>Uniform interface</b></td>
                  <td>Dùng URI cho tài nguyên, method chuẩn, media type rõ ràng, có link để đi tiếp.</td>
                </tr>
                <tr>
                  <td><b>Layered system</b></td>
                  <td>Có thể chèn proxy, CDN, gateway ở giữa mà client không cần biết.</td>
                </tr>
                <tr>
                  <td><b>Code on demand</b> (tùy chọn)</td>
                  <td>Server có thể gửi code để client chạy, ví dụ JavaScript.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>Richardson Maturity Model</h3>
          <ol className="steps">
            <li>
              <div><b>Level 0</b><div className="d">Một URI, mọi thứ qua POST. Giống RPC qua HTTP.</div></div>
            </li>
            <li>
              <div><b>Level 1 · Resource</b><div className="d">Mỗi tài nguyên có URI riêng: <code>/orders/42</code>.</div></div>
            </li>
            <li>
              <div><b>Level 2 · HTTP verbs</b><div className="d">Dùng đúng method và status code. Phần lớn API “REST” thực tế dừng ở đây.</div></div>
            </li>
            <li>
              <div><b>Level 3 · Hypermedia (HATEOAS)</b><div className="d">Response chứa link tới hành động tiếp theo, client đi theo link thay vì tự ghép URI.</div></div>
            </li>
          </ol>
        </section>
        <section id="rest-flow">
          <h2><span className="n">02</span>Luồng một request</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 420" role="img" aria-label="Luồng một request REST từ client qua cache, CDN, gateway tới service và trả response"> <defs> <marker id="rfa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> <marker id="rfb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker> </defs> <rect className="s-bg" x="8" y="22" width="884" height="118" rx="10" /> <text className="s-lane" x="20" y="42">CLIENT</text> <rect className="s-bg" x="8" y="160" width="884" height="252" rx="10" /> <text className="s-lane" x="20" y="180">SERVER</text> <rect className="s-box" x="20" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="32" y="78">Tạo request</text><text className="s-tm" x="32" y="98">GET /orders/42</text> <rect className="s-box" x="195" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="207" y="78">DNS + TLS</text><text className="s-tm" x="207" y="98">tìm IP · HTTPS</text> <rect className="s-box" x="370" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="382" y="78">Client cache</text><text className="s-tm" x="382" y="98">max-age · ETag</text> <rect className="s-box" x="545" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="557" y="78">CDN</text><text className="s-tm" x="557" y="98">gần người dùng</text> <rect className="s-box" x="720" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="732" y="78">Gửi request</text><text className="s-tm" x="732" y="98">headers + body</text> <path className="s-ln" d="M170 87 H193" markerEnd="url(#rfa)" /> <path className="s-ln" d="M345 87 H368" markerEnd="url(#rfa)" /> <path className="s-ln" d="M520 87 H543" markerEnd="url(#rfa)" /> <path className="s-ln" d="M695 87 H718" markerEnd="url(#rfa)" /> <rect className="s-box" x="720" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="732" y="216">API Gateway</text><text className="s-tm" x="732" y="236">auth · rate limit</text> <rect className="s-box" x="545" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="557" y="216">Router</text><text className="s-tm" x="557" y="236">method + path</text> <rect className="s-box" x="370" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="382" y="216">Validate</text><text className="s-tm" x="382" y="236">params · body</text> <rect className="s-hl" x="195" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="207" y="216">Xử lý</text><text className="s-tm" x="207" y="236">business logic</text> <rect className="s-box" x="20" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="32" y="216">Response</text><text className="s-tm" x="32" y="236">status · headers</text> <path className="s-ln" d="M720 225 H697" markerEnd="url(#rfa)" /> <path className="s-ln" d="M545 225 H522" markerEnd="url(#rfa)" /> <path className="s-ln" d="M370 225 H347" markerEnd="url(#rfa)" /> <path className="s-ln" d="M195 225 H172" markerEnd="url(#rfa)" /> <path className="s-ln" d="M795 122 V188" markerEnd="url(#rfa)" /> <text className="s-tm" x="805" y="158">HTTP</text> <path className="s-dl" d="M60 190 V124" markerEnd="url(#rfb)" /> <text className="s-tm" x="70" y="158">200 OK + JSON</text> <path className="s-dl" d="M270 262 V318" markerEnd="url(#rfb)" /> <rect className="s-disk" x="195" y="320" width="150" height="62" rx="7" /><text className="s-tb" x="207" y="344">Database</text><text className="s-tm" x="207" y="364">SQL / NoSQL</text> <path className="s-dl" d="M795 262 V318" markerEnd="url(#rfb)" /> <rect className="s-bad" x="720" y="320" width="150" height="62" rx="7" /><text className="s-tb" x="732" y="344">Từ chối sớm</text><text className="s-tm" x="732" y="364">401 · 403 · 429</text> <text className="s-tm" x="380" y="334">stateless: mỗi request tự mang token</text> <text className="s-tm" x="380" y="352">GET lặp lại không đổi dữ liệu</text> <text className="s-tm" x="380" y="370">304 khi ETag chưa đổi</text> </svg>
            </div>
            <figcaption>Hàng trên chạy phía client và hạ tầng gần client, hàng dưới chạy phía server. Request có thể kết thúc sớm ở cache hoặc CDN.</figcaption>
          </figure>
          <ul className="plain">
            <li>Request có thể dừng sớm ở <b>client cache</b> hoặc <b>CDN</b> nếu response trước đó còn hạn, không tới server.</li>
            <li><b>API Gateway</b> lo phần chung: xác thực, rate limit, ghi log, chuyển tiếp tới đúng service.</li>
            <li>Response gồm <b>status line</b>, <b>headers</b> (Content-Type, Cache-Control, ETag…) và <b>body</b>.</li>
          </ul>
        </section>
        <section id="rest-method">
          <h2><span className="n">03</span>HTTP method</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Dùng để</th>
                  <th>Safe</th>
                  <th>Idempotent</th>
                  <th>Ví dụ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">GET</td>
                  <td>Đọc tài nguyên</td>
                  <td>Có</td>
                  <td>Có</td>
                  <td><code>GET /orders/42</code></td>
                </tr>
                <tr>
                  <td className="m">POST</td>
                  <td>Tạo mới hoặc hành động</td>
                  <td>Không</td>
                  <td>Không</td>
                  <td><code>POST /orders</code></td>
                </tr>
                <tr>
                  <td className="m">PUT</td>
                  <td>Thay toàn bộ tài nguyên</td>
                  <td>Không</td>
                  <td>Có</td>
                  <td><code>PUT /orders/42</code></td>
                </tr>
                <tr>
                  <td className="m">PATCH</td>
                  <td>Sửa một phần</td>
                  <td>Không</td>
                  <td>Không bắt buộc</td>
                  <td><code>PATCH /orders/42</code></td>
                </tr>
                <tr>
                  <td className="m">DELETE</td>
                  <td>Xóa</td>
                  <td>Không</td>
                  <td>Có</td>
                  <td><code>DELETE /orders/42</code></td>
                </tr>
                <tr>
                  <td className="m">HEAD</td>
                  <td>Như GET nhưng không có body</td>
                  <td>Có</td>
                  <td>Có</td>
                  <td>Kiểm tra tồn tại, kích thước</td>
                </tr>
                <tr>
                  <td className="m">OPTIONS</td>
                  <td>Hỏi method được phép, CORS preflight</td>
                  <td>Có</td>
                  <td>Có</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
          <p><b>Safe</b>: không thay đổi dữ liệu. <b>Idempotent</b>: gọi 1 lần hay nhiều lần thì trạng thái cuối giống nhau, nên client retry an toàn.</p>
          <div className="note tip"><b>POST an toàn khi retry:</b> client gửi header <code>Idempotency-Key</code> (một UUID). Server lưu kết quả theo key, nhận lại cùng key thì trả kết quả cũ thay vì tạo bản ghi thứ hai. Các API thanh toán hay dùng cách này.</div>
        </section>
        <section id="rest-status">
          <h2><span className="n">04</span>Status code</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Ý nghĩa</th>
                  <th>Khi nào dùng</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">200 OK</td>
                  <td>Thành công</td>
                  <td>GET, PUT, PATCH trả dữ liệu</td>
                </tr>
                <tr>
                  <td className="m">201 Created</td>
                  <td>Đã tạo</td>
                  <td>POST tạo mới, kèm header <code>Location</code></td>
                </tr>
                <tr>
                  <td className="m">202 Accepted</td>
                  <td>Đã nhận, xử lý sau</td>
                  <td>Tác vụ bất đồng bộ</td>
                </tr>
                <tr>
                  <td className="m">204 No Content</td>
                  <td>Thành công, không có body</td>
                  <td>DELETE</td>
                </tr>
                <tr>
                  <td className="m">301 / 308</td>
                  <td>Chuyển vĩnh viễn</td>
                  <td>Đổi URI</td>
                </tr>
                <tr>
                  <td className="m">304 Not Modified</td>
                  <td>Không đổi</td>
                  <td>Cache còn dùng được</td>
                </tr>
                <tr>
                  <td className="m">400 Bad Request</td>
                  <td>Request sai cú pháp</td>
                  <td>JSON hỏng, thiếu tham số</td>
                </tr>
                <tr>
                  <td className="m">401 Unauthorized</td>
                  <td>Chưa xác thực</td>
                  <td>Thiếu hoặc sai token</td>
                </tr>
                <tr>
                  <td className="m">403 Forbidden</td>
                  <td>Không có quyền</td>
                  <td>Đã đăng nhập nhưng không được phép</td>
                </tr>
                <tr>
                  <td className="m">404 Not Found</td>
                  <td>Không tồn tại</td>
                  <td />
                </tr>
                <tr>
                  <td className="m">409 Conflict</td>
                  <td>Xung đột trạng thái</td>
                  <td>Trùng dữ liệu, sai phiên bản</td>
                </tr>
                <tr>
                  <td className="m">412 Precondition Failed</td>
                  <td>Điều kiện không thỏa</td>
                  <td><code>If-Match</code> không khớp ETag</td>
                </tr>
                <tr>
                  <td className="m">422 Unprocessable Content</td>
                  <td>Đúng cú pháp nhưng sai nghiệp vụ</td>
                  <td>Validate thất bại</td>
                </tr>
                <tr>
                  <td className="m">429 Too Many Requests</td>
                  <td>Vượt rate limit</td>
                  <td>Kèm <code>Retry-After</code></td>
                </tr>
                <tr>
                  <td className="m">500 Internal Server Error</td>
                  <td>Lỗi server</td>
                  <td />
                </tr>
                <tr>
                  <td className="m">502 / 503 / 504</td>
                  <td>Gateway lỗi / quá tải / timeout</td>
                  <td>Lỗi ở tầng hạ tầng</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Định dạng body lỗi nên theo chuẩn <b>Problem Details</b> (RFC 9457), content type <code>application/problem+json</code>:</p>
          <Code lang="json">{`{
  "type": "https://api.example.com/errors/out-of-stock",
  "title": "Out of stock",
  "status": 409,
  "detail": "Item SKU-123 has only 2 units left",
  "instance": "/orders/42"
}`}</Code>
        </section>
        <section id="rest-design">
          <h2><span className="n">05</span>Thiết kế URI</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Nên</th>
                  <th>Không nên</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>GET /orders</code></td>
                  <td><code>GET /getAllOrders</code></td>
                </tr>
                <tr>
                  <td><code>POST /orders</code></td>
                  <td><code>POST /createOrder</code></td>
                </tr>
                <tr>
                  <td><code>GET /users/7/orders</code></td>
                  <td><code>{"GET /orders?userId=7&type=user"}</code> khi quan hệ rõ ràng</td>
                </tr>
                <tr>
                  <td><code>POST /orders/42/cancel</code></td>
                  <td><code>PUT /orders/42</code> với cờ <code>"cancel": true</code> khó hiểu</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="plain">
            <li>Danh từ số nhiều, chữ thường, nối bằng gạch ngang: <code>/order-items</code>. Không lồng quá 2 cấp.</li>
            <li><b>Lọc, sắp xếp</b> qua query string: <code>{"?status=paid&sort=-created_at"}</code>.</li>
            <li><b>Phân trang</b>: offset (<code>{"?page=3&size=20"}</code>) dễ làm nhưng chậm và lệch khi dữ liệu thay đổi; cursor (<code>?after=eyJpZCI6NDJ9</code>) ổn định và nhanh với dữ liệu lớn.</li>
            <li><b>Versioning</b>: trong URI (<code>/v1/orders</code>) phổ biến nhất; hoặc qua header/media type. Chỉ tăng version khi có thay đổi phá vỡ tương thích.</li>
            <li>Mô tả API bằng <b>OpenAPI</b> (3.1 trở lên) để sinh tài liệu, client và kiểm thử tự động.</li>
          </ul>
        </section>
        <section id="rest-cache">
          <h2><span className="n">06</span>{"Cache & request có điều kiện"}</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Header</th>
                  <th>Tác dụng</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">Cache-Control</td>
                  <td><code>max-age=60</code>, <code>no-store</code>, <code>private</code>, <code>public</code>: ai được cache, cache bao lâu.</td>
                </tr>
                <tr>
                  <td className="m">ETag</td>
                  <td>“Dấu vân tay” của phiên bản tài nguyên, ví dụ <code>"v7"</code>.</td>
                </tr>
                <tr>
                  <td className="m">If-None-Match</td>
                  <td>Client gửi ETag đã có; không đổi thì server trả <b>304</b>, không gửi lại body.</td>
                </tr>
                <tr>
                  <td className="m">If-Match</td>
                  <td>Chỉ cập nhật nếu ETag còn khớp, tránh ghi đè lên thay đổi của người khác (trả <b>412</b> nếu lệch).</td>
                </tr>
                <tr>
                  <td className="m">Last-Modified / If-Modified-Since</td>
                  <td>Như ETag nhưng theo thời gian, kém chính xác hơn.</td>
                </tr>
                <tr>
                  <td className="m">Vary</td>
                  <td>Báo cache rằng response khác nhau theo header nào, ví dụ <code>Accept-Language</code>.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="rest-security">
          <h2><span className="n">07</span>Bảo mật</h2>
          <ul className="plain">
            <li>Luôn dùng <b>HTTPS</b>. Không đưa token hay dữ liệu nhạy cảm lên URL vì URL bị ghi vào log.</li>
            <li><b>Xác thực</b>: API key cho server-to-server đơn giản; <b>OAuth 2.0 / OpenID Connect</b> với Bearer token (thường là JWT) cho người dùng.</li>
            <li><b>Phân quyền</b> ở từng tài nguyên: kiểm tra <code>/orders/42</code> có thuộc người đang gọi không. Đây là lỗi phổ biến nhất (BOLA/IDOR).</li>
            <li><b>Rate limit</b> theo user hoặc IP, trả 429 kèm <code>Retry-After</code>.</li>
            <li><b>CORS</b>: chỉ cho phép đúng origin cần thiết; trình duyệt gửi OPTIONS preflight trước request “không đơn giản”.</li>
            <li>Validate mọi input, giới hạn kích thước body và số phần tử mỗi trang.</li>
          </ul>
        </section>
        <section id="rest-ref">
          <h2><span className="n">08</span>Bảng tra nhanh</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Header</th>
                  <th>Phía</th>
                  <th>Ví dụ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">Authorization</td>
                  <td>Request</td>
                  <td><code>Bearer eyJhbGci…</code></td>
                </tr>
                <tr>
                  <td className="m">Content-Type</td>
                  <td>Cả hai</td>
                  <td><code>application/json</code></td>
                </tr>
                <tr>
                  <td className="m">Accept</td>
                  <td>Request</td>
                  <td><code>application/json</code></td>
                </tr>
                <tr>
                  <td className="m">Idempotency-Key</td>
                  <td>Request</td>
                  <td><code>3f2c…</code> (UUID)</td>
                </tr>
                <tr>
                  <td className="m">Location</td>
                  <td>Response</td>
                  <td><code>/orders/43</code> sau khi tạo</td>
                </tr>
                <tr>
                  <td className="m">Retry-After</td>
                  <td>Response</td>
                  <td><code>30</code> (giây)</td>
                </tr>
                <tr>
                  <td className="m">X-Request-Id / traceparent</td>
                  <td>Cả hai</td>
                  <td>Truy vết request qua nhiều service</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
