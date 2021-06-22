import { SiteConfig } from "APIClient";
import clsx from "clsx";
import { useAmp } from "next/amp";
import Head from "next/head";
import NextLink from "next/link";
import React from "react";
import { GoogleAnalytics } from "./GoogleAnalytics";

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
      {site.gtm && site.gtm_amp && (
        <GoogleAnalytics gtag={site.gtm} gtag_amp={site.gtm_amp} />
      )}
      <Head>
        {site.favicon && (
          <link rel="icon" href={site.favicon.url} type="image/svg+html" />
        )}
        <meta key="og:site_name" property="og:site_name" content={site.title} />
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
              {site.logo && site.logo_size ? (
                amp ? (
                  <amp-img
                    src={site.logo.url}
                    width={site.logo_size.split(":")[0]}
                    height={site.logo_size.split(":")[1]}
                    layout="intrinsic"
                    alt={site.title}
                  />
                ) : (
                  <img
                    src={site.logo?.url}
                    className="object-contain object-left"
                    width={site.logo_size.split(":")[0]}
                    height={site.logo_size.split(":")[1]}
                    alt={site.title}
                  />
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
