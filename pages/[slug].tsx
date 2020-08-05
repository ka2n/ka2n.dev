import { AmpIncludeAmpSocialShare } from "components/amp/AmpCustomElement";
import { AuthorIcon } from "components/AuthorIcon";
import { Layout } from "components/Layout";
import { formatToAMP, formatToPlain } from "Formatter";
import { GetStaticPaths, GetStaticProps, NextPage, PageConfig } from "next";
import Head from "next/head";
import React from "react";
import { APIClient, Entry, Result, SiteConfig } from "../APIClient";
import DefaultErrorPage from "./_error";

// export const config: PageConfig = { amp: "hybrid" };
export const config: PageConfig = { amp: "hybrid" };

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
    <Layout
      preview={props.preview}
      site={site}
      _main={{ className: "mx-4 pt-4" }}
    >
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
        <title key="title">
          {props.preview ? "Preview: " : ""}
          {title}
        </title>
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
          <div dangerouslySetInnerHTML={{ __html: entry.body_amp }} />
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
                <p className="text-sm text-gray-800">
                  {site.author_description}
                </p>
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
      entry: Entry & { og_path?: string; body_amp: string; body_plain: string };
      site: SiteConfig;
      preview?: boolean;
    }
  | {
      entry: null;
      site?: SiteConfig;
      error: string;
      preview?: boolean;
    };

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
  const preview = !!ctx?.previewData?.draftKey;
  const siteResp = await Result(APIClient.current.author());
  const site = siteResp.result?.data;
  if (!site) {
    return {
      props: { entry: null, site, error: "ERR_NOT_FOUND", preview },
      revalidate: 10,
    };
  }

  // slugで取得してなければ探す
  if (!ctx.params?.slug) {
    return {
      props: { entry: null, site, error: "ERR_NOT_FOUND_SLUG", preview },
      revalidate: 10,
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
      props: { entry: null, site, error: "ERR_NOT_FOUND_ENTRY", preview },
      revalidate: 10,
    };
  }

  const ampBody = formatToAMP(entry.body);
  if (!ampBody) {
    return {
      props: { entry: null, site, error: "ERR_BUILD_AMP", preview },
      revalidate: 10,
    };
  }

  const plainBody = formatToPlain(entry.body);
  if (!plainBody) {
    return {
      props: { entry: null, site, error: "ERR_BUILD_PLAIN", preview },
      revalidate: 10,
    };
  }

  const og_path = `/ogp/${entry.id}?rev=${Date.parse(entry.updatedAt)}`;

  return {
    props: {
      entry: {
        ...entry,
        body_amp: ampBody,
        body_plain: plainBody,
        og_path,
      },
      site,
      preview,
    },
    revalidate: 60,
  };
};
