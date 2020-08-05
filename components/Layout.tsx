import React from "react";
import { GoogleAnalytics, GoogleAnalyticsTracker } from "./GoogleAnalytics";
import { SiteConfig } from "APIClient";
import NextLink from "next/link";
import clsx from "clsx";
import Head from "next/head";
import { useAmp } from "next/amp";

export const Layout: React.FC<{
  site: SiteConfig;
  preview?: boolean;
  _header?: Partial<JSX.IntrinsicElements["div"]>;
  _main?: Partial<JSX.IntrinsicElements["div"]>;
  _container?: Partial<JSX.IntrinsicElements["div"]>;
}> = ({ site, ...props }) => {
  const amp = useAmp();
  return (
    <div
      {...props._container}
      className={clsx("min-h-screen", props._container?.className)}
    >
      {process.env.NEXT_PUBLIC_GTAG && (
        <>
          <GoogleAnalytics gtag={process.env.NEXT_PUBLIC_GTAG} />
          <GoogleAnalyticsTracker gtag={process.env.NEXT_PUBLIC_GTAG} />
        </>
      )}
      <Head>
        {site.favicon && (
          <link rel="icon" href={site.favicon.url} type="image/svg+html" />
        )}
      </Head>
      {props.preview && (
        <div className="bg-pink-700 text-white px-4">
          <div className="max-w-screen-md mx-auto text-base">
            現在プレビューモードを表示しています
            <a className="ml-4 text-sm" href="/api/exit-preview">
              [終了する]
            </a>
          </div>
        </div>
      )}
      <header
        {...props._header}
        className={clsx(
          "w-full border-b p-4 bg-white",
          props._header?.className
        )}
      >
        <div className="max-w-screen-md w-full mx-auto">
          <NextLink href="/">
            <a>
              {site.logo ? (
                amp ? (
                  <amp-img
                    src={site.logo.url}
                    height={64}
                    width={
                      (64 / (site.logo_size?.height ?? 64)) *
                      (site.logo_size?.width ?? 0)
                    }
                    layout="intrinsic"
                    alt={site.title}
                  />
                ) : (
                  <img src={site.logo?.url} className="h-16" alt={site.title} />
                )
              ) : (
                site.title
              )}
            </a>
          </NextLink>
        </div>
      </header>
      <main {...props._main} className={clsx(props._main?.className)}>
        {props.children}
      </main>
      <footer className="border border-l-0 border-r-0 border-b-0 border-gray-300 bg-white mt-12 p-12 text-center text-sm text-gray-700">
        {site.base_url}
      </footer>
    </div>
  );
};
