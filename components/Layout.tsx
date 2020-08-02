import React from "react";
import { GoogleAnalytics, GoogleAnalyticsTracker } from "./GoogleAnalytics";

export const Layout: React.FC<{}> = (props) => {
  return (
    <>
      {process.env.NEXT_PUBLIC_GTAG && (
        <>
          <GoogleAnalytics gtag={process.env.NEXT_PUBLIC_GTAG} />
          <GoogleAnalyticsTracker gtag={process.env.NEXT_PUBLIC_GTAG} />
        </>
      )}
      <main>{props.children}</main>
    </>
  );
};
