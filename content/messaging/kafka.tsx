export default function KafkaPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#arch"><span>01</span>Kiến trúc tổng thể</a></li>
          <li><a href="#producer"><span>02</span>Producer → Broker</a></li>
          <li><a href="#disk"><span>03</span>{"Ghi đĩa & Segment"}</a></li>
          <li><a href="#repl"><span>04</span>{"Replication & ISR"}</a></li>
          <li><a href="#consumer"><span>05</span>Consumer</a></li>
          <li><a href="#cleanup"><span>06</span>{"Retention & Cleanup"}</a></li>
          <li><a href="#kraft"><span>07</span>ZooKeeper vs KRaft</a></li>
          <li><a href="#config"><span>08</span>Bảng config tra nhanh</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">apache kafka · ghi chú học tập</div>
          <h1>Sổ tay Kafka: từ Producer đến Cleanup</h1>
          <p className="lede">Ghi chú về cách Kafka nhận, lưu, sao chép, phân phối và dọn dẹp dữ liệu, kèm bảng config tra nhanh.</p>
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
          <h2><span className="n">01</span>Kiến trúc tổng thể</h2>
          <p className="sub">Một cluster 3 broker với hai topic: <code>orders</code> (3 partition, RF = 3) và <code>payments</code> (1 partition, RF = 2).</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 548" role="img" aria-label="Cluster ba broker; topic orders có replica ở cả ba broker, topic payments chỉ ở broker 1 và 2; producer gửi tới leader, consumer group đọc từ leader"> <defs> <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> </defs> <style>{`.t{font-family:var(--f-body);fill:var(--ink);font-size:13px}
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
.ln{stroke:var(--accent);stroke-width:1.8;fill:none}`}</style>  <rect className="box" x="16" y="250" width="150" height="128" rx="8" /> <text className="tb" x="30" y="276">Producer</text> <text className="tm" x="30" y="300">ProducerRecord</text> <text className="tm" x="30" y="318">topic, key, value,</text> <text className="tm" x="30" y="336">headers, partition?</text> <text className="tm" x="30" y="360">acks=all</text> <path className="ln" d="M166 314 H198" markerEnd="url(#ar)" /> <text className="tm" x="168" y="306">send</text>  <rect className="clu" x="200" y="34" width="490" height="496" rx="12" /> <text className="tb" x="218" y="58">Kafka Cluster</text> <rect className="ctl" x="218" y="70" width="454" height="44" rx="6" /> <text className="t" x="232" y="91" style={{ fontWeight: "600" }}>Controller quorum (KRaft)</text> <text className="tm" x="232" y="106">lưu metadata · bầu leader partition · quản lý broker</text> <rect className="box" x="218" y="128" width="142" height="340" rx="8" /> <text className="tb" x="232" y="152">Broker 1</text> <rect className="tp1" x="225" y="164" width="128" height="206" rx="6" /> <text className="tt tp1t" x="234" y="181">topic: orders</text> <rect className="ld" x="232" y="188" width="114" height="52" rx="5" /> <text className="t" x="242" y="210">orders-P0</text> <text className="tm" x="242" y="228">LEADER</text> <rect className="fl" x="232" y="248" width="114" height="52" rx="5" /> <text className="t" x="242" y="270">orders-P1</text> <text className="tm" x="242" y="288">follower</text> <rect className="fl" x="232" y="308" width="114" height="52" rx="5" /> <text className="t" x="242" y="330">orders-P2</text> <text className="tm" x="242" y="348">follower</text> <rect className="tp2" x="225" y="380" width="128" height="86" rx="6" /> <text className="tt tp2t" x="234" y="397">topic: payments</text> <rect className="ld" x="232" y="404" width="114" height="52" rx="5" /> <text className="t" x="242" y="426">payments-P0</text> <text className="tm" x="242" y="444">LEADER</text> <rect className="box" x="374" y="128" width="142" height="340" rx="8" /> <text className="tb" x="388" y="152">Broker 2</text> <rect className="tp1" x="381" y="164" width="128" height="206" rx="6" /> <text className="tt tp1t" x="390" y="181">topic: orders</text> <rect className="fl" x="388" y="188" width="114" height="52" rx="5" /> <text className="t" x="398" y="210">orders-P0</text> <text className="tm" x="398" y="228">follower</text> <rect className="ld" x="388" y="248" width="114" height="52" rx="5" /> <text className="t" x="398" y="270">orders-P1</text> <text className="tm" x="398" y="288">LEADER</text> <rect className="fl" x="388" y="308" width="114" height="52" rx="5" /> <text className="t" x="398" y="330">orders-P2</text> <text className="tm" x="398" y="348">follower</text> <rect className="tp2" x="381" y="380" width="128" height="86" rx="6" /> <text className="tt tp2t" x="390" y="397">topic: payments</text> <rect className="fl" x="388" y="404" width="114" height="52" rx="5" /> <text className="t" x="398" y="426">payments-P0</text> <text className="tm" x="398" y="444">follower</text> <rect className="box" x="530" y="128" width="142" height="340" rx="8" /> <text className="tb" x="544" y="152">Broker 3</text> <rect className="tp1" x="537" y="164" width="128" height="206" rx="6" /> <text className="tt tp1t" x="546" y="181">topic: orders</text> <rect className="fl" x="544" y="188" width="114" height="52" rx="5" /> <text className="t" x="554" y="210">orders-P0</text> <text className="tm" x="554" y="228">follower</text> <rect className="fl" x="544" y="248" width="114" height="52" rx="5" /> <text className="t" x="554" y="270">orders-P1</text> <text className="tm" x="554" y="288">follower</text> <rect className="ld" x="544" y="308" width="114" height="52" rx="5" /> <text className="t" x="554" y="330">orders-P2</text> <text className="tm" x="554" y="348">LEADER</text> <text className="tm" x="544" y="398">(không có payments)</text> <text className="tm" x="218" y="494">orders: 3 partitions · RF = 3 → có mặt ở cả 3 broker</text> <text className="tm" x="218" y="512">payments: 1 partition · RF = 2 → chỉ nằm ở Broker 1 và 2</text>  <rect className="box" x="726" y="214" width="160" height="200" rx="8" /> <text className="tb" x="740" y="240">Consumer group</text> <text className="tm" x="740" y="258">group.id = billing</text> <text className="tm" x="740" y="274">subscribe: orders</text> <rect className="fl" x="738" y="286" width="136" height="54" rx="6" /> <text className="t" x="750" y="308">Consumer 1</text><text className="tm" x="750" y="328">← orders P0, P1</text> <rect className="fl" x="738" y="350" width="136" height="54" rx="6" /> <text className="t" x="750" y="372">Consumer 2</text><text className="tm" x="750" y="392">← orders P2</text> <path className="ln" d="M692 314 H724" markerEnd="url(#ar)" /> <text className="tm" x="694" y="306">poll</text> </svg>
            </div>
            <figcaption>Broker chứa các replica partition, gom theo topic. <code>orders</code> có mặt ở cả 3 broker vì 3 partition × RF 3 đủ phủ hết; <code>payments</code> chỉ có 2 replica nên Broker 3 không chứa gì của nó. Leader (ô xanh) được chia ra các broker khác nhau để cân tải. Producer và consumer luôn làm việc với leader; trong một group, mỗi partition chỉ giao cho một consumer.</figcaption>
          </figure>
          <h3>Topic có nằm trên mọi broker không?</h3>
          <p>Không bắt buộc. Một topic chiếm tối đa <code>số partition × replication factor</code> replica, mỗi replica nằm trên một broker khác nhau với cùng partition. Topic nhỏ có thể chỉ nằm trên 1 hoặc 2 broker.</p>
          <ul className="plain">
            <li><b>Khi tạo topic</b>, Kafka mặc định rải replica kiểu round-robin qua các broker để cân tải. Có <code>broker.rack</code> thì Kafka còn cố đặt replica ở các rack khác nhau.</li>
            <li><b>Có thể tự chỉ định vị trí</b> bằng <code>kafka-topics.sh --create --replica-assignment</code>.</li>
            <li><code>replication.factor</code> không được lớn hơn số broker; hai replica của cùng một partition không bao giờ nằm chung broker.</li>
            <li><b>Thêm broker mới không tự chuyển partition cũ sang.</b> Phải chạy <code>kafka-reassign-partitions.sh</code> hoặc dùng công cụ như Cruise Control để cân lại.</li>
            <li>Partition đều nhau chưa chắc dung lượng đều nhau, vì mỗi partition nhận lượng dữ liệu khác nhau tùy key.</li>
            <li>Sau khi broker restart, leader có thể dồn về một chỗ; <code>auto.leader.rebalance.enable=true</code> (mặc định) đưa leader dần về <em>preferred leader</em> (replica đầu tiên trong danh sách).</li>
          </ul>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Khái niệm</th>
                  <th>Ý nghĩa ngắn gọn</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Cluster</b></td>
                  <td>Tập hợp các broker cùng phục vụ một tập topic.</td>
                </tr>
                <tr>
                  <td><b>Broker</b></td>
                  <td>Một server Kafka, lưu replica của nhiều partition.</td>
                </tr>
                <tr>
                  <td><b>Topic</b></td>
                  <td>Tên logic của một luồng dữ liệu, chia thành nhiều partition.</td>
                </tr>
                <tr>
                  <td><b>Partition</b></td>
                  <td>Một log chỉ ghi nối thêm (append-only), có thứ tự. Đơn vị song song và đơn vị đảm bảo thứ tự.</td>
                </tr>
                <tr>
                  <td><b>Replica</b></td>
                  <td>Bản sao của partition. Một leader nhận đọc/ghi, các follower sao chép.</td>
                </tr>
                <tr>
                  <td><b>Offset</b></td>
                  <td>Số thứ tự tăng dần của message trong <em>một</em> partition. Không có offset toàn cục cho cả topic.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="producer">
          <h2><span className="n">02</span>Luồng Producer → Broker Leader</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 420" role="img" aria-label="Luồng producer: ProducerRecord, serializer, partitioner, accumulator, sender; gửi TCP tới broker leader: network thread, kiểm tra batch, gán offset, append vào page cache, chờ ISR, rồi trả response; flush xuống đĩa bất đồng bộ"> <defs> <marker id="ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> <marker id="ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker> </defs> <style>{`.tb2{font-family:var(--f-body);fill:var(--ink);font-size:13.5px;font-weight:700}
.tm{font-family:var(--f-mono);fill:var(--muted);font-size:11px}
.lane{font-family:var(--f-mono);font-size:11px;font-weight:600;letter-spacing:.08em;fill:var(--accent)}
.box{fill:var(--surface);stroke:var(--line);stroke-width:1.5}
.ld{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.5}
.bg1{fill:var(--bg);stroke:var(--line);stroke-width:1}
.disk{fill:var(--warn-soft);stroke:var(--warn);stroke-width:1.3}
.fol{fill:var(--surface);stroke:var(--line);stroke-width:1.3;stroke-dasharray:4 3}
.ln{stroke:var(--accent);stroke-width:1.8;fill:none}
.dl{stroke:var(--muted);stroke-width:1.5;fill:none;stroke-dasharray:5 4}`}</style> <rect className="bg1" x="8" y="22" width="884" height="118" rx="10" /> <text className="lane" x="20" y="42">PRODUCER (CLIENT)</text> <rect className="bg1" x="8" y="160" width="884" height="252" rx="10" /> <text className="lane" x="20" y="180">BROKER LEADER CỦA PARTITION</text> <rect className="box" x="20" y="52" width="150" height="70" rx="7" /><text className="tb2" x="32" y="78">ProducerRecord</text><text className="tm" x="32" y="98">topic, key, value</text> <rect className="box" x="195" y="52" width="150" height="70" rx="7" /><text className="tb2" x="207" y="78">Serializer</text><text className="tm" x="207" y="98">key/value → byte[]</text> <rect className="box" x="370" y="52" width="150" height="70" rx="7" /><text className="tb2" x="382" y="78">Partitioner</text><text className="tm" x="382" y="98">murmur2(key) % N</text> <rect className="box" x="545" y="52" width="150" height="70" rx="7" /><text className="tb2" x="557" y="78">Accumulator</text><text className="tm" x="557" y="98">gom batch theo P</text> <rect className="box" x="720" y="52" width="150" height="70" rx="7" /><text className="tb2" x="732" y="78">Sender thread</text><text className="tm" x="732" y="98">nén · gửi tới leader</text> <path className="ln" d="M170 87 H193" markerEnd="url(#ar2)" /> <path className="ln" d="M345 87 H368" markerEnd="url(#ar2)" /> <path className="ln" d="M520 87 H543" markerEnd="url(#ar2)" /> <path className="ln" d="M695 87 H718" markerEnd="url(#ar2)" /> <rect className="box" x="720" y="190" width="150" height="70" rx="7" /><text className="tb2" x="732" y="216">Network thread</text><text className="tm" x="732" y="236">nhận ProduceRequest</text> <rect className="box" x="545" y="190" width="150" height="70" rx="7" /><text className="tb2" x="557" y="216">Kiểm tra batch</text><text className="tm" x="557" y="236">CRC · sequence</text> <rect className="ld" x="370" y="190" width="150" height="70" rx="7" /><text className="tb2" x="382" y="216">Gán offset</text><text className="tm" x="382" y="236">100, 101, 102 …</text> <rect className="box" x="195" y="190" width="150" height="70" rx="7" /><text className="tb2" x="207" y="216">Append segment</text><text className="tm" x="207" y="236">→ OS page cache</text> <rect className="box" x="20" y="190" width="150" height="70" rx="7" /><text className="tb2" x="32" y="216">Chờ ISR</text><text className="tm" x="32" y="236">đợi HW vượt offset</text> <path className="ln" d="M720 225 H697" markerEnd="url(#ar2)" /> <path className="ln" d="M545 225 H522" markerEnd="url(#ar2)" /> <path className="ln" d="M370 225 H347" markerEnd="url(#ar2)" /> <path className="ln" d="M195 225 H172" markerEnd="url(#ar2)" />  <path className="ln" d="M795 122 V188" markerEnd="url(#ar2)" /> <text className="tm" x="805" y="158">TCP</text>  <path className="dl" d="M60 190 V124" markerEnd="url(#ar3)" /> <text className="tm" x="70" y="158">response + offset → callback</text>  <path className="dl" d="M270 262 V318" markerEnd="url(#ar3)" /> <rect className="disk" x="195" y="320" width="150" height="62" rx="7" /> <text className="tb2" x="207" y="344">Ổ đĩa</text> <text className="tm" x="207" y="364">flush bất đồng bộ (OS)</text>  <rect className="fol" x="20" y="320" width="150" height="62" rx="7" /> <text className="tb2" x="32" y="344">Followers</text> <text className="tm" x="32" y="364">fetch từ leader</text> <path className="ln" d="M95 320 V262" markerEnd="url(#ar2)" /> <text className="tm" x="380" y="340">acks=0 · không chờ response</text> <text className="tm" x="380" y="358">acks=1 · response sau bước Append segment</text> <text className="tm" x="380" y="376">acks=all · response sau khi mọi replica trong ISR đã có</text> </svg>
            </div>
            <figcaption>Hàng trên chạy trong ứng dụng producer, hàng dưới chạy trên broker giữ leader của partition. Dữ liệu được trả lời cho producer khi còn nằm trong page cache; việc ghi xuống đĩa diễn ra sau, do hệ điều hành tự làm.</figcaption>
          </figure>
          <h3>Phía Producer (client)</h3>
          <ol className="steps">
            <li>
              <div><b>Tạo ProducerRecord</b><div className="d">Topic, key, value, headers, tùy chọn partition và timestamp.</div></div>
            </li>
            <li>
              <div><b>Serializer</b><div className="d">Chuyển key/value sang <code>byte[]</code>.</div></div>
            </li>
            <li>
              <div><b>Partitioner</b><div className="d">Có key: <code>murmur2(key) % số partition</code>, nên cùng key luôn vào cùng partition và giữ được thứ tự. Không có key: <em>sticky partitioner</em> gom vào một partition cho đến khi đầy batch rồi mới chuyển.</div></div>
            </li>
            <li>
              <div><b>Record Accumulator</b><div className="d">Bộ đệm RAM phía client (<code>buffer.memory</code>), chia theo từng partition.</div></div>
            </li>
            <li>
              <div><b>{"Batching & Compression"}</b><div className="d">Gửi khi batch đầy <code>batch.size</code> hoặc chờ đủ <code>linger.ms</code>. Nén theo <code>compression.type</code> (gzip, snappy, lz4, zstd).</div></div>
            </li>
            <li>
              <div><b>Sender thread gửi qua TCP</b><div className="d">Gửi tới <em>leader</em> của partition, địa chỉ lấy từ metadata. Nếu lỗi tạm thời thì retry trong giới hạn <code>delivery.timeout.ms</code>.</div></div>
            </li>
          </ol>
          <h3>Phía Broker Leader</h3>
          <ol className="steps">
            <li>
              <div><b>Nhận request</b><div className="d">Network thread đọc từ socket, đưa vào request queue, I/O thread xử lý.</div></div>
            </li>
            <li>
              <div><b>Kiểm tra batch</b><div className="d">CRC, kích thước, sequence number (nếu idempotent).</div></div>
            </li>
            <li>
              <div><b>Gán offset</b><div className="d">Leader gán offset liên tiếp cho các message, ví dụ 100, 101, 102.</div></div>
            </li>
            <li>
              <div><b>Append vào active segment</b><div className="d">Lệnh <code>write()</code> ghi vào file <code>.log</code>, dữ liệu thực tế nằm trong <b>OS page cache</b>, chưa chắc đã xuống đĩa.</div></div>
            </li>
            <li>
              <div><b>Chờ replication theo <code>acks</code></b><div className="d">Với <code>acks=all</code>, leader giữ response cho tới khi mọi replica trong ISR đã có dữ liệu (HW vượt qua offset đó).</div></div>
            </li>
            <li>
              <div><b>Trả response cho producer</b><div className="d">Kèm offset đã gán.</div></div>
            </li>
            <li>
              <div><b>Flush xuống đĩa (bất đồng bộ)</b><div className="d">Do OS tự làm, không nằm trên đường trả lời producer. Xem mục 03.</div></div>
            </li>
          </ol>
          <h3>acks: khi nào producer coi là “gửi thành công”</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>acks</th>
                  <th>Producer chờ</th>
                  <th>Rủi ro</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">0</td>
                  <td>Không chờ gì</td>
                  <td>Mất dữ liệu mà không biết. Nhanh nhất.</td>
                </tr>
                <tr>
                  <td className="m">1</td>
                  <td>Leader ghi xong</td>
                  <td>Leader chết trước khi follower kịp sao chép → mất.</td>
                </tr>
                <tr>
                  <td className="m">all (-1)</td>
                  <td>Mọi replica trong ISR đã có</td>
                  <td>An toàn nhất. Mặc định từ Kafka 3.0.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Idempotent producer</b> (<code>enable.idempotence=true</code>, mặc định từ 3.0): mỗi producer có Producer ID và sequence number cho từng partition, nên khi retry broker loại bỏ được bản ghi trùng. Kết hợp với <b>transactions</b> (<code>transactional.id</code>) để đạt exactly-once giữa đọc → xử lý → ghi.</div>
        </section>
        <section id="disk">
          <h2><span className="n">03</span>{"Ghi xuống đĩa & Segment"}</h2>
          <h3>Flush policy</h3>
          <p>Mặc định Kafka để Linux tự xả page cache xuống đĩa. Có thể ép flush thủ công, hai điều kiện là <b>OR</b>, cái nào đến trước thì xả trước:</p>
          <ul className="plain">
            <li><code>log.flush.interval.messages</code>: xả khi tích đủ số message.</li>
            <li><code>log.flush.interval.ms</code>: xả khi quá khoảng thời gian.</li>
            <li><code>log.flush.scheduler.interval.ms</code>: chu kỳ thread kiểm tra xem log nào cần flush.</li>
          </ul>
          <div className="note"><b>Lưu ý:</b> Kafka không dựa vào fsync để chống mất dữ liệu. Độ bền đến từ <b>replication</b>: <code>replication.factor=3</code> + <code>min.insync.replicas=2</code> + <code>acks=all</code>. Một broker mất điện trước khi flush thì dữ liệu vẫn còn ở replica khác. Vì vậy không khuyến khích chỉnh flush thủ công, nó làm giảm throughput.</div>
          <h3>Segment: log thực ra là nhiều file</h3>
          <p>Mỗi partition là một thư mục, ví dụ <code>orders-0/</code>, chứa nhiều segment. Tên file là base offset của segment đó:</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Nội dung</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">00000000000000000000.log</td>
                  <td>Dữ liệu message (các record batch).</td>
                </tr>
                <tr>
                  <td className="m">…0000.index</td>
                  <td>Offset → vị trí byte trong file .log (index thưa).</td>
                </tr>
                <tr>
                  <td className="m">…0000.timeindex</td>
                  <td>Timestamp → offset, dùng cho tìm theo thời gian và retention.</td>
                </tr>
                <tr>
                  <td className="m">leader-epoch-checkpoint</td>
                  <td>Lịch sử epoch của leader, dùng khi cắt log sau đổi leader.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Chỉ <b>segment cuối cùng (active)</b> được ghi tiếp. Segment được đóng (roll) khi đạt <code>log.segment.bytes</code> (mặc định 1 GB) <b>hoặc</b> quá <code>log.roll.hours</code> (mặc định 168 giờ = 7 ngày).</p>
          <div className="note tip"><b>Vì sao Kafka nhanh:</b> ghi tuần tự (sequential I/O), tận dụng page cache, và <b>zero-copy</b> (<code>sendfile</code>) đẩy dữ liệu từ page cache thẳng ra socket khi consumer đọc mà không copy qua bộ nhớ JVM. Zero-copy không dùng được khi bật TLS, vì dữ liệu phải được mã hóa trước khi gửi.</div>
        </section>
        <section id="repl">
          <h2><span className="n">04</span>Replication, ISR và High Watermark</h2>
          <p>Follower chủ động gửi fetch request để kéo dữ liệu từ leader (mô hình pull), giống như consumer.</p>
          <h3>Các khái niệm cần có</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Thuật ngữ</th>
                  <th>Ý nghĩa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>LEO</b> (Log End Offset)</td>
                  <td>Offset tiếp theo sẽ được ghi trên một replica. Mỗi replica có LEO riêng.</td>
                </tr>
                <tr>
                  <td><b>ISR</b> (In-Sync Replicas)</td>
                  <td>Tập replica (gồm cả leader) bắt kịp leader. Follower bị loại khỏi ISR nếu tụt lại quá <code>replica.lag.time.max.ms</code> (mặc định 30 giây).</td>
                </tr>
                <tr>
                  <td><b>HW</b> (High Watermark)</td>
                  <td>Do leader tính = LEO nhỏ nhất trong ISR. Message dưới HW là <em>committed</em>, consumer chỉ thấy được phần này.</td>
                </tr>
                <tr>
                  <td><b>min.insync.replicas</b></td>
                  <td>Với <code>acks=all</code>, nếu ISR nhỏ hơn giá trị này thì producer nhận lỗi <code>NotEnoughReplicas</code> thay vì ghi không an toàn.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Ví dụ: leader có LEO = 103, follower A có LEO = 101, follower B có LEO = 103. HW = min(103, 101, 103) = <b>101</b>. Consumer đọc được tới offset 100; offset 101, 102 chưa committed.</p>
          <h3>Khi leader chết</h3>
          <ul className="plain">
            <li>Controller chọn một replica <b>trong ISR</b> làm leader mới, nên không mất message đã committed.</li>
            <li><code>unclean.leader.election.enable=false</code> (mặc định): không cho replica ngoài ISR lên làm leader. Bật lên thì partition sống lại nhanh hơn nhưng có thể mất dữ liệu.</li>
            <li>Công thức phổ biến: <code>RF=3</code>, <code>min.insync.replicas=2</code>, <code>acks=all</code> → chịu được 1 broker chết mà vẫn ghi được.</li>
          </ul>
        </section>
        <section id="consumer">
          <h2><span className="n">05</span>Luồng Consumer đọc dữ liệu</h2>
          <ol className="steps">
            <li>
              <div><b>Tham gia group</b><div className="d">Consumer gửi yêu cầu tới <em>group coordinator</em> (một broker). Coordinator phân chia partition cho các thành viên.</div></div>
            </li>
            <li>
              <div><b>Lấy offset bắt đầu</b><div className="d">Đọc offset đã commit trong <code>__consumer_offsets</code>. Nếu chưa có thì theo <code>auto.offset.reset</code>: <code>latest</code> (mặc định) hoặc <code>earliest</code>.</div></div>
            </li>
            <li>
              <div><b>poll()</b><div className="d">Kéo dữ liệu từ <b>leader</b> (mặc định), chỉ tới HW. Đọc từ follower gần nhất cần cấu hình thêm <code>client.rack</code>.</div></div>
            </li>
            <li>
              <div><b>Xử lý message</b><div className="d">Đọc không làm mất hay xóa message trên broker. Nhiều group khác nhau có thể đọc cùng một topic độc lập.</div></div>
            </li>
            <li>
              <div><b>Commit offset</b><div className="d">Commit <b>offset tiếp theo</b>: xử lý xong offset 100 thì commit 101. Tự động (<code>enable.auto.commit=true</code>, mỗi 5 giây) hoặc thủ công <code>commitSync()</code> / <code>commitAsync()</code>.</div></div>
            </li>
          </ol>
          <h3>{"Consumer group & rebalance"}</h3>
          <ul className="plain">
            <li>Trong một group, mỗi partition chỉ thuộc về <b>một</b> consumer. Số consumer có ích tối đa = số partition; consumer dư sẽ ngồi chơi.</li>
            <li><b>Rebalance</b> xảy ra khi consumer vào/ra, hoặc consumer không gửi heartbeat trong <code>session.timeout.ms</code>, hoặc xử lý quá lâu giữa hai lần poll (<code>max.poll.interval.ms</code>, mặc định 5 phút).</li>
            <li>Kafka 4.0 có giao thức rebalance mới (KIP-848, <code>group.protocol=consumer</code>) do broker điều phối, giảm tình trạng cả group phải dừng lại.</li>
            <li><b>Share groups</b> (KIP-932, “Queues for Kafka”): nhiều consumer cùng đọc một partition và ack từng message, giống hàng đợi. Có từ 4.0 ở mức early access, 4.1 ở mức preview; kiểm tra trạng thái trước khi dùng cho production.</li>
          </ul>
          <h3>Delivery semantics</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Kiểu</th>
                  <th>Cách đạt được</th>
                  <th>Hệ quả</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>At-most-once</b></td>
                  <td>Commit trước, xử lý sau</td>
                  <td>Crash giữa chừng → mất message.</td>
                </tr>
                <tr>
                  <td><b>At-least-once</b></td>
                  <td>Xử lý xong mới commit</td>
                  <td>Crash trước commit → xử lý lặp. Phổ biến nhất, cần xử lý idempotent.</td>
                </tr>
                <tr>
                  <td><b>Exactly-once</b></td>
                  <td>Idempotent producer + transactions, consumer đặt <code>isolation.level=read_committed</code></td>
                  <td>Áp dụng cho luồng Kafka → Kafka (ví dụ Kafka Streams).</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="cleanup">
          <h2><span className="n">06</span>{"Retention & Cleanup"}</h2>
          <h3><code>cleanup.policy=delete</code> (mặc định)</h3>
          <p>Xóa theo thời gian (<code>retention.ms</code>, mặc định 7 ngày) hoặc dung lượng (<code>retention.bytes</code>, mặc định -1 tức không giới hạn).</p>
          <ul className="plain">
            <li>Xóa theo <b>cả segment</b>, không xóa từng message. Một segment chỉ bị xóa khi message <em>mới nhất</em> trong nó đã quá hạn.</li>
            <li>Active segment không bao giờ bị xóa, nên dữ liệu có thể sống lâu hơn <code>retention.ms</code> một khoảng tới <code>log.roll.hours</code>.</li>
            <li><code>retention.bytes</code> tính cho <b>mỗi partition</b>, không phải cả topic.</li>
          </ul>
          <h3><code>cleanup.policy=compact</code></h3>
          <p>Giữ ít nhất bản ghi mới nhất cho mỗi key, các bản ghi cũ cùng key bị loại. Offset của bản ghi còn lại <b>không đổi</b>, nên sau compaction offset sẽ có khoảng trống.</p>
          <div className="loglabel">Trước compaction</div>
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
            <li><b>Tombstone</b> (value = null) đánh dấu xóa key. Bản thân tombstone được giữ thêm <code>delete.retention.ms</code> (mặc định 1 ngày) để consumer kịp thấy, sau đó mới bị dọn.</li>
            <li>Compaction chỉ chạy trên segment đã đóng, khi tỉ lệ dữ liệu “bẩn” vượt <code>min.cleanable.dirty.ratio</code> (mặc định 0.5).</li>
            <li>Dùng cho: <code>__consumer_offsets</code>, changelog của Kafka Streams, bảng cấu hình hay trạng thái mới nhất theo ID.</li>
          </ul>
          <h3><code>cleanup.policy=compact,delete</code></h3>
          <p>Vừa compact theo key, vừa xóa segment quá <code>retention.ms</code>/<code>retention.bytes</code>. Kể cả bản ghi mới nhất của một key cũng bị xóa nếu nằm trong segment đã hết hạn.</p>
        </section>
        <section id="kraft">
          <h2><span className="n">07</span>ZooKeeper vs KRaft</h2>
          <div className="cmp">
            <div><h4>ZooKeeper mode</h4>Metadata (broker, topic, ACL, leader) lưu trong một cụm ZooKeeper riêng. Một broker được chọn làm controller. Phải vận hành 2 hệ thống, giới hạn số partition, failover controller chậm.</div>
            <div><h4>KRaft mode</h4>Metadata lưu trong topic nội bộ <code>__cluster_metadata</code>, đồng bộ bằng giao thức Raft giữa các node controller. Chỉ còn một hệ thống, khởi động và failover nhanh, hỗ trợ hàng triệu partition.</div>
          </div>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Phiên bản</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">2.8 (2021)</td>
                  <td>KRaft xuất hiện, early access, không dùng production.</td>
                </tr>
                <tr>
                  <td className="m">3.3 (2022)</td>
                  <td>KRaft sẵn sàng production cho cluster mới.</td>
                </tr>
                <tr>
                  <td className="m">3.5</td>
                  <td>ZooKeeper mode bị đánh dấu deprecated.</td>
                </tr>
                <tr>
                  <td className="m">4.0 (2025)</td>
                  <td>Gỡ bỏ ZooKeeper hoàn toàn, chỉ còn KRaft.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Ghi nhớ gọn: <b>{"ZooKeeper < 3.3 · KRaft ≥ 3.3 (production) · chỉ KRaft từ 4.0"}</b>. Node trong KRaft có <code>process.roles</code> là <code>broker</code>, <code>controller</code> hoặc cả hai.</p>
        </section>
        <section id="config">
          <h2><span className="n">08</span>Bảng config tra nhanh</h2>
          <p className="sub">Giá trị mặc định theo Kafka 3.x / 4.x.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Config</th>
                  <th>Phía</th>
                  <th>Mặc định</th>
                  <th>Tác dụng</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">acks</td>
                  <td>Producer</td>
                  <td className="v">all</td>
                  <td>Mức xác nhận khi gửi.</td>
                </tr>
                <tr>
                  <td className="m">enable.idempotence</td>
                  <td>Producer</td>
                  <td className="v">true</td>
                  <td>Chống ghi trùng khi retry.</td>
                </tr>
                <tr>
                  <td className="m">batch.size</td>
                  <td>Producer</td>
                  <td className="v">16384</td>
                  <td>Kích thước batch (byte) mỗi partition.</td>
                </tr>
                <tr>
                  <td className="m">linger.ms</td>
                  <td>Producer</td>
                  <td className="v">5 (4.0) · 0 (3.x)</td>
                  <td>Thời gian chờ gom batch.</td>
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
                  <td>Tổng thời gian tối đa kể cả retry.</td>
                </tr>
                <tr>
                  <td className="m">min.insync.replicas</td>
                  <td>Broker/Topic</td>
                  <td className="v">1</td>
                  <td>Số replica tối thiểu trong ISR khi acks=all. Nên đặt 2.</td>
                </tr>
                <tr>
                  <td className="m">replica.lag.time.max.ms</td>
                  <td>Broker</td>
                  <td className="v">30000</td>
                  <td>Quá thời gian này follower bị loại khỏi ISR.</td>
                </tr>
                <tr>
                  <td className="m">unclean.leader.election.enable</td>
                  <td>Broker/Topic</td>
                  <td className="v">false</td>
                  <td>Cho phép replica ngoài ISR lên leader.</td>
                </tr>
                <tr>
                  <td className="m">log.segment.bytes</td>
                  <td>Broker</td>
                  <td className="v">1073741824</td>
                  <td>Kích thước tối đa một segment (1 GB).</td>
                </tr>
                <tr>
                  <td className="m">log.roll.hours</td>
                  <td>Broker</td>
                  <td className="v">168</td>
                  <td>Thời gian tối đa trước khi roll segment.</td>
                </tr>
                <tr>
                  <td className="m">retention.ms</td>
                  <td>Topic</td>
                  <td className="v">604800000</td>
                  <td>Giữ dữ liệu 7 ngày.</td>
                </tr>
                <tr>
                  <td className="m">retention.bytes</td>
                  <td>Topic</td>
                  <td className="v">-1</td>
                  <td>Giới hạn dung lượng mỗi partition.</td>
                </tr>
                <tr>
                  <td className="m">cleanup.policy</td>
                  <td>Topic</td>
                  <td className="v">delete</td>
                  <td>delete, compact, hoặc compact,delete.</td>
                </tr>
                <tr>
                  <td className="m">delete.retention.ms</td>
                  <td>Topic</td>
                  <td className="v">86400000</td>
                  <td>Thời gian giữ tombstone (1 ngày).</td>
                </tr>
                <tr>
                  <td className="m">min.cleanable.dirty.ratio</td>
                  <td>Topic</td>
                  <td className="v">0.5</td>
                  <td>Ngưỡng kích hoạt compaction.</td>
                </tr>
                <tr>
                  <td className="m">auto.offset.reset</td>
                  <td>Consumer</td>
                  <td className="v">latest</td>
                  <td>Đọc từ đâu khi chưa có offset.</td>
                </tr>
                <tr>
                  <td className="m">enable.auto.commit</td>
                  <td>Consumer</td>
                  <td className="v">true</td>
                  <td>Tự commit mỗi auto.commit.interval.ms (5 giây).</td>
                </tr>
                <tr>
                  <td className="m">max.poll.interval.ms</td>
                  <td>Consumer</td>
                  <td className="v">300000</td>
                  <td>Quá thời gian giữa hai lần poll → bị loại khỏi group.</td>
                </tr>
                <tr>
                  <td className="m">session.timeout.ms</td>
                  <td>Consumer</td>
                  <td className="v">45000</td>
                  <td>Không có heartbeat trong thời gian này → rebalance.</td>
                </tr>
                <tr>
                  <td className="m">isolation.level</td>
                  <td>Consumer</td>
                  <td className="v">read_uncommitted</td>
                  <td>Đặt read_committed khi dùng transactions.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
