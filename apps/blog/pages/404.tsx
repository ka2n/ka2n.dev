import { Layout } from "components/Layout";
import { siteConfig } from "lib/site-config";
import { NextPage } from "next";
import { NextSeo } from "next-seo";
import React from "react";

const NotFoundPage: NextPage<{}> = (props) => {
  return (
    <Layout
      site={siteConfig}
      _container={{
        className: "bg-yellow-50",
      }}
      _main={{
        className: "flex flex-col items-center justify-start",
      }}
    >
      <NextSeo title="お探しのページはみつかりません" noindex />
      <h1 className="py-10 px-4 space-y-4 font-serif">
        <div className="text-2xl">404 Page Not Found</div>
        <div className="text-4xl">お探しのページはみつかりませんでした</div>
      </h1>
      <p>このページは存在しないようです。</p>
    </Layout>
  );
};

export default NotFoundPage;
