// @ts-check

const { withContentlayer } =  require('next-contentlayer')

/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  experimental: {
    appDir: true,
    mdxRs: true,
  }
}

module.exports = withContentlayer(nextConfig)
