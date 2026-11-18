import { Flow } from "@/components/Flow";
import type { InterviewData } from "@/components/InterviewList";
import type { Locale } from "@/lib/notebook";

const INDEX = "https://www.postgresql.org/docs/current/indexes-types.html";
const MULTI = "https://www.postgresql.org/docs/current/indexes-multicolumn.html";
const ISO = "https://www.postgresql.org/docs/current/transaction-iso.html";
const MVCC = "https://www.postgresql.org/docs/current/mvcc-intro.html";
const LOCK = "https://www.postgresql.org/docs/current/explicit-locking.html";
const EXPLAIN = "https://www.postgresql.org/docs/current/using-explain.html";
const TX = "https://www.postgresql.org/docs/current/tutorial-transactions.html";
const LIMIT = "https://www.postgresql.org/docs/current/queries-limit.html";
const REPL = "https://www.postgresql.org/docs/current/high-availability.html";
const MONGO = "https://www.mongodb.com/docs/manual/data-modeling/";
const PARTITION = "https://www.postgresql.org/docs/current/ddl-partitioning.html";

export default function build(l: Locale): InterviewData {
  const t = (vi: string, en: string) => (l === "vi" ? vi : en);
  return {
    eyebrow: t("phỏng vấn · database", "interview · database"),
    title: t("Phỏng vấn Database", "Database interview"),
    lede: t(
      "Bấm vào câu hỏi để xem đáp án, ví dụ và sơ đồ. Ví dụ dùng PostgreSQL với bảng orders của hệ thống bán hàng; nguồn là tài liệu chính thức.",
      "Click a question to see the answer, an example and a diagram. Examples use PostgreSQL with the orders table of the shop system; the source is the official docs.",
    ),
    items: [
      {
        q: t("ACID là gì?", "What is ACID?"),
        a: [
          t(
            "Atomicity: transaction chạy hết hoặc không gì cả. Consistency: dữ liệu luôn thoả các ràng buộc (khoá ngoại, CHECK, UNIQUE). Isolation: các transaction chạy song song không nhìn thấy trạng thái dở dang của nhau (mức độ tuỳ isolation level). Durability: đã COMMIT thì không mất kể cả khi sập máy (nhờ WAL).",
            "Atomicity: a transaction runs fully or not at all. Consistency: data always satisfies constraints (foreign keys, CHECK, UNIQUE). Isolation: concurrent transactions do not see each other's half-done state (how much depends on the isolation level). Durability: once COMMITted, data survives a crash (thanks to the WAL).",
          ),
        ],
        code: { lang: "sql", src: `BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;  -- ${t("lỗi ở giữa thì ROLLBACK, không ai mất tiền", "an error in between means ROLLBACK, nobody loses money")}` },
        href: TX, label: "Transactions",
      },
      {
        q: t("Index là gì? Vì sao không index hết mọi cột?", "What is an index? Why not index every column?"),
        a: t(
          "Index (thường là B-tree) là cấu trúc sắp xếp sẵn giúp tìm dòng theo giá trị mà không phải quét cả bảng. Cái giá: tốn dung lượng, và mỗi INSERT/UPDATE/DELETE phải cập nhật thêm mọi index, nên ghi chậm hơn. Chỉ index cột hay dùng trong WHERE, JOIN, ORDER BY và có độ chọn lọc cao.",
          "An index (usually a B-tree) is a pre-sorted structure that finds rows by value without scanning the whole table. The cost: it takes space, and every INSERT/UPDATE/DELETE must also update every index, so writes get slower. Index only columns that are often used in WHERE, JOIN or ORDER BY and are selective.",
        ),
        code: { lang: "sql", src: `CREATE INDEX idx_orders_user ON orders (user_id);
-- ${t("giờ truy vấn này dùng Index Scan thay vì Seq Scan", "this query now uses an Index Scan instead of a Seq Scan")}
SELECT * FROM orders WHERE user_id = 42;` },
        href: INDEX, label: "Index types",
      },
      {
        q: t("Composite index (a, b) dùng được cho truy vấn nào?", "Which queries can a composite index (a, b) serve?"),
        a: t(
          "Theo quy tắc tiền tố bên trái: dùng tốt cho WHERE a = ?, WHERE a = ? AND b = ?, WHERE a = ? ORDER BY b. Gần như không giúp WHERE b = ? một mình. Đặt cột lọc bằng (=) trước, cột khoảng (>, <) hoặc sắp xếp sau.",
          "By the leftmost-prefix rule: it serves WHERE a = ?, WHERE a = ? AND b = ?, WHERE a = ? ORDER BY b well. It barely helps WHERE b = ? on its own. Put equality-filtered columns first, range (>, <) or sort columns after.",
        ),
        code: { lang: "sql", src: `CREATE INDEX idx_orders_user_created ON orders (user_id, created_at);

SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC LIMIT 20;  -- ${t("dùng index", "uses the index")}
SELECT * FROM orders WHERE created_at > now() - interval '1 day';          -- ${t("không dùng tốt", "not served well")}` },
        href: MULTI, label: "Multicolumn indexes",
      },
      {
        q: t("Các isolation level và hiện tượng mỗi mức ngăn được?", "Isolation levels and which anomalies each prevents?"),
        a: [
          t(
            "Read Uncommitted < Read Committed < Repeatable Read < Serializable. Ba hiện tượng kinh điển: dirty read (đọc dữ liệu chưa commit), non-repeatable read (đọc lại một dòng thấy giá trị khác), phantom read (chạy lại truy vấn thấy thêm/bớt dòng).",
            "Read Uncommitted < Read Committed < Repeatable Read < Serializable. The three classic anomalies: dirty read (reading uncommitted data), non-repeatable read (re-reading a row gives a different value), phantom read (re-running a query returns extra or missing rows).",
          ),
          t(
            "PostgreSQL mặc định Read Committed, không bao giờ cho dirty read, và Repeatable Read của nó đã chặn cả phantom. MySQL InnoDB mặc định Repeatable Read. Serializable có thể báo lỗi serialization failure, ứng dụng phải retry.",
            "PostgreSQL defaults to Read Committed, never allows dirty reads, and its Repeatable Read also blocks phantoms. MySQL InnoDB defaults to Repeatable Read. Serializable may raise a serialization failure that the application must retry.",
          ),
        ],
        code: { lang: "sql", src: `BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT sum(total) FROM orders WHERE user_id = 42;
-- ${t("transaction khác commit thêm order ở đây...", "another transaction commits a new order here...")}
SELECT sum(total) FROM orders WHERE user_id = 42;  -- ${t("vẫn ra kết quả cũ", "still the old result")}
COMMIT;` },
        href: ISO, label: "Transaction isolation",
      },
      {
        q: t("MVCC là gì?", "What is MVCC?"),
        a: t(
          "Multi-Version Concurrency Control: mỗi lần UPDATE tạo phiên bản dòng mới thay vì ghi đè, mỗi transaction đọc snapshot phù hợp với nó. Nhờ vậy người đọc không chặn người ghi và ngược lại. Phiên bản cũ được VACUUM dọn dẹp sau.",
          "Multi-Version Concurrency Control: each UPDATE creates a new row version instead of overwriting, and each transaction reads the snapshot that fits it. So readers do not block writers and vice versa. Old versions are cleaned up later by VACUUM.",
        ),
        diagram: <Flow id="dbmv" label="MVCC row versions" steps={[
          { title: "v1", sub: "status=new" },
          { title: "UPDATE", sub: t("tạo bản mới", "new version") },
          { title: "v2", sub: "status=paid", hl: true },
          { title: "VACUUM", sub: t("dọn v1", "removes v1") },
        ]} caption={t("Transaction bắt đầu trước UPDATE vẫn thấy v1.", "A transaction that started before the UPDATE still sees v1.")} />,
        href: MVCC, label: "MVCC introduction",
      },
      {
        q: t("Optimistic lock khác pessimistic lock?", "Optimistic vs pessimistic locking?"),
        a: t(
          "Pessimistic: khoá dòng ngay khi đọc (SELECT ... FOR UPDATE), người khác phải chờ; hợp khi tranh chấp cao. Optimistic: không khoá, thêm cột version, lúc UPDATE kiểm tra version còn đúng không; nếu 0 dòng bị ảnh hưởng thì có người sửa trước, báo lỗi hoặc thử lại; hợp khi ít tranh chấp.",
          "Pessimistic: lock the row as you read it (SELECT ... FOR UPDATE), others must wait; good under heavy contention. Optimistic: no lock, add a version column and check it in the UPDATE; if 0 rows are affected someone changed it first, so fail or retry; good when contention is rare.",
        ),
        code: [
          { lang: "sql", src: `-- Pessimistic
BEGIN;
SELECT stock FROM products WHERE id = 7 FOR UPDATE;
UPDATE products SET stock = stock - 1 WHERE id = 7;
COMMIT;` },
          { lang: "sql", src: `-- Optimistic
UPDATE products SET stock = stock - 1, version = version + 1
WHERE id = 7 AND version = 3;   -- ${t("0 dòng → xung đột", "0 rows → conflict")}` },
        ],
        href: LOCK, label: "Explicit locking",
      },
      {
        q: t("Deadlock xảy ra thế nào và tránh ra sao?", "How does a deadlock happen and how do you avoid it?"),
        a: t(
          "Hai transaction mỗi bên giữ một khoá và chờ khoá bên kia. Database phát hiện và huỷ một bên. Cách tránh: luôn khoá theo cùng một thứ tự (ví dụ id tăng dần), giữ transaction ngắn, và retry khi bị huỷ vì deadlock.",
          "Two transactions each hold one lock and wait for the other's. The database detects this and aborts one. To avoid it: always lock in the same order (for example ascending id), keep transactions short, and retry when aborted for a deadlock.",
        ),
        diagram: <Flow id="dbdl" label="Deadlock" steps={[
          { title: "T1", sub: t("giữ A, chờ B", "holds A, waits B") },
          { title: "T2", sub: t("giữ B, chờ A", "holds B, waits A"), hl: true },
          { title: t("DB huỷ T2", "DB aborts T2"), sub: "deadlock detected" },
        ]} />,
        href: LOCK, label: "Deadlocks",
      },
      {
        q: t("Lỗi N+1 query là gì?", "What is the N+1 query problem?"),
        a: t(
          "Lấy danh sách N dòng bằng 1 query, rồi với mỗi dòng lại chạy thêm 1 query để lấy dữ liệu liên quan, tổng cộng N+1 lần đi về database. Sửa bằng JOIN, WHERE id IN (...), hoặc eager loading / DataLoader của ORM.",
          "You fetch N rows with 1 query, then run 1 more query per row for related data, N+1 round trips in total. Fix it with a JOIN, WHERE id IN (...), or the ORM's eager loading / a DataLoader.",
        ),
        code: { lang: "ts", src: `// ${t("Sai: 1 + N query", "Bad: 1 + N queries")}
const orders = await db.query("SELECT * FROM orders LIMIT 50");
for (const o of orders) o.user = await db.query("SELECT * FROM users WHERE id = $1", [o.user_id]);

// ${t("Đúng: 2 query", "Good: 2 queries")}
const ids = [...new Set(orders.map(o => o.user_id))];
const users = await db.query("SELECT * FROM users WHERE id = ANY($1)", [ids]);` },
        href: EXPLAIN, label: "Using EXPLAIN",
      },
      {
        q: t("Đọc EXPLAIN ANALYZE thế nào?", "How do you read EXPLAIN ANALYZE?"),
        a: t(
          "Đọc cây kế hoạch từ trong ra ngoài. Để ý: Seq Scan trên bảng lớn (thiếu index), số rows ước tính lệch xa rows thực tế (thống kê cũ, chạy ANALYZE), Sort hoặc Hash tràn ra đĩa, và node nào chiếm phần lớn actual time.",
          "Read the plan tree from the inside out. Watch for: a Seq Scan on a big table (missing index), estimated rows far from actual rows (stale stats, run ANALYZE), a Sort or Hash spilling to disk, and which node takes most of the actual time.",
        ),
        code: { lang: "sql", src: `EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC LIMIT 20;
-- Limit  (actual time=0.03..0.05 rows=20)
--   ->  Index Scan Backward using idx_orders_user_created on orders` },
        href: EXPLAIN, label: "Using EXPLAIN",
      },
      {
        q: t("Phân trang OFFSET khác keyset (cursor)?", "OFFSET vs keyset (cursor) pagination?"),
        a: t(
          "OFFSET 100000 vẫn phải đọc rồi bỏ 100000 dòng nên trang càng sâu càng chậm, và dữ liệu chèn thêm làm trùng hoặc sót dòng. Keyset dùng giá trị cuối của trang trước (WHERE created_at < ?) nên luôn đi thẳng vào index, ổn định; đổi lại không nhảy được tới trang bất kỳ.",
          "OFFSET 100000 still reads and discards 100000 rows, so deeper pages get slower, and inserts cause duplicated or skipped rows. Keyset uses the last value of the previous page (WHERE created_at < ?), so it always seeks straight into the index and stays stable; the trade-off is you cannot jump to an arbitrary page.",
        ),
        code: { lang: "sql", src: `-- OFFSET
SELECT * FROM orders ORDER BY id DESC LIMIT 20 OFFSET 100000;

-- Keyset
SELECT * FROM orders WHERE id < $last_id ORDER BY id DESC LIMIT 20;` },
        href: LIMIT, label: "LIMIT and OFFSET",
      },
      {
        q: t("Chuẩn hoá (normalization) và khi nào nên phi chuẩn hoá?", "Normalization, and when to denormalize?"),
        a: t(
          "Chuẩn hoá (1NF, 2NF, 3NF) tách dữ liệu để mỗi sự thật chỉ lưu một chỗ, tránh cập nhật lệch. Phi chuẩn hoá là cố ý lưu lặp (ví dụ lưu total trong orders thay vì cộng order_items mỗi lần) để đọc nhanh hơn, đổi lại phải tự giữ đồng bộ.",
          "Normalization (1NF, 2NF, 3NF) splits data so each fact is stored in one place, avoiding inconsistent updates. Denormalization deliberately duplicates data (for example storing total on orders instead of summing order_items every time) for faster reads, at the cost of keeping copies in sync yourself.",
        ),
        href: "https://www.postgresql.org/docs/current/ddl-constraints.html", label: "Constraints",
      },
      {
        q: t("Khi nào chọn SQL, khi nào chọn NoSQL?", "When to pick SQL vs NoSQL?"),
        a: t(
          "SQL (PostgreSQL, MySQL): dữ liệu quan hệ, cần transaction nhiều bảng, truy vấn linh hoạt, JOIN. NoSQL: document (MongoDB) khi dữ liệu dạng cây đọc theo cả khối; key-value (DynamoDB, Redis) khi biết trước kiểu truy cập và cần scale ngang lớn. Thiết kế NoSQL bắt đầu từ câu truy vấn, không phải từ thực thể.",
          "SQL (PostgreSQL, MySQL): relational data, multi-table transactions, flexible queries and JOINs. NoSQL: document stores (MongoDB) for tree-shaped data read as a whole; key-value (DynamoDB, Redis) when access patterns are known up front and you need large horizontal scale. NoSQL design starts from the queries, not the entities.",
        ),
        href: MONGO, label: "MongoDB data modeling",
      },
      {
        q: t("Replication, partitioning và sharding khác nhau?", "Replication vs partitioning vs sharding?"),
        a: t(
          "Replication: sao chép toàn bộ dữ liệu sang replica để đọc song song và chịu lỗi; replica async có thể trễ (đọc sau ghi chưa thấy). Partitioning: chia một bảng lớn thành nhiều phần (theo tháng, theo hash) trong cùng một server. Sharding: chia dữ liệu ra nhiều server theo shard key để scale ghi; khó JOIN và transaction xuyên shard.",
          "Replication: copy all the data to replicas for read scaling and fault tolerance; async replicas can lag (read-after-write may miss). Partitioning: split one big table into parts (by month, by hash) on the same server. Sharding: split data across servers by a shard key to scale writes; cross-shard JOINs and transactions get hard.",
        ),
        diagram: <Flow id="dbrp" label="Primary and replicas" steps={[
          { title: "App", sub: t("ghi", "writes") },
          { title: "Primary", sub: "WAL", hl: true },
          { title: "Replica", sub: t("chỉ đọc", "read-only") },
        ]} caption={t("Ghi vào primary, đọc có thể chia cho replica.", "Writes go to the primary; reads can be spread to replicas.")} />,
        href: REPL, label: "High availability & replication",
      },
      {
        q: t("Partition bảng orders theo thời gian thế nào?", "How do you partition the orders table by time?"),
        a: t(
          "Dùng declarative partitioning theo RANGE trên created_at. Truy vấn có lọc thời gian chỉ chạm partition liên quan (partition pruning), và xoá dữ liệu cũ chỉ là DROP một partition thay vì DELETE hàng triệu dòng.",
          "Use declarative RANGE partitioning on created_at. Queries filtered by time touch only the relevant partitions (partition pruning), and removing old data is a DROP of one partition instead of DELETEing millions of rows.",
        ),
        code: { lang: "sql", src: `CREATE TABLE orders (
  id bigint, user_id bigint, total numeric, created_at timestamptz NOT NULL
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2026_11 PARTITION OF orders
  FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');` },
        href: PARTITION, label: "Table partitioning",
      },
    ],
  };
}
