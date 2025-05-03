const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  basePath: isProd ? '/MY-PJ-DAY' : '',
  trailingSlash: true,
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
