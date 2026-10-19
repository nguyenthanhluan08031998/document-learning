import { Code } from "@/components/Code";

export default function GraphqlPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục GraphQL">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#gql-overview"><span>01</span>GraphQL là gì</a></li>
          <li><a href="#gql-flow"><span>02</span>Luồng xử lý query</a></li>
          <li><a href="#gql-schema"><span>03</span>{"Schema & kiểu dữ liệu"}</a></li>
          <li><a href="#gql-ops"><span>04</span>Query, Mutation, Subscription</a></li>
          <li><a href="#gql-resolver"><span>05</span>{"Resolver & N+1"}</a></li>
          <li><a href="#gql-error"><span>06</span>{"Lỗi, HTTP & cache"}</a></li>
          <li><a href="#gql-security"><span>07</span>{"Bảo mật & hiệu năng"}</a></li>
          <li><a href="#gql-federation"><span>08</span>Federation</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">graphql · ghi chú học tập</div>
          <h1>Sổ tay GraphQL: client hỏi đúng thứ cần</h1>
          <p className="lede">GraphQL là ngôn ngữ truy vấn cho API. Server công bố một <b>schema</b> có kiểu rõ ràng, client gửi query mô tả <b>chính xác các trường muốn lấy</b> và nhận về JSON có đúng hình dạng đó, qua một endpoint duy nhất.</p>
          <div className="tape" aria-hidden="true">
            <div>query</div>
            <div>{"{"}</div>
            <div>order</div>
            <div>{"{ id"}</div>
            <div className="hw">{"total }"}</div>
            <div className="leo">{"}"}</div>
          </div>
        </header>
        <section id="gql-overview">
          <h2><span className="n">01</span>GraphQL là gì</h2>
          <div className="cmp">
            <div><h4>Với REST</h4>Màn hình đơn hàng cần gọi <code>/orders/42</code>, rồi <code>/users/7</code>, rồi <code>/orders/42/items</code>. Mỗi endpoint trả nhiều trường thừa (over-fetching) mà vẫn thiếu dữ liệu nên phải gọi thêm (under-fetching).</div>
            <div><h4>Với GraphQL</h4>Một request tới <code>/graphql</code> lấy đơn hàng, người mua và danh sách món, chỉ những trường màn hình cần.</div>
          </div>
          <div className="cmp">
            <Code lang="graphql">{`# Request
query OrderPage($id: ID!) {
  order(id: $id) {
    id
    total
    customer { name }
    items { name qty }
  }
}`}</Code>
            <Code lang="jsonc">{`// Response
{
  "data": {
    "order": {
      "id": "42",
      "total": 350000,
      "customer": { "name": "An" },
      "items": [{ "name": "Phở", "qty": 2 }]
    }
  }
}`}</Code>
          </div>
        </section>
        <section id="gql-flow">
          <h2><span className="n">02</span>Luồng xử lý một query</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 420" role="img" aria-label="Luồng xử lý GraphQL: client viết query, gửi POST tới /graphql, server parse, validate, execute resolver, DataLoader gom truy vấn, trả data và errors"> <defs> <marker id="gfa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> <marker id="gfb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker> </defs> <rect className="s-bg" x="8" y="22" width="884" height="118" rx="10" /> <text className="s-lane" x="20" y="42">CLIENT</text> <rect className="s-bg" x="8" y="160" width="884" height="252" rx="10" /> <text className="s-lane" x="20" y="180">GRAPHQL SERVER</text> <rect className="s-box" x="20" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="32" y="78">Viết query</text><text className="s-tm" x="32" y="98">chọn trường cần</text> <rect className="s-box" x="195" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="207" y="78">Variables</text><text className="s-tm" x="207" y="98">giá trị động</text> <rect className="s-box" x="370" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="382" y="78">Client cache</text><text className="s-tm" x="382" y="98">chuẩn hóa theo id</text> <rect className="s-box" x="545" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="557" y="78">Persisted query</text><text className="s-tm" x="557" y="98">gửi hash (tùy chọn)</text> <rect className="s-box" x="720" y="52" width="150" height="70" rx="7" /><text className="s-tb" x="732" y="78">HTTP POST</text><text className="s-tm" x="732" y="98">/graphql · JSON</text> <path className="s-ln" d="M170 87 H193" markerEnd="url(#gfa)" /> <path className="s-ln" d="M345 87 H368" markerEnd="url(#gfa)" /> <path className="s-ln" d="M520 87 H543" markerEnd="url(#gfa)" /> <path className="s-ln" d="M695 87 H718" markerEnd="url(#gfa)" /> <rect className="s-box" x="720" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="732" y="216">Parse</text><text className="s-tm" x="732" y="236">query → AST</text> <rect className="s-box" x="545" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="557" y="216">Validate</text><text className="s-tm" x="557" y="236">so với schema</text> <rect className="s-hl" x="370" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="382" y="216">Execute</text><text className="s-tm" x="382" y="236">resolver theo cây</text> <rect className="s-box" x="195" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="207" y="216">DataLoader</text><text className="s-tm" x="207" y="236">gom truy vấn</text> <rect className="s-box" x="20" y="190" width="150" height="70" rx="7" /><text className="s-tb" x="32" y="216">Response</text><text className="s-tm" x="32" y="236">{"{ data, errors }"}</text> <path className="s-ln" d="M720 225 H697" markerEnd="url(#gfa)" /> <path className="s-ln" d="M545 225 H522" markerEnd="url(#gfa)" /> <path className="s-ln" d="M370 225 H347" markerEnd="url(#gfa)" /> <path className="s-ln" d="M195 225 H172" markerEnd="url(#gfa)" /> <path className="s-ln" d="M795 122 V188" markerEnd="url(#gfa)" /> <text className="s-tm" x="805" y="158">một endpoint</text> <path className="s-dl" d="M60 190 V124" markerEnd="url(#gfb)" /> <text className="s-tm" x="70" y="158">{"200 + { data, errors }"}</text> <path className="s-dl" d="M270 262 V318" markerEnd="url(#gfb)" /> <rect className="s-disk" x="195" y="320" width="150" height="62" rx="7" /><text className="s-tb" x="207" y="344">Data sources</text><text className="s-tm" x="207" y="364">DB · REST · gRPC</text> <path className="s-dl" d="M620 262 V318" markerEnd="url(#gfb)" /> <rect className="s-bad" x="545" y="320" width="150" height="62" rx="7" /><text className="s-tb" x="557" y="344">Query sai</text><text className="s-tm" x="557" y="364">trả errors, dừng</text> </svg>
            </div>
            <figcaption>Mọi request đi vào một endpoint. Server kiểm tra query theo schema trước, rồi mới chạy resolver cho từng trường.</figcaption>
          </figure>
          <ol className="steps">
            <li>
              <div><b>Parse</b><div className="d">Chuỗi query được chuyển thành cây cú pháp (AST). Sai cú pháp thì dừng luôn.</div></div>
            </li>
            <li>
              <div><b>Validate</b><div className="d">So với schema: trường có tồn tại không, kiểu tham số đúng không. Lỗi ở đây thì không resolver nào chạy.</div></div>
            </li>
            <li>
              <div><b>Execute</b><div className="d">Đi theo cây query, mỗi trường gọi một <b>resolver</b>. Các trường cùng cấp trong query có thể chạy song song.</div></div>
            </li>
            <li>
              <div><b>Trả kết quả</b><div className="d">JSON gồm <code>data</code> và (nếu có) <code>errors</code>. Có thể vừa có dữ liệu vừa có lỗi.</div></div>
            </li>
          </ol>
        </section>
        <section id="gql-schema">
          <h2><span className="n">03</span>{"Schema & kiểu dữ liệu"}</h2>
          <Code lang="graphql">{`type Order {
  id: ID!                 # ! means non-null
  total: Int!
  status: OrderStatus!
  customer: User!
  items: [OrderItem!]!    # non-null list of non-null items
}

enum OrderStatus { PENDING PAID SHIPPED }

input CreateOrderInput {  # input types are used for arguments
  items: [ItemInput!]!
}

type Query {
  order(id: ID!): Order
  orders(first: Int = 20, after: String): OrderConnection!
}

type Mutation {
  createOrder(input: CreateOrderInput!): Order!
}

type Subscription {
  orderStatusChanged(id: ID!): Order!
}`}</Code>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>Ý nghĩa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Scalar</b></td>
                  <td><code>Int</code>, <code>Float</code>, <code>String</code>, <code>Boolean</code>, <code>ID</code>, và scalar tự định nghĩa như <code>DateTime</code>.</td>
                </tr>
                <tr>
                  <td><b>Object</b></td>
                  <td>Kiểu có các trường, ví dụ <code>Order</code>.</td>
                </tr>
                <tr>
                  <td><b>Input</b></td>
                  <td>Kiểu chỉ dùng làm tham số đầu vào.</td>
                </tr>
                <tr>
                  <td><b>Enum</b></td>
                  <td>Tập giá trị cố định.</td>
                </tr>
                <tr>
                  <td><b>Interface / Union</b></td>
                  <td>Một trường có thể trả nhiều kiểu, ví dụ kết quả tìm kiếm là <code>Product | Shop</code>.</td>
                </tr>
                <tr>
                  <td><b>List <code>[ ]</code> và Non-null <code>!</code></b></td>
                  <td>Mặc định mọi trường đều có thể null; thêm <code>!</code> để bắt buộc có giá trị.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="gql-ops">
          <h2><span className="n">04</span>Query, Mutation, Subscription</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>Dùng để</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>query</b></td>
                  <td>Đọc dữ liệu</td>
                  <td>Các trường gốc chạy song song.</td>
                </tr>
                <tr>
                  <td><b>mutation</b></td>
                  <td>Ghi, thay đổi dữ liệu</td>
                  <td>Các trường gốc chạy <b>tuần tự</b> theo thứ tự viết.</td>
                </tr>
                <tr>
                  <td><b>subscription</b></td>
                  <td>Nhận sự kiện theo thời gian thực</td>
                  <td>Chạy qua WebSocket (giao thức <code>graphql-ws</code>) hoặc SSE.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="plain">
            <li><b>Variables</b> (<code>$id</code>): tách giá trị động khỏi query, giúp cache và tránh ghép chuỗi.</li>
            <li><b>Fragment</b>: nhóm trường dùng lại nhiều nơi, ví dụ <code>{"fragment OrderCard on Order { id total }"}</code>.</li>
            <li><b>Alias</b>: lấy cùng trường hai lần với tham số khác: <code>{"a: order(id: 1) { … } b: order(id: 2) { … }"}</code>.</li>
            <li><b>Directive</b>: <code>@include(if: $x)</code>, <code>@skip(if: $x)</code> ở client; <code>@deprecated</code> trong schema để đánh dấu trường sắp bỏ, thay cho việc đánh version.</li>
            <li><b>Introspection</b>: client hỏi được chính schema, nhờ đó có công cụ tự gợi ý như GraphiQL và sinh code.</li>
          </ul>
        </section>
        <section id="gql-resolver">
          <h2><span className="n">05</span>{"Resolver & bài toán N+1"}</h2>
          <p>Mỗi trường có một resolver nhận <code>(parent, args, context, info)</code>. Resolver của <code>orders</code> trả về danh sách, rồi với <b>từng</b> đơn, resolver <code>customer</code> lại chạy một lần.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Cách viết</th>
                  <th>Số truy vấn DB cho 50 đơn hàng</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Resolver <code>customer</code> gọi DB trực tiếp</td>
                  <td className="n">1 (orders) + 50 (mỗi customer) = <b>51</b></td>
                </tr>
                <tr>
                  <td>Dùng <b>DataLoader</b> gom các id trong cùng một nhịp</td>
                  <td className="n">1 (orders) + 1 (<code>WHERE id IN (…)</code>) = <b>2</b></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>DataLoader</b> gom mọi lời gọi <code>load(id)</code> phát sinh trong cùng một tick, gọi DB một lần theo lô, rồi cache kết quả trong phạm vi một request. Tạo DataLoader mới cho mỗi request để không lẫn dữ liệu giữa người dùng.</div>
        </section>
        <section id="gql-error">
          <h2><span className="n">06</span>{"Lỗi, HTTP & cache"}</h2>
          <Code lang="json">{`{
  "data": { "order": { "id": "42", "customer": null } },
  "errors": [{
    "message": "Customer service unavailable",
    "path": ["order", "customer"],
    "extensions": { "code": "UNAVAILABLE" }
  }]
}`}</Code>
          <ul className="plain">
            <li>Lỗi ở một trường không làm hỏng cả response: trường đó thành <code>null</code>, phần còn lại vẫn trả về. Nếu trường là non-null thì null lan lên cha gần nhất cho phép null.</li>
            <li>Nhiều server trả HTTP 200 kể cả khi có lỗi nghiệp vụ. Spec <b>GraphQL over HTTP</b> đề xuất dùng content type <code>application/graphql-response+json</code> và status 4xx khi request không hợp lệ.</li>
            <li><b>Cache khó hơn REST</b> vì mọi request đều là POST tới một URL. Cách xử lý: client cache chuẩn hóa theo <code>id</code> (Apollo, urql), <b>persisted query</b> gửi hash thay cho cả query và cho phép dùng GET để CDN cache.</li>
          </ul>
        </section>
        <section id="gql-security">
          <h2><span className="n">07</span>{"Bảo mật & hiệu năng"}</h2>
          <ul className="plain">
            <li>Client tự viết query nên có thể gửi query lồng rất sâu hoặc rất tốn kém. Cần giới hạn <b>độ sâu</b>, <b>độ phức tạp</b> (tính điểm theo số trường và kích thước list) và <b>timeout</b>.</li>
            <li>Rate limit theo <b>chi phí query</b>, không chỉ theo số request.</li>
            <li><b>Persisted query dạng allowlist</b>: production chỉ chấp nhận các query đã đăng ký trước. Rất hợp với ứng dụng nội bộ.</li>
            <li>Cân nhắc tắt introspection ở API công khai nếu không cần, và tắt gợi ý tên trường trong thông báo lỗi.</li>
            <li>Phân quyền ở tầng resolver hoặc business logic, không chỉ ở endpoint, vì một endpoint phục vụ mọi thứ.</li>
            <li>Upload file không có trong spec chuẩn; thường upload qua REST hoặc presigned URL rồi gửi URL vào mutation.</li>
          </ul>
        </section>
        <section id="gql-federation">
          <h2><span className="n">08</span>Federation: nhiều service, một schema</h2>
          <p>Khi có nhiều team, mỗi service sở hữu một phần schema (<b>subgraph</b>). Một <b>router/gateway</b> ghép chúng thành <b>supergraph</b> và tự chia query thành các lời gọi tới từng subgraph.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Cách làm</th>
                  <th>Đặc điểm</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Apollo Federation</b></td>
                  <td>Phổ biến nhất. Subgraph đánh dấu entity bằng <code>@key</code>, router lo việc ghép.</td>
                </tr>
                <tr>
                  <td><b>Schema stitching</b></td>
                  <td>Cách cũ hơn, ghép schema thủ công ở gateway.</td>
                </tr>
                <tr>
                  <td><b>BFF (Backend for Frontend)</b></td>
                  <td>Một server GraphQL cho từng loại client, phía sau gọi REST hoặc gRPC.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
