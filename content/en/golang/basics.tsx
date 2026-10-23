import { Code } from "@/components/Code";

export default function GoBasicsPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Go basics contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#gb-vars"><span>01</span>Variables, constants, zero values</a></li>
          <li><a href="#gb-struct"><span>02</span>Structs, methods, pointers</a></li>
          <li><a href="#gb-flow"><span>03</span>for, switch, defer</a></li>
          <li><a href="#gb-pkg"><span>04</span>Packages and exports</a></li>
          <li><a href="#gb-traps"><span>05</span>Common traps</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · basics</div>
          <h1>Go basics for working developers</h1>
          <p className="lede">The foundation for reading and writing Go every day: variables and zero values, structs with methods, pointers, loops, <code>defer</code>, packages. The page ends with traps that cost newcomers (and veterans) debugging time.</p>
          <div className="tape" aria-hidden="true">
            <div>:=</div>
            <div>zero value</div>
            <div className="hw">pointer receiver</div>
            <div>defer</div>
            <div>range</div>
          </div>
        </header>

        <section id="gb-vars">
          <h2><span className="n">01</span>Variables, constants and zero values</h2>
          <p>Every variable in Go has a default value called its <b>zero value</b>; there is no &quot;uninitialized variable&quot;. Many structs are therefore usable straight away without a constructor.</p>
          <Code lang="go">{`package main

import "fmt"

const MaxRetry = 3                 // typed by use, evaluated at compile time

type Weekday int
const (                            // iota: auto-incrementing enum
    Sunday Weekday = iota          // 0
    Monday                         // 1
    Tuesday                        // 2
)

func main() {
    var n int                      // 0
    var s string                   // ""
    var p *int                     // nil
    var xs []int                   // nil slice, but len(xs) == 0 and append works
    var m map[string]int           // nil map: reading is fine, writing panics

    name := "Lan"                  // := declares and infers the type (inside functions only)
    a, b := 1, 2                   // multiple assignment
    a, b = b, a                    // swap

    fmt.Println(n, s, p, xs, m, name, a, b)
}`}</Code>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Type</th><th>Zero value</th></tr>
              </thead>
              <tbody>
                <tr><td><code>int</code>, <code>float64</code></td><td><code>0</code></td></tr>
                <tr><td><code>bool</code></td><td><code>false</code></td></tr>
                <tr><td><code>string</code></td><td><code>&quot;&quot;</code> (empty, never nil)</td></tr>
                <tr><td>pointer, slice, map, chan, func, interface</td><td><code>nil</code></td></tr>
                <tr><td>struct</td><td>every field set to its own zero value</td></tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Design habit:</b> make the zero value of your own types <i>usable</i>. <code>sync.Mutex</code> and <code>bytes.Buffer</code> work as soon as they are declared for exactly that reason.</div>
        </section>

        <section id="gb-struct">
          <h2><span className="n">02</span>Structs, methods and pointers</h2>
          <p>Go has no classes. Data lives in a <code>struct</code>, behaviour is a <code>method</code> attached to a type through a <b>receiver</b>.</p>
          <Code lang="go">{`type User struct {
    ID    int    \`json:"id"\`            // struct tag: used by encoding/json
    Name  string \`json:"name"\`
    email string                         // lowercase: unexported, private to the package
}

// Value receiver: works on a copy, cannot change the caller's struct
func (u User) Display() string { return u.Name }

// Pointer receiver: works on the original, can change it
func (u *User) Rename(name string) {
    u.Name = name                        // shorthand for (*u).Name = name: Go dereferences the pointer for you
}

func NewUser(name string) *User {        // constructor by convention: NewXxx
    return &User{Name: name}
}

func main() {
    u := User{ID: 1, Name: "Lan"}        // named fields, order does not matter
    u.Rename("Mai")                      // Go takes &u for you
    fmt.Println(u.Display())             // Mai
}`}</Code>
          <div className="pp">
            <div><span className="pl">Use a pointer receiver when</span>the method must modify the struct; the struct is large (avoid copying); it contains a <code>sync.Mutex</code> (must not be copied); or another method already uses a pointer receiver (stay consistent).</div>
            <div><span className="pl">Use a value receiver when</span>the type is small and immutable (<code>time.Time</code>, a few numbers), or is a small map/slice/func type.</div>
          </div>
          <p><b>Pointers</b> in Go are simpler than in C: no pointer arithmetic. <code>&amp;x</code> takes an address, <code>*p</code> reads the value. Passing a value gives the function a copy; passing a pointer lets it modify the original.</p>
          <Code lang="go">{`func incByValue(n int)  { n++ }        // changes a copy
func incByPointer(n *int) { *n++ }      // changes the original; an int has no fields, so you must write *n yourself

x := 1
incByValue(x)       // x == 1
incByPointer(&x)    // x == 2

// Composition instead of inheritance: embed a struct to reuse its fields and methods
type Admin struct {
    User                // embedded
    Permissions []string
}
a := Admin{User: User{Name: "Lan"}}
a.Rename("Mai")         // promoted from User`}</Code>
        </section>

        <section id="gb-flow">
          <h2><span className="n">03</span>for, switch and defer</h2>
          <p>Go has a single loop keyword, <code>for</code>, used in every form.</p>
          <Code lang="go">{`for i := 0; i < 3; i++ {}               // classic
for cond {}                               // while
for {}                                    // infinite, leave with break or return
for i := range 3 {}                       // Go 1.22+: 0, 1, 2

nums := []int{10, 20, 30}
for i, v := range nums {}                 // index and value (v is a copy)
for _, v := range nums {}                 // ignore the index with _
for k, v := range map[string]int{"a": 1} {}   // map order is random on purpose

switch day := Weekday(1); day {           // no fallthrough by default, no break needed
case Sunday, Tuesday:
    fmt.Println("a")
case Monday:
    fmt.Println("b")
default:
    fmt.Println("c")
}

switch {                                  // no tag: replaces an if/else chain
case n < 0:
    fmt.Println("negative")
case n == 0:
    fmt.Println("zero")
}`}</Code>
          <p><code>defer</code> postpones a function call until the surrounding function returns. Use it for cleanup right next to where the resource is acquired, so it is never forgotten.</p>
          <Code lang="go">{`func readFile(path string) ([]byte, error) {
    f, err := os.Open(path)
    if err != nil {
        return nil, err
    }
    defer f.Close()                       // runs when readFile returns, on every path
    return io.ReadAll(f)
}

func deferOrder() {
    for i := 0; i < 3; i++ {
        defer fmt.Println(i)              // prints 2, 1, 0: last in, first out
    }
}

func trace() {
    start := time.Now()
    defer func() { fmt.Println(time.Since(start)) }()   // arguments of a plain defer are evaluated NOW
}`}</Code>
          <div className="note"><b>Note:</b> a <code>defer</code> inside a loop runs when the function ends, not on each iteration. When opening many files in a loop, move the body into its own function.</div>
        </section>

        <section id="gb-pkg">
          <h2><span className="n">04</span>Packages and exports</h2>
          <ul className="plain">
            <li>Each directory is a package. A name starting with an <b>uppercase letter</b> is exported (<code>NewUser</code>, <code>User</code>); lowercase is package-private.</li>
            <li>There is no separate <code>public</code>/<code>private</code> keyword; the capitalization rule is all there is.</li>
            <li>Import cycles (A imports B, B imports A) are forbidden. Extract the shared part into a third package, or use an interface.</li>
            <li><code>init()</code> runs automatically when a package loads; use it sparingly since it is hard to test and its order is hard to see.</li>
          </ul>
          <Code lang="go">{`// internal/user/user.go
package user                              // package name = last folder name

type User struct{ Name string }           // exported
func New(name string) *User { return &User{Name: name} }
func validate(name string) bool { return name != "" }   // unexported

// cmd/api/main.go
import "example.com/shop/internal/user"
u := user.New("Lan")                      // call through the package name`}</Code>
        </section>

        <section id="gb-traps">
          <h2><span className="n">05</span>Common traps</h2>
          <Code lang="go">{`// 1. := inside a block creates a NEW variable and shadows the outer one
var err error
if true {
    x, err := doThing()          // this err is a different variable
    _, _ = x, err
}
// outer err is still nil: the error was lost

// 2. Writing to a nil map panics
var m map[string]int
m["a"] = 1                       // panic: assignment to entry in nil map
m = make(map[string]int)         // always make before writing

// 3. range gives a copy of each element
users := []User{{Name: "a"}}
for _, u := range users { u.Name = "x" }        // users unchanged
for i := range users { users[i].Name = "x" }    // this one works

// 4. Slices share their backing array
a := []int{1, 2, 3}
b := a[:2]
b[0] = 99                        // a[0] is 99 too

// 5. Loop variable captured by a goroutine (before Go 1.22 all shared one variable)
for i := 0; i < 3; i++ {
    go func() { fmt.Println(i) }()   // Go 1.22+: each iteration has its own i
}`}</Code>
          <ul className="plain">
            <li>An unused variable or import is a <b>compile error</b>. Use <code>_</code> if you mean to ignore it.</li>
            <li>No implicit conversions: <code>int</code> and <code>int64</code> are different types, you must write <code>int64(x)</code>.</li>
            <li>Run <code>gofmt</code> (or <code>go fmt ./...</code>) on every file; the whole community shares one formatting style.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
