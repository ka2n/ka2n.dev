import React from "react";
import { NextPage, GetStaticProps, GetStaticPaths, PageConfig } from "next";
import { APIClient, Result, Entry, SiteConfig } from "../APIClient";
import Head from "next/head";
import DefaultErrorPage from "./_error";
import unified from "unified";
import RemarkHTML from "remark-html";
import RemarkParse from "remark-parse";
import { AmpIncludeAmpSocialShare } from "components/amp/AmpCustomElement";
import { Layout } from "components/Layout";

export const config: PageConfig = { amp: true };

const EntryPage: NextPage<EntryProps> = (props) => {
  const { entry, site } = props;
  if (!entry) {
    return (
      <>
        <Head>
          <meta name="robots" content="noindex" />
        </Head>
        <DefaultErrorPage statusCode={404} />
      </>
    );
  }
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="px-2 text-3xl font-semibold">{entry.title}</h1>
        <section className="px-2 py-2 mb-2 text-sm">
          {site && <div className="font-semibold">{site.author_name}</div>}
          <div>{entry.updatedAt}</div>
        </section>
        <div className="px-2 py-2">
          <div dangerouslySetInnerHTML={{ __html: entry.body }} />
        </div>
        <div>
          <AmpIncludeAmpSocialShare />
          <amp-social-share type="system"></amp-social-share>
          <amp-social-share type="email"></amp-social-share>
          <amp-social-share type="twitter"></amp-social-share>
          <amp-social-share type="line"></amp-social-share>
        </div>
        {site && (
          <section className="px-2 py-2 mt-2">
            <h2>{site?.author_name}</h2>
            <div
              dangerouslySetInnerHTML={{ __html: site.author_description }}
            />
          </section>
        )}
        <hr />
      </div>
    </Layout>
  );
};

export default EntryPage;

type EntryProps =
  | {
      entry: Entry;
      site: SiteConfig;
    }
  | { entry: null; site?: SiteConfig; error: "ERR_NOT_FOUND" };

type EntryQuery = {
  slug: string;
};

export const getStaticPaths: GetStaticPaths<EntryQuery> = async () => {
  const topEntries = await APIClient.current.listEntry({
    limit: 50,
    offset: 0,
    orders: "-publishedAt",
    fields: ["id", "updatedAt", "slug"],
  });

  return {
    paths: topEntries.data.contents.map((entry) => ({
      params: {
        slug: (entry.slug && encodeURIComponent(entry.slug)) || entry.id,
      },
    })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<EntryProps, EntryQuery> = async (
  ctx
) => {
  const siteResp = await Result(APIClient.current.author());
  const site = siteResp.result?.data;
  if (!site) {
    return {
      props: { entry: null, site, error: "ERR_NOT_FOUND" },
    };
  }

  // slugで取得してなければ探す
  if (!ctx.params?.slug) {
    return {
      props: { entry: null, site, error: "ERR_NOT_FOUND" },
    };
  }

  const ret = await Result(APIClient.current.findEntry(ctx.params.slug));
  if (!ret.result?.data) {
    return {
      props: { entry: null, site, error: "ERR_NOT_FOUND" },
    };
  }

  const bodyHTML = await Result(
    unified()
      .use(RemarkParse)
      .use(RemarkHTML)
      .process(ret.result.data.body)
      .then((r) => {
        return r.toString("utf8") || "";
      })
  );
  if (!bodyHTML.result) {
    return {
      props: { entry: null, site, error: "ERR_NOT_FOUND" },
    };
  }

  return {
    props: {
      entry: {
        ...ret.result.data,
        body: bodyHTML.result,
      },
      site,
    },
  };
};
