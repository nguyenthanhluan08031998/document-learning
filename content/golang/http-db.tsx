import { Code } from "@/components/Code";

export default function GoHttpDbPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục HTTP server và database trong Go">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#gh-http"><span>01</span>HTTP server với net/http</a></li>
          <li><a href="#gh-mw"><span>02</span>Middleware</a></li>
          <li><a href="#gh-shutdown"><span>03</span>Timeout và graceful shutdown</a></li>
          <li><a href="#gh-db"><span>04</span>database/sql</a></li>
          <li><a href="#gh-layout"><span>05</span>Cấu trúc project</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · http &amp; database</div>
          <h1>HTTP server và Database</h1>
          <p className="lede">Hai thứ gần như service Go nào cũng có. <code>net/http</code> từ Go 1.22 đã đủ để dựng API (Application Programming Interface) không cần framework; <code>database/sql</code> cho truy vấn, transaction và connection pool. Trang này đi từ handler tới tắt server an toàn và cấu trúc thư mục.</p>
          <div className="tape" aria-hidden="true">
            <div>ServeMux</div>
            <div>middleware</div>
            <div className="hw">Shutdown</div>
            <div>QueryContext</div>
            <div>Tx</div>
          </div>
        </header>

        <section id="gh-http">
          <h2><span className="n">01</span>HTTP server với net/http</h2>
          <Code lang="go">{`type userHandler struct{ store UserStore }

func (h *userHandler) get(w http.ResponseWriter, r *http.Request) {
    id, err := strconv.Atoi(r.PathValue("id"))        // Go 1.22: tham số trên đường dẫn
    if err != nil {
        http.Error(w, "bad id", http.StatusBadRequest)
        return
    }
    u, err := h.store.Find(r.Context(), id)           // truyền context của request xuống dưới
    if errors.Is(err, ErrNotFound) {
        http.Error(w, "not found", http.StatusNotFound)
        return
    }
    if err != nil {
        log.Printf("get user %d: %v", id, err)
        http.Error(w, "internal error", http.StatusInternalServerError)
        return
    }
    writeJSON(w, http.StatusOK, u)
}

func (h *userHandler) create(w http.ResponseWriter, r *http.Request) {
    var in struct {
        Name string \`json:"name"\`
    }
    r.Body = http.MaxBytesReader(w, r.Body, 1<<20)     // giới hạn body tối đa 1 MiB
    if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
        http.Error(w, "invalid json", http.StatusBadRequest)
        return
    }
    // ... kiểm tra hợp lệ, lưu
    writeJSON(w, http.StatusCreated, map[string]string{"name": in.Name})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)                              // header trước, rồi tới body
    json.NewEncoder(w).Encode(v)
}

func routes(h *userHandler) http.Handler {
    mux := http.NewServeMux()
    mux.HandleFunc("GET /users/{id}", h.get)           // method + mẫu đường dẫn trong một chuỗi
    mux.HandleFunc("POST /users", h.create)
    mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(204) })
    return mux
}`}</Code>
          <div className="note tip"><b>Có cần Gin, Echo, Fiber không?</b> Với API thông thường, <code>net/http</code> + một router chuẩn là đủ. Framework tiện khi cần binding/validation sẵn; so sánh chi tiết ở trang Production.</div>
        </section>

        <section id="gh-mw">
          <h2><span className="n">02</span>Middleware</h2>
          <p>Middleware là hàm nhận một <code>http.Handler</code> và trả về <code>http.Handler</code> mới bọc quanh nó. Dùng cho logging, auth, recover, request id.</p>
          <Code lang="go">{`type Middleware func(http.Handler) http.Handler

func logging(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}

type ctxKey struct{}                                     // kiểu không export: key không bị trùng

func auth(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        user, err := verify(r.Header.Get("Authorization"))
        if err != nil {
            http.Error(w, "unauthorized", http.StatusUnauthorized)
            return                                       // KHÔNG gọi next
        }
        ctx := context.WithValue(r.Context(), ctxKey{}, user)
        next.ServeHTTP(w, r.WithContext(ctx))            // chuyển thông tin user cho handler qua context
    })
}

// Nối chuỗi: middleware đầu tiên là lớp ngoài cùng
func chain(h http.Handler, ms ...Middleware) http.Handler {
    for i := len(ms) - 1; i >= 0; i-- {
        h = ms[i](h)
    }
    return h
}
handler := chain(routes(h), logging, auth)               // logging -> auth -> routes`}</Code>
        </section>

        <section id="gh-shutdown">
          <h2><span className="n">03</span>Timeout và graceful shutdown</h2>
          <p><code>http.ListenAndServe</code> mặc định <b>không có timeout</b>: client chậm giữ kết nối mãi. Luôn cấu hình <code>http.Server</code> đầy đủ, và tắt có kiểm soát để không cắt ngang request đang xử lý (quan trọng khi deploy trên Kubernetes).</p>
          <Code lang="go">{`func main() {
    srv := &http.Server{
        Addr:              ":8080",
        Handler:           handler,
        ReadHeaderTimeout: 5 * time.Second,     // chống tấn công slowloris
        ReadTimeout:       10 * time.Second,
        WriteTimeout:      30 * time.Second,
        IdleTimeout:       60 * time.Second,
    }

    // ctx bị hủy khi nhận SIGINT hoặc SIGTERM
    ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
    defer stop()

    go func() {
        if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
            log.Fatal(err)
        }
    }()

    <-ctx.Done()                                // chờ tín hiệu
    shutdownCtx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
    defer cancel()
    if err := srv.Shutdown(shutdownCtx); err != nil {   // ngừng nhận request mới, chờ các request đang xử lý
        log.Printf("forced shutdown: %v", err)
    }
    db.Close()                                  // sau đó giải phóng tài nguyên
}`}</Code>
          <div className="note"><b>Trên Kubernetes:</b> pod nhận SIGTERM rồi có <code>terminationGracePeriodSeconds</code> (mặc định 30 giây). Thời gian <code>Shutdown</code> phải nhỏ hơn con số này.</div>
        </section>

        <section id="gh-db">
          <h2><span className="n">04</span>database/sql</h2>
          <p><code>database/sql</code> là giao diện chung; driver cụ thể (<code>pgx</code> cho PostgreSQL (Structured Query Language), <code>go-sql-driver/mysql</code>) được import ngầm. <code>*sql.DB</code> là <b>connection pool</b>, tạo một lần và dùng chung cho cả chương trình, không mở/đóng mỗi request.</p>
          <Code lang="go">{`db, err := sql.Open("pgx", os.Getenv("DATABASE_URL"))   // chưa kết nối ngay
if err != nil { log.Fatal(err) }
db.SetMaxOpenConns(20)                   // giới hạn số kết nối đồng thời (DB cũng có giới hạn riêng)
db.SetMaxIdleConns(10)
db.SetConnMaxLifetime(30 * time.Minute)
if err := db.PingContext(ctx); err != nil { log.Fatal(err) }   // kiểm tra kết nối

// Một dòng
func (s *Store) Find(ctx context.Context, id int) (*User, error) {
    var u User
    err := s.db.QueryRowContext(ctx,
        "SELECT id, name FROM users WHERE id = $1", id,   // placeholder: không bao giờ ghép chuỗi để tạo SQL
    ).Scan(&u.ID, &u.Name)
    if errors.Is(err, sql.ErrNoRows) {
        return nil, ErrNotFound
    }
    return &u, err
}

// Nhiều dòng
rows, err := s.db.QueryContext(ctx, "SELECT id, name FROM users WHERE active = $1", true)
if err != nil { return nil, err }
defer rows.Close()                       // PHẢI đóng, nếu không kết nối không được trả về pool
var out []User
for rows.Next() {
    var u User
    if err := rows.Scan(&u.ID, &u.Name); err != nil { return nil, err }
    out = append(out, u)
}
if err := rows.Err(); err != nil { return nil, err }   // lỗi làm vòng lặp kết thúc sớm`}</Code>
          <p><b>Transaction:</b> các câu lệnh trong cùng transaction phải dùng cùng <code>tx</code>, không dùng <code>db</code>.</p>
          <Code lang="go">{`func (s *Store) Transfer(ctx context.Context, from, to int, amount int64) (err error) {
    tx, err := s.db.BeginTx(ctx, nil)
    if err != nil { return err }
    defer func() {
        if err != nil { tx.Rollback() }  // lỗi nào bên dưới cũng rollback toàn bộ
    }()

    if _, err = tx.ExecContext(ctx, "UPDATE accounts SET balance = balance - $1 WHERE id = $2", amount, from); err != nil {
        return err
    }
    if _, err = tx.ExecContext(ctx, "UPDATE accounts SET balance = balance + $1 WHERE id = $2", amount, to); err != nil {
        return err
    }
    return tx.Commit()                   // err được gán nếu commit lỗi, lúc đó rollback trong defer không có tác dụng
}`}</Code>
          <ul className="plain">
            <li>Luôn dùng biến thể <code>...Context</code> để request bị hủy thì truy vấn cũng bị hủy.</li>
            <li>Cột có thể <code>NULL</code> cần <code>sql.NullString</code> hoặc con trỏ (<code>*string</code>) khi scan.</li>
            <li>Để bớt viết tay: <code>sqlx</code> (scan vào struct), <code>sqlc</code> (sinh code từ file SQL). Chi tiết lựa chọn ở trang Production.</li>
          </ul>
        </section>

        <section id="gh-layout">
          <h2><span className="n">05</span>Cấu trúc project</h2>
          <Code lang="text">{`shop/
  go.mod                      # module example.com/shop, go 1.22
  cmd/
    api/main.go               # mỗi binary một thư mục; main chỉ nối các thành phần lại
    worker/main.go
  internal/                   # module khác không import được
    user/
      handler.go              # tầng HTTP
      service.go              # nghiệp vụ, phụ thuộc interface nhỏ
      store.go                # truy cập database
    platform/
      postgres.go             # hạ tầng dùng chung (DB, logger, config)
  migrations/                 # các file migration SQL`}</Code>
          <ul className="plain">
            <li><b>Chia theo tính năng</b> (<code>user</code>, <code>order</code>) thay vì theo tầng (<code>controllers</code>, <code>models</code>): thay đổi một tính năng chỉ chạm một thư mục.</li>
            <li><b><code>main</code> chỉ nối dây:</b> đọc config, tạo DB (Database), tạo service, chạy server. Logic nằm ở package khác nên test được.</li>
            <li><b>Dependency injection thủ công:</b> truyền phụ thuộc qua constructor (<code>NewService(store)</code>), không cần framework DI.</li>
            <li>Lệnh hay dùng: <code>go mod tidy</code>, <code>go vet ./...</code>, <code>go test ./...</code>, <code>go build ./cmd/api</code>.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
