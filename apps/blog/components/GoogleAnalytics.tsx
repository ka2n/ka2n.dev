import { useAmp } from "next/amp";
import Head from "next/head";
import { AmpIncludeAmpAnalytics } from "./amp/AmpCustomElement";

export const GoogleAnalytics = ({
  gtag,
  gtag_amp,
}: {
  gtag: string;
  gtag_amp: string;
}) => {
  const amp = useAmp();
  return amp ? (
    <AmpAnalytics gtmID={gtag_amp} />
  ) : (
    <>
      <Analytics gtag={gtag} />
      <GoogleAnalyticsNoAMPTracker gtag={gtag} />
    </>
  );
};

const AmpAnalytics = ({ gtmID }: { gtmID: string }) => {
  return (
    <>
      <AmpIncludeAmpAnalytics />
      {/* @ts-ignore */}
      <amp-analytics
        config={`https://www.googletagmanager.com/amp.json?id=${gtmID}&gtm.url=SOURCE_URL`}
        data-credentials="include"
      />
      <Head>
        <meta name="amp-google-client-id-api" content="googleanalytics" />
      </Head>
    </>
  );
};

const Analytics = ({ gtag }: { gtag: string }) => (
  <>
    <Head>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtag}');`,
        }}
      />
    </Head>
    <noscript
      dangerouslySetInnerHTML={{
        __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtag}"
height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
      }}
    />
  </>
);

const GoogleAnalyticsNoAMPTracker: React.FC<{ gtag: string }> = (props) => {
  //useEffect(() => {
  //  const h = () => {
  //    requestAnimationFrame(() => {
  //      trackPageView(props.gtag)(Router.pathname);
  //    });
  //  };
  //  Router.events.on("routeChangeComplete", h);
  //  return () => Router.events.off("routeChangeComplete", h);
  //}, []);
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
