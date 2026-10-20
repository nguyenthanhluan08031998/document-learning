import { Code } from "@/components/Code";

export default function CreationalPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Creational: creating objects contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#cr-singleton"><span>01</span>Singleton</a></li>
          <li><a href="#cr-factory-method"><span>02</span>Factory Method</a></li>
          <li><a href="#cr-abstract-factory"><span>03</span>Abstract Factory</a></li>
          <li><a href="#cr-builder"><span>04</span>Builder</a></li>
          <li><a href="#cr-prototype"><span>05</span>Prototype</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">design pattern · creational</div>
          <h1>Creational: creating objects</h1>
          <p className="lede">Five patterns that separate <b>creating</b> objects from <b>using</b> them, so the using code knows only interfaces, not concrete classes.</p>
        </header>
        <section>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Pattern</th>
                  <th>In plain words</th>
                  <th>The idea in one sentence</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><a className="plink" href="#cr-singleton">Singleton</a></td>
                  <td>Exactly one instance</td>
                  <td>Hide the constructor and provide one access point returning the same instance.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#cr-factory-method">Factory Method</a></td>
                  <td>Creation method</td>
                  <td>Put object creation in a method; a subclass or a parameter decides which concrete type to create.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#cr-abstract-factory">Abstract Factory</a></td>
                  <td>Factory of factories</td>
                  <td>A factory interface with several creation methods; each implementation creates one consistent family.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#cr-builder">Builder</a></td>
                  <td>Build step by step</td>
                  <td>Create an object through a chain of clearly named calls, finishing with <code>build()</code>.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#cr-prototype">Prototype</a></td>
                  <td>Clone</td>
                  <td>Copy a template object, then adjust what differs.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="cr-singleton">
          <h2><span className="n">01</span>Singleton <small className="vn">Exactly one instance</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>You need exactly one shared object for the whole app, such as configuration or a connection pool, and don't want every place to create its own.</div>
            <div><span className="pl">Idea</span>Hide the constructor and provide one access point returning the same instance.</div>
          </div>
          <Code lang="ts">{`class Config {
  private static instance: Config | undefined;
  private constructor(readonly dbUrl: string) {}

  static get(): Config {
    // Lazily create the single instance on first access
    if (!Config.instance) Config.instance = new Config(process.env.DB_URL ?? "");
    return Config.instance;
  }
}

const a = Config.get();
const b = Config.get();
console.log(a === b); // true`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Truly unique shared resources: logger, config, pool.</div>
            <div className="warnc"><span className="pl">Caveat</span>Easily becomes a disguised global and is hard to test because it cannot be swapped. In TypeScript, a module exporting an object (<code>export const config = …</code>) is already a singleton; prefer dependency injection.</div>
          </div>
        </section>
        <section id="cr-factory-method">
          <h2><span className="n">02</span>Factory Method <small className="vn">Creation method</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span><code>new</code> calls are scattered everywhere, and every new type means editing many places.</div>
            <div><span className="pl">Idea</span>Put object creation in a method; a subclass or a parameter decides which concrete type to create.</div>
          </div>
          <Code lang="ts">{`interface Notifier { send(to: string, msg: string): Promise<void>; }

class EmailNotifier implements Notifier {
  async send(to: string, msg: string) { /* call SMTP */ }
}
class SmsNotifier implements Notifier {
  async send(to: string, msg: string) { /* call SMS gateway */ }
}

type Channel = "email" | "sms";

function createNotifier(channel: Channel): Notifier {
  // The only place that knows concrete classes
  switch (channel) {
    case "email": return new EmailNotifier();
    case "sms": return new SmsNotifier();
  }
}

await createNotifier("sms").send("0901...", "Your order has been delivered");`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>The caller only needs the interface; the concrete type is chosen by configuration or data.</div>
            <div className="warnc"><span className="pl">Caveat</span>Don't add a factory for a class with only one way to build it; it is a useless extra layer.</div>
          </div>
        </section>
        <section id="cr-abstract-factory">
          <h2><span className="n">03</span>Abstract Factory <small className="vn">Factory of factories</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>You must create a whole <b>family</b> of objects that belong together (for example VNPay's charger and webhook verifier, or Stripe's) and never mix the two families.</div>
            <div><span className="pl">Idea</span>A factory interface with several creation methods; each implementation creates one consistent family.</div>
          </div>
          <Code lang="ts">{`interface Charger { charge(orderId: string, amount: number): Promise<string>; }
interface WebhookVerifier { verify(body: string, signature: string): boolean; }

interface PaymentProviderFactory {
  createCharger(): Charger;
  createWebhookVerifier(): WebhookVerifier;
}

class VnpayFactory implements PaymentProviderFactory {
  createCharger(): Charger { return new VnpayCharger(); }
  createWebhookVerifier(): WebhookVerifier { return new VnpayHmacVerifier(); }
}
class StripeFactory implements PaymentProviderFactory {
  createCharger(): Charger { return new StripeCharger(); }
  createWebhookVerifier(): WebhookVerifier { return new StripeSignatureVerifier(); }
}

// Application code depends only on the abstract factory
function bootstrap(provider: PaymentProviderFactory) {
  const charger = provider.createCharger();
  const verifier = provider.createWebhookVerifier();   // always from the same provider
  return { charger, verifier };
}`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Whole families that replace each other: payment gateways, cloud providers, UI themes, test vs production environments.</div>
            <div className="warnc"><span className="pl">Caveat</span>Adding a new kind of product means changing the interface and every factory.</div>
          </div>
        </section>
        <section id="cr-builder">
          <h2><span className="n">04</span>Builder <small className="vn">Build step by step</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>An object has many optional parameters; the constructor is long and easy to call with arguments in the wrong order.</div>
            <div><span className="pl">Idea</span>Create an object through a chain of clearly named calls, finishing with <code>build()</code>.</div>
          </div>
          <Code lang="ts">{`class HttpRequest {
  constructor(
    readonly method: string, readonly url: string,
    readonly headers: Record<string, string>, readonly body?: string,
    readonly timeoutMs = 5000,
  ) {}
}

class RequestBuilder {
  private method = "GET";
  private headers: Record<string, string> = {};
  private body?: string;
  private timeoutMs = 5000;
  constructor(private url: string) {}

  post(body: unknown) { this.method = "POST"; this.body = JSON.stringify(body); return this; }
  header(k: string, v: string) { this.headers[k] = v; return this; }
  timeout(ms: number) { this.timeoutMs = ms; return this; }
  build() { return new HttpRequest(this.method, this.url, this.headers, this.body, this.timeoutMs); }
}

const req = new RequestBuilder("/orders")
  .post({ sku: "A1", qty: 2 })
  .header("Idempotency-Key", crypto.randomUUID())
  .timeout(3000)
  .build();`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Complex objects with many options: query builders, HTTP requests, test data.</div>
            <div className="warnc"><span className="pl">Caveat</span>In TypeScript an options object <code>{"{ url, method?, timeout? }"}</code> is often enough; use Builder only when you need per-step validation or staged construction.</div>
          </div>
        </section>
        <section id="cr-prototype">
          <h2><span className="n">05</span>Prototype <small className="vn">Clone</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>Creating an object from scratch is expensive or complex, while a similar template already exists.</div>
            <div><span className="pl">Idea</span>Copy a template object, then adjust what differs.</div>
          </div>
          <Code lang="ts">{`interface Cloneable<T> { clone(): T; }

class ReportTemplate implements Cloneable<ReportTemplate> {
  constructor(public title: string, public sections: string[], public style: { font: string }) {}

  clone(): ReportTemplate {
    // Deep copy so the clone does not share nested objects
    return new ReportTemplate(this.title, [...this.sections], { ...this.style });
  }
}

const base = new ReportTemplate("Monthly report", ["Revenue", "Costs"], { font: "Inter" });
const q4 = base.clone();
q4.title = "Q4 report";
q4.sections.push("Forecast");

// structuredClone() also works for plain data objects`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Many objects differing in a few properties, default configurations, test data.</div>
            <div className="warnc"><span className="pl">Caveat</span>Beware of shallow copies: nested objects end up shared between the original and the copy.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
