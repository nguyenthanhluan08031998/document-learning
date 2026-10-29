import { Code } from "@/components/Code";

export default function DockerPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục Docker">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#dk-concept"><span>01</span>Khái niệm và quan hệ bọc</a></li>
          <li><a href="#dk-flow"><span>02</span>Image và container</a></li>
          <li><a href="#dk-file"><span>03</span>Dockerfile</a></li>
          <li><a href="#dk-cmd"><span>04</span>Lệnh hay dùng</a></li>
          <li><a href="#dk-compose"><span>05</span>Docker Compose</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">triển khai · docker</div>
          <h1>Docker</h1>
          <p className="lede">Đóng gói app cùng runtime và thư viện thành một image; chạy image ở đâu cũng ra cùng một kết quả.</p>
        </header>

        <section id="dk-concept">
          <h2><span className="n">01</span>Khái niệm và quan hệ bọc</h2>
          <p>Image bọc code và môi trường chạy. Container là image đang chạy, cộng thêm một lớp ghi tạm. Volume và network không nằm trong container mà được gắn vào từ bên ngoài. Tất cả chạy trên Docker Engine.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 330" role="img" aria-label="Máy host chứa Docker Engine; Docker Engine chứa container; container gồm lớp ghi tạm bên trên và image chỉ đọc bên dưới; volume và network nằm ngoài container và được gắn vào"> <defs><marker id="dkc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs> <rect className="s-box" x="16" y="10" width="868" height="310" rx="10" /><text className="s-tm" x="30" y="30">Máy host (Windows, Linux)</text> <rect className="s-hl" x="30" y="42" width="840" height="266" rx="9" /><text className="s-tb" x="44" y="64" style={{ fill: "var(--ink)" }}>Docker Engine</text> <rect className="s-box" x="50" y="80" width="440" height="212" rx="8" /><text className="s-tb" x="64" y="102">Container</text> <rect className="s-box" x="70" y="114" width="400" height="38" rx="6" /><text className="s-tm" x="82" y="138">Lớp ghi tạm (mất khi xoá container)</text> <rect className="s-disk" x="70" y="162" width="400" height="116" rx="6" /><text className="s-tb" x="82" y="184">Image (chỉ đọc, gồm nhiều layer)</text><text className="s-tm" x="82" y="208">Code app</text><text className="s-tm" x="82" y="228">Thư viện (node_modules)</text><text className="s-tm" x="82" y="248">OS (Operating System) gốc: node:22-alpine</text> <rect className="s-disk" x="540" y="80" width="310" height="72" rx="7" /><text className="s-tb" x="554" y="106">Volume</text><text className="s-tm" x="554" y="128">dữ liệu sống ngoài container</text> <path className="s-ln" d="M540 116 H492" markerEnd="url(#dkc)" /><text className="s-tm" x="498" y="108">mount</text> <rect className="s-box" x="540" y="172" width="310" height="72" rx="7" /><text className="s-tb" x="554" y="198">Network</text><text className="s-tm" x="554" y="220">container gọi nhau bằng tên service</text> <path className="s-ln" d="M540 208 H492" markerEnd="url(#dkc)" /><text className="s-tm" x="540" y="272" style={{ fill: "var(--ink)" }}>Compose khai báo cả cụm này trong compose.yaml</text> </svg>
            </div>
            <figcaption>Xoá container thì lớp ghi tạm mất, image và volume vẫn còn.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead><tr><th>Khái niệm</th><th>Là gì</th><th>Tài liệu chính thức</th></tr></thead>
              <tbody>
                <tr><td>Image</td><td>Gói chứa mọi thứ container cần để chạy. Không sửa được sau khi tạo; muốn đổi thì build image mới hoặc thêm layer lên trên.</td><td><a href="https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/" target="_blank" rel="noreferrer">What is an image</a></td></tr>
                <tr><td>Container</td><td>Tiến trình cô lập cho từng thành phần của app. Dùng chung kernel với host nên nhẹ hơn VM (Virtual Machine, máy ảo), và chạy giống nhau ở mọi môi trường.</td><td><a href="https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/" target="_blank" rel="noreferrer">What is a container</a></td></tr>
                <tr><td>Volume</td><td>Vùng lưu trữ do Docker quản lý trên host, được mount vào container. Dữ liệu còn nguyên sau khi container bị xoá.</td><td><a href="https://docs.docker.com/engine/storage/volumes/" target="_blank" rel="noreferrer">Volumes</a></td></tr>
                <tr><td>Network</td><td>Container ở bridge mặc định chỉ gọi nhau bằng IP. Network tự tạo cho gọi nhau bằng tên, qua DNS (Domain Name System) nhúng sẵn của Docker. Muốn truy cập từ ngoài host thì publish port bằng <code>-p</code>.</td><td><a href="https://docs.docker.com/engine/network/" target="_blank" rel="noreferrer">Networking</a></td></tr>
                <tr><td>Registry</td><td>Nơi lưu và chia sẻ image, mặc định là Docker Hub. Trong registry, repository gom các image cùng dự án theo tag.</td><td><a href="https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-registry/" target="_blank" rel="noreferrer">What is a registry</a></td></tr>
                <tr><td>Docker Compose</td><td>Khai báo nhiều service trong một file YAML (YAML Ain't Markup Language, tên file là <code>compose.yaml</code>) và chạy bằng một lệnh.</td><td><a href="https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-docker-compose/" target="_blank" rel="noreferrer">What is Docker Compose</a></td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="dk-flow">
          <h2><span className="n">02</span>Image và container</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 230" role="img" aria-label="Dockerfile được build thành image; image push lên registry và pull về máy khác; docker run tạo container từ image, một image chạy được nhiều container"> <defs><marker id="dka" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs> <rect className="s-box" x="16" y="70" width="150" height="62" rx="7" /><text className="s-tb" x="28" y="96">Dockerfile</text><text className="s-tm" x="28" y="116">công thức build</text> <path className="s-ln" d="M166 101 H226" markerEnd="url(#dka)" /><text className="s-tm" x="172" y="92">build</text> <rect className="s-hl" x="228" y="62" width="170" height="78" rx="8" /><text className="s-tb" x="242" y="88">Image</text><text className="s-tm" x="242" y="108" style={{ fill: "var(--ink)" }}>chỉ đọc, có tag</text><text className="s-tm" x="242" y="126" style={{ fill: "var(--ink)" }}>order-svc:1.4.0</text> <path className="s-ln" d="M398 92 H456" markerEnd="url(#dka)" /><text className="s-tm" x="404" y="84">push</text> <path className="s-dl" d="M456 112 H400" markerEnd="url(#dka)" /><text className="s-tm" x="406" y="128">pull</text> <rect className="s-disk" x="458" y="62" width="160" height="78" rx="7" /><text className="s-tb" x="470" y="88">Registry</text><text className="s-tm" x="470" y="108">Docker Hub, ECR,</text><text className="s-tm" x="470" y="126">Azure CR…</text> <path className="s-ln" d="M313 140 C313 180 600 160 664 160" markerEnd="url(#dka)" /><text className="s-tm" x="420" y="186">docker run</text> <rect className="s-box" x="666" y="20" width="218" height="54" rx="7" /><text className="s-tb" x="678" y="44">Container 1</text><text className="s-tm" x="678" y="62">tiến trình đang chạy</text> <rect className="s-box" x="666" y="86" width="218" height="54" rx="7" /><text className="s-tb" x="678" y="110">Container 2</text><text className="s-tm" x="678" y="128">cùng image, cô lập nhau</text> <rect className="s-box" x="666" y="152" width="218" height="54" rx="7" /><text className="s-tb" x="678" y="176">Volume</text><text className="s-tm" x="678" y="194">dữ liệu sống ngoài container</text> </svg>
            </div>
            <figcaption>Image giống class, container giống object. Xoá container là mất dữ liệu bên trong, trừ phần nằm trong volume.</figcaption>
          </figure>
        </section>

        <section id="dk-file">
          <h2><span className="n">03</span>Dockerfile</h2>
          <p>Build hai giai đoạn: giai đoạn đầu cài đủ thư viện để build, giai đoạn sau chỉ chép kết quả sang image nhỏ để chạy.</p>
          <Code lang="dockerfile">{`FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev   # drop devDependencies before copying

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER node
CMD ["node", "dist/start.js"]`}</Code>
          <div className="note tip">Chép <code>package*.json</code> trước rồi mới chép code: khi chỉ code đổi, Docker dùng lại cache của bước <code>npm ci</code>. Thêm <code>.dockerignore</code> để không chép <code>node_modules</code>, <code>.env</code>, <code>.git</code>.</div>
        </section>

        <section id="dk-cmd">
          <h2><span className="n">04</span>Lệnh hay dùng</h2>
          <div className="tbl">
            <table>
              <thead><tr><th>Việc</th><th>Lệnh</th></tr></thead>
              <tbody>
                <tr><td>Build image</td><td className="m">docker build -t order-svc:1.4.0 .</td></tr>
                <tr><td>Chạy container</td><td className="m">docker run -d --name order -p 3000:3000 --env-file .env order-svc:1.4.0</td></tr>
                <tr><td>Xem container đang chạy</td><td className="m">docker ps</td></tr>
                <tr><td>Xem log</td><td className="m">docker logs -f order</td></tr>
                <tr><td>Vào trong container</td><td className="m">docker exec -it order sh</td></tr>
                <tr><td>Đẩy lên registry</td><td className="m">docker push &lt;registry&gt;/order-svc:1.4.0</td></tr>
                <tr><td>Dọn image, container thừa</td><td className="m">docker system prune</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="dk-compose">
          <h2><span className="n">05</span>Docker Compose</h2>
          <p>Khai báo nhiều container chạy cùng nhau trong một file; các container gọi nhau bằng tên service.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 170" role="img" aria-label="docker compose up chạy app, mongo, redis trong cùng một network; app gọi mongo và redis bằng tên service"> <defs><marker id="dkb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs> <rect className="s-box" x="16" y="56" width="170" height="58" rx="7" /><text className="s-tb" x="28" y="80">docker compose up -d</text><text className="s-tm" x="28" y="100">đọc compose.yaml</text> <path className="s-ln" d="M186 85 H230" markerEnd="url(#dkb)" /> <rect className="s-hl" x="232" y="16" width="652" height="140" rx="10" /><text className="s-tm" x="246" y="38" style={{ fill: "var(--ink)" }}>network chung</text> <rect className="s-box" x="252" y="56" width="180" height="62" rx="7" /><text className="s-tb" x="264" y="82">app</text><text className="s-tm" x="264" y="102">port 3000 ra ngoài</text> <path className="s-ln" d="M432 76 H486" markerEnd="url(#dkb)" /> <path className="s-ln" d="M432 98 H664" markerEnd="url(#dkb)" /> <rect className="s-disk" x="488" y="48" width="160" height="50" rx="7" /><text className="s-tb" x="500" y="70">mongo</text><text className="s-tm" x="500" y="88">mongodb://mongo:27017</text> <rect className="s-disk" x="666" y="74" width="200" height="50" rx="7" /><text className="s-tb" x="678" y="96">redis</text><text className="s-tm" x="678" y="114">redis://redis:6379</text> </svg>
            </div>
          </figure>
          <Code lang="yaml">{`services:
  app:
    image: order-svc:1.4.0
    ports: ["3000:3000"]
    env_file: .env
    depends_on: [mongo, redis]
  mongo:
    image: mongo:7
    volumes: [mongo-data:/data/db]
  redis:
    image: redis:7
volumes:
  mongo-data:`}</Code>
        </section>
      </main>
    </div>
  );
}
