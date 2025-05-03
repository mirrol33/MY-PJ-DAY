import path from 'path';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  basePath: isProd ? '/MY-PJ-DAY' : '',
  assetPrefix: isProd ? '/MY-PJ-DAY/' : '',
  trailingSlash: true,

  webpack: (config:any) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
};

export default nextConfig;
