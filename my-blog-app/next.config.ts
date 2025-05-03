// next.config.ts
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  basePath: isProd ? '/MY-PJ-DAY' : '',
  assetPrefix: isProd ? '/MY-PJ-DAY/' : '',
  trailingSlash: true,
};

export default nextConfig;
