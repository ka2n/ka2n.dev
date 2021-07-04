import { AuthorIcon } from "components/AuthorIcon";
import { DateTimeLabel } from "components/DateTimeLabel";
import { FooterAuthorDesc } from "components/FooterAuthorDesc";
import { Layout } from "components/Layout";
import { PageLevelEyeCatch } from "components/PageLevelEyeCatch";
import { formatToHTML, formatToPlain } from "Formatter";
import { siteConfig } from "lib/site-config";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { NextSeo } from "next-seo";
import React from "react";
import { isTruthy } from "typesafe-utils";
import { APIClient, RenderedEntry, Result, SiteConfig } from "../APIClient";
import { EntryBody } from "../components/EntryBody";
import DefaultErrorPage from "./_error";
import Link from "next/link";

const EntryPage: NextPage<EntryProps> = (props) => {
  const { entry, site } = props;
  if (!entry || !site) {
    return (
      <>
        <NextSeo noindex />
        <DefaultErrorPage statusCode={404} />
      </>
    );
  }
  const canonical = `${site.base_url}/${encodeURIComponent(
    entry.slug ?? entry.id
  )}`;
  const excerpt = entry.excerpt ?? entry.body_plain.slice(0, 100);

  return (
    <Layout preview={props.preview} site={site}>
      <NextSeo
        title={props.preview ? `Preview : ${entry.title}` : entry.title}
        canonical={canonical}
        description={excerpt}
        openGraph={{
          url: canonical,
          type: "article",
          description: excerpt,
          title: entry.title,
          article: {
            publishedTime: entry.publishedAt,
            modifiedTime: entry.updatedAt,
          },
          images: [
            entry.og_path && {
              url: `${site.base_url}${entry.og_path}`,
            },
          ].filter(isTruthy),
        }}
      />
      {entry.eyecatch && <PageLevelEyeCatch image={entry.eyecatch} />}
      <div className="w-full max-w-screen-md mx-auto">
        <h1 className="text-palt tracking-wider p-2 pt-4 text-3xl font-semibold">
          <Link href={canonical}>{entry.title}</Link>
        </h1>
        <section className="px-2 py-2 mb-2 text-sm">
          <div className="flex items-center">
            <div className="mr-4">
              <AuthorIcon size="sm" site={site} loading="eager" />
            </div>
            <div>
              <div className="font-semibold">{site.author_name}</div>
              <div className="space-x-2">
                <DateTimeLabel date={entry.publishedAt ?? entry.createdAt} />
                {entry.revisedAt && (
                  <span className="text-gray-500">
                    (Updated:&nbsp;
                    <DateTimeLabel date={entry.revisedAt} />)
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
        <div className="px-4 py-4">
          <EntryBody>{entry.body}</EntryBody>
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
  const site = siteConfig;
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

  const [plainBody, htmlBody] = await Promise.all([
    formatToPlain(entry.body),
    formatToHTML(entry.body),
  ]);
  const og_path = `/ogp/${entry.id}?rev=${Date.parse(entry.updatedAt)}`;

  return {
    props: {
      entry: {
        ...entry,
        body: htmlBody,
        body_plain: plainBody,
        og_path,
      },
      site,
      preview,
    },
    revalidate: 60,
  };
};
