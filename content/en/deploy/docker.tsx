import { Code } from "@/components/Code";

export default function DockerPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Docker contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#dk-concept"><span>01</span>Concepts and what wraps what</a></li>
          <li><a href="#dk-flow"><span>02</span>Images and containers</a></li>
          <li><a href="#dk-file"><span>03</span>Dockerfile</a></li>
          <li><a href="#dk-cmd"><span>04</span>Common commands</a></li>
          <li><a href="#dk-compose"><span>05</span>Docker Compose</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">deployment · docker</div>
          <h1>Docker</h1>
          <p className="lede">Package an app with its runtime and libraries into an image; run that image anywhere and get the same result.</p>
        </header>

        <section id="dk-concept">
          <h2><span className="n">01</span>Concepts and what wraps what</h2>
          <p>An image wraps the code and its runtime environment. A container is an image that is running, plus a temporary writable layer. Volumes and networks do not live inside the container; they are attached from outside. Everything runs on the Docker Engine.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 330" role="img" aria-label="The host machine contains the Docker Engine; the engine contains the container; the container has a temporary writable layer on top of a read-only image; volumes and networks sit outside the container and are attached to it"> <defs><marker id="dkc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs> <rect className="s-box" x="16" y="10" width="868" height="310" rx="10" /><text className="s-tm" x="30" y="30">Host machine (Windows, Linux)</text> <rect className="s-hl" x="30" y="42" width="840" height="266" rx="9" /><text className="s-tb" x="44" y="64" style={{ fill: "var(--ink)" }}>Docker Engine</text> <rect className="s-box" x="50" y="80" width="440" height="212" rx="8" /><text className="s-tb" x="64" y="102">Container</text> <rect className="s-box" x="70" y="114" width="400" height="38" rx="6" /><text className="s-tm" x="82" y="138">Temporary writable layer (lost on delete)</text> <rect className="s-disk" x="70" y="162" width="400" height="116" rx="6" /><text className="s-tb" x="82" y="184">Image (read-only, made of layers)</text><text className="s-tm" x="82" y="208">App code</text><text className="s-tm" x="82" y="228">Dependencies (node_modules)</text><text className="s-tm" x="82" y="248">Base OS (Operating System): node:22-alpine</text> <rect className="s-disk" x="540" y="80" width="310" height="72" rx="7" /><text className="s-tb" x="554" y="106">Volume</text><text className="s-tm" x="554" y="128">data lives outside the container</text> <path className="s-ln" d="M540 116 H492" markerEnd="url(#dkc)" /><text className="s-tm" x="498" y="108">mount</text> <rect className="s-box" x="540" y="172" width="310" height="72" rx="7" /><text className="s-tb" x="554" y="198">Network</text><text className="s-tm" x="554" y="220">containers reach each other by service name</text> <path className="s-ln" d="M540 208 H492" markerEnd="url(#dkc)" /><text className="s-tm" x="540" y="272" style={{ fill: "var(--ink)" }}>Compose declares this whole set in compose.yaml</text> </svg>
            </div>
            <figcaption>Deleting a container loses its writable layer; the image and the volume stay.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead><tr><th>Concept</th><th>What it is</th><th>Official docs</th></tr></thead>
              <tbody>
                <tr><td>Image</td><td>A package with everything a container needs to run. It cannot be changed after creation; to change it, build a new image or add layers on top.</td><td><a href="https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/" target="_blank" rel="noreferrer">What is an image</a></td></tr>
                <tr><td>Container</td><td>An isolated process for one component of the app. It shares the host kernel, so it is lighter than a VM (Virtual Machine), and behaves the same in every environment.</td><td><a href="https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/" target="_blank" rel="noreferrer">What is a container</a></td></tr>
                <tr><td>Volume</td><td>Storage that Docker manages on the host and mounts into containers. Data survives after the container is removed.</td><td><a href="https://docs.docker.com/engine/storage/volumes/" target="_blank" rel="noreferrer">Volumes</a></td></tr>
                <tr><td>Network</td><td>On the default bridge, containers reach each other only by IP. A user-defined network lets them use names, through Docker's embedded DNS (Domain Name System). To reach a container from outside the host, publish a port with <code>-p</code>.</td><td><a href="https://docs.docker.com/engine/network/" target="_blank" rel="noreferrer">Networking</a></td></tr>
                <tr><td>Registry</td><td>A place to store and share images; Docker Hub is the default. Inside a registry, a repository groups the images of one project by tag.</td><td><a href="https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-registry/" target="_blank" rel="noreferrer">What is a registry</a></td></tr>
                <tr><td>Docker Compose</td><td>Declares several services in one YAML (YAML Ain't Markup Language) file, <code>compose.yaml</code>, and starts them with one command.</td><td><a href="https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-docker-compose/" target="_blank" rel="noreferrer">What is Docker Compose</a></td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="dk-flow">
          <h2><span className="n">02</span>Images and containers</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 230" role="img" aria-label="A Dockerfile is built into an image; the image is pushed to a registry and pulled on other machines; docker run creates containers from the image, and one image can run many containers"> <defs><marker id="dka" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs> <rect className="s-box" x="16" y="70" width="150" height="62" rx="7" /><text className="s-tb" x="28" y="96">Dockerfile</text><text className="s-tm" x="28" y="116">build recipe</text> <path className="s-ln" d="M166 101 H226" markerEnd="url(#dka)" /><text className="s-tm" x="172" y="92">build</text> <rect className="s-hl" x="228" y="62" width="170" height="78" rx="8" /><text className="s-tb" x="242" y="88">Image</text><text className="s-tm" x="242" y="108" style={{ fill: "var(--ink)" }}>read-only, tagged</text><text className="s-tm" x="242" y="126" style={{ fill: "var(--ink)" }}>order-svc:1.4.0</text> <path className="s-ln" d="M398 92 H456" markerEnd="url(#dka)" /><text className="s-tm" x="404" y="84">push</text> <path className="s-dl" d="M456 112 H400" markerEnd="url(#dka)" /><text className="s-tm" x="406" y="128">pull</text> <rect className="s-disk" x="458" y="62" width="160" height="78" rx="7" /><text className="s-tb" x="470" y="88">Registry</text><text className="s-tm" x="470" y="108">Docker Hub, ECR,</text><text className="s-tm" x="470" y="126">Azure CR…</text> <path className="s-ln" d="M313 140 C313 180 600 160 664 160" markerEnd="url(#dka)" /><text className="s-tm" x="420" y="186">docker run</text> <rect className="s-box" x="666" y="20" width="218" height="54" rx="7" /><text className="s-tb" x="678" y="44">Container 1</text><text className="s-tm" x="678" y="62">a running process</text> <rect className="s-box" x="666" y="86" width="218" height="54" rx="7" /><text className="s-tb" x="678" y="110">Container 2</text><text className="s-tm" x="678" y="128">same image, isolated</text> <rect className="s-box" x="666" y="152" width="218" height="54" rx="7" /><text className="s-tb" x="678" y="176">Volume</text><text className="s-tm" x="678" y="194">data lives outside the container</text> </svg>
            </div>
            <figcaption>An image is like a class, a container like an object. Deleting a container loses its data, except what lives in a volume.</figcaption>
          </figure>
        </section>

        <section id="dk-file">
          <h2><span className="n">03</span>Dockerfile</h2>
          <p>A two-stage build: the first stage installs everything needed to build, the second copies only the output into a small runtime image.</p>
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
          <div className="note tip">Copy <code>package*.json</code> before the code: when only code changes, Docker reuses the cached <code>npm ci</code> layer. Add a <code>.dockerignore</code> so <code>node_modules</code>, <code>.env</code> and <code>.git</code> are not copied.</div>
        </section>

        <section id="dk-cmd">
          <h2><span className="n">04</span>Common commands</h2>
          <div className="tbl">
            <table>
              <thead><tr><th>Task</th><th>Command</th></tr></thead>
              <tbody>
                <tr><td>Build image</td><td className="m">docker build -t order-svc:1.4.0 .</td></tr>
                <tr><td>Run a container</td><td className="m">docker run -d --name order -p 3000:3000 --env-file .env order-svc:1.4.0</td></tr>
                <tr><td>List running containers</td><td className="m">docker ps</td></tr>
                <tr><td>Xem log</td><td className="m">docker logs -f order</td></tr>
                <tr><td>Shell into a container</td><td className="m">docker exec -it order sh</td></tr>
                <tr><td>Push to a registry</td><td className="m">docker push &lt;registry&gt;/order-svc:1.4.0</td></tr>
                <tr><td>Clean up unused images and containers</td><td className="m">docker system prune</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="dk-compose">
          <h2><span className="n">05</span>Docker Compose</h2>
          <p>Declare several containers that run together in one file; containers reach each other by service name.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 170" role="img" aria-label="docker compose up runs app, mongo and redis on one network; the app reaches mongo and redis by service name"> <defs><marker id="dkb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs> <rect className="s-box" x="16" y="56" width="170" height="58" rx="7" /><text className="s-tb" x="28" y="80">docker compose up -d</text><text className="s-tm" x="28" y="100">reads compose.yaml</text> <path className="s-ln" d="M186 85 H230" markerEnd="url(#dkb)" /> <rect className="s-hl" x="232" y="16" width="652" height="140" rx="10" /><text className="s-tm" x="246" y="38" style={{ fill: "var(--ink)" }}>network chung</text> <rect className="s-box" x="252" y="56" width="180" height="62" rx="7" /><text className="s-tb" x="264" y="82">app</text><text className="s-tm" x="264" y="102">port 3000 exposed</text> <path className="s-ln" d="M432 76 H486" markerEnd="url(#dkb)" /> <path className="s-ln" d="M432 98 H664" markerEnd="url(#dkb)" /> <rect className="s-disk" x="488" y="48" width="160" height="50" rx="7" /><text className="s-tb" x="500" y="70">mongo</text><text className="s-tm" x="500" y="88">mongodb://mongo:27017</text> <rect className="s-disk" x="666" y="74" width="200" height="50" rx="7" /><text className="s-tb" x="678" y="96">redis</text><text className="s-tm" x="678" y="114">redis://redis:6379</text> </svg>
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
