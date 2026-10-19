// Layered system design of the e-commerce example, including the parts needed at 10M users / 100M events

type BoxProps = { x: number; y: number; w: number; h?: number; lines: string[]; kind?: string };

const Box = ({ x, y, w, h = 46, lines, kind = "s-box" }: BoxProps) => (
  <g>
    <rect className={kind} x={x} y={y} width={w} height={h} rx="7" />
    {lines.map((l, i) => (
      <text key={l} className={i === 0 ? "s-tb" : "s-tm"} x={x + 9} y={y + 19 + i * 17}>{l}</text>
    ))}
  </g>
);

// Several identical replicas drawn as a stack
const Pods = (p: BoxProps) => (
  <g>
    <rect className="s-box" x={p.x + 6} y={p.y - 6} width={p.w} height={p.h ?? 46} rx="7" />
    <rect className="s-box" x={p.x + 3} y={p.y - 3} width={p.w} height={p.h ?? 46} rx="7" />
    <Box {...p} />
  </g>
);

// Layer bands: [title, description, y, height]
const LAYERS: [string, string, number, number][] = [
  ["1 · Client", "giao diện", 8, 64],
  ["2 · Edge", "chặn tải sớm", 82, 64],
  ["3 · Gateway", "cửa vào API", 156, 64],
  ["4 · Service", "nghiệp vụ", 236, 74],
  ["5 · Cache", "đọc nhanh", 320, 62],
  ["6 · Data", "lưu bền", 392, 90],
  ["7 · Messaging", "sự kiện", 492, 62],
  ["8 · Worker", "xử lý nền", 564, 112],
];

const COL4 = [160, 297, 434, 571];          // four boxes, width 127
const COL5 = [160, 270, 380, 490, 600];     // five boxes, width 100

export function SystemDesign() {
  return (
    <svg viewBox="0 0 900 712" role="img" aria-label="System design chia 8 tầng: client gồm web, mobile, admin, seller; edge gồm GeoDNS, CDN, WAF, load balancer; gateway gồm waiting room và API gateway; service gồm user, catalog, cart, order, payment chạy nhiều pod; cache là Redis Cluster; data gồm PgBouncer và database riêng của từng service, orders chia 16 shard; messaging là Kafka 200 partition; worker gồm notification, search, inventory, shipping, trong đó inventory và shipping dùng chung warehouse_db. Bên phải: observability, CI/CD, secrets xuyên suốt; cổng thanh toán và đơn vị vận chuyển bên ngoài">
      <defs>
        <marker id="da" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker>
        <marker id="db" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker>
      </defs>

      {LAYERS.map(([title, desc, y, h]) => (
        <g key={title}>
          <rect className="s-bg" x="16" y={y} width="692" height={h} rx="8" />
          <text className="s-tb" x="26" y={y + 24}>{title}</text>
          <text className="s-tm" x="26" y={y + 41}>{desc}</text>
        </g>
      ))}

      {/* 1 · Client */}
      {[["Web storefront", "Next.js"], ["Mobile app", "iOS · Android"], ["Admin portal", "vận hành, CSKH"], ["Seller center", "người bán"]].map((l, i) => (
        <g key={l[0]}>
          <Box x={COL4[i]} y={16} w={127} lines={l} />
          <path d={`M${COL4[i] + 63} 62 V76`} style={{ stroke: "var(--accent)", strokeWidth: 1.8 }} />
        </g>
      ))}
      <path className="s-ln" d="M223 76 H634 M223 76 V88" markerEnd="url(#da)" />

      {/* 2 · Edge */}
      {[["GeoDNS", "chọn region gần"], ["CDN edge", "ảnh, JS, CSS"], ["WAF", "chặn bot, DDoS"], ["Load balancer", "chia tải"]].map((l, i) => (
        <g key={l[0]}>
          <Box x={COL4[i]} y={90} w={127} lines={l} />
          {i < 3 && <path className="s-ln" d={`M${COL4[i] + 127} 113 H${COL4[i + 1] - 1}`} markerEnd="url(#da)" />}
        </g>
      ))}
      <path className="s-ln" d="M634 136 V162" markerEnd="url(#da)" />

      {/* 3 · Gateway */}
      <Pods x={160} y={164} w={350} lines={["API Gateway · BFF ×50 pod", "JWT · rate limit · routing · REST / GraphQL"]} kind="s-hl" />
      <Box x={530} y={164} w={170} lines={["Waiting room", "xếp hàng flash sale"]} />
      <path className="s-ln" d="M530 187 H520" markerEnd="url(#da)" />

      {/* 4 · Service */}
      <path className="s-ln" d="M335 210 V226 M210 226 H650" />
      {[["user-svc", "×20 pod"], ["catalog-svc", "×100 pod"], ["cart-svc", "×60 pod"], ["order-svc", "×200 pod"], ["payment-svc", "×80 pod"]].map((l, i) => (
        <g key={l[0]}>
          <path className="s-ln" d={`M${COL5[i] + 50} 226 V244`} markerEnd="url(#da)" />
          <Pods x={COL5[i]} y={254} w={104} lines={l} />
        </g>
      ))}
      <path className="s-ln" d="M320 300 V326" markerEnd="url(#da)" />
      <path className="s-ln" d="M430 300 V326" markerEnd="url(#da)" />

      {/* 5 · Cache */}
      <Box x={160} y={328} w={540} kind="s-disk" lines={["Redis Cluster · 6 shard", "cache sản phẩm, giá, giỏ hàng · trừ tồn kho flash sale (DECR) · session"]} />

      {/* 6 · Data: each database sits under the service that owns it */}
      <rect className="s-box" x="160" y="400" width="540" height="24" rx="6" />
      <text className="s-tm" x="169" y="416" style={{ fill: "var(--ink)" }}>PgBouncer · gom 50.000 kết nối còn 500 · ghi vào primary, đọc từ replica</text>
      <Box x={COL5[0]} y={432} w={100} h={42} kind="s-disk" lines={["users", "Postgres"]} />
      <Box x={COL5[1]} y={432} w={100} h={42} kind="s-disk" lines={["products", "MongoDB"]} />
      <text className="s-tm" x={COL5[2] + 9} y="458">cart: ở Redis</text>
      <Box x={COL5[3]} y={432} w={100} h={42} kind="s-disk" lines={["orders", "PG · 16 shard"]} />
      <Box x={COL5[4]} y={432} w={100} h={42} kind="s-disk" lines={["payments", "Postgres"]} />

      {/* 7 · Messaging */}
      <rect className="s-disk" x="160" y="500" width="540" height="46" rx="7" />
      <text className="s-tb" x="169" y="519">Kafka · 200 partition · key = orderId</text>
      <text className="s-tm" x="169" y="536">OrderCreated · PaymentSucceeded · ProductUpdated</text>
      <path className="s-dl2" d="M690 300 V310 H710 V523 H702" markerEnd="url(#db)" />

      {/* 8 · Worker: consumer groups and their storage */}
      {[["notification", "×30 consumer"], ["search", "×20 consumer"], ["inventory", "×100 consumer"], ["shipping", "×50 consumer"]].map((l, i) => (
        <g key={l[0]}>
          <path className="s-dl2" d={`M${COL4[i] + 63} 546 V570`} markerEnd="url(#db)" />
          <Pods x={COL4[i]} y={580} w={127} lines={l} />
        </g>
      ))}
      <Box x={160} y={630} w={127} h={40} kind="s-disk" lines={["Redis", "hàng đợi gửi lại"]} />
      <Box x={297} y={630} w={127} h={40} kind="s-disk" lines={["Elasticsearch", "chỉ mục"]} />
      <Box x={434} y={630} w={264} h={40} kind="s-bad2" lines={["warehouse_db · DB dùng chung", "inventory + shipping"]} />

      {/* Right column: cross-cutting concerns and external providers */}
      <rect className="s-bg" x="718" y="8" width="174" height="212" rx="8" />
      <text className="s-lane" x="730" y="28">XUYÊN SUỐT</text>
      <Box x={730} y={38} w={150} lines={["Observability", "log · metric · trace"]} />
      <Box x={730} y={96} w={150} lines={["CI/CD", "build image · deploy"]} />
      <Box x={730} y={154} w={150} lines={["Config · secrets", "Vault, K8s secret"]} />
      <rect className="s-bg" x="718" y="236" width="174" height="440" rx="8" />
      <text className="s-lane" x="730" y="254">BÊN NGOÀI</text>
      <Box x={730} y={262} w={150} lines={["Cổng thanh toán", "VNPay · MoMo · Stripe"]} />
      <path className="s-ln" d="M706 279 H728" markerStart="url(#da)" markerEnd="url(#da)" />
      <Box x={730} y={584} w={150} lines={["Vận chuyển", "GHN · GHTK"]} />
      <path className="s-ln" d="M704 603 H728" markerEnd="url(#da)" />

      <text className="s-tm" x="16" y="700">Xanh: request đồng bộ · Cam nét đứt: sự kiện · Ô vàng: lưu trữ · Ô đỏ: DB dùng chung · Ô xếp chồng: nhiều bản chạy song song</text>
    </svg>
  );
}
