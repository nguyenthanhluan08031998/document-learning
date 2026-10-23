import { Code } from "@/components/Code";

export default function GoBasicsPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục Go cơ bản">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#gb-vars"><span>01</span>Biến, hằng, zero value</a></li>
          <li><a href="#gb-struct"><span>02</span>Struct, method, pointer</a></li>
          <li><a href="#gb-flow"><span>03</span>for, switch, defer</a></li>
          <li><a href="#gb-pkg"><span>04</span>Package và export</a></li>
          <li><a href="#gb-traps"><span>05</span>Bẫy hay gặp</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · basics</div>
          <h1>Go cơ bản cho người đi làm</h1>
          <p className="lede">Phần nền để đọc và viết Go hằng ngày: biến và zero value, struct với method, pointer, vòng lặp, <code>defer</code>, package. Cuối trang là những bẫy làm người mới (và cả người cũ) mất thời gian debug.</p>
          <div className="tape" aria-hidden="true">
            <div>:=</div>
            <div>zero value</div>
            <div className="hw">pointer receiver</div>
            <div>defer</div>
            <div>range</div>
          </div>
        </header>

        <section id="gb-vars">
          <h2><span className="n">01</span>Biến, hằng và zero value</h2>
          <p>Mọi biến trong Go đều có giá trị khởi tạo mặc định gọi là <b>zero value</b>, không có &quot;biến chưa khởi tạo&quot;. Nhờ vậy nhiều struct dùng được ngay mà không cần constructor.</p>
          <Code lang="go">{`package main

import "fmt"

const MaxRetry = 3                 // kiểu suy ra theo cách dùng, tính lúc biên dịch

type Weekday int
const (                            // iota: enum tự tăng
    Sunday Weekday = iota          // 0
    Monday                         // 1
    Tuesday                        // 2
)

func main() {
    var n int                      // 0
    var s string                   // ""
    var p *int                     // nil
    var xs []int                   // nil slice, nhưng len(xs) == 0 và append vẫn dùng được
    var m map[string]int           // nil map: đọc được, ghi sẽ panic

    name := "Lan"                  // := khai báo và tự suy ra kiểu (chỉ trong hàm)
    a, b := 1, 2                   // gán nhiều biến cùng lúc
    a, b = b, a                    // hoán đổi

    fmt.Println(n, s, p, xs, m, name, a, b)
}`}</Code>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Kiểu</th><th>Zero value</th></tr>
              </thead>
              <tbody>
                <tr><td><code>int</code>, <code>float64</code></td><td><code>0</code></td></tr>
                <tr><td><code>bool</code></td><td><code>false</code></td></tr>
                <tr><td><code>string</code></td><td><code>&quot;&quot;</code> (rỗng, không bao giờ nil)</td></tr>
                <tr><td>pointer, slice, map, chan, func, interface</td><td><code>nil</code></td></tr>
                <tr><td>struct</td><td>mọi field đều là zero value của nó</td></tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Ý thức thiết kế:</b> hãy làm cho zero value của kiểu bạn tạo ra <i>dùng được</i>. <code>sync.Mutex</code> và <code>bytes.Buffer</code> dùng được ngay khi khai báo vì lý do đó.</div>
        </section>

        <section id="gb-struct">
          <h2><span className="n">02</span>Struct, method và pointer</h2>
          <p>Go không có class. Dữ liệu nằm trong <code>struct</code>, hành vi là <code>method</code> gắn vào kiểu qua <b>receiver</b>.</p>
          <Code lang="go">{`type User struct {
    ID    int    \`json:"id"\`            // struct tag: encoding/json dùng
    Name  string \`json:"name"\`
    email string                         // chữ thường: không export, chỉ dùng trong package
}

// Value receiver: làm việc trên bản copy, không sửa được struct của nơi gọi
func (u User) Display() string { return u.Name }

// Pointer receiver: làm việc trên bản gốc, sửa được
func (u *User) Rename(name string) {
    u.Name = name                        // viết gọn của (*u).Name = name: Go tự dereference pointer
}

func NewUser(name string) *User {        // constructor theo quy ước: NewXxx
    return &User{Name: name}
}

func main() {
    u := User{ID: 1, Name: "Lan"}        // gán theo tên field, thứ tự không quan trọng
    u.Rename("Mai")                      // Go tự lấy &u giúp bạn
    fmt.Println(u.Display())             // Mai
}`}</Code>
          <div className="pp">
            <div><span className="pl">Dùng pointer receiver khi</span>method cần sửa struct; struct lớn (tránh copy); struct chứa <code>sync.Mutex</code> (không được copy); hoặc đã có method nào dùng pointer receiver (giữ nhất quán).</div>
            <div><span className="pl">Dùng value receiver khi</span>kiểu nhỏ và bất biến (<code>time.Time</code>, một vài số), hoặc là map/slice/func nhỏ.</div>
          </div>
          <p><b>Pointer</b> trong Go đơn giản hơn C: không có phép tính trên địa chỉ. <code>&amp;x</code> lấy địa chỉ, <code>*p</code> lấy giá trị. Truyền giá trị thì hàm nhận bản copy; truyền pointer thì hàm sửa được bản gốc.</p>
          <Code lang="go">{`func incByValue(n int)  { n++ }        // chỉ sửa bản copy
func incByPointer(n *int) { *n++ }      // sửa bản gốc; kiểu int không có field nên phải tự viết *n

x := 1
incByValue(x)       // x == 1
incByPointer(&x)    // x == 2

// Composition thay cho kế thừa: nhúng struct để dùng lại field và method
type Admin struct {
    User                // nhúng
    Permissions []string
}
a := Admin{User: User{Name: "Lan"}}
a.Rename("Mai")         // được đưa lên từ User`}</Code>
        </section>

        <section id="gb-flow">
          <h2><span className="n">03</span>for, switch và defer</h2>
          <p>Go chỉ có một vòng lặp là <code>for</code>, dùng cho mọi kiểu.</p>
          <Code lang="go">{`for i := 0; i < 3; i++ {}               // kiểu cổ điển
for cond {}                               // như while
for {}                                    // vô hạn, thoát bằng break hoặc return
for i := range 3 {}                       // Go 1.22+: 0, 1, 2

nums := []int{10, 20, 30}
for i, v := range nums {}                 // chỉ số và giá trị (v là bản copy)
for _, v := range nums {}                 // bỏ qua chỉ số bằng _
for k, v := range map[string]int{"a": 1} {}   // thứ tự duyệt map là ngẫu nhiên có chủ ý

switch day := Weekday(1); day {           // mặc định không fallthrough, không cần break
case Sunday, Tuesday:
    fmt.Println("a")
case Monday:
    fmt.Println("b")
default:
    fmt.Println("c")
}

switch {                                  // không có biểu thức: thay cho chuỗi if/else
case n < 0:
    fmt.Println("negative")
case n == 0:
    fmt.Println("zero")
}`}</Code>
          <p><code>defer</code> hoãn một lời gọi hàm tới khi hàm bao quanh return. Dùng để dọn dẹp ngay cạnh chỗ cấp phát tài nguyên, nên không quên đóng.</p>
          <Code lang="go">{`func readFile(path string) ([]byte, error) {
    f, err := os.Open(path)
    if err != nil {
        return nil, err
    }
    defer f.Close()                       // chạy khi readFile kết thúc, ở mọi nhánh
    return io.ReadAll(f)
}

func deferOrder() {
    for i := 0; i < 3; i++ {
        defer fmt.Println(i)              // in 2, 1, 0: vào sau ra trước
    }
}

func trace() {
    start := time.Now()
    defer func() { fmt.Println(time.Since(start)) }()   // tham số của defer thường được tính NGAY lúc khai báo
}`}</Code>
          <div className="note"><b>Lưu ý:</b> <code>defer</code> trong vòng lặp chỉ chạy khi hàm kết thúc, không phải mỗi vòng. Mở nhiều file trong loop thì đưa phần xử lý vào một hàm riêng.</div>
        </section>

        <section id="gb-pkg">
          <h2><span className="n">04</span>Package và export</h2>
          <ul className="plain">
            <li>Mỗi thư mục là một package. Tên bắt đầu bằng <b>chữ hoa</b> thì export (<code>NewUser</code>, <code>User</code>), chữ thường thì chỉ dùng trong package.</li>
            <li>Không có <code>public</code>/<code>private</code> riêng; quy ước chữ hoa/thường là tất cả.</li>
            <li>Import vòng (A import B, B import A) bị cấm. Gặp thì tách phần dùng chung ra package thứ ba, hoặc dùng interface.</li>
            <li><code>init()</code> chạy tự động khi package được nạp; hạn chế dùng vì khó test và khó thấy thứ tự.</li>
          </ul>
          <Code lang="go">{`// internal/user/user.go
package user                              // tên package = tên thư mục cuối

type User struct{ Name string }           // export (dùng được từ package khác)
func New(name string) *User { return &User{Name: name} }
func validate(name string) bool { return name != "" }   // không export

// cmd/api/main.go
import "example.com/shop/internal/user"
u := user.New("Lan")                      // gọi qua tên package`}</Code>
        </section>

        <section id="gb-traps">
          <h2><span className="n">05</span>Bẫy hay gặp</h2>
          <Code lang="go">{`// 1. := trong block tạo biến MỚI và che biến ngoài
var err error
if true {
    x, err := doThing()          // err này là một biến khác
    _, _ = x, err
}
// err bên ngoài vẫn nil: lỗi bị mất

// 2. Ghi vào nil map sẽ panic
var m map[string]int
m["a"] = 1                       // panic: assignment to entry in nil map
m = make(map[string]int)         // luôn make trước khi ghi

// 3. range trả về bản copy của từng phần tử
users := []User{{Name: "a"}}
for _, u := range users { u.Name = "x" }        // users không đổi
for i := range users { users[i].Name = "x" }    // cách này mới đúng

// 4. Các slice dùng chung mảng bên dưới
a := []int{1, 2, 3}
b := a[:2]
b[0] = 99                        // a[0] cũng thành 99

// 5. Biến vòng lặp bị goroutine bắt (trước Go 1.22 tất cả dùng chung một biến)
for i := 0; i < 3; i++ {
    go func() { fmt.Println(i) }()   // Go 1.22+: mỗi vòng lặp có i riêng
}`}</Code>
          <ul className="plain">
            <li>Biến hoặc import không dùng là <b>lỗi biên dịch</b>. Dùng <code>_</code> nếu cố ý bỏ qua.</li>
            <li>Không có ép kiểu ngầm: <code>int</code> và <code>int64</code> là hai kiểu khác nhau, phải ghi <code>int64(x)</code>.</li>
            <li>Chạy <code>gofmt</code> (hoặc <code>go fmt ./...</code>) cho mọi file; cả cộng đồng dùng chung một kiểu định dạng.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
