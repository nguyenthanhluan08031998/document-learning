import { Code } from "@/components/Code";

export default function GoErrorsPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục lỗi, interface và generics trong Go">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#ge-error"><span>01</span>error là một giá trị</a></li>
          <li><a href="#ge-wrap"><span>02</span>Bọc và kiểm tra lỗi</a></li>
          <li><a href="#ge-panic"><span>03</span>panic và recover</a></li>
          <li><a href="#ge-iface"><span>04</span>Interface thực dụng</a></li>
          <li><a href="#ge-generics"><span>05</span>Generics</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · errors &amp; interfaces</div>
          <h1>Lỗi, Interface và Generics</h1>
          <p className="lede">Ba thứ quyết định code Go &quot;có giống Go&quot; hay không: lỗi là giá trị trả về (không có exception), interface nhỏ được thỏa mãn ngầm, và generics dùng có chừng mực.</p>
          <div className="tape" aria-hidden="true">
            <div>if err != nil</div>
            <div>%w</div>
            <div className="hw">errors.Is / As</div>
            <div>small interface</div>
            <div>generics</div>
          </div>
        </header>

        <section id="ge-error">
          <h2><span className="n">01</span>error là một giá trị</h2>
          <p>Go không có <code>try/catch</code>. Hàm có thể lỗi sẽ trả <code>error</code> làm giá trị cuối; người gọi kiểm tra ngay. Dài dòng nhưng luồng xử lý lỗi hiện ra rõ ràng trong code.</p>
          <Code lang="go">{`func parsePort(s string) (int, error) {
    n, err := strconv.Atoi(s)
    if err != nil {
        return 0, fmt.Errorf("parse port %q: %w", s, err)   // thêm ngữ cảnh, giữ nguyên nhân gốc
    }
    if n < 1 || n > 65535 {
        return 0, errors.New("port out of range")
    }
    return n, nil                                           // error nil nghĩa là thành công
}

port, err := parsePort(os.Getenv("PORT"))
if err != nil {
    log.Fatal(err)                                          // xử lý lỗi, đừng bỏ qua
}`}</Code>
          <div className="note tip"><b>Quy ước:</b> mỗi tầng chỉ <b>xử lý hoặc bọc</b> lỗi, đừng log rồi lại return (một lỗi bị log nhiều lần). Log ở tầng ngoài cùng, nơi quyết định cách phản hồi (HTTP 500, thoát chương trình).</div>
        </section>

        <section id="ge-wrap">
          <h2><span className="n">02</span>Bọc và kiểm tra lỗi</h2>
          <p><code>%w</code> trong <code>fmt.Errorf</code> bọc lỗi gốc để giữ chuỗi nguyên nhân. Sau đó kiểm tra bằng <code>errors.Is</code> (là lỗi cụ thể này?) và <code>errors.As</code> (có kiểu lỗi này không, và lấy ra dùng).</p>
          <Code lang="go">{`// Sentinel error: giá trị cố định để nơi gọi so sánh
var ErrNotFound = errors.New("not found")

// Kiểu lỗi riêng: mang theo dữ liệu
type ValidationError struct {
    Field string
    Msg   string
}
func (e *ValidationError) Error() string { return e.Field + ": " + e.Msg }

func GetUser(id int) (*User, error) {
    u, err := db.Find(id)
    if errors.Is(err, sql.ErrNoRows) {
        return nil, fmt.Errorf("user %d: %w", id, ErrNotFound)   // đổi lỗi tầng thấp sang lỗi nghiệp vụ
    }
    return u, err
}

// Nơi gọi
_, err := GetUser(7)
switch {
case errors.Is(err, ErrNotFound):                  // hoạt động qua bao nhiêu lớp %w cũng được
    http.Error(w, "not found", 404)
case err != nil:
    var ve *ValidationError
    if errors.As(err, &ve) {                       // lấy ra lỗi có kiểu
        http.Error(w, ve.Msg, 422)
        return
    }
    http.Error(w, "internal error", 500)
}`}</Code>
          <p>Không so sánh <code>err == ErrNotFound</code> hay <code>err.Error() == &quot;...&quot;</code>: sẽ hỏng ngay khi lỗi được bọc. <code>errors.Join</code> (Go 1.20+) gộp nhiều lỗi thành một.</p>
        </section>

        <section id="ge-panic">
          <h2><span className="n">03</span>panic và recover</h2>
          <p><code>panic</code> dành cho lỗi lập trình hoặc trạng thái không thể tiếp tục (index ngoài phạm vi, nil pointer, cấu hình bắt buộc thiếu lúc khởi động). Không dùng thay <code>error</code> cho lỗi nghiệp vụ.</p>
          <Code lang="go">{`// recover chỉ hoạt động trong hàm được defer
func safeHandler(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if rec := recover(); rec != nil {
                log.Printf("panic: %v\\n%s", rec, debug.Stack())
                http.Error(w, "internal error", 500)      // một request lỗi không được làm sập server
            }
        }()
        next.ServeHTTP(w, r)
    })
}`}</Code>
          <div className="note"><b>Lưu ý:</b> <code>recover</code> chỉ bắt panic <b>trong cùng goroutine</b>. Panic trong goroutine con không được recover sẽ làm sập cả chương trình, nên goroutine chạy nền thường tự có <code>defer recover</code>.</div>
        </section>

        <section id="ge-iface">
          <h2><span className="n">04</span>Interface thực dụng</h2>
          <p>Interface được thỏa mãn <b>ngầm</b>: kiểu nào có đủ method thì tự động là implementation, không cần khai báo <code>implements</code>. Hệ quả: người <i>dùng</i> định nghĩa interface, không phải người viết.</p>
          <Code lang="go">{`// Định nghĩa ở nơi DÙNG, chỉ gồm method mà code này cần
type UserStore interface {
    Find(ctx context.Context, id int) (*User, error)
}

type Service struct{ store UserStore }      // phụ thuộc vào hành vi, không phụ thuộc Postgres

func NewService(s UserStore) *Service { return &Service{store: s} }

// Kiểu nào có Find khớp đều được nhận: DB thật, hoặc fake trong bộ nhớ để test
type fakeStore struct{}
func (fakeStore) Find(ctx context.Context, id int) (*User, error) {
    return &User{ID: id, Name: "test"}, nil
}
svc := NewService(fakeStore{})`}</Code>
          <ul className="plain">
            <li><b>Interface nhỏ</b>: 1 đến 3 method (<code>io.Reader</code> chỉ có <code>Read</code>). Interface càng nhỏ càng dễ ghép và dễ fake.</li>
            <li><b>Nhận interface, trả struct:</b> tham số hàm là interface để linh hoạt, giá trị trả về là kiểu cụ thể để người dùng có đủ thông tin.</li>
            <li><b>Đừng tạo interface sớm.</b> Chờ có hai implementation hoặc cần mock rồi hãy tách.</li>
          </ul>
          <Code lang="go">{`// Bẫy kinh điển: interface chứa nil pointer thì KHÔNG phải nil
func find() error {
    var e *ValidationError = nil
    return e                      // kiểu là *ValidationError, giá trị nil: interface != nil
}
if err := find(); err != nil {   // true! hãy return nil thuần
    fmt.Println("surprise")
}`}</Code>
        </section>

        <section id="ge-generics">
          <h2><span className="n">05</span>Generics</h2>
          <p>Từ Go 1.18, hàm và kiểu nhận <b>type parameter</b> để dùng cho nhiều kiểu mà không lặp code hay ép về <code>any</code>.</p>
          <Code lang="go">{`// Ràng buộc: những kiểu nào được phép
type Number interface{ ~int | ~int64 | ~float64 }

func Sum[T Number](xs []T) T {
    var total T
    for _, x := range xs { total += x }
    return total
}
Sum([]int{1, 2, 3})               // T được suy ra là int
Sum([]float64{1.5, 2.5})

func Map[T, U any](xs []T, f func(T) U) []U {
    out := make([]U, 0, len(xs))
    for _, x := range xs { out = append(out, f(x)) }
    return out
}

// Kiểu generic
type Stack[T any] struct{ items []T }
func (s *Stack[T]) Push(v T) { s.items = append(s.items, v) }
func (s *Stack[T]) Pop() (T, bool) {
    var zero T
    if len(s.items) == 0 { return zero, false }
    v := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return v, true
}

// Thư viện chuẩn đã có sẵn các hàm phổ biến (Go 1.21+)
slices.Sort(xs); slices.Contains(xs, 3); maps.Keys(m); min(a, b); max(a, b)`}</Code>
          <div className="pp">
            <div><span className="pl">Nên dùng</span>Cấu trúc dữ liệu dùng chung (stack, set, cache), hàm thao tác slice/map (<code>Map</code>, <code>Filter</code>, <code>Keys</code>), nơi trước đây phải copy-paste theo từng kiểu.</div>
            <div className="warnc"><span className="pl">Không cần</span>Khi chỉ có một kiểu cụ thể, hoặc interface đã đủ. Generics không thay được interface khi ta muốn <i>hành vi</i> khác nhau theo kiểu.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
