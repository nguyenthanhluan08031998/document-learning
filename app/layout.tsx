import type { Metadata, Viewport } from "next";
import { NotebookHeader } from "@/components/NotebookHeader";
import "./notebook.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Sổ tay Backend", template: "%s · Sổ tay Backend" },
  description: "Ghi chú học backend: REST, GraphQL, gRPC, Kafka, RabbitMQ, NATS, design pattern, lock, logging.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap"
        />
      </head>
      <body>
        <NotebookHeader />
        {children}
      </body>
    </html>
  );
}
