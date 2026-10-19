# Sổ tay Backend

Ghi chú học backend bằng tiếng Việt, viết bằng **Next.js (App Router) + TypeScript**, xuất ra site tĩnh.

| Nhóm | Nội dung |
|---|---|
| API (đồng bộ) | REST, GraphQL, gRPC, so sánh |
| Messaging (bất đồng bộ) | Kafka, RabbitMQ, NATS, so sánh |
| Thiết kế | OOP, SOLID, 23 pattern GoF, pattern microservice, Clean Architecture, tra nhanh |
| Đồng thời | Race condition, isolation level, pessimistic/optimistic lock, SKIP LOCKED, distributed lock |
| Vận hành | Logging, structured logging, tự viết logger, observability |

## Chạy trên máy

```bash
npm install
npm run dev          # http://localhost:3000
```

## Build

```bash
npm run build        # site tĩnh nằm trong ./out
npm start            # xem thử bản build
```

## Cấu trúc

```
app/
  layout.tsx                 # khung trang, header, font
  page.tsx                   # trang Tổng quan  (/)
  [group]/[slug]/page.tsx    # mọi trang con     (/api/rest/, /messaging/kafka/, ...)
  notebook.css               # giao diện chung, sơ đồ, theme code One Dark
  globals.css                # phần riêng cho Next.js
components/
  NotebookHeader.tsx         # thanh nhóm + tab con (client component)
  NotebookContent.tsx        # render nội dung một trang (server component)
lib/
  notebook.ts                # danh sách nhóm, trang, route
  content.ts                 # đọc nội dung lúc build
content/pages/*.html         # nội dung từng trang: chữ, sơ đồ SVG, code đã tô màu
```

### Thêm hoặc sửa một trang

1. Sửa hoặc tạo file `content/pages/<nhóm>__<slug>.html`.
2. Nếu là trang mới, khai báo trong `lib/notebook.ts`.
3. Link sang trang khác viết dạng `href="{{BASE}}/design/oop#oop-static"` để tự thêm base path.

## Deploy lên GitHub Pages

Repo đã có sẵn workflow `.github/workflows/deploy.yml`. Vào **Settings → Pages → Source: GitHub Actions**, sau đó mỗi lần push lên `main` site sẽ tự build và đăng tại `https://<user>.github.io/<tên-repo>/`.
