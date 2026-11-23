import { Flow } from "@/components/Flow";
import type { InterviewData } from "@/components/InterviewList";
import type { Locale } from "@/lib/notebook";

const REPLICATION = "https://kafka.apache.org/documentation/#replication";
const SEMANTICS = "https://kafka.apache.org/documentation/#semantics";
const COMPACTION = "https://kafka.apache.org/documentation/#compaction";
const KRAFT = "https://kafka.apache.org/documentation/#kraft";
const PRODUCERCONFIGS = "https://kafka.apache.org/documentation/#producerconfigs";
const CONSUMERCONFIGS = "https://kafka.apache.org/documentation/#consumerconfigs";
const MODIFYTOPIC = "https://kafka.apache.org/documentation/#basic_ops_modify_topic";
const HWANDOS = "https://kafka.apache.org/documentation/#hwandos";
const DOCS = "https://kafka.apache.org/documentation/";

export default function build(l: Locale): InterviewData {
  const t = (vi: string, en: string) => (l === "vi" ? vi : en);
  return {
    eyebrow: t("phỏng vấn · kafka · senior", "interview · kafka · senior"),
    title: t("Phỏng vấn Kafka (senior)", "Kafka interview (senior)"),
    lede: t(
      "Bấm vào câu hỏi để xem đáp án, ví dụ và sơ đồ. Nguồn chính là kafka.apache.org/documentation.",
      "Click a question to see the answer, an example and a diagram. The main source is kafka.apache.org/documentation.",
    ),
    items: [
      {
        q: t(
          "ISR, min.insync.replicas và “committed” liên hệ thế nào?",
          "How do ISR, min.insync.replicas and “committed” relate?",
        ),
        a: [
          t(
            "ISR (In-Sync Replicas) là các replica đang bắt kịp leader, kể cả leader. Ví dụ: Leader, Follower A, Follower B đều đồng bộ bình thường → ISR có 3 replica. Nếu Follower B tụt lại quá replica.lag.time.max.ms (mặc định 30 giây), B bị loại khỏi ISR → ISR chỉ còn 2 (Leader, A).",
            "ISR (In-Sync Replicas) is the set of replicas keeping up with the leader, the leader included. Example: Leader, Follower A and Follower B are all caught up → the ISR has 3 replicas. If Follower B falls behind past replica.lag.time.max.ms (30 seconds by default), B is dropped from the ISR → it shrinks to 2 (Leader, A).",
          ),
          t(
            "High Watermark (HW) = LEO (Log End Offset) nhỏ nhất trong các replica thuộc ISR. Ví dụ leader đã ghi tới offset 105, follower A mới ghi tới 103 → HW = min(105, 103) = 103. Chỉ message có offset ≤ HW mới được coi là committed; consumer chỉ đọc được tới đó, chưa thấy offset 104, 105 vì nếu leader chết ngay lúc này thì hai message đó có thể chưa kịp sao chép.",
            "High Watermark (HW) = the smallest LEO (Log End Offset) among the replicas in the ISR. Example: the leader has written up to offset 105, follower A only up to 103 → HW = min(105, 103) = 103. Only messages at or below the HW count as committed; a consumer can only read up to there, not yet offsets 104 or 105, since those could be lost if the leader died right now.",
          ),
          t(
            "min.insync.replicas chỉ có tác dụng khi producer dùng acks=all. Ví dụ đặt min.insync.replicas=2: ISR còn ≥ 2 replica thì ghi bình thường; nếu ISR tụt xuống còn 1 (các follower đều rớt), Kafka từ chối ghi luôn, trả lỗi NotEnoughReplicas cho producer thay vì chấp nhận ghi liều chỉ trên một mình leader.",
            "min.insync.replicas only matters when the producer uses acks=all. Example with min.insync.replicas=2: as long as the ISR has 2 or more replicas, writes go through as normal; if the ISR drops to 1 (every follower fell behind), Kafka rejects the write outright with NotEnoughReplicas instead of accepting it unsafely on the leader alone.",
          ),
        ],
        code: { lang: "properties", src: `acks=all
min.insync.replicas=2
replication.factor=3   # ${t("chịu được 1 broker chết mà vẫn ghi được", "tolerates 1 broker down and still accepts writes")}` },
        href: REPLICATION, label: "Replication",
      },
      {
        q: t(
          "Partition leader election hoạt động ra sao trong KRaft so với ZooKeeper?",
          "How does partition leader election work under KRaft vs ZooKeeper?",
        ),
        a: t(
          "Cả hai mô hình đều có một controller chịu trách nhiệm bầu leader mới trong tập ISR khi leader cũ chết. Khác biệt là nơi lưu và đồng bộ metadata: ZooKeeper dùng một cụm ZooKeeper riêng, một broker được chọn làm controller qua ZooKeeper. KRaft lưu metadata trong topic nội bộ __cluster_metadata, đồng bộ bằng giao thức Raft giữa các node controller, nên không cần hệ thống thứ hai và failover nhanh hơn.",
          "Both models rely on a controller that elects a new leader from the ISR when the old leader dies. The difference is where metadata lives and how it syncs: ZooKeeper uses a separate ZooKeeper ensemble, with one broker elected controller through it. KRaft stores metadata in the internal __cluster_metadata topic, replicated via the Raft protocol among controller nodes, so there is no second system to run and failover is faster.",
        ),
        diagram: <Flow id="kfle" label={t("Bầu leader mới khi leader cũ chết", "Electing a new leader when the old one dies")} steps={[
          { title: t("Leader chết", "Leader dies"), sub: t("hết heartbeat", "heartbeat lost") },
          { title: "Controller", sub: t("đọc ISR hiện tại", "reads current ISR"), hl: true },
          { title: t("Chọn replica trong ISR", "Pick replica in ISR"), sub: t("leader mới", "new leader") },
          { title: t("Cập nhật metadata", "Update metadata"), sub: t("broker khác thấy ngay", "other brokers see it") },
        ]} caption={t("Replica ngoài ISR không được chọn, trừ khi bật unclean.leader.election.enable.", "A replica outside the ISR is never picked unless unclean.leader.election.enable is turned on.")} />,
        href: KRAFT, label: "KRaft",
      },
      {
        q: t(
          "acks=all kết hợp min.insync.replicas ảnh hưởng gì đến durability và availability?",
          "How do acks=all and min.insync.replicas trade off durability against availability?",
        ),
        a: t(
          "acks=all bắt leader chờ mọi replica trong ISR xác nhận trước khi trả response, nên không mất dữ liệu đã committed nếu leader chết. Đặt min.insync.replicas cao hơn làm tăng độ bền (ít dung sai mất replica) nhưng giảm availability, vì khi ISR tụt dưới ngưỡng, producer bị chặn ghi. RF=3 với min.insync.replicas=2 là công thức phổ biến: chịu được 1 broker chết mà vẫn ghi được, chịu được 2 broker chết mà không mất dữ liệu đã commit.",
          "acks=all makes the leader wait for every ISR member to acknowledge before responding, so committed data survives a leader crash. Raising min.insync.replicas increases durability (less tolerance for lost replicas) but lowers availability, since writes are rejected once the ISR drops below the threshold. RF=3 with min.insync.replicas=2 is the common recipe: survive 1 broker down and keep writing, survive 2 broker failures without losing committed data.",
        ),
        href: PRODUCERCONFIGS, label: "Producer configs",
      },
      {
        q: t(
          "Unclean leader election là gì, khi nào xảy ra và rủi ro gì?",
          "What is unclean leader election, when does it happen, and what is the risk?",
        ),
        a: t(
          "Xảy ra khi mọi replica trong ISR đều chết và không còn ứng viên an toàn, nhưng unclean.leader.election.enable=true cho phép một replica ngoài ISR (đã tụt lại) lên làm leader để partition hoạt động lại. Rủi ro là mất các message đã committed trên các replica cũ nhưng chưa có trên replica này. Mặc định từ các bản Kafka gần đây là false, ưu tiên nhất quán hơn khả dụng.",
          "It happens when every ISR replica is dead and there is no safe candidate left, but unclean.leader.election.enable=true allows a lagging, out-of-ISR replica to become leader so the partition can serve traffic again. The risk is losing committed messages that were on the old replicas but never reached this one. Recent Kafka versions default this to false, favoring consistency over availability.",
        ),
        href: REPLICATION, label: "Replication",
      },
      {
        q: t(
          "Log compaction khác log retention thế nào, dùng khi nào?",
          "How does log compaction differ from log retention, and when do you use each?",
        ),
        a: t(
          "cleanup.policy=delete xóa theo thời gian (retention.ms) hoặc dung lượng (retention.bytes), xóa cả segment một lần. cleanup.policy=compact giữ lại bản ghi mới nhất cho mỗi key, loại các bản cũ cùng key, dùng tombstone (value=null) để đánh dấu xóa key. Compaction phù hợp cho dữ liệu kiểu “trạng thái mới nhất theo ID” như __consumer_offsets hay changelog của Kafka Streams; retention phù hợp cho dữ liệu kiểu log sự kiện có hạn dùng.",
          "cleanup.policy=delete removes whole segments once they age past retention.ms or exceed retention.bytes. cleanup.policy=compact keeps only the latest record per key, dropping older ones for that key, with a tombstone (value=null) marking a key as deleted. Compaction suits “latest state per ID” data like __consumer_offsets or a Kafka Streams changelog; retention suits event-log data with a natural expiry.",
        ),
        href: COMPACTION, label: "Log Compaction",
      },
      {
        q: t(
          "Idempotent producer và transactions phối hợp thế nào để đạt exactly-once?",
          "How do the idempotent producer and transactions combine for exactly-once?",
        ),
        a: t(
          "enable.idempotence=true gắn cho producer một Producer ID và số thứ tự tăng dần theo từng partition, nên broker phát hiện và loại bỏ bản ghi trùng khi producer retry. Transactions (transactional.id) nhóm nhiều lần ghi vào nhiều partition, và cả commit offset, thành một đơn vị atomic: hoặc tất cả xuất hiện, hoặc không gì xuất hiện. Consumer phía sau cần đặt isolation.level=read_committed để không thấy dữ liệu của transaction chưa commit.",
          "enable.idempotence=true gives the producer a Producer ID and a per-partition sequence number, so the broker detects and drops duplicates on retry. Transactions (transactional.id) group several writes across partitions, plus an offset commit, into one atomic unit: either all of it is visible or none of it is. The downstream consumer must set isolation.level=read_committed to avoid seeing data from an uncommitted transaction.",
        ),
        diagram: <Flow id="kfeo" label={t("Exactly-once: đọc, xử lý, ghi", "Exactly-once: read, process, write")} steps={[
          { title: t("Đọc input topic", "Read input topic"), sub: "read_committed" },
          { title: t("Xử lý", "Process") },
          { title: "beginTransaction", sub: t("mở transaction", "open transaction"), hl: true },
          { title: t("Ghi output + offset", "Write output + offset"), sub: t("nhiều partition", "across partitions") },
          { title: "commitTransaction", sub: t("tất cả hoặc không gì", "all or nothing") },
        ]} />,
        href: SEMANTICS, label: "Message Delivery Semantics",
      },
      {
        q: t(
          "Cooperative sticky assignor giải quyết vấn đề gì so với eager rebalance?",
          "What problem does the cooperative sticky assignor solve compared to eager rebalance?",
        ),
        a: t(
          "Rebalance kiểu eager (mặc định cũ) bắt mọi consumer trong group thu hồi hết partition rồi gán lại từ đầu (“stop-the-world”), nên toàn group ngừng xử lý trong lúc rebalance. Cooperative sticky chỉ thu hồi đúng những partition cần chuyển chủ, các consumer khác vẫn tiếp tục xử lý partition đang giữ, nên giảm thời gian ngừng xử lý khi group thay đổi.",
          "Eager rebalancing (the old default) forces every consumer in the group to give up all partitions and get reassigned from scratch (“stop-the-world”), so the whole group pauses during a rebalance. Cooperative sticky only revokes the partitions that actually need to move; other consumers keep processing the partitions they already hold, cutting the pause whenever the group changes.",
        ),
        href: CONSUMERCONFIGS, label: "Consumer configs",
      },
      {
        q: t(
          "commitSync và commitAsync khác nhau thế nào, rủi ro gì?",
          "How do commitSync and commitAsync differ, and what are the risks?",
        ),
        a: t(
          "commitSync() chặn cho tới khi broker xác nhận, an toàn nhưng chậm hơn và tự retry khi lỗi tạm thời; dùng trước khi đóng consumer để chắc offset cuối được ghi. commitAsync() không chặn, cho throughput cao hơn nhưng không tự retry (vì có thể commit chồng lên một commit mới hơn), nên cần callback để log lỗi. Dù sync hay async, crash giữa lúc xử lý xong và lúc commit đều gây xử lý lặp (at-least-once), nên logic xử lý cần idempotent.",
          "commitSync() blocks until the broker acknowledges; it is safe but slower, and retries transient failures itself, so it is the right call right before closing a consumer to make sure the last offset lands. commitAsync() does not block and gives higher throughput but does not retry on its own (it might overwrite a newer commit), so it needs a callback to log failures. Either way, a crash between finishing processing and committing causes reprocessing (at-least-once), so the handler logic needs to be idempotent.",
        ),
        href: CONSUMERCONFIGS, label: "Consumer configs",
      },
      {
        q: t(
          "Làm sao phát hiện và xử lý một partition bị “hot” (lệch tải)?",
          "How do you detect and handle a “hot” (overloaded) partition?",
        ),
        a: t(
          "Phát hiện qua metric theo partition: bytes-in/out, lag của consumer trên từng partition, hoặc CPU/disk của broker giữ leader partition đó cao bất thường so với các broker khác. Nguyên nhân phổ biến là key phân bố lệch (một vài key chiếm phần lớn traffic). Cách xử lý: tăng số partition và chọn lại khóa phân vùng cân bằng hơn (ví dụ thêm salt vào key), hoặc dùng custom partitioner; không giải quyết được bằng cách thêm broker nếu dữ liệu vẫn dồn vào đúng một partition.",
          "You spot it through per-partition metrics: bytes-in/out, consumer lag per partition, or unusually high CPU/disk on the broker holding that partition's leader compared to the other brokers. The usual cause is skewed key distribution, where a few keys account for most of the traffic. The fix is to increase the partition count and pick a more even partitioning key (for example salting the key), or use a custom partitioner; adding more brokers alone does not help if the data still lands on the same single partition.",
        ),
        href: DOCS, label: t("Tài liệu Kafka", "Kafka documentation"),
      },
      {
        q: t(
          "replica.lag.time.max.ms ảnh hưởng gì khi broker chậm replicate?",
          "What does replica.lag.time.max.ms do when a broker falls behind on replication?",
        ),
        a: t(
          "Đây là ngưỡng thời gian follower được phép không bắt kịp LEO của leader. Follower vượt ngưỡng này (mặc định 30 giây) bị loại khỏi ISR, nên không còn được tính khi xác định High Watermark hay khi chọn leader mới trong lần failover kế tiếp. Follower chậm do mạng hoặc disk I/O cao là nguyên nhân phổ biến khiến ISR co lại, kéo theo rủi ro producer bị chặn nếu acks=all và ISR xuống dưới min.insync.replicas.",
          "This is the time threshold a follower is allowed to stay behind the leader's LEO. Once a follower exceeds it (30 seconds by default) it is dropped from the ISR, so it no longer counts toward the High Watermark or as a candidate for the next leader failover. A follower lagging from network issues or high disk I/O is the common cause of a shrinking ISR, which risks blocking the producer under acks=all once the ISR falls below min.insync.replicas.",
        ),
        href: REPLICATION, label: "Replication",
      },
      {
        q: t(
          "Khi nào nên tăng số partition của một topic, và hệ quả là gì?",
          "When should you increase a topic's partition count, and what follows from that?",
        ),
        a: t(
          "Tăng khi số consumer cần song song hóa vượt quá số partition hiện có, hoặc throughput trên một partition đã chạm giới hạn của một broker. Hệ quả: partition mới không tự có dữ liệu cũ, nên key cũ vẫn map theo công thức phân vùng cũ còn traffic mới có thể đổi partition cho cùng key (vì murmur2(key) % N thay đổi theo N), làm mất tính đảm bảo thứ tự xuyên suốt cho key đó. Không thể giảm số partition, chỉ có thể tăng.",
          "You increase it when the number of consumers needed for parallelism exceeds the current partition count, or when throughput on a single partition is already hitting one broker's limit. The consequence: new partitions do not inherit old data, and because murmur2(key) % N changes with N, the same key can land on a different partition going forward, breaking cross-time ordering guarantees for that key. Partition count can only go up, never down.",
        ),
        href: MODIFYTOPIC, label: t("Sửa đổi topic", "Modifying topics"),
      },
      {
        q: t(
          "Cách ước tính sizing cluster (broker, replication factor, retention) cho hệ thống log lớn?",
          "How do you size a cluster (brokers, replication factor, retention) for a large log system?",
        ),
        a: t(
          "Bắt đầu từ throughput cần (MB/s ghi, nhân với replication factor vì mỗi replica cũng ghi/đọc), rồi suy ra số partition cần để trải tải đều qua các broker, và số broker để mỗi broker không vượt quá khả năng disk I/O và network của nó. Dung lượng đĩa = throughput ghi × retention.ms × replication.factor, cộng thêm biên an toàn. RF=3 là mặc định hợp lý cho production; retention càng dài, disk càng lớn, không liên quan tới số broker trực tiếp trừ khi disk đầy buộc phải thêm broker.",
          "Start from the required throughput (MB/s written, multiplied by the replication factor since every replica also writes and reads), then derive the partition count needed to spread that load across brokers, and the broker count so no single broker exceeds its disk I/O or network capacity. Disk capacity = write throughput × retention.ms × replication.factor, plus headroom. RF=3 is a reasonable production default; longer retention mainly grows disk needs, not broker count directly, unless a full disk forces adding brokers.",
        ),
        href: HWANDOS, label: t("Phần cứng & OS", "Hardware and OS"),
      },
      {
        q: t(
          "Thiết kế hệ thống đảm bảo message ordering theo key xuyên suốt nhiều consumer?",
          "How do you design for per-key message ordering across multiple consumers?",
        ),
        a: t(
          "Kafka chỉ đảm bảo thứ tự trong một partition. Muốn mọi message của một key luôn theo đúng thứ tự, phải đảm bảo chúng luôn vào cùng một partition: dùng key đó khi gửi (murmur2(key) % N) và không đổi số partition của topic sau khi đã có traffic quan trọng theo key. Trong một consumer group, một partition chỉ được giao cho đúng một consumer tại một thời điểm, nên thứ tự trong partition được giữ nguyên khi tới tay consumer; xử lý song song bên trong một consumer (ví dụ đa luồng) có thể làm mất thứ tự này nếu không tự xếp hàng lại theo key.",
          "Kafka only guarantees order within a single partition. To keep every message for a key strictly ordered, they must always land on the same partition: key the records on send (murmur2(key) % N) and avoid changing the topic's partition count once meaningful traffic is flowing for that key. Within a consumer group, a partition is assigned to exactly one consumer at a time, so partition order is preserved on the way in; parallel processing inside that consumer (e.g. multiple threads) can still break the order unless it re-queues by key itself.",
        ),
        href: SEMANTICS, label: "Message Delivery Semantics",
      },
      {
        q: t(
          "Xử lý schema evolution (Avro/Protobuf + Schema Registry) khi có breaking change thế nào?",
          "How do you handle schema evolution (Avro/Protobuf + Schema Registry) for a breaking change?",
        ),
        a: t(
          "Schema Registry kiểm tra compatibility mode (BACKWARD, FORWARD, FULL, hoặc *_TRANSITIVE) trước khi cho phép đăng ký schema mới cho một subject; thay đổi không tương thích bị chặn đăng ký. Với breaking change thật sự (xóa field bắt buộc, đổi kiểu), cách an toàn là tạo topic/subject mới với schema mới, chạy song song hai luồng (dual write hoặc consumer đọc cả hai), rồi chuyển dần consumer sang schema mới và ngừng luồng cũ khi đã xong.",
          "Schema Registry enforces a compatibility mode (BACKWARD, FORWARD, FULL, or their *_TRANSITIVE variants) before accepting a new schema version for a subject; an incompatible change is simply rejected at registration. For a genuine breaking change (dropping a required field, changing a type), the safe path is a new topic/subject with the new schema, running both in parallel (dual-write, or a consumer reading both), then migrating consumers onto the new schema and retiring the old stream once they have.",
        ),
        href: "https://docs.confluent.io/platform/current/schema-registry/index.html", label: "Schema Registry",
      },
      {
        q: t(
          "Thiết kế dead-letter queue (DLQ) và chiến lược retry cho consumer xử lý lỗi?",
          "How do you design a dead-letter queue (DLQ) and retry strategy for a failing consumer?",
        ),
        a: t(
          "Khi xử lý một message lỗi, không nên chặn cả partition bằng cách retry vô hạn tại chỗ. Cách phổ biến: retry một số lần có giới hạn (có thể qua topic retry riêng với delay tăng dần), rồi nếu vẫn lỗi thì ghi message (kèm lý do lỗi, stack trace vào header) sang một DLQ topic và commit offset gốc để consumer tiếp tục với message kế tiếp. DLQ cần được giám sát và có quy trình xử lý lại thủ công hoặc tự động sau khi đã sửa nguyên nhân lỗi.",
          "When one message fails, blocking the whole partition with infinite in-place retries is the wrong move. The common pattern: retry a bounded number of times (often via a separate retry topic with increasing delay), and if it still fails, write the message (with the failure reason and stack trace in headers) to a DLQ topic and commit the original offset so the consumer moves on to the next message. The DLQ needs monitoring and a replay process, manual or automated, once the root cause is fixed.",
        ),
        href: DOCS, label: t("Tài liệu Kafka", "Kafka documentation"),
      },
    ],
  };
}
