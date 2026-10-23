import { Code } from "@/components/Code";

export default function GoErrorsPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Go errors, interfaces and generics contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#ge-error"><span>01</span>An error is a value</a></li>
          <li><a href="#ge-wrap"><span>02</span>Wrapping and checking errors</a></li>
          <li><a href="#ge-panic"><span>03</span>panic and recover</a></li>
          <li><a href="#ge-iface"><span>04</span>Practical interfaces</a></li>
          <li><a href="#ge-generics"><span>05</span>Generics</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · errors &amp; interfaces</div>
          <h1>Errors, Interfaces and Generics</h1>
          <p className="lede">Three things that decide whether code feels like Go: errors are return values (no exceptions), small interfaces are satisfied implicitly, and generics are used in moderation.</p>
          <div className="tape" aria-hidden="true">
            <div>if err != nil</div>
            <div>%w</div>
            <div className="hw">errors.Is / As</div>
            <div>small interface</div>
            <div>generics</div>
          </div>
        </header>

        <section id="ge-error">
          <h2><span className="n">01</span>An error is a value</h2>
          <p>Go has no <code>try/catch</code>. A function that can fail returns an <code>error</code> as its last value, and the caller checks it right away. It is verbose, but the error path is plainly visible in the code.</p>
          <Code lang="go">{`func parsePort(s string) (int, error) {
    n, err := strconv.Atoi(s)
    if err != nil {
        return 0, fmt.Errorf("parse port %q: %w", s, err)   // add context, keep the cause
    }
    if n < 1 || n > 65535 {
        return 0, errors.New("port out of range")
    }
    return n, nil                                           // nil error means success
}

port, err := parsePort(os.Getenv("PORT"))
if err != nil {
    log.Fatal(err)                                          // handle it, do not ignore it
}`}</Code>
          <div className="note tip"><b>Convention:</b> each layer should either <b>handle or wrap</b> an error, not log it and also return it (one error logged many times). Log at the outermost layer, where the response is decided (HTTP 500, exit the program).</div>
        </section>

        <section id="ge-wrap">
          <h2><span className="n">02</span>Wrapping and checking errors</h2>
          <p><code>%w</code> in <code>fmt.Errorf</code> wraps the original error to keep the cause chain. Check it afterwards with <code>errors.Is</code> (is it this specific error?) and <code>errors.As</code> (is it this error type, and extract it).</p>
          <Code lang="go">{`// Sentinel error: a fixed value callers compare against
var ErrNotFound = errors.New("not found")

// Custom error type: carries data
type ValidationError struct {
    Field string
    Msg   string
}
func (e *ValidationError) Error() string { return e.Field + ": " + e.Msg }

func GetUser(id int) (*User, error) {
    u, err := db.Find(id)
    if errors.Is(err, sql.ErrNoRows) {
        return nil, fmt.Errorf("user %d: %w", id, ErrNotFound)   // translate a low-level error
    }
    return u, err
}

// Caller
_, err := GetUser(7)
switch {
case errors.Is(err, ErrNotFound):                  // works through any number of %w layers
    http.Error(w, "not found", 404)
case err != nil:
    var ve *ValidationError
    if errors.As(err, &ve) {                       // extract the typed error
        http.Error(w, ve.Msg, 422)
        return
    }
    http.Error(w, "internal error", 500)
}`}</Code>
          <p>Do not compare <code>err == ErrNotFound</code> or <code>err.Error() == &quot;...&quot;</code>: it breaks as soon as the error is wrapped. <code>errors.Join</code> (Go 1.20+) combines several errors into one.</p>
        </section>

        <section id="ge-panic">
          <h2><span className="n">03</span>panic and recover</h2>
          <p><code>panic</code> is for programmer errors or states that cannot continue (index out of range, nil pointer, a required setting missing at startup). Do not use it instead of <code>error</code> for business failures.</p>
          <Code lang="go">{`// recover only works inside a deferred function
func safeHandler(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if rec := recover(); rec != nil {
                log.Printf("panic: %v\\n%s", rec, debug.Stack())
                http.Error(w, "internal error", 500)      // one bad request must not kill the server
            }
        }()
        next.ServeHTTP(w, r)
    })
}`}</Code>
          <div className="note"><b>Note:</b> <code>recover</code> only catches a panic <b>in the same goroutine</b>. An unrecovered panic in a child goroutine crashes the whole program, so background goroutines often carry their own <code>defer recover</code>.</div>
        </section>

        <section id="ge-iface">
          <h2><span className="n">04</span>Practical interfaces</h2>
          <p>Interfaces are satisfied <b>implicitly</b>: any type with the required methods is automatically an implementation, with no <code>implements</code> keyword. The consequence is that the <i>consumer</i> defines the interface, not the author.</p>
          <Code lang="go">{`// Defined where it is USED, with only the methods this code needs
type UserStore interface {
    Find(ctx context.Context, id int) (*User, error)
}

type Service struct{ store UserStore }      // depends on the behaviour, not on Postgres

func NewService(s UserStore) *Service { return &Service{store: s} }

// Any type with a matching Find is accepted: real DB, in-memory fake for tests
type fakeStore struct{}
func (fakeStore) Find(ctx context.Context, id int) (*User, error) {
    return &User{ID: id, Name: "test"}, nil
}
svc := NewService(fakeStore{})`}</Code>
          <ul className="plain">
            <li><b>Small interfaces</b>: 1 to 3 methods (<code>io.Reader</code> has only <code>Read</code>). The smaller, the easier to compose and fake.</li>
            <li><b>Accept interfaces, return structs:</b> parameters are interfaces for flexibility, return values are concrete types so callers get full information.</li>
            <li><b>Do not create interfaces early.</b> Wait until there are two implementations or you need a mock.</li>
          </ul>
          <Code lang="go">{`// The classic trap: an interface holding a nil pointer is NOT nil
func find() error {
    var e *ValidationError = nil
    return e                      // type is *ValidationError, value nil: interface != nil
}
if err := find(); err != nil {   // true! return a plain nil instead
    fmt.Println("surprise")
}`}</Code>
        </section>

        <section id="ge-generics">
          <h2><span className="n">05</span>Generics</h2>
          <p>Since Go 1.18, functions and types accept <b>type parameters</b> so they work for many types without duplicated code or falling back to <code>any</code>.</p>
          <Code lang="go">{`// Constraint: which types are allowed
type Number interface{ ~int | ~int64 | ~float64 }

func Sum[T Number](xs []T) T {
    var total T
    for _, x := range xs { total += x }
    return total
}
Sum([]int{1, 2, 3})               // T inferred as int
Sum([]float64{1.5, 2.5})

func Map[T, U any](xs []T, f func(T) U) []U {
    out := make([]U, 0, len(xs))
    for _, x := range xs { out = append(out, f(x)) }
    return out
}

// Generic type
type Stack[T any] struct{ items []T }
func (s *Stack[T]) Push(v T) { s.items = append(s.items, v) }
func (s *Stack[T]) Pop() (T, bool) {
    var zero T
    if len(s.items) == 0 { return zero, false }
    v := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return v, true
}

// Standard library already has the common ones (Go 1.21+)
slices.Sort(xs); slices.Contains(xs, 3); maps.Keys(m); min(a, b); max(a, b)`}</Code>
          <div className="pp">
            <div><span className="pl">Good fit</span>Shared data structures (stack, set, cache) and slice/map helpers (<code>Map</code>, <code>Filter</code>, <code>Keys</code>) that you used to copy-paste per type.</div>
            <div className="warnc"><span className="pl">Not needed</span>When there is only one concrete type, or an interface is enough. Generics do not replace interfaces when you want <i>behaviour</i> that differs per type.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
