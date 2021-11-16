import {
  APIClient,
  Collection,
  CollectionResponse,
  Data,
  Entry,
  RenderedEntry,
  Result,
} from "APIClient";
import clsx from "clsx";
import { AuthorIcon } from "components/AuthorIcon";
import { CollectionCard } from "components/CollectionCard";
import { EntryCard } from "components/EntryCard";
import { Layout } from "components/Layout";
import { PageLevelEyeCatch } from "components/PageLevelEyeCatch";
import { formatToPlain } from "Formatter";
import produce from "immer";
import { siteConfig } from "lib/site-config";
import { GetStaticProps, NextPage, PageConfig } from "next";
import { NextSeo } from "next-seo";

export const config: PageConfig = {};

const Home: NextPage<HomePageProps> = (props) => {
  const { pinnedEntry } = props;
  const site = siteConfig;
  return (
    <Layout site={site} _main={{ className: "mx-4" }}>
      <NextSeo
        additionalLinkTags={[
          { rel: "alternate", type: "application/rss+xml", href: "/feed.xml" },
        ]}
      />
      <div className="-mx-4 bg-white">
        {site.eyecatch && <PageLevelEyeCatch image={site.eyecatch} />}
        <div className="mx-4">
          <div className="py-6 max-w-screen-md mx-auto">
            <div className="flex items-center">
              <div className="mr-6">
                <AuthorIcon site={site} loading="eager" />
              </div>
              <div>
                <h1 className="text-xl text-gray-900 font-bold mb-2">
                  {site.author_name}
                </h1>
                <p className="text-sm text-gray-800">
                  {site.author_description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={clsx(
          "max-w-screen-md mx-auto flex flex-row container",
          pinnedEntry ? "pt-10" : "pt-4"
        )}
      >
        <div className="w-full">
          <ul className="space-y-4">
            {pinnedEntry && (
              <li>
                <div className="-mt-6 mb-1">
                  <span className="text-xs text-gray-700">
                    <PinIcon />
                    固定された記事
                  </span>
                </div>
                <EntryCard
                  variant="pinned"
                  entry={pinnedEntry}
                  className="mb-8"
                />
              </li>
            )}
            {props.topEntries.map((entry, idx) => {
              if (idx < 10 && pinnedEntry?.id === entry.id) return null; // 画面の上の方にpinnedがダブらないようにする
              return (
                <li key={entry.id}>
                  <EntryCard entry={entry} />
                </li>
              );
            })}
          </ul>
        </div>
        <aside className="ml-4 hidden md:w-side md:block">
          <ul className="space-y-4">
            {props.asideContents.map((entry) => {
              return (
                <li key={entry.id}>
                  <CollectionCard collection={entry} />
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </Layout>
  );
};

const PinIcon = () => (
  <svg
    className="fill-current inline-block h-3 w-3 mr-1 transform -rotate-45"
    viewBox="0 0 20 20"
    version="1.1"
  >
    <g id="Page-1" stroke="none" strokeWidth="1" fillRule="evenodd">
      <g id="icon-shape">
        <path
          d="M3,-1.41345269e-14 L17,-1.41345269e-14 L17,1 L14,2 L14,10 L17,11 L17,12 L3,12 L3,11 L6,10 L6,2 L3,1 L3,-1.41345269e-14 L3,-1.41345269e-14 Z M9,12 L11,12 L11,19 L10,20 L9,19 L9,12 L9,12 Z"
          id="Combined-Shape"
        ></path>
      </g>
    </g>
  </svg>
);

export default Home;

type TopPageEntry = Pick<
  RenderedEntry,
  "createdAt" | "excerpt" | "title" | "slug" | "id" | "body" | "body_plain"
>;

type AsideContent = Pick<
  Collection<Pick<Entry, "id">>,
  "title" | "id" | "entries" | "description" | "eyecatch"
>;

type HomePageProps = {
  pinnedEntry: TopPageEntry | null;
  topEntries: TopPageEntry[];
  asideContents: AsideContent[];
};

export const getStaticProps: GetStaticProps<HomePageProps, any> = async (
  ctx
) => {
  const pinnedEntry = (
    await Result(
      Data(
        APIClient.current.listEntry({
          limit: 1,
          fields: ["title", "slug", "id", "createdAt", "excerpt", "body"],
          filters: `pinned[equals]true`,
        })
      ).then(
        produce(async (r: CollectionResponse<TopPageEntry>) => {
          await Promise.all(
            r.contents.map(async (e) => {
              e.body_plain = await formatToPlain(e.body);
            })
          );
        })
      )
    )
  ).result?.contents[0];

  const asideContents = await Data(
    APIClient.current.listCollection({
      limit: 5,
      fields: ["id", "slug", "title", "description", "eyecatch"],
      entryFields: ["id"],
    })
  );

  const topEntries = await Data(
    APIClient.current.listEntry({
      limit: 50,
      offset: 0,
      orders: "-publishedAt",
      fields: ["title", "slug", "id", "createdAt", "excerpt", "body"],
    })
  ).then(
    produce(async (r: CollectionResponse<TopPageEntry>) => {
      await Promise.all(
        r.contents.map(async (e) => {
          e.body_plain = await formatToPlain(e.body);
        })
      );
    })
  );

  return {
    props: {
      pinnedEntry: pinnedEntry ?? null,
      topEntries: topEntries.contents,
      asideContents: asideContents.contents,
    },
    revalidate: 60,
  };
};
