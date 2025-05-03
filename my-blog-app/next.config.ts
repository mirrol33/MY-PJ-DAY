import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  basePath: '/MY-PJ-DAY',
  trailingSlash: true, // 모든 경로에 / 붙이기 (GitHub Pages 호환)
};

export default nextConfig;
