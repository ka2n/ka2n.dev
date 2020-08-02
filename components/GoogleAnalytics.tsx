import { AmpIncludeAmpAnalytics } from "./amp/AmpCustomElement";
import { useAmp } from "next/amp";
import Head from "next/head";
import { useEffect } from "react";
import Router from "next/router";

export const GoogleAnalytics = ({ gtag }: { gtag: string }) => {
  const amp = useAmp();
  return amp ? <AmpAnalytics gtag={gtag} /> : <Analytics gtag={gtag} />;
};

const AmpAnalytics = ({ gtag }: { gtag: string }) => {
  const json = JSON.stringify({
    vars: {
      gtag_id: gtag,
      config: {
        [gtag]: { groups: "default" },
      },
    },
  });
  return (
    <>
      <AmpIncludeAmpAnalytics />
      {/* @ts-ignore */}
      <amp-analytics type="gtag" data-credentials="include">
        <script
          type="application/json"
          dangerouslySetInnerHTML={{ __html: json }}
        />
        {/* @ts-ignore */}
      </amp-analytics>
    </>
  );
};

const Analytics = ({ gtag }: { gtag: string }) => (
  <>
    <Head>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag}`}
      />
    </Head>
    <script
      dangerouslySetInnerHTML={{
        __html: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${gtag}', {
    page_path: window.location.pathname
  });
 `,
      }}
    />
  </>
);

export const GoogleAnalyticsTracker: React.FC<{ gtag: string }> = (props) => {
  const amp = useAmp();
  if (amp) return null;
  return <GoogleAnalyticsNoAMPTracker gtag={props.gtag} />;
};

const GoogleAnalyticsNoAMPTracker: React.FC<{ gtag: string }> = (props) => {
  useEffect(() => {
    const h = () => {
      requestAnimationFrame(() => {
        trackPageView(props.gtag)(Router.pathname);
      });
    };
    Router.events.on("routeChangeComplete", h);
    return () => Router.events.off("routeChangeComplete", h);
  }, []);
  return null;
};

declare var gtag: any;

export const trackEvent = (
  action: string,
  event_category?: string,
  event_label?: string,
  value?: number
) => {
  if ("gtag" in window) {
    gtag("event", action, {
      event_category,
      event_label,
      value,
    });
  }
};

export const trackPageView = (mesurement_id: string) => (url: string) => {
  if ("gtag" in window) {
    gtag("config", mesurement_id, {
      page_path: url,
    });
  }
};
