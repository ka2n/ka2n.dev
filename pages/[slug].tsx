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
import { AuthorIcon } from "components/AuthorIcon";

export const config: PageConfig = { amp: "hybrid" };
// export const config: PageConfig = { amp: true };

const EntryPage: NextPage<EntryProps> = (props) => {
  const { entry, site } = props;
  if (!entry || !site) {
    return (
      <>
        <Head>
          <meta name="robots" content="noindex" />
        </Head>
        <DefaultErrorPage statusCode={404} />
      </>
    );
  }
  const canonical = `${site.base_url}/${
    entry.slug ? encodeURIComponent(entry.slug) : entry.id
  }`;
  const title = `${entry.title} | ${site.title}`;
  const excerpt = entry.excerpt ?? entry.body.slice(0, 100);
  return (
    <Layout site={site} _main={{ className: "mx-4 pt-4" }}>
      <Head>
        {entry.og_path && (
          <meta
            key="og:image"
            property="og:image"
            content={`${site.base_url}${entry.og_path}`}
          />
        )}
        <meta key="og:url" property="og:url" content={canonical} />
        <meta key="og:type" property="og:type" content="article" />
        <meta key="og:title" property="og:title" content={title} />
        <meta
          key="og:description"
          property="og:description"
          content={excerpt}
        />
        <meta key="og:site_name" property="og:site_name" content={site.title} />
        {/* <meta key="fb:app_id" property="fb:app_id" content="" /> */}
        <meta
          data-hid="twitter:card"
          property="twitter:card"
          content="summary"
        />
        <meta key="description" property="description" content={excerpt} />
        <link key="canonical" rel="canonical" href={canonical} />
        <title key="title">{title}</title>
      </Head>
      <div className="w-full max-w-screen-md mx-auto">
        <h1 className="px-2 text-3xl font-semibold">{entry.title}</h1>
        <section className="px-2 py-2 mb-2 text-sm">
          <div className="flex items-center">
            <div className="mr-4">
              <AuthorIcon size="sm" site={site} />
            </div>
            <div>
              <div className="font-semibold">{site.author_name}</div>
              <div>{entry.updatedAt}</div>
            </div>
          </div>
        </section>
        <div className="px-2 py-2">
          <div dangerouslySetInnerHTML={{ __html: entry.html_body }} />
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
            <div className="flex items-center">
              <div className="mr-6">
                <AuthorIcon site={site} />
              </div>
              <div>
                <h2 className="text-base font-bold">{site?.author_name}</h2>
                <div
                  className="text-sm text-gray-800"
                  dangerouslySetInnerHTML={{ __html: site.author_description }}
                />
              </div>
            </div>
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
      entry: Entry & { og_path?: string; html_body: string };
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

  const ret = await Result(
    APIClient.current.findEntry(ctx.params.slug, {
      draftKey: ctx.previewData?.draftKey,
    })
  );
  const entry = ret.result?.data;
  if (!entry) {
    return {
      props: { entry: null, site, error: "ERR_NOT_FOUND" },
    };
  }

  const bodyHTML = await Result(
    unified()
      .use(RemarkParse)
      .use(RemarkHTML)
      .process(entry.body)
      .then((r) => {
        return r.toString("utf8") || "";
      })
  );
  if (!bodyHTML.result) {
    return {
      props: { entry: null, site, error: "ERR_NOT_FOUND" },
    };
  }

  const og_path = `/ogp/${entry.id}?rev=${Date.parse(entry.updatedAt)}`;

  return {
    props: {
      entry: {
        ...entry,
        html_body: bodyHTML.result,
        og_path,
      },
      site,
    },
    revalidate: 60,
  };
};
