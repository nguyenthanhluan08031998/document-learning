import { Code } from "@/components/Code";

export default function DbLockPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục lock trong DB">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#lk-atomic"><span>01</span>Atomic operation</a></li>
          <li><a href="#lk-pessimistic"><span>02</span>Pessimistic lock</a></li>
          <li><a href="#lk-skip"><span>03</span>{"NOWAIT & SKIP LOCKED"}</a></li>
          <li><a href="#lk-deadlock"><span>04</span>Deadlock</a></li>
          <li><a href="#lk-optimistic"><span>05</span>Optimistic lock</a></li>
          <li><a href="#lk-vs"><span>06</span>Pessimistic vs Optimistic</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">đồng thời · database</div>
          <h1>Lock trong database</h1>
          <p className="lede">Ba cách chính để sửa dữ liệu an toàn trong một database: làm cho thao tác thành <b>atomic</b>, <b>khóa trước</b> (pessimistic), hoặc <b>kiểm tra phiên bản lúc ghi</b> (optimistic). Ví dụ dùng PostgreSQL và thư viện <code>pg</code>.</p>
          <div className="tape" aria-hidden="true">
            <div>BEGIN</div>
            <div>FOR UPDATE</div>
            <div>UPDATE</div>
            <div className="hw">COMMIT</div>
            <div className="leo">version+1</div>
          </div>
        </header>
        <section id="lk-atomic">
          <h2><span className="n">01</span>Atomic operation: cách đơn giản nhất</h2>
          <p>Nếu được, đừng đọc lên rồi mới ghi. Đẩy cả điều kiện lẫn phép tính vào <b>một câu lệnh</b>; database tự đảm bảo câu lệnh đó không bị chen ngang.</p>
          <Code lang="ts">{`async function buy(productId: string) {
  // Check and decrement in one statement: no read-modify-write gap
  const res = await db.query(
    "UPDATE products SET stock = stock - 1 WHERE id = $1 AND stock > 0 RETURNING stock",
    [productId],
  );
  if (res.rowCount === 0) throw new Error("Sold out");
  return res.rows[0].stock;
}

// Same idea elsewhere
await redis.decr(\`stock:\${productId}\`);                       // Redis atomic counter
await orders.updateOne({ _id: id }, { $inc: { views: 1 } });  // MongoDB $inc`}</Code>
          <div className="pp">
            <div><span className="pl">Hợp với</span>Tăng giảm số đếm, trừ tồn kho, đổi trạng thái có điều kiện (<code>WHERE status = 'pending'</code>).</div>
            <div className="warnc"><span className="pl">Giới hạn</span>Chỉ dùng được khi logic gói gọn trong một câu lệnh trên một dòng hoặc một key. Logic phức tạp, nhiều bảng thì cần lock.</div>
          </div>
        </section>
        <section id="lk-pessimistic">
          <h2><span className="n">02</span>Pessimistic lock: khóa trước, sửa sau</h2>
          <p>Giả định xung đột <b>sẽ xảy ra</b>, nên khóa dòng ngay khi đọc. Transaction khác muốn khóa cùng dòng phải <b>chờ</b> tới khi transaction đầu commit hoặc rollback.</p>
          <Code lang="ts">{`async function transfer(fromId: string, toId: string, amount: number) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Lock both rows in a fixed order (by id) to avoid deadlocks
    const ids = [fromId, toId].sort();
    const { rows } = await client.query(
      "SELECT id, balance FROM accounts WHERE id = ANY($1) ORDER BY id FOR UPDATE",
      [ids],
    );
    const from = rows.find(r => r.id === fromId)!;
    if (from.balance < amount) throw new Error("Insufficient funds");

    await client.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [amount, fromId]);
    await client.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [amount, toId]);
    await client.query("COMMIT");          // locks are released here
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}`}</Code>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Mệnh đề</th>
                  <th>Khóa</th>
                  <th>Dùng khi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">FOR UPDATE</td>
                  <td>Khóa độc quyền dòng</td>
                  <td>Sẽ sửa hoặc xóa dòng</td>
                </tr>
                <tr>
                  <td className="m">FOR NO KEY UPDATE</td>
                  <td>Như trên nhưng vẫn cho bảng khác tham chiếu khóa ngoại</td>
                  <td>Sửa cột không phải khóa; nhẹ hơn FOR UPDATE</td>
                </tr>
                <tr>
                  <td className="m">FOR SHARE</td>
                  <td>Khóa chia sẻ: nhiều bên cùng đọc, cấm sửa</td>
                  <td>Cần chắc dòng không đổi trong lúc dùng</td>
                </tr>
                <tr>
                  <td className="m">LOCK TABLE</td>
                  <td>Khóa cả bảng</td>
                  <td>Hiếm khi cần; tránh trên hệ thống đang chạy</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note">Lock chỉ sống trong <b>transaction</b>. Gọi <code>FOR UPDATE</code> ngoài <code>BEGIN … COMMIT</code> thì khóa nhả ngay sau câu lệnh. Giữ transaction càng ngắn càng tốt: không gọi API bên ngoài, không chờ người dùng khi đang giữ lock.</div>
        </section>
        <section id="lk-skip">
          <h2><span className="n">03</span>{"NOWAIT & SKIP LOCKED: không đứng chờ"}</h2>
          <p>Mặc định <code>FOR UPDATE</code> gặp dòng đang bị khóa thì <b>đứng chờ</b>. Thêm một từ khóa ở cuối để đổi cách hành xử:</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Cách viết</th>
                  <th>Gặp dòng đã bị khóa thì</th>
                  <th>Dùng khi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">FOR UPDATE</td>
                  <td><b>Đứng chờ</b> tới khi dòng được nhả</td>
                  <td>Bắt buộc phải xử lý đúng dòng đó (chuyển tiền)</td>
                </tr>
                <tr>
                  <td className="m">FOR UPDATE NOWAIT</td>
                  <td><b>Báo lỗi ngay</b> (mã <code>55P03</code>)</td>
                  <td>Báo người dùng “ghế này đang có người đặt”</td>
                </tr>
                <tr>
                  <td className="m">FOR UPDATE SKIP LOCKED</td>
                  <td><b>Bỏ qua</b>, lấy dòng khác còn trống</td>
                  <td>Dòng nào cũng được, miễn chưa ai nhận: job queue, phát mã giảm giá</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Code lang="ts">{`// NOWAIT: fail immediately if someone else holds the lock
try {
  await client.query("SELECT * FROM seats WHERE id = $1 FOR UPDATE NOWAIT", [seatId]);
} catch (e: any) {
  if (e.code === "55P03") throw new Error("Seat is being booked by someone else");
  throw e;
}

// Bounded wait instead of waiting forever
await client.query("SET LOCAL lock_timeout = '2s'");`}</Code>
          <h3>SKIP LOCKED: nhiều worker chia nhau một bảng việc</h3>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 370" role="img" aria-label="Ba worker cùng chạy SELECT FOR UPDATE SKIP LOCKED LIMIT 3 trên bảng jobs: worker A nhận job 1 đến 3, worker B bỏ qua các dòng đã khóa và nhận 4 đến 6, worker C nhận 7 đến 9"> <defs><marker id="sk0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker><marker id="sk1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--new)" /></marker><marker id="sk2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker></defs> <rect className="s-box" x="330" y="14" width="240" height="342" rx="8" /> <text className="s-tb" x="344" y="38">jobs</text> <text className="s-tm" x="446" y="38">status = pending</text> <rect x="344" y="52" width="212" height="26" rx="4" style={{ fill: "var(--surface)", stroke: "var(--accent)", strokeWidth: "1.6" }} /> <text className="s-tm" x="356" y="69" style={{ fill: "var(--ink)" }}>job 1</text> <text className="s-tm" x="470" y="69" style={{ fill: "var(--accent)" }}>khóa bởi A</text> <rect x="344" y="84" width="212" height="26" rx="4" style={{ fill: "var(--surface)", stroke: "var(--accent)", strokeWidth: "1.6" }} /> <text className="s-tm" x="356" y="101" style={{ fill: "var(--ink)" }}>job 2</text> <text className="s-tm" x="470" y="101" style={{ fill: "var(--accent)" }}>khóa bởi A</text> <rect x="344" y="116" width="212" height="26" rx="4" style={{ fill: "var(--surface)", stroke: "var(--accent)", strokeWidth: "1.6" }} /> <text className="s-tm" x="356" y="133" style={{ fill: "var(--ink)" }}>job 3</text> <text className="s-tm" x="470" y="133" style={{ fill: "var(--accent)" }}>khóa bởi A</text> <rect x="344" y="148" width="212" height="26" rx="4" style={{ fill: "var(--surface)", stroke: "var(--new)", strokeWidth: "1.6" }} /> <text className="s-tm" x="356" y="165" style={{ fill: "var(--ink)" }}>job 4</text> <text className="s-tm" x="470" y="165" style={{ fill: "var(--new)" }}>khóa bởi B</text> <rect x="344" y="180" width="212" height="26" rx="4" style={{ fill: "var(--surface)", stroke: "var(--new)", strokeWidth: "1.6" }} /> <text className="s-tm" x="356" y="197" style={{ fill: "var(--ink)" }}>job 5</text> <text className="s-tm" x="470" y="197" style={{ fill: "var(--new)" }}>khóa bởi B</text> <rect x="344" y="212" width="212" height="26" rx="4" style={{ fill: "var(--surface)", stroke: "var(--new)", strokeWidth: "1.6" }} /> <text className="s-tm" x="356" y="229" style={{ fill: "var(--ink)" }}>job 6</text> <text className="s-tm" x="470" y="229" style={{ fill: "var(--new)" }}>khóa bởi B</text> <rect x="344" y="244" width="212" height="26" rx="4" style={{ fill: "var(--surface)", stroke: "var(--warn)", strokeWidth: "1.6" }} /> <text className="s-tm" x="356" y="261" style={{ fill: "var(--ink)" }}>job 7</text> <text className="s-tm" x="470" y="261" style={{ fill: "var(--warn)" }}>khóa bởi C</text> <rect x="344" y="276" width="212" height="26" rx="4" style={{ fill: "var(--surface)", stroke: "var(--warn)", strokeWidth: "1.6" }} /> <text className="s-tm" x="356" y="293" style={{ fill: "var(--ink)" }}>job 8</text> <text className="s-tm" x="470" y="293" style={{ fill: "var(--warn)" }}>khóa bởi C</text> <rect x="344" y="308" width="212" height="26" rx="4" style={{ fill: "var(--surface)", stroke: "var(--warn)", strokeWidth: "1.6" }} /> <text className="s-tm" x="356" y="325" style={{ fill: "var(--ink)" }}>job 9</text> <text className="s-tm" x="470" y="325" style={{ fill: "var(--warn)" }}>khóa bởi C</text> <rect x="40" y="58" width="170" height="60" rx="7" style={{ fill: "var(--surface)", stroke: "var(--accent)", strokeWidth: "1.6" }} /> <text className="s-tb" x="54" y="84">Worker A</text> <text className="s-tm" x="54" y="103">LIMIT 3 SKIP LOCKED</text> <path d="M210 88 C270 88 280 97 342 97" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#sk0)" /> <rect x="690" y="154" width="170" height="60" rx="7" style={{ fill: "var(--surface)", stroke: "var(--new)", strokeWidth: "1.6" }} /> <text className="s-tb" x="704" y="180">Worker B</text> <text className="s-tm" x="704" y="199">LIMIT 3 SKIP LOCKED</text> <path d="M690 184 C630 184 620 193 558 193" style={{ stroke: "var(--new)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#sk1)" /> <rect x="40" y="250" width="170" height="60" rx="7" style={{ fill: "var(--surface)", stroke: "var(--warn)", strokeWidth: "1.6" }} /> <text className="s-tb" x="54" y="276">Worker C</text> <text className="s-tm" x="54" y="295">LIMIT 3 SKIP LOCKED</text> <path d="M210 280 C270 280 280 289 342 289" style={{ stroke: "var(--warn)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#sk2)" /> <text className="s-tm" x="690" y="300">B chạy cùng lúc với A,</text> <text className="s-tm" x="690" y="318">thấy job 1–3 đang bị khóa</text> <text className="s-tm" x="690" y="336">nên bỏ qua, lấy 4–6</text> </svg>
            </div>
            <figcaption>Mỗi worker chỉ thấy các dòng chưa ai khóa, nên tự động chia việc mà không cần điều phối.</figcaption>
          </figure>
          <p>Ba worker chạy cùng một câu lệnh lấy 3 job. Worker A khóa job 1–3; worker B gặp 1–3 đang bị khóa nên bỏ qua và lấy 4–6; worker C lấy 7–9. Không ai nhận trùng, không ai phải chờ.</p>
          <h3>Cách 1: giữ transaction trong lúc xử lý</h3>
          <Code lang="ts">{`async function workOnce(): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: jobs } = await client.query(\`
      SELECT id, payload FROM jobs
      WHERE status = 'pending'
      ORDER BY created_at
      LIMIT 10
      FOR UPDATE SKIP LOCKED
    \`);
    for (const job of jobs) {
      await handle(job.payload);                        // must be short
      await client.query("UPDATE jobs SET status = 'done' WHERE id = $1", [job.id]);
    }
    await client.query("COMMIT");                       // locks released, rows done
    return jobs.length;
  } catch (e) {
    await client.query("ROLLBACK");                     // jobs go back to pending automatically
    throw e;
  } finally {
    client.release();
  }
}`}</Code>
          <p>Đơn giản và an toàn: worker chết giữa chừng thì transaction rollback, job tự quay về <code>pending</code>. Nhược điểm là giữ connection và lock suốt thời gian xử lý, nên chỉ hợp với việc ngắn.</p>
          <h3>Cách 2: nhận việc nhanh, xử lý ngoài transaction</h3>
          <Code lang="ts">{`// Claim a batch in one short statement, then process without holding locks
const { rows: jobs } = await pool.query(\`
  UPDATE jobs SET status = 'processing', locked_by = $1, locked_at = now()
  WHERE id IN (
    SELECT id FROM jobs
    WHERE status = 'pending'
    ORDER BY created_at
    LIMIT 10
    FOR UPDATE SKIP LOCKED
  )
  RETURNING id, payload
\`, [workerId]);

for (const job of jobs) {
  await handle(job.payload);                            // can be slow: no lock held now
  await pool.query("UPDATE jobs SET status = 'done' WHERE id = $1", [job.id]);
}

// Reaper: return jobs stuck in "processing" (worker crashed) to the queue
await pool.query(\`
  UPDATE jobs SET status = 'pending', locked_by = NULL
  WHERE status = 'processing' AND locked_at < now() - interval '5 minutes'
\`);`}</Code>
          <p>Hợp với việc chạy lâu. Đổi lại phải có tiến trình dọn job bị kẹt, và việc xử lý nên idempotent vì một job có thể bị chạy lại sau khi bị trả về.</p>
          <div className="pp">
            <div><span className="pl">Hay dùng cho</span>Job queue trong PostgreSQL (pg-boss, Graphile Worker, Solid Queue), chia đơn hàng cho nhiều instance, phát mã giảm giá hoặc vé có hạn, xử lý bảng outbox bằng nhiều relay.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Kết quả cố tình bỏ sót dòng bị khóa: không dùng để đọc báo cáo hay đếm. Phải nằm trong transaction. Cần index trên cột lọc (<code>status, created_at</code>). Hỗ trợ từ PostgreSQL 9.5 và MySQL 8.0.</div>
          </div>
        </section>
        <section id="lk-deadlock">
          <h2><span className="n">04</span>Deadlock</h2>
          <p>Transaction A khóa dòng 1 rồi chờ dòng 2; transaction B khóa dòng 2 rồi chờ dòng 1. Cả hai chờ nhau mãi. PostgreSQL phát hiện sau <code>deadlock_timeout</code> (mặc định 1 giây) và hủy một bên với lỗi <code>40P01</code>.</p>
          <ul className="plain">
            <li><b>Khóa theo thứ tự cố định</b>, ví dụ luôn theo id tăng dần như hàm <code>transfer</code> ở trên.</li>
            <li>Khóa ít dòng nhất có thể, giữ transaction ngắn.</li>
            <li>Bắt lỗi deadlock và <b>retry</b> cả transaction.</li>
          </ul>
        </section>
        <section id="lk-optimistic">
          <h2><span className="n">05</span>Optimistic lock: không khóa, kiểm tra lúc ghi</h2>
          <p>Giả định xung đột <b>hiếm</b>. Mỗi dòng có cột <code>version</code>. Khi ghi, chỉ cập nhật nếu version vẫn như lúc đọc; nếu người khác đã sửa trước thì không có dòng nào được cập nhật, ta biết có xung đột và làm lại.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 306" role="img" aria-label="Pessimistic lock: transaction 1 khóa dòng bằng FOR UPDATE, transaction 2 phải chờ tới khi transaction 1 commit"> <defs><marker id="pea" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker><marker id="peb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker><marker id="pec" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--bad)" /></marker><marker id="ped" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker><marker id="pee" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--new)" /></marker></defs> <rect className="s-box" x="0.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="70.0" y="35" textAnchor="middle">Transaction 1</text> <text className="s-tm" x="70.0" y="52" textAnchor="middle">giữ khóa</text> <path d="M70.0 62 V292" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-disk" x="380.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="450.0" y="35" textAnchor="middle">Database</text> <text className="s-tm" x="450.0" y="52" textAnchor="middle">products</text> <path d="M450.0 62 V292" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-box" x="760.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="830.0" y="35" textAnchor="middle">Transaction 2</text> <text className="s-tm" x="830.0" y="52" textAnchor="middle">đến sau</text> <path d="M830.0 62 V292" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <path d="M74.0 92 H444.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#pea)" /> <text className="s-tm" x="260.0" y="85" textAnchor="middle" style={{ fill: "var(--accent)" }}>BEGIN; SELECT … FOR UPDATE</text> <path d="M446.0 126 H76.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#peb)" /> <text className="s-tm" x="260.0" y="119" textAnchor="middle" style={{ fill: "var(--muted)" }}>đã khóa dòng</text> <path d="M826.0 160 H456.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#pea)" /> <text className="s-tm" x="640.0" y="153" textAnchor="middle" style={{ fill: "var(--accent)" }}>SELECT … FOR UPDATE</text> <text className="s-tm" x="10.0" y="194" style={{ fill: "var(--warn)", fontWeight: "600" }}>Transaction 2 bị chặn, đứng chờ</text> <path d="M74.0 232 H444.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#pea)" /> <text className="s-tm" x="260.0" y="225" textAnchor="middle" style={{ fill: "var(--accent)" }}>UPDATE …; COMMIT</text> <path d="M454.0 266 H824.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#peb)" /> <text className="s-tm" x="640.0" y="259" textAnchor="middle" style={{ fill: "var(--muted)" }}>giờ mới có khóa, đọc giá trị mới</text> </svg>
            </div>
            <figcaption>Pessimistic: bên đến sau đứng chờ, không ai bị thất bại nhưng tốn thời gian chờ.</figcaption>
          </figure>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 340" role="img" aria-label="Optimistic lock: hai transaction cùng đọc version 7, transaction 1 cập nhật thành công, transaction 2 cập nhật 0 dòng và phải thử lại"> <defs><marker id="opa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker><marker id="opb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker><marker id="opc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--bad)" /></marker><marker id="opd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker><marker id="ope" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--new)" /></marker></defs> <rect className="s-box" x="0.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="70.0" y="35" textAnchor="middle">Transaction 1</text> <text className="s-tm" x="70.0" y="52" textAnchor="middle">đến trước</text> <path d="M70.0 62 V326" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-disk" x="380.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="450.0" y="35" textAnchor="middle">Database</text> <text className="s-tm" x="450.0" y="52" textAnchor="middle">products</text> <path d="M450.0 62 V326" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-box" x="760.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="830.0" y="35" textAnchor="middle">Transaction 2</text> <text className="s-tm" x="830.0" y="52" textAnchor="middle">đến sau</text> <path d="M830.0 62 V326" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <path d="M74.0 92 H444.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#opa)" /> <text className="s-tm" x="260.0" y="85" textAnchor="middle" style={{ fill: "var(--accent)" }}>SELECT … (version = 7)</text> <path d="M826.0 126 H456.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#opa)" /> <text className="s-tm" x="640.0" y="119" textAnchor="middle" style={{ fill: "var(--accent)" }}>SELECT … (version = 7)</text> <path d="M74.0 160 H444.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#opa)" /> <text className="s-tm" x="260.0" y="153" textAnchor="middle" style={{ fill: "var(--accent)" }}>UPDATE … WHERE version = 7</text> <path d="M446.0 194 H76.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#opb)" /> <text className="s-tm" x="260.0" y="187" textAnchor="middle" style={{ fill: "var(--muted)" }}>1 dòng, version → 8</text> <path d="M826.0 228 H456.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#opa)" /> <text className="s-tm" x="640.0" y="221" textAnchor="middle" style={{ fill: "var(--accent)" }}>UPDATE … WHERE version = 7</text> <path d="M454.0 262 H824.0" style={{ stroke: "var(--bad)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#opc)" /> <text className="s-tm" x="640.0" y="255" textAnchor="middle" style={{ fill: "var(--bad)" }}>0 dòng: có người sửa trước</text> <text className="s-tm" x="10.0" y="296" style={{ fill: "var(--warn)", fontWeight: "600" }}>Transaction 2 đọc lại và thử lại</text> </svg>
            </div>
            <figcaption>Optimistic: không ai chờ, nhưng bên thua phải tự phát hiện (0 dòng được cập nhật) và làm lại.</figcaption>
          </figure>
          <Code lang="ts">{`async function renameProduct(id: string, newName: string, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const { rows } = await db.query("SELECT name, version FROM products WHERE id = $1", [id]);
    const current = rows[0];

    // Write only if nobody changed the row since we read it
    const res = await db.query(
      "UPDATE products SET name = $1, version = version + 1 WHERE id = $2 AND version = $3",
      [newName, id, current.version],
    );
    if (res.rowCount === 1) return;        // success
    // rowCount 0: someone else won the race, read again and retry
  }
  throw new Error("Conflict: product was modified by someone else");
}`}</Code>
          <ul className="plain">
            <li><b>Qua HTTP</b>: server trả <code>ETag: "v7"</code>, client gửi lại <code>If-Match: "v7"</code> khi PUT; lệch thì trả <b>412 Precondition Failed</b> (xem tab REST).</li>
            <li><b>ORM</b>: JPA <code>@Version</code>, TypeORM <code>@VersionColumn</code>, Prisma dùng điều kiện <code>{"where: { id, version }"}</code>.</li>
            <li>Có thể dùng <code>updated_at</code> thay cho version, nhưng dễ trùng khi hai lần ghi cùng mili giây.</li>
          </ul>
        </section>
        <section id="lk-vs">
          <h2><span className="n">06</span>Pessimistic vs Optimistic</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th />
                  <th>Pessimistic</th>
                  <th>Optimistic</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Giả định</b></td>
                  <td>Xung đột thường xuyên</td>
                  <td>Xung đột hiếm</td>
                </tr>
                <tr>
                  <td><b>Khi xung đột</b></td>
                  <td>Bên sau chờ</td>
                  <td>Bên sau thất bại và retry</td>
                </tr>
                <tr>
                  <td><b>Giữ tài nguyên</b></td>
                  <td>Giữ lock và connection suốt transaction</td>
                  <td>Không giữ gì giữa lúc đọc và ghi</td>
                </tr>
                <tr>
                  <td><b>Nguy cơ</b></td>
                  <td>Deadlock, chờ lâu, nghẽn khi tải cao</td>
                  <td>Retry liên tục khi tranh chấp nhiều</td>
                </tr>
                <tr>
                  <td><b>Thao tác dài, có người dùng</b></td>
                  <td>Không hợp (không thể giữ lock khi người dùng đang sửa form)</td>
                  <td>Rất hợp</td>
                </tr>
                <tr>
                  <td><b>Ví dụ</b></td>
                  <td>Chuyển tiền, giữ ghế khi thanh toán</td>
                  <td>Sửa hồ sơ, sửa bài viết, cấu hình</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
