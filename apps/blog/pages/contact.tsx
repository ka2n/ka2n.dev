import { Layout } from "components/Layout";
import { siteConfig } from "lib/site-config";
import { NextSeo } from "next-seo";
import React from "react";

const ContactPage = () => {
  return (
    <Layout site={siteConfig} _main={{ className: "mx-4" }}>
      <NextSeo title="ご意見・お問い合わせ" noindex />
      <div className="max-w-2xl pt-8 mx-auto w-full space-y-6 text-center">
        <h1 className="text-lg w-full font-bold">ご意見・お問い合わせ</h1>
        <p className="text-base">
          内容へのご意見やご感想、誤りのご指摘などありましたらどうぞ。
        </p>
        <iframe className="form w-full" src={siteConfig.contact_form_url}>
          読み込んでいます…
        </iframe>
        <style jsx>{`
          .form {
            min-height: 800px;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default ContactPage;
