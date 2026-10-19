import { Code } from "@/components/Code";

export default function DistributedLockPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục distributed lock">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#dl-local"><span>01</span>Lock trong một tiến trình</a></li>
          <li><a href="#dl-why"><span>02</span>Vì sao cần distributed lock</a></li>
          <li><a href="#dl-redis"><span>03</span>Redis lock</a></li>
          <li><a href="#dl-fencing"><span>04</span>{"Lease hết hạn & fencing token"}</a></li>
          <li><a href="#dl-redlock"><span>05</span>Redlock</a></li>
          <li><a href="#dl-others"><span>06</span>etcd, ZooKeeper, PostgreSQL</a></li>
          <li><a href="#dl-rules"><span>07</span>Quy tắc dùng an toàn</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">đồng thời · nhiều instance</div>
          <h1>Distributed lock: khóa xuyên nhiều máy</h1>
          <p className="lede">Khi ứng dụng chạy nhiều instance, lock trong bộ nhớ của một instance không ngăn được instance khác. Distributed lock đặt “chìa khóa” ở một hệ thống mà mọi instance cùng thấy. Khó hơn lock thường nhiều, vì mạng có thể chậm, tiến trình có thể dừng giữa chừng và đồng hồ có thể lệch.</p>
          <div className="tape" aria-hidden="true">
            <div>SET NX</div>
            <div>PX 30000</div>
            <div>token</div>
            <div className="hw">fencing</div>
            <div className="leo">release</div>
          </div>
        </header>
        <section id="dl-local">
          <h2><span className="n">01</span>{"Lock trong một tiến trình: mutex & semaphore"}</h2>
          <p>Node.js chạy một luồng nhưng các hàm async vẫn xen kẽ nhau tại mỗi <code>await</code>. Muốn một đoạn code async chỉ chạy một lần tại một thời điểm trong cùng tiến trình, dùng mutex (ví dụ thư viện <code>async-mutex</code>).</p>
          <Code lang="ts">{`import { Mutex, Semaphore } from "async-mutex";

// Mutex: only one refresh at a time inside this process
const tokenMutex = new Mutex();
let cachedToken: string | undefined;

async function getAccessToken() {
  return tokenMutex.runExclusive(async () => {
    if (!cachedToken) cachedToken = await fetchNewToken(); // other callers wait, then reuse
    return cachedToken;
  });
}

// Semaphore: at most 5 concurrent calls to a slow API (see Bulkhead pattern)
const apiSlots = new Semaphore(5);
await apiSlots.runExclusive(() => callSlowApi());`}</Code>
          <div className="note">Mutex trong bộ nhớ <b>chỉ có tác dụng trong một instance</b>. Chạy 3 pod thì có 3 mutex độc lập. Đó là lúc cần distributed lock, hoặc tốt hơn, một cơ chế ở database.</div>
        </section>
        <section id="dl-why">
          <h2><span className="n">02</span>Khi nào cần distributed lock</h2>
          <ul className="plain">
            <li><b>Cron job chạy trên nhiều instance</b>: chỉ một instance được gửi báo cáo cuối ngày.</li>
            <li><b>Gọi hệ thống ngoài không có idempotency</b>: chỉ một tiến trình được làm mới token OAuth dùng chung.</li>
            <li><b>Tài nguyên không nằm trong một database</b>: file trên S3, nhiều hệ thống cùng chạm vào.</li>
            <li><b>Bầu leader</b>: một instance làm việc nền, các instance khác dự phòng.</li>
          </ul>
          <div className="note tip">Nếu dữ liệu nằm trong <b>một database</b>, hãy ưu tiên atomic update, <code>FOR UPDATE</code> hoặc optimistic lock ở tab trước. Chúng nằm trong transaction nên an toàn hơn distributed lock nhiều.</div>
        </section>
        <section id="dl-redis">
          <h2><span className="n">03</span>Redis lock: cách phổ biến nhất</h2>
          <ol className="steps">
            <li>
              <div><b>Lấy khóa</b><div className="d"><code>{"SET lock:report <token> NX PX 30000"}</code>: chỉ đặt nếu chưa có (<code>NX</code>), tự hết hạn sau 30 giây (<code>PX</code>) để không kẹt mãi nếu tiến trình chết.</div></div>
            </li>
            <li>
              <div><b>Làm việc</b><div className="d">Phải xong trước khi khóa hết hạn, hoặc gia hạn định kỳ.</div></div>
            </li>
            <li>
              <div><b>Nhả khóa đúng chủ</b><div className="d">Chỉ xóa nếu giá trị vẫn là token của mình, bằng một script Lua để kiểm tra và xóa là một thao tác atomic.</div></div>
            </li>
          </ol>
          <Code lang="ts">{`import Redis from "ioredis";
import { randomUUID } from "node:crypto";

const redis = new Redis(process.env.REDIS_URL!);

const RELEASE_SCRIPT = \`
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  end
  return 0
\`;

async function withLock<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T | null> {
  const token = randomUUID();                       // identifies the owner
  const ok = await redis.set(key, token, "PX", ttlMs, "NX");
  if (ok !== "OK") return null;                     // someone else holds it: non-blocking
  try {
    return await fn();
  } finally {
    // Never delete a lock that expired and now belongs to someone else
    await redis.eval(RELEASE_SCRIPT, 1, key, token);
  }
}

// Only one instance sends the daily report
await withLock("lock:daily-report", 60_000, () => sendDailyReport());`}</Code>
          <div className="pp">
            <div><span className="pl">Vì sao cần token</span>Nếu xóa bằng <code>DEL</code> thường: A giữ khóa quá TTL, khóa hết hạn, B lấy được; A làm xong gọi <code>DEL</code> và xóa mất khóa của B.</div>
            <div className="warnc"><span className="pl">Giới hạn</span>Một Redis đơn: Redis chết hoặc failover sang replica chưa kịp đồng bộ thì khóa có thể mất, hai bên cùng giữ.</div>
          </div>
        </section>
        <section id="dl-fencing">
          <h2><span className="n">04</span>{"Lease hết hạn & fencing token"}</h2>
          <p>Mọi distributed lock có TTL đều là <b>lease</b> (thuê có hạn). Vấn đề: tiến trình có thể bị dừng (GC pause, máy treo, mạng chậm) lâu hơn TTL mà không biết. Khi tỉnh lại, nó tưởng mình vẫn giữ khóa và ghi đè lên việc của người khác.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 408" role="img" aria-label="Fencing token: client A lấy khóa với token 33 rồi bị dừng, khóa hết hạn, client B lấy token 34 và ghi; A tỉnh lại ghi với token 33 bị storage từ chối"> <defs><marker id="fea" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker><marker id="feb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker><marker id="fec" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--bad)" /></marker><marker id="fed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker><marker id="fee" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--new)" /></marker></defs> <rect className="s-box" x="0.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="70.0" y="35" textAnchor="middle">Client A</text> <text className="s-tm" x="70.0" y="52" textAnchor="middle">worker 1</text> <path d="M70.0 62 V394" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-hl" x="253.33333333333337" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="323.33333333333337" y="35" textAnchor="middle">Lock service</text> <text className="s-tm" x="323.33333333333337" y="52" textAnchor="middle">Redis · etcd</text> <path d="M323.33333333333337 62 V394" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-box" x="506.66666666666674" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="576.6666666666667" y="35" textAnchor="middle">Client B</text> <text className="s-tm" x="576.6666666666667" y="52" textAnchor="middle">worker 2</text> <path d="M576.6666666666667 62 V394" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-disk" x="760.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="830.0" y="35" textAnchor="middle">Storage</text> <text className="s-tm" x="830.0" y="52" textAnchor="middle">database</text> <path d="M830.0 62 V394" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <path d="M74.0 92 H317.33333333333337" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#fea)" /> <text className="s-tm" x="196.66666666666669" y="85" textAnchor="middle" style={{ fill: "var(--accent)" }}>acquire</text> <path d="M319.33333333333337 126 H76.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#feb)" /> <text className="s-tm" x="196.66666666666669" y="119" textAnchor="middle" style={{ fill: "var(--muted)" }}>OK, token 33</text> <text className="s-tm" x="10.0" y="160" style={{ fill: "var(--warn)", fontWeight: "600" }}>A bị GC pause 40 giây, lease 30 giây hết hạn</text> <path d="M572.6666666666667 198 H329.33333333333337" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#fea)" /> <text className="s-tm" x="450.00000000000006" y="191" textAnchor="middle" style={{ fill: "var(--accent)" }}>acquire</text> <path d="M327.33333333333337 232 H570.6666666666667" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#feb)" /> <text className="s-tm" x="450.00000000000006" y="225" textAnchor="middle" style={{ fill: "var(--muted)" }}>OK, token 34</text> <path d="M580.6666666666667 266 H824.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#fea)" /> <text className="s-tm" x="703.3333333333334" y="259" textAnchor="middle" style={{ fill: "var(--accent)" }}>write (token 34)</text> <path d="M826.0 300 H582.6666666666667" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#feb)" /> <text className="s-tm" x="703.3333333333334" y="293" textAnchor="middle" style={{ fill: "var(--muted)" }}>OK, ghi nhận 34</text> <path d="M74.0 334 H824.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#fea)" /> <text className="s-tm" x="450.0" y="327" textAnchor="middle" style={{ fill: "var(--accent)" }}>write (token 33)</text> <path d="M826.0 368 H76.0" style={{ stroke: "var(--bad)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#fec)" /> <text className="s-tm" x="450.0" y="361" textAnchor="middle" style={{ fill: "var(--bad)" }}>từ chối: 33 nhỏ hơn 34</text> </svg>
            </div>
            <figcaption>Không có fencing, lần ghi của A sẽ đè lên dữ liệu của B. Storage chỉ nhận token lớn hơn token đã thấy nên lần ghi cũ bị chặn.</figcaption>
          </figure>
          <Code lang="ts">{`// Each successful acquire returns a strictly increasing number
const fencingToken = await redis.incr("lock:invoice:fence");

// The storage accepts a write only if the token is newer than the last one it saw
const res = await db.query(
  "UPDATE invoices SET pdf_url = $1, fence = $2 WHERE id = $3 AND fence < $2",
  [url, fencingToken, invoiceId],
);
if (res.rowCount === 0) throw new Error("Stale lock holder, write rejected");`}</Code>
          <p>Lock giúp <b>giảm</b> trùng lặp; fencing token ở phía lưu trữ mới <b>đảm bảo đúng</b>. etcd (revision) và ZooKeeper (zxid) cung cấp sẵn số tăng dần dùng làm fencing token.</p>
        </section>
        <section id="dl-redlock">
          <h2><span className="n">05</span>Redlock</h2>
          <p>Thuật toán của tác giả Redis để không phụ thuộc một node: dùng N node Redis <b>độc lập</b> (thường 5), lấy khóa trên từng node, coi là thành công nếu được <b>đa số</b> (ít nhất 3) trong thời gian ngắn hơn TTL. Thư viện Node.js: <code>redlock</code>.</p>
          <div className="cmp">
            <div><h4>Ủng hộ</h4>Chịu được một số node Redis chết; đủ tốt khi lock chỉ để tránh làm trùng việc (hiệu năng), không phải để đảm bảo đúng tuyệt đối.</div>
            <div><h4>Phê bình (Martin Kleppmann, 2016)</h4>Dựa vào giả định về thời gian và đồng hồ; không có fencing token nên vẫn hỏng khi tiến trình bị dừng lâu. Cần đúng tuyệt đối thì dùng hệ thống đồng thuận (etcd, ZooKeeper) kèm fencing.</div>
          </div>
          <p>Cách nghĩ thực dụng: lock để <b>tiết kiệm công</b> (tránh hai máy cùng tính một báo cáo) thì Redis là đủ; lock để <b>giữ đúng dữ liệu</b> (tiền, tồn kho) thì đưa kiểm tra vào database hoặc dùng fencing.</p>
        </section>
        <section id="dl-others">
          <h2><span className="n">06</span>etcd, ZooKeeper, PostgreSQL advisory lock</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Công cụ</th>
                  <th>Cách hoạt động</th>
                  <th>Điểm mạnh</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>etcd</b></td>
                  <td>Key gắn với lease, client gửi keep-alive; hết keep-alive thì key tự xóa. Revision tăng dần dùng làm fencing token.</td>
                  <td>Đồng thuận Raft, nhất quán mạnh; Kubernetes dùng cho leader election.</td>
                </tr>
                <tr>
                  <td><b>ZooKeeper</b></td>
                  <td>Tạo znode ephemeral sequential; ai có số nhỏ nhất giữ khóa, người khác theo dõi node đứng trước mình.</td>
                  <td>Đã được kiểm chứng lâu (Kafka bản cũ, Hadoop); công thức lock có sẵn trong Curator.</td>
                </tr>
                <tr>
                  <td><b>PostgreSQL advisory lock</b></td>
                  <td>Khóa theo một số nguyên do ứng dụng tự đặt nghĩa: <code>pg_try_advisory_xact_lock(hashtext('daily-report'))</code>.</td>
                  <td>Không cần thêm hạ tầng nếu đã có PostgreSQL; bản <code>_xact_</code> tự nhả khi transaction kết thúc.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Code lang="ts">{`// PostgreSQL advisory lock: one runner for a scheduled job across all instances
const client = await pool.connect();
try {
  await client.query("BEGIN");
  const { rows } = await client.query(
    "SELECT pg_try_advisory_xact_lock(hashtext($1)) AS ok", ["daily-report"],
  );
  if (rows[0].ok) await sendDailyReport(client);   // others skip immediately
  await client.query("COMMIT");                    // lock released with the transaction
} finally {
  client.release();
}`}</Code>
          <div className="note">Advisory lock dạng session (<code>pg_advisory_lock</code>) gắn với connection. Qua PgBouncer ở chế độ transaction pooling, connection bị dùng chung nên khóa có thể không như mong đợi; dùng bản <code>_xact_</code> trong transaction.</div>
        </section>
        <section id="dl-rules">
          <h2><span className="n">07</span>Quy tắc dùng distributed lock an toàn</h2>
          <ol className="steps">
            <li>
              <div><b>Luôn có TTL</b><div className="d">Tiến trình chết thì khóa phải tự nhả.</div></div>
            </li>
            <li>
              <div><b>Nhả đúng chủ</b><div className="d">So token trước khi xóa, bằng thao tác atomic.</div></div>
            </li>
            <li>
              <div><b>Gia hạn cho việc dài</b><div className="d">Gia hạn định kỳ (watchdog), dừng việc nếu gia hạn thất bại.</div></div>
            </li>
            <li>
              <div><b>Chờ có giới hạn</b><div className="d">Thử lại vài lần với backoff, không chờ vô hạn.</div></div>
            </li>
            <li>
              <div><b>Dữ liệu quan trọng thì thêm fencing hoặc kiểm tra ở database</b><div className="d">Đừng chỉ tin vào việc “mình đang giữ khóa”.</div></div>
            </li>
            <li>
              <div><b>Hỏi lại xem có cần lock không</b><div className="d">Unique constraint, idempotency key hoặc một consumer cho mỗi key thường đơn giản và chắc chắn hơn.</div></div>
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}
