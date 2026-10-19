import type { NextConfig } from "next";

// Set NEXT_PUBLIC_BASE_PATH (e.g. "/document-learning") when hosting under a sub-path such as GitHub Pages
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",       // fully static site in ./out
  trailingSlash: true,    // /api/rest/index.html works on any static host
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
