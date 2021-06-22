import React from "react";
import { AppProps } from "next/app";
import "css/index.css";
import { DefaultSeo } from "next-seo";
import { siteConfig } from "lib/site-config";
import { isTruthy } from "typesafe-utils";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <DefaultSeo
        titleTemplate={`%s | ${siteConfig.title}`}
        defaultTitle={siteConfig.title}
        twitter={{
          cardType: "summary_large_image",
        }}
        openGraph={{
          site_name: siteConfig.title,
        }}
        additionalLinkTags={[
          siteConfig.favicon && {
            rel: "icon",
            href: siteConfig.favicon.url,
          },
        ].filter(isTruthy)}
      />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
