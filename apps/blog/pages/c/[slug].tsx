import {
  APIClient,
  Collection,
  Data,
  RenderedEntry,
  Result,
  SiteConfig,
} from "APIClient";
import { EntryCard } from "components/EntryCard";
import { FooterAuthorDesc } from "components/FooterAuthorDesc";
import { Layout } from "components/Layout";
import { PageLevelEyeCatch } from "components/PageLevelEyeCatch";
import { formatToPlain } from "Formatter";
import produce from "immer";
import { siteConfig } from "lib/site-config";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import React from "react";
import DefaultErrorPage from "../_error";

const CollectionPage: NextPage<CollectionProps> = ({
  site,
  error,
  preview,
  collection: col,
}) => {
  if (!site || !col) {
    return (
      <>
        <Head>
          <meta name="robots" content="noindex" />
        </Head>
        <DefaultErrorPage statusCode={404} />
      </>
    );
  }
  const canonical = `${site.base_url}/c/${encodeURIComponent(
    col.slug ?? col.id
  )}`;
  const title = `${col.title} | ${site.title}`;
  return (
    <Layout site={site} preview={preview}>
      <Head>
        <title key="title">
          {preview ? "Preview: " : ""}
          {title}
        </title>
        <link key="canonical" rel="canonical" href={canonical} />
      </Head>
      {col.eyecatch && <PageLevelEyeCatch image={col.eyecatch} />}
      <div className="w-full max-w-screen-md mt-4 px-2 pt-2 mx-auto">
        <h1 className="text-gray-900 text-palt tracking-wider text-2xl font-semibold my-4">
          {col.title}
        </h1>
        <div className="text-gray-900 text-sm my-4">{col.description}</div>

        <div className="w-full my-10">
          <ul className="space-y-4">
            {col.entries.map((entry) => (
              <li key={entry.id}>
                <EntryCard entry={entry} />
              </li>
            ))}
          </ul>

          <FooterAuthorDesc site={site} className={"mt-4"} />
        </div>
      </div>
    </Layout>
  );
};

type CollectionProps = {
  site: SiteConfig;
  collection?: Collection<RenderedEntry>;
  preview?: boolean;
} & (
  | {
      error: null;
    }
  | { error: any }
);

type CollectionQuery = {
  slug: string;
};

export default CollectionPage;

export const getStaticPaths: GetStaticPaths<CollectionQuery> = async () => {
  const collections = await Data(
    APIClient.current.listCollection({
      limit: 50,
      offset: 0,
      fields: ["id", "slug"],
    })
  );
  return {
    paths: collections.contents.map((c) => ({
      params: { slug: c.slug ?? c.id },
    })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<CollectionProps, CollectionQuery> =
  async (ctx) => {
    const previewData = ctx?.previewData as any;
    const draftKey = previewData?.draftKey;
    const preview = !!draftKey;
    const site = siteConfig;

    if (!ctx.params?.slug) {
      return {
        props: { site, error: "ERR_NO_QUERY", preview },
        revalidate: 10,
      };
    }

    const ret = await Result(
      APIClient.current.findCollection(ctx.params.slug, {
        draftKey,
      })
    );
    if (!ret.result) {
      return {
        props: { site, error: "ERR_NOT_FOUND_COLLECTION", preview },
        revalidate: 10,
      };
    }
    const collection: Collection<RenderedEntry> = produce(
      ret.result.data,
      (data) => {
        data.entries.forEach((entry: RenderedEntry) => {
          entry.body_plain = formatToPlain(entry.body);
        });
        return data as Collection<RenderedEntry>;
      }
    );

    return {
      props: {
        site,
        preview,
        collection,
        error: null,
      },
      revalidate: 60,
    };
  };
