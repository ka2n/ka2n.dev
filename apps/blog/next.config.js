// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const { withSentryConfig } = require('@sentry/nextjs');

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

const moduleExports = {
  sentry: {
    disableServerWebpackPlugin: !SENTRY_DSN,
    disableClientWebpackPlugin: !SENTRY_DSN,
  },
};

const SentryWebpackPluginOptions = {
  silent: true, // Suppresses all logs
  dryRun: process.env.NODE_ENV !== 'production',
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(moduleExports, SentryWebpackPluginOptions);
