import type { Metadata, Viewport } from "next";
import { NotebookHeader } from "@/components/NotebookHeader";
import "./notebook.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Coder", template: "%s · Coder" },
  description: "Ghi chú học lập trình theo FE, BE, Database, CI/CD, Git: REST, GraphQL, gRPC, Kafka, RabbitMQ, NATS, design pattern, lock, logging.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Browser extensions often add attributes to html/body before React hydrates
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap"
        />
      </head>
      <body suppressHydrationWarning>
        <NotebookHeader />
        {children}
      </body>
    </html>
  );
}
