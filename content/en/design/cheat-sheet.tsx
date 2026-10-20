import Link from "next/link";

export default function CheatSheetPage() {
  return (
    <div className="wrap single">
      <main>
        <header className="hero">
          <div className="eyebrow">design · tra nhanh</div>
          <h1>Facing this problem? Think of this pattern</h1>
          <p className="lede">A lookup table from symptom to solution. Click a pattern name to jump to its details.</p>
        </header>
        <section>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>Pattern</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Only one shared object may exist</td>
                  <td><Link className="plink" href="/en/design/creational/#cr-singleton">Singleton</Link></td>
                </tr>
                <tr>
                  <td>Create objects of a type chosen at runtime</td>
                  <td><Link className="plink" href="/en/design/creational/#cr-factory-method">Factory Method</Link></td>
                </tr>
                <tr>
                  <td>Create a whole consistent family of objects</td>
                  <td><Link className="plink" href="/en/design/creational/#cr-abstract-factory">Abstract Factory</Link></td>
                </tr>
                <tr>
                  <td>A constructor with too many optional parameters</td>
                  <td><Link className="plink" href="/en/design/creational/#cr-builder">Builder</Link></td>
                </tr>
                <tr>
                  <td>An external library's interface doesn't fit</td>
                  <td><Link className="plink" href="/en/design/structural/#st-adapter">Adapter</Link></td>
                </tr>
                <tr>
                  <td>Add logging, caching, retries around a service</td>
                  <td><Link className="plink" href="/en/design/structural/#st-decorator">Decorator</Link></td>
                </tr>
                <tr>
                  <td>One use case calls many subsystems</td>
                  <td><Link className="plink" href="/en/design/structural/#st-facade">Facade</Link></td>
                </tr>
                <tr>
                  <td>Control access, lazy loading</td>
                  <td><Link className="plink" href="/en/design/structural/#st-proxy">Proxy</Link></td>
                </tr>
                <tr>
                  <td>Tree-shaped data</td>
                  <td><Link className="plink" href="/en/design/structural/#st-composite">Composite</Link></td>
                </tr>
                <tr>
                  <td>Several interchangeable algorithms</td>
                  <td><Link className="plink" href="/en/design/behavioral/#bh-strategy">Strategy</Link></td>
                </tr>
                <tr>
                  <td>Many places need to know about changes</td>
                  <td><Link className="plink" href="/en/design/behavioral/#bh-observer">Observer</Link></td>
                </tr>
                <tr>
                  <td>if/else on state everywhere</td>
                  <td><Link className="plink" href="/en/design/behavioral/#bh-state">State</Link></td>
                </tr>
                <tr>
                  <td>Validation pipelines, middleware</td>
                  <td><Link className="plink" href="/en/design/behavioral/#bh-chain">Chain of Responsibility</Link></td>
                </tr>
                <tr>
                  <td>Undo, queued operations</td>
                  <td><Link className="plink" href="/en/design/behavioral/#bh-command">Command</Link></td>
                </tr>
                <tr>
                  <td>Same process skeleton, a few different steps</td>
                  <td><Link className="plink" href="/en/design/behavioral/#bh-template-method">Template Method</Link></td>
                </tr>
                <tr>
                  <td>Transactions spanning several services</td>
                  <td><Link className="plink" href="/en/design/microservice/#ms-saga">Saga</Link></td>
                </tr>
                <tr>
                  <td>Who coordinates a multi-service process</td>
                  <td><Link className="plink" href="/en/design/microservice/#ms-orch-choreo">Orchestration vs Choreography</Link></td>
                </tr>
                <tr>
                  <td>Many workers taking jobs from one table</td>
                  <td><Link className="plink" href="/en/concurrency/db-lock/#lk-skip">SELECT … FOR UPDATE SKIP LOCKED</Link></td>
                </tr>
                <tr>
                  <td>Write to the DB and send an event</td>
                  <td><Link className="plink" href="/en/design/microservice/#ms-outbox">Transactional Outbox</Link></td>
                </tr>
                <tr>
                  <td>Messages delivered twice</td>
                  <td><Link className="plink" href="/en/design/microservice/#ms-idempotent-consumer">Idempotent Consumer</Link></td>
                </tr>
                <tr>
                  <td>A dependency is slow or down</td>
                  <td><Link className="plink" href="/en/design/microservice/#ms-circuit-breaker">Circuit Breaker + Retry</Link></td>
                </tr>
                <tr>
                  <td>Complex, slow read screens</td>
                  <td><Link className="plink" href="/en/design/microservice/#ms-cqrs">CQRS</Link></td>
                </tr>
                <tr>
                  <td>Full history, auditing</td>
                  <td><Link className="plink" href="/en/design/microservice/#ms-event-sourcing">Event Sourcing</Link></td>
                </tr>
                <tr>
                  <td>Gradually breaking up a monolith</td>
                  <td><Link className="plink" href="/en/design/microservice/#ms-strangler">Strangler Fig</Link></td>
                </tr>
                <tr>
                  <td>Business logic tangled with the framework, hard to test</td>
                  <td><Link className="plink" href="/en/design/clean-architecture/#ca-layers">Clean Architecture</Link></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2>Pairs that are often confused</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Pair</th>
                  <th>Difference</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Adapter vs Facade</td>
                  <td>Adapter converts one interface into another; Facade creates a new, simpler interface for a whole group.</td>
                </tr>
                <tr>
                  <td>Decorator vs Proxy</td>
                  <td>Decorator adds behavior and receives the object from outside; Proxy controls access and usually manages the real object itself.</td>
                </tr>
                <tr>
                  <td>Strategy vs State</td>
                  <td>Strategy is chosen from outside; State switches itself along the object's lifecycle.</td>
                </tr>
                <tr>
                  <td>Factory Method vs Abstract Factory</td>
                  <td>One product versus a family of products that belong together.</td>
                </tr>
                <tr>
                  <td>Observer vs Mediator</td>
                  <td>Observer broadcasts to whoever cares; Mediator coordinates components deliberately.</td>
                </tr>
                <tr>
                  <td>Saga orchestration vs choreography</td>
                  <td>A central controller, or services reacting to events on their own.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
