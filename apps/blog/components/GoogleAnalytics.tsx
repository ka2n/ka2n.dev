import Script from "next/script";

export const GoogleAnalytics = ({ gtag }: { gtag: string }) => {
  return (
    <>
      <Analytics gtag={gtag} />
      <GoogleAnalyticsNoAMPTracker gtag={gtag} />
    </>
  );
};

const Analytics = ({ gtag }: { gtag: string }) => (
  <Script strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtag}');`}</Script>
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
