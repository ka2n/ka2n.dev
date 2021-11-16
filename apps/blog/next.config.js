// @ts-check
// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const { withSentryConfig } = require("@sentry/nextjs");

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

/** @type {import('next').NextConfig & import('@sentry/nextjs/src/config/types').ExportedNextConfig} */
const config = {
  sentry: {
    disableServerWebpackPlugin: !SENTRY_DSN,
    disableClientWebpackPlugin: !SENTRY_DSN,
  },
  // https://github.com/vercel/next.js/issues/30561#issuecomment-954032510
  outputFileTracing: false,
};

const SentryWebpackPluginOptions = {
  silent: true, // Suppresses all logs
  dryRun: process.env.NODE_ENV !== "production",
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(config, SentryWebpackPluginOptions);
