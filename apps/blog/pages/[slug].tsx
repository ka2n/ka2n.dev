import { AuthorIcon } from "components/AuthorIcon";
import { FooterAuthorDesc } from "components/FooterAuthorDesc";
import { Layout } from "components/Layout";
import { PageLevelEyeCatch } from "components/PageLevelEyeCatch";
import { formatToPlain } from "Formatter";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import React from "react";
import { APIClient, RenderedEntry, Result, SiteConfig } from "../APIClient";
import DefaultErrorPage from "./_error";

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
  const canonical = `${site.base_url}/${encodeURIComponent(
    entry.slug ?? entry.id
  )}`;
  const title = `${entry.title} | ${site.title}`;
  const excerpt = entry.excerpt ?? entry.body.slice(0, 100);

  return (
    <Layout preview={props.preview} site={site}>
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
      {entry.eyecatch && <PageLevelEyeCatch image={entry.eyecatch} />}
      <div className="w-full max-w-screen-md mx-auto">
        <h1 className="text-palt tracking-wider pt-4 px-2 text-3xl font-semibold">
          {entry.title}
        </h1>
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
        <div className="px-4 py-4">
          <div
            dangerouslySetInnerHTML={{
              __html: entry.body,
            }}
          />
        </div>
        <FooterAuthorDesc site={site} className={"mt-2"} />
        <hr />
      </div>
    </Layout>
  );
};

export default EntryPage;

type EntryProps =
  | {
      entry: RenderedEntry & Required<Pick<RenderedEntry, "body_plain">>;
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
        slug: encodeURIComponent(entry.slug ?? entry.id),
      },
    })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<EntryProps, EntryQuery> = async (
  ctx
) => {
  const previewData = ctx?.previewData as any;
  const draftKey = previewData?.draftKey;
  const preview = !!draftKey;
  const siteResp = await Result(APIClient.current.author());
  const site = siteResp.result?.data;
  if (!site) {
    return {
      props: { entry: null, site, error: "ERR_NOT_FOUND", preview },
      revalidate: 10,
    };
  }

  if (!ctx.params?.slug) {
    return {
      props: { entry: null, site, error: "ERR_NOT_FOUND_SLUG", preview },
      revalidate: 10,
    };
  }

  const ret = await Result(
    APIClient.current.findEntry(ctx.params.slug, {
      draftKey,
    })
  );
  const entry = ret.result?.data;
  if (!entry) {
    return {
      props: { entry: null, site, error: "ERR_NOT_FOUND_ENTRY", preview },
      revalidate: 10,
    };
  }

  const plainBody = formatToPlain(entry.body);
  const og_path = `/ogp/${entry.id}?rev=${Date.parse(entry.updatedAt)}`;

  return {
    props: {
      entry: {
        ...entry,
        body_plain: plainBody,
        og_path,
      },
      site,
      preview,
    },
    revalidate: 60,
  };
};
