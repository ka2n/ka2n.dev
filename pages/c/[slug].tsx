import {
  APIClient,
  Data,
  SiteConfig,
  Collection,
  Entry,
  Result,
  RenderedEntry,
} from "APIClient";
import { Layout } from "components/Layout";
import { GetStaticProps, NextPage, GetStaticPaths } from "next";
import React from "react";
import Head from "next/head";
import DefaultErrorPage from "../_error";
import { PageLevelEyeCatch } from "components/PageLevelEyeCatch";
import { EntryCard } from "components/EntryCard";
import { FooterAuthorDesc } from "components/FooterAuthorDesc";
import produce from "immer";
import { formatToAMP, formatToPlain } from "Formatter";

const CollectionPage: NextPage<CollectionProps> = ({
  site,
  error,
  preview,
  collection,
}) => {
  if (!site || !collection) {
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
    <Layout site={site} preview={preview}>
      <Head>
        <title key="title">
          {preview ? "Preview: " : ""}
          {collection.title}
        </title>
      </Head>
      {collection.eyecatch && <PageLevelEyeCatch image={collection.eyecatch} />}
      <div className="w-full max-w-screen-md mt-4 px-2 pt-2 mx-auto">
        <h1 className="text-gray-900 text-palt tracking-wider text-2xl font-semibold my-4">
          {collection.title}
        </h1>
        <div className="text-gray-900 text-sm my-4">
          {collection.description}
        </div>

        <div className="w-full my-10">
          <ul className="space-y-4">
            {collection.entries.map((entry) => (
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

export const getStaticProps: GetStaticProps<
  CollectionProps,
  CollectionQuery
> = async (ctx) => {
  const preview = !!ctx?.previewData?.draftKey;
  const site = await Data(APIClient.current.author());
  if (!site) {
    return {
      props: { site, error: "ERR_NOT_FOUND", preview },
      revalidate: 10,
    };
  }

  if (!ctx.params?.slug) {
    return { props: { site, error: "ERR_NO_QUERY", preview }, revalidate: 10 };
  }

  const ret = await Result(
    APIClient.current.findCollection(ctx.params.slug, {
      draftKey: ctx.previewData?.draftKey,
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
        entry.body_amp = formatToAMP(entry.body);
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
  };
};
