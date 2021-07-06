import { GoogleAnalytics } from "components/GoogleAnalytics";
import "css/index.css";
import { siteConfig } from "lib/site-config";
import { DefaultSeo } from "next-seo";
import { AppProps } from "next/app";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import { isTruthy } from "typesafe-utils";

function App({ Component, pageProps }: AppProps) {
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
      {siteConfig.gtm_id && <GoogleAnalytics gtag={siteConfig.gtm_id} />}
      <HighlightJS />
    </>
  );
}

declare global {
  interface Window {
    hljs?: any;
  }
}

const HighlightJS = () => {
  const hydrated = useRef(false);
  const [, setRender] = useState(false);
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      setRender(true);
    }
  }, []);

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.0.0/styles/github.min.css"
          media={!hydrated.current ? "print" : "all"}
        />
      </Head>
    </>
  );
};

export default App;
