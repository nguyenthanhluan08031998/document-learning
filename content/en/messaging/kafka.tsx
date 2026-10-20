export default function KafkaPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#arch"><span>01</span>Overall architecture</a></li>
          <li><a href="#producer"><span>02</span>Producer → Broker</a></li>
          <li><a href="#disk"><span>03</span>{"Disk writes & segments"}</a></li>
          <li><a href="#repl"><span>04</span>{"Replication & ISR"}</a></li>
          <li><a href="#consumer"><span>05</span>Consumer</a></li>
          <li><a href="#cleanup"><span>06</span>{"Retention & Cleanup"}</a></li>
          <li><a href="#kraft"><span>07</span>ZooKeeper vs KRaft</a></li>
          <li><a href="#config"><span>08</span>Config quick reference</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">apache kafka · study notes</div>
          <h1>Kafka notebook: from producer to cleanup</h1>
          <p className="lede">Notes on how Kafka receives, stores, replicates, distributes and cleans up data, with a config quick reference.</p>
          <div className="tape" aria-hidden="true">
            <div>off 96</div>
            <div>off 97</div>
            <div>off 98</div>
            <div>off 99</div>
            <div className="hw">off 100 · HW</div>
            <div className="leo">off 101</div>
            <div className="leo">off 102 · LEO</div>
          </div>
        </header>
        <section id="arch">
          <h2><span className="n">01</span>Overall architecture</h2>
          <p className="sub">A 3-broker cluster with two topics: <code>orders</code> (3 partitions, RF = 3) and <code>payments</code> (1 partition, RF = 2).</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 548" role="img" aria-label="A three-broker cluster; topic orders has replicas on all three brokers, topic payments only on brokers 1 and 2; producers send to the leader, the consumer group reads from the leader"> <defs> <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> </defs> <style>{`.t{font-family:var(--f-body);fill:var(--ink);font-size:13px}
.tm{font-family:var(--f-mono);fill:var(--muted);font-size:11px}
.tb{font-family:var(--f-body);fill:var(--ink);font-size:14px;font-weight:700}
.tt{font-family:var(--f-mono);font-size:11px;font-weight:600}
.box{fill:var(--surface);stroke:var(--line);stroke-width:1.5}
.clu{fill:var(--bg);stroke:var(--muted);stroke-width:1.5;stroke-dasharray:6 4}
.tp1{fill:none;stroke:var(--warn);stroke-width:1.3;stroke-dasharray:4 3}
.tp2{fill:none;stroke:var(--new);stroke-width:1.3;stroke-dasharray:4 3}
.tp1t{fill:var(--warn);stroke:none}
.tp2t{fill:var(--new);stroke:none}
.ld{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.5}
.fl{fill:var(--surface);stroke:var(--line);stroke-width:1.2}
.ctl{fill:var(--new-soft);stroke:var(--new);stroke-width:1.2}
.ln{stroke:var(--accent);stroke-width:1.8;fill:none}`}</style>  <rect className="box" x="16" y="250" width="150" height="128" rx="8" /> <text className="tb" x="30" y="276">Producer</text> <text className="tm" x="30" y="300">ProducerRecord</text> <text className="tm" x="30" y="318">topic, key, value,</text> <text className="tm" x="30" y="336">headers, partition?</text> <text className="tm" x="30" y="360">acks=all</text> <path className="ln" d="M166 314 H198" markerEnd="url(#ar)" /> <text className="tm" x="168" y="306">send</text>  <rect className="clu" x="200" y="34" width="490" height="496" rx="12" /> <text className="tb" x="218" y="58">Kafka Cluster</text> <rect className="ctl" x="218" y="70" width="454" height="44" rx="6" /> <text className="t" x="232" y="91" style={{ fontWeight: "600" }}>Controller quorum (KRaft)</text> <text className="tm" x="232" y="106">stores metadata · elects partition leaders · manages brokers</text> <rect className="box" x="218" y="128" width="142" height="340" rx="8" /> <text className="tb" x="232" y="152">Broker 1</text> <rect className="tp1" x="225" y="164" width="128" height="206" rx="6" /> <text className="tt tp1t" x="234" y="181">topic: orders</text> <rect className="ld" x="232" y="188" width="114" height="52" rx="5" /> <text className="t" x="242" y="210">orders-P0</text> <text className="tm" x="242" y="228">LEADER</text> <rect className="fl" x="232" y="248" width="114" height="52" rx="5" /> <text className="t" x="242" y="270">orders-P1</text> <text className="tm" x="242" y="288">follower</text> <rect className="fl" x="232" y="308" width="114" height="52" rx="5" /> <text className="t" x="242" y="330">orders-P2</text> <text className="tm" x="242" y="348">follower</text> <rect className="tp2" x="225" y="380" width="128" height="86" rx="6" /> <text className="tt tp2t" x="234" y="397">topic: payments</text> <rect className="ld" x="232" y="404" width="114" height="52" rx="5" /> <text className="t" x="242" y="426">payments-P0</text> <text className="tm" x="242" y="444">LEADER</text> <rect className="box" x="374" y="128" width="142" height="340" rx="8" /> <text className="tb" x="388" y="152">Broker 2</text> <rect className="tp1" x="381" y="164" width="128" height="206" rx="6" /> <text className="tt tp1t" x="390" y="181">topic: orders</text> <rect className="fl" x="388" y="188" width="114" height="52" rx="5" /> <text className="t" x="398" y="210">orders-P0</text> <text className="tm" x="398" y="228">follower</text> <rect className="ld" x="388" y="248" width="114" height="52" rx="5" /> <text className="t" x="398" y="270">orders-P1</text> <text className="tm" x="398" y="288">LEADER</text> <rect className="fl" x="388" y="308" width="114" height="52" rx="5" /> <text className="t" x="398" y="330">orders-P2</text> <text className="tm" x="398" y="348">follower</text> <rect className="tp2" x="381" y="380" width="128" height="86" rx="6" /> <text className="tt tp2t" x="390" y="397">topic: payments</text> <rect className="fl" x="388" y="404" width="114" height="52" rx="5" /> <text className="t" x="398" y="426">payments-P0</text> <text className="tm" x="398" y="444">follower</text> <rect className="box" x="530" y="128" width="142" height="340" rx="8" /> <text className="tb" x="544" y="152">Broker 3</text> <rect className="tp1" x="537" y="164" width="128" height="206" rx="6" /> <text className="tt tp1t" x="546" y="181">topic: orders</text> <rect className="fl" x="544" y="188" width="114" height="52" rx="5" /> <text className="t" x="554" y="210">orders-P0</text> <text className="tm" x="554" y="228">follower</text> <rect className="fl" x="544" y="248" width="114" height="52" rx="5" /> <text className="t" x="554" y="270">orders-P1</text> <text className="tm" x="554" y="288">follower</text> <rect className="ld" x="544" y="308" width="114" height="52" rx="5" /> <text className="t" x="554" y="330">orders-P2</text> <text className="tm" x="554" y="348">LEADER</text> <text className="tm" x="544" y="398">(no payments)</text> <text className="tm" x="218" y="494">orders: 3 partitions · RF = 3 → present on all 3 brokers</text> <text className="tm" x="218" y="512">payments: 1 partition · RF = 2 → only on Brokers 1 and 2</text>  <rect className="box" x="726" y="214" width="160" height="200" rx="8" /> <text className="tb" x="740" y="240">Consumer group</text> <text className="tm" x="740" y="258">group.id = billing</text> <text className="tm" x="740" y="274">subscribe: orders</text> <rect className="fl" x="738" y="286" width="136" height="54" rx="6" /> <text className="t" x="750" y="308">Consumer 1</text><text className="tm" x="750" y="328">← orders P0, P1</text> <rect className="fl" x="738" y="350" width="136" height="54" rx="6" /> <text className="t" x="750" y="372">Consumer 2</text><text className="tm" x="750" y="392">← orders P2</text> <path className="ln" d="M692 314 H724" markerEnd="url(#ar)" /> <text className="tm" x="694" y="306">poll</text> </svg>
            </div>
            <figcaption>Brokers hold partition replicas, grouped by topic. <code>orders</code> is on all 3 brokers because 3 partitions × RF 3 covers them all; <code>payments</code> has only 2 replicas, so Broker 3 holds none of it. Leaders (teal) are spread across brokers to balance load. Producers and consumers always work with the leader; within a group, each partition goes to exactly one consumer.</figcaption>
          </figure>
          <h3>Is every topic on every broker?</h3>
          <p>Not necessarily. A topic occupies at most <code>partitions × replication factor</code> replicas, with each replica of a partition on a different broker. A small topic may live on only 1 or 2 brokers.</p>
          <ul className="plain">
            <li><b>When a topic is created</b>, Kafka spreads replicas round-robin across brokers by default to balance load. With <code>broker.rack</code> set, it also tries to place replicas on different racks.</li>
            <li><b>You can choose placement yourself</b> with <code>kafka-topics.sh --create --replica-assignment</code>.</li>
            <li><code>replication.factor</code> cannot exceed the number of brokers; two replicas of the same partition never share a broker.</li>
            <li><b>Adding a broker does not move existing partitions.</b> Run <code>kafka-reassign-partitions.sh</code> or use a tool like Cruise Control to rebalance.</li>
            <li>Even partition counts don't mean even disk usage, since each partition receives different amounts of data depending on keys.</li>
            <li>After broker restarts, leaders can pile up in one place; <code>auto.leader.rebalance.enable=true</code> (the default) gradually moves leadership back to the <em>preferred leader</em> (the first replica in the list).</li>
          </ul>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Concept</th>
                  <th>Short meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Cluster</b></td>
                  <td>A set of brokers serving a set of topics together.</td>
                </tr>
                <tr>
                  <td><b>Broker</b></td>
                  <td>One Kafka server, storing replicas of many partitions.</td>
                </tr>
                <tr>
                  <td><b>Topic</b></td>
                  <td>The logical name of a data stream, split into partitions.</td>
                </tr>
                <tr>
                  <td><b>Partition</b></td>
                  <td>An ordered, append-only log. The unit of parallelism and the unit of ordering.</td>
                </tr>
                <tr>
                  <td><b>Replica</b></td>
                  <td>A copy of a partition. One leader serves reads/writes, followers replicate.</td>
                </tr>
                <tr>
                  <td><b>Offset</b></td>
                  <td>An increasing sequence number of messages within <em>one</em> partition. There is no global offset for a whole topic.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="producer">
          <h2><span className="n">02</span>Producer → broker leader flow</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 420" role="img" aria-label="Producer flow: ProducerRecord, serializer, partitioner, accumulator, sender; TCP to the leader broker: network thread, batch validation, offset assignment, append to the page cache, wait for the ISR, then respond; flush to disk asynchronously"> <defs> <marker id="ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> <marker id="ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker> </defs> <style>{`.tb2{font-family:var(--f-body);fill:var(--ink);font-size:13.5px;font-weight:700}
.tm{font-family:var(--f-mono);fill:var(--muted);font-size:11px}
.lane{font-family:var(--f-mono);font-size:11px;font-weight:600;letter-spacing:.08em;fill:var(--accent)}
.box{fill:var(--surface);stroke:var(--line);stroke-width:1.5}
.ld{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.5}
.bg1{fill:var(--bg);stroke:var(--line);stroke-width:1}
.disk{fill:var(--warn-soft);stroke:var(--warn);stroke-width:1.3}
.fol{fill:var(--surface);stroke:var(--line);stroke-width:1.3;stroke-dasharray:4 3}
.ln{stroke:var(--accent);stroke-width:1.8;fill:none}
.dl{stroke:var(--muted);stroke-width:1.5;fill:none;stroke-dasharray:5 4}`}</style> <rect className="bg1" x="8" y="22" width="884" height="118" rx="10" /> <text className="lane" x="20" y="42">PRODUCER (CLIENT)</text> <rect className="bg1" x="8" y="160" width="884" height="252" rx="10" /> <text className="lane" x="20" y="180">PARTITION LEADER BROKER</text> <rect className="box" x="20" y="52" width="150" height="70" rx="7" /><text className="tb2" x="32" y="78">ProducerRecord</text><text className="tm" x="32" y="98">topic, key, value</text> <rect className="box" x="195" y="52" width="150" height="70" rx="7" /><text className="tb2" x="207" y="78">Serializer</text><text className="tm" x="207" y="98">key/value → byte[]</text> <rect className="box" x="370" y="52" width="150" height="70" rx="7" /><text className="tb2" x="382" y="78">Partitioner</text><text className="tm" x="382" y="98">murmur2(key) % N</text> <rect className="box" x="545" y="52" width="150" height="70" rx="7" /><text className="tb2" x="557" y="78">Accumulator</text><text className="tm" x="557" y="98">batches per P</text> <rect className="box" x="720" y="52" width="150" height="70" rx="7" /><text className="tb2" x="732" y="78">Sender thread</text><text className="tm" x="732" y="98">compress · send to leader</text> <path className="ln" d="M170 87 H193" markerEnd="url(#ar2)" /> <path className="ln" d="M345 87 H368" markerEnd="url(#ar2)" /> <path className="ln" d="M520 87 H543" markerEnd="url(#ar2)" /> <path className="ln" d="M695 87 H718" markerEnd="url(#ar2)" /> <rect className="box" x="720" y="190" width="150" height="70" rx="7" /><text className="tb2" x="732" y="216">Network thread</text><text className="tm" x="732" y="236">receives ProduceRequest</text> <rect className="box" x="545" y="190" width="150" height="70" rx="7" /><text className="tb2" x="557" y="216">Validate batch</text><text className="tm" x="557" y="236">CRC · sequence</text> <rect className="ld" x="370" y="190" width="150" height="70" rx="7" /><text className="tb2" x="382" y="216">Assign offset</text><text className="tm" x="382" y="236">100, 101, 102 …</text> <rect className="box" x="195" y="190" width="150" height="70" rx="7" /><text className="tb2" x="207" y="216">Append segment</text><text className="tm" x="207" y="236">→ OS page cache</text> <rect className="box" x="20" y="190" width="150" height="70" rx="7" /><text className="tb2" x="32" y="216">Wait for ISR</text><text className="tm" x="32" y="236">until HW passes offset</text> <path className="ln" d="M720 225 H697" markerEnd="url(#ar2)" /> <path className="ln" d="M545 225 H522" markerEnd="url(#ar2)" /> <path className="ln" d="M370 225 H347" markerEnd="url(#ar2)" /> <path className="ln" d="M195 225 H172" markerEnd="url(#ar2)" />  <path className="ln" d="M795 122 V188" markerEnd="url(#ar2)" /> <text className="tm" x="805" y="158">TCP</text>  <path className="dl" d="M60 190 V124" markerEnd="url(#ar3)" /> <text className="tm" x="70" y="158">response + offset → callback</text>  <path className="dl" d="M270 262 V318" markerEnd="url(#ar3)" /> <rect className="disk" x="195" y="320" width="150" height="62" rx="7" /> <text className="tb2" x="207" y="344">Disk</text> <text className="tm" x="207" y="364">async flush (OS)</text>  <rect className="fol" x="20" y="320" width="150" height="62" rx="7" /> <text className="tb2" x="32" y="344">Followers</text> <text className="tm" x="32" y="364">fetch from leader</text> <path className="ln" d="M95 320 V262" markerEnd="url(#ar2)" /> <text className="tm" x="380" y="340">acks=0 · no response awaited</text> <text className="tm" x="380" y="358">acks=1 · response after Append segment</text> <text className="tm" x="380" y="376">acks=all · response once every ISR replica has it</text> </svg>
            </div>
            <figcaption>The top row runs in the producer application, the bottom row on the broker that leads the partition. The producer gets its answer while the data is still in the page cache; writing to disk happens later, done by the operating system.</figcaption>
          </figure>
          <h3>Producer side (client)</h3>
          <ol className="steps">
            <li>
              <div><b>Create a ProducerRecord</b><div className="d">Topic, key, value, headers, optional partition and timestamp.</div></div>
            </li>
            <li>
              <div><b>Serializer</b><div className="d">Turns key/value into <code>byte[]</code>.</div></div>
            </li>
            <li>
              <div><b>Partitioner</b><div className="d">With a key: <code>murmur2(key) % partitions</code>, so the same key always lands on the same partition and keeps its order. Without a key: the <em>sticky partitioner</em> fills one partition until the batch is full before moving on.</div></div>
            </li>
            <li>
              <div><b>Record Accumulator</b><div className="d">A client-side RAM buffer (<code>buffer.memory</code>), split per partition.</div></div>
            </li>
            <li>
              <div><b>{"Batching & Compression"}</b><div className="d">Send when a batch reaches <code>batch.size</code> or after <code>linger.ms</code>. Compress with <code>compression.type</code> (gzip, snappy, lz4, zstd).</div></div>
            </li>
            <li>
              <div><b>Sender thread sends over TCP</b><div className="d">Sends to the partition's <em>leader</em>, whose address comes from metadata. Transient errors are retried within <code>delivery.timeout.ms</code>.</div></div>
            </li>
          </ol>
          <h3>Broker leader side</h3>
          <ol className="steps">
            <li>
              <div><b>Receive the request</b><div className="d">A network thread reads from the socket and queues the request; an I/O thread handles it.</div></div>
            </li>
            <li>
              <div><b>Validate the batch</b><div className="d">CRC, size, sequence number (if idempotent).</div></div>
            </li>
            <li>
              <div><b>Assign offsets</b><div className="d">The leader assigns consecutive offsets to the messages, e.g. 100, 101, 102.</div></div>
            </li>
            <li>
              <div><b>Append to the active segment</b><div className="d"><code>write()</code> appends to the <code>.log</code> file; the data actually sits in the <b>OS page cache</b> and may not be on disk yet.</div></div>
            </li>
            <li>
              <div><b>Wait for replication per <code>acks</code></b><div className="d">With <code>acks=all</code>, the leader holds the response until every ISR replica has the data (HW passes that offset).</div></div>
            </li>
            <li>
              <div><b>Respond to the producer</b><div className="d">Including the assigned offset.</div></div>
            </li>
            <li>
              <div><b>Flush to disk (asynchronously)</b><div className="d">Done by the OS, not on the producer's response path. See section 03.</div></div>
            </li>
          </ol>
          <h3>acks: when does the producer consider a send “successful”</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>acks</th>
                  <th>Producer waits for</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">0</td>
                  <td>Nothing</td>
                  <td>Data lost without knowing. Fastest.</td>
                </tr>
                <tr>
                  <td className="m">1</td>
                  <td>Leader ghi xong</td>
                  <td>Leader dies before followers replicate → lost.</td>
                </tr>
                <tr>
                  <td className="m">all (-1)</td>
                  <td>Every replica in the ISR has it</td>
                  <td>Safest. Default since Kafka 3.0.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Idempotent producer</b> (<code>enable.idempotence=true</code>, default since 3.0): each producer has a Producer ID and per-partition sequence numbers, so the broker discards duplicates on retry. Combine with <b>transactions</b> (<code>transactional.id</code>) for exactly-once across read → process → write.</div>
        </section>
        <section id="disk">
          <h2><span className="n">03</span>{"Writing to disk & segments"}</h2>
          <h3>Flush policy</h3>
          <p>By default Kafka lets Linux flush the page cache to disk. You can force flushing; the two conditions are <b>OR</b>ed, whichever comes first:</p>
          <ul className="plain">
            <li><code>log.flush.interval.messages</code>: flush after this many messages.</li>
            <li><code>log.flush.interval.ms</code>: flush after this much time.</li>
            <li><code>log.flush.scheduler.interval.ms</code>: how often a thread checks which logs need flushing.</li>
          </ul>
          <div className="note"><b>Note:</b> Kafka does not rely on fsync to avoid data loss. Durability comes from <b>replication</b>: <code>replication.factor=3</code> + <code>min.insync.replicas=2</code> + <code>acks=all</code>. If a broker loses power before flushing, the data still exists on other replicas. So tuning flushes by hand is discouraged; it reduces throughput.</div>
          <h3>Segments: a log is really many files</h3>
          <p>Each partition is a directory, e.g. <code>orders-0/</code>, holding many segments. File names are the segment's base offset:</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Contents</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">00000000000000000000.log</td>
                  <td>Message data (record batches).</td>
                </tr>
                <tr>
                  <td className="m">…0000.index</td>
                  <td>Offset → byte position in the .log file (a sparse index).</td>
                </tr>
                <tr>
                  <td className="m">…0000.timeindex</td>
                  <td>Timestamp → offset, for time-based lookup and retention.</td>
                </tr>
                <tr>
                  <td className="m">leader-epoch-checkpoint</td>
                  <td>History of leader epochs, used to truncate logs after a leader change.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Only the <b>last (active) segment</b> receives writes. A segment is closed (rolled) when it reaches <code>log.segment.bytes</code> (default 1 GB) <b>or</b> exceeds <code>log.roll.hours</code> (default 168 hours = 7 days).</p>
          <div className="note tip"><b>Why Kafka is fast:</b> sequential I/O, heavy use of the page cache, and <b>zero-copy</b> (<code>sendfile</code>) pushing data from the page cache straight to the socket when consumers read, without copying through JVM memory. Zero-copy is unavailable with TLS, because data must be encrypted before sending.</div>
        </section>
        <section id="repl">
          <h2><span className="n">04</span>Replication, ISR and High Watermark</h2>
          <p>Followers actively send fetch requests to pull data from the leader (a pull model), just like consumers.</p>
          <h3>Key concepts</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Term</th>
                  <th>Meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>LEO</b> (Log End Offset)</td>
                  <td>The next offset to be written on a replica. Each replica has its own LEO.</td>
                </tr>
                <tr>
                  <td><b>ISR</b> (In-Sync Replicas)</td>
                  <td>The set of replicas (leader included) keeping up with the leader. A follower drops out of the ISR if it lags beyond <code>replica.lag.time.max.ms</code> (default 30 seconds).</td>
                </tr>
                <tr>
                  <td><b>HW</b> (High Watermark)</td>
                  <td>Computed by the leader = the smallest LEO in the ISR. Messages below the HW are <em>committed</em>; consumers only see those.</td>
                </tr>
                <tr>
                  <td><b>min.insync.replicas</b></td>
                  <td>With <code>acks=all</code>, if the ISR is smaller than this value the producer gets a <code>NotEnoughReplicas</code> error instead of an unsafe write.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Example: the leader has LEO = 103, follower A has LEO = 101, follower B has LEO = 103. HW = min(103, 101, 103) = <b>101</b>. Consumers can read up to offset 100; offsets 101 and 102 are not committed yet.</p>
          <h3>When the leader dies</h3>
          <ul className="plain">
            <li>The controller picks a replica <b>from the ISR</b> as the new leader, so no committed message is lost.</li>
            <li><code>unclean.leader.election.enable=false</code> (default): replicas outside the ISR may not become leader. Enabling it brings the partition back faster but can lose data.</li>
            <li>A common recipe: <code>RF=3</code>, <code>min.insync.replicas=2</code>, <code>acks=all</code> → survives 1 broker down while still accepting writes.</li>
          </ul>
        </section>
        <section id="consumer">
          <h2><span className="n">05</span>How consumers read</h2>
          <ol className="steps">
            <li>
              <div><b>Join the group</b><div className="d">The consumer contacts the <em>group coordinator</em> (a broker), which assigns partitions to members.</div></div>
            </li>
            <li>
              <div><b>Find the starting offset</b><div className="d">Read the committed offset from <code>__consumer_offsets</code>. If none, follow <code>auto.offset.reset</code>: <code>latest</code> (default) or <code>earliest</code>.</div></div>
            </li>
            <li>
              <div><b>poll()</b><div className="d">Pull data from the <b>leader</b> (default), only up to the HW. Reading from the nearest follower requires <code>client.rack</code>.</div></div>
            </li>
            <li>
              <div><b>Process messages</b><div className="d">Reading never removes messages from the broker. Different groups can read the same topic independently.</div></div>
            </li>
            <li>
              <div><b>Commit offsets</b><div className="d">Commit the <b>next offset</b>: after processing offset 100, commit 101. Automatically (<code>enable.auto.commit=true</code>, every 5 seconds) or manually with <code>commitSync()</code> / <code>commitAsync()</code>.</div></div>
            </li>
          </ol>
          <h3>{"Consumer group & rebalance"}</h3>
          <ul className="plain">
            <li>Within a group each partition belongs to <b>one</b> consumer. The useful number of consumers is at most the number of partitions; extra consumers sit idle.</li>
            <li><b>Rebalances</b> happen when consumers join or leave, when a consumer misses heartbeats for <code>session.timeout.ms</code>, or takes too long between polls (<code>max.poll.interval.ms</code>, default 5 minutes).</li>
            <li>Kafka 4.0 ships a new broker-coordinated rebalance protocol (KIP-848, <code>group.protocol=consumer</code>) that avoids stopping the whole group.</li>
            <li><b>Share groups</b> (KIP-932, “Queues for Kafka”): several consumers read one partition and ack individual messages, like a queue. Early access in 4.0, preview in 4.1; check its status before using it in production.</li>
          </ul>
          <h3>Delivery semantics</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Kind</th>
                  <th>How</th>
                  <th>Consequence</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>At-most-once</b></td>
                  <td>Commit first, process after</td>
                  <td>Crash midway → message lost.</td>
                </tr>
                <tr>
                  <td><b>At-least-once</b></td>
                  <td>Commit only after processing</td>
                  <td>Crash before commit → processed again. Most common; needs idempotent handling.</td>
                </tr>
                <tr>
                  <td><b>Exactly-once</b></td>
                  <td>Idempotent producer + transactions, consumers set <code>isolation.level=read_committed</code></td>
                  <td>Applies to Kafka → Kafka flows (e.g. Kafka Streams).</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="cleanup">
          <h2><span className="n">06</span>{"Retention & Cleanup"}</h2>
          <h3><code>cleanup.policy=delete</code> (default)</h3>
          <p>Delete by time (<code>retention.ms</code>, default 7 days) or size (<code>retention.bytes</code>, default -1 meaning unlimited).</p>
          <ul className="plain">
            <li>Deletes <b>whole segments</b>, never single messages. A segment is deleted only when its <em>newest</em> message has expired.</li>
            <li>The active segment is never deleted, so data can outlive <code>retention.ms</code> by up to <code>log.roll.hours</code>.</li>
            <li><code>retention.bytes</code> applies <b>per partition</b>, not to the whole topic.</li>
          </ul>
          <h3><code>cleanup.policy=compact</code></h3>
          <p>Keeps at least the latest record for each key and drops older records with the same key. Surviving records keep their offsets <b>unchanged</b>, so offsets have gaps after compaction.</p>
          <div className="loglabel">Before compaction</div>
          <div className="log">
            <div className="cell gone"><small>off 0</small>K1:A</div>
            <div className="cell gone"><small>off 1</small>K2:B</div>
            <div className="cell"><small>off 2</small>K1:C</div>
            <div className="cell"><small>off 3</small>K3:D</div>
            <div className="cell tomb"><small>off 4</small>K2:null</div>
          </div>
          <div className="loglabel">Sau compaction</div>
          <div className="log">
            <div className="cell"><small>off 2</small>K1:C</div>
            <div className="cell"><small>off 3</small>K3:D</div>
            <div className="cell tomb"><small>off 4</small>K2:null</div>
          </div>
          <ul className="plain">
            <li>A <b>tombstone</b> (value = null) marks a key as deleted. The tombstone itself is kept for <code>delete.retention.ms</code> (default 1 day) so consumers see it, then removed.</li>
            <li>Compaction runs only on closed segments, when the “dirty” ratio exceeds <code>min.cleanable.dirty.ratio</code> (default 0.5).</li>
            <li>Used for: <code>__consumer_offsets</code>, Kafka Streams changelogs, tables of config or latest state by ID.</li>
          </ul>
          <h3><code>cleanup.policy=compact,delete</code></h3>
          <p>Compacts by key and also deletes segments past <code>retention.ms</code>/<code>retention.bytes</code>. Even a key's latest record is deleted if it sits in an expired segment.</p>
        </section>
        <section id="kraft">
          <h2><span className="n">07</span>ZooKeeper vs KRaft</h2>
          <div className="cmp">
            <div><h4>ZooKeeper mode</h4>Metadata (brokers, topics, ACLs, leaders) lives in a separate ZooKeeper ensemble. One broker is elected controller. Two systems to run, a cap on partitions, slow controller failover.</div>
            <div><h4>KRaft mode</h4>Metadata lives in the internal topic <code>__cluster_metadata</code>, replicated with Raft among controller nodes. One system only, fast startup and failover, millions of partitions supported.</div>
          </div>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">2.8 (2021)</td>
                  <td>KRaft appears, early access, not for production.</td>
                </tr>
                <tr>
                  <td className="m">3.3 (2022)</td>
                  <td>KRaft production-ready for new clusters.</td>
                </tr>
                <tr>
                  <td className="m">3.5</td>
                  <td>ZooKeeper mode deprecated.</td>
                </tr>
                <tr>
                  <td className="m">4.0 (2025)</td>
                  <td>ZooKeeper removed entirely, KRaft only.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Quick memory aid: <b>{"ZooKeeper < 3.3 · KRaft ≥ 3.3 (production) · KRaft only from 4.0"}</b>. KRaft nodes have <code>process.roles</code> set to <code>broker</code>, <code>controller</code> or both.</p>
        </section>
        <section id="config">
          <h2><span className="n">08</span>Config quick reference</h2>
          <p className="sub">Defaults as of Kafka 3.x / 4.x.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Config</th>
                  <th>Side</th>
                  <th>Default</th>
                  <th>Effect</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">acks</td>
                  <td>Producer</td>
                  <td className="v">all</td>
                  <td>Acknowledgement level when sending.</td>
                </tr>
                <tr>
                  <td className="m">enable.idempotence</td>
                  <td>Producer</td>
                  <td className="v">true</td>
                  <td>Prevents duplicates on retry.</td>
                </tr>
                <tr>
                  <td className="m">batch.size</td>
                  <td>Producer</td>
                  <td className="v">16384</td>
                  <td>Batch size (bytes) per partition.</td>
                </tr>
                <tr>
                  <td className="m">linger.ms</td>
                  <td>Producer</td>
                  <td className="v">5 (4.0) · 0 (3.x)</td>
                  <td>How long to wait to fill a batch.</td>
                </tr>
                <tr>
                  <td className="m">buffer.memory</td>
                  <td>Producer</td>
                  <td className="v">33554432</td>
                  <td>RAM cho Record Accumulator (32 MB).</td>
                </tr>
                <tr>
                  <td className="m">delivery.timeout.ms</td>
                  <td>Producer</td>
                  <td className="v">120000</td>
                  <td>Total time limit including retries.</td>
                </tr>
                <tr>
                  <td className="m">min.insync.replicas</td>
                  <td>Broker/Topic</td>
                  <td className="v">1</td>
                  <td>Minimum ISR replicas when acks=all. Set it to 2.</td>
                </tr>
                <tr>
                  <td className="m">replica.lag.time.max.ms</td>
                  <td>Broker</td>
                  <td className="v">30000</td>
                  <td>Followers lagging longer than this leave the ISR.</td>
                </tr>
                <tr>
                  <td className="m">unclean.leader.election.enable</td>
                  <td>Broker/Topic</td>
                  <td className="v">false</td>
                  <td>Allows replicas outside the ISR to become leader.</td>
                </tr>
                <tr>
                  <td className="m">log.segment.bytes</td>
                  <td>Broker</td>
                  <td className="v">1073741824</td>
                  <td>Maximum segment size (1 GB).</td>
                </tr>
                <tr>
                  <td className="m">log.roll.hours</td>
                  <td>Broker</td>
                  <td className="v">168</td>
                  <td>Maximum time before rolling a segment.</td>
                </tr>
                <tr>
                  <td className="m">retention.ms</td>
                  <td>Topic</td>
                  <td className="v">604800000</td>
                  <td>Keep data for 7 days.</td>
                </tr>
                <tr>
                  <td className="m">retention.bytes</td>
                  <td>Topic</td>
                  <td className="v">-1</td>
                  <td>Size limit per partition.</td>
                </tr>
                <tr>
                  <td className="m">cleanup.policy</td>
                  <td>Topic</td>
                  <td className="v">delete</td>
                  <td>delete, compact, or compact,delete.</td>
                </tr>
                <tr>
                  <td className="m">delete.retention.ms</td>
                  <td>Topic</td>
                  <td className="v">86400000</td>
                  <td>How long tombstones are kept (1 day).</td>
                </tr>
                <tr>
                  <td className="m">min.cleanable.dirty.ratio</td>
                  <td>Topic</td>
                  <td className="v">0.5</td>
                  <td>Threshold that triggers compaction.</td>
                </tr>
                <tr>
                  <td className="m">auto.offset.reset</td>
                  <td>Consumer</td>
                  <td className="v">latest</td>
                  <td>Where to start when there is no offset.</td>
                </tr>
                <tr>
                  <td className="m">enable.auto.commit</td>
                  <td>Consumer</td>
                  <td className="v">true</td>
                  <td>Auto-commit every auto.commit.interval.ms (5 seconds).</td>
                </tr>
                <tr>
                  <td className="m">max.poll.interval.ms</td>
                  <td>Consumer</td>
                  <td className="v">300000</td>
                  <td>Too long between polls → removed from the group.</td>
                </tr>
                <tr>
                  <td className="m">session.timeout.ms</td>
                  <td>Consumer</td>
                  <td className="v">45000</td>
                  <td>No heartbeat for this long → rebalance.</td>
                </tr>
                <tr>
                  <td className="m">isolation.level</td>
                  <td>Consumer</td>
                  <td className="v">read_uncommitted</td>
                  <td>Set read_committed when using transactions.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
