import {
  APIClient,
  Data,
  Entry,
  SiteConfig,
  Result,
  Collection,
  CollectionResponse,
} from "APIClient";
import { Layout } from "components/Layout";
import { GetStaticProps, NextPage, PageConfig } from "next";
import Head from "next/head";
import NextLink from "next/link";
import clsx from "clsx";
import { AuthorIcon } from "components/AuthorIcon";
import produce from "immer";
import { formatToPlain } from "Formatter";

export const config: PageConfig = {};

const Home: NextPage<HomePageProps> = (props) => {
  const { site, pinnedEntry } = props;
  return (
    <Layout
      site={site}
      _container={{ className: "bg-orange-100" }}
      _main={{ className: "mx-4" }}
    >
      <Head>
        <title key="title">{site.title}</title>
      </Head>
      <div className="-mx-4 bg-white">
        {site.eyecatch && (
          <div
            className="h-64 bg-cover bg-center overflow-hidden"
            style={{
              backgroundImage: `url(${site.eyecatch.url})`,
            }}
          ></div>
        )}
        <div className="mx-4">
          <div className="py-6 max-w-screen-md mx-auto">
            <div className="flex items-center">
              <div className="mr-6">
                <AuthorIcon site={site} />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">{site.author_name}</h1>
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
          <ul className="ul space-y-4">
            {pinnedEntry && (
              <li>
                <div className="-mt-6 mb-1">
                  <span className="text-xs text-gray-700">
                    <PinIcon />
                    固定された記事
                  </span>
                </div>
                <EntrySummary entry={pinnedEntry} />
              </li>
            )}
            {props.topEntries.map((entry, idx) => {
              if (idx < 10 && pinnedEntry?.id === entry.id) return null; // 画面の上の方にpinnedがダブらないようにする
              return (
                <li key={entry.id}>
                  <EntrySummary entry={entry} />
                </li>
              );
            })}
          </ul>
        </div>
        <aside className="ml-4 hidden md:w-side md:block">
          <ul>
            {props.asideContents.map((entry) => {
              return (
                <li key={entry.id}>
                  <CollectionSummary collection={entry} />
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

const EntrySummary = ({
  entry,
}: {
  entry: Pick<Entry, "id" | "slug" | "title" | "excerpt" | "body" | "eyecatch">;
}) => {
  const link = {
    href: `/[slug]`,
    as: `/${entry.slug ?? entry.id}`,
  };
  return (
    <div className="rounded overflow-hidden border bg-white">
      {entry.eyecatch?.url && (
        <div
          className="h-64 w-full bg-cover bg-center rounded-t overflow-hidden"
          style={{
            backgroundImage: `url(${entry.eyecatch?.url})`,
          }}
        ></div>
      )}
      <div className="px-4 py-2">
        <NextLink {...link}>
          <a>
            <h3 className="text-xl text-gray-900 font-bold mb-2 mt-2">
              {entry.title}
            </h3>
          </a>
        </NextLink>
        <p className="text-gray-700 text-base">
          {entry.excerpt ?? entry.body?.slice(0, 140)}
        </p>
        <p className="text-sm my-6">
          <NextLink {...link}>
            <a className="text-blue-500 hover:text-blue-700">続きを読む</a>
          </NextLink>
        </p>
      </div>
    </div>
  );
};

const CollectionSummary = ({
  collection,
}: {
  collection: Pick<
    Collection<Pick<Entry, "id">>,
    "id" | "title" | "description" | "entries" | "eyecatch"
  >;
}) => (
  <div className="rounded overflow-hidden border-4 border-double bg-white">
    {collection.eyecatch && (
      <div
        className="h-24 w-full bg-cover bg-center rounded-t overflow-hidden"
        style={{
          backgroundImage: `url(${collection.eyecatch.url})`,
        }}
      ></div>
    )}
    <NextLink href={`/c/[slug]`} as={`/c/${collection.id}`}>
      <a>
        <div className="px-4 py-2 space-y-2">
          <h3 className="text-base text-gray-900 font-semibold">
            {collection.title}
          </h3>
          <p className="text-gray-700 text-xs line-clamp-3">
            {collection.description}
          </p>
        </div>
      </a>
    </NextLink>
  </div>
);

export default Home;

type TopPageEntry = Pick<
  Entry,
  "createdAt" | "excerpt" | "title" | "slug" | "id" | "body"
>;

type AsideContent = Pick<
  Collection<Pick<Entry, "id">>,
  "title" | "id" | "entries" | "description" | "eyecatch"
>;

type HomePageProps = {
  pinnedEntry: TopPageEntry | null;
  topEntries: TopPageEntry[];
  asideContents: AsideContent[];
  site: SiteConfig;
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
          filters: `pinned[exists]`,
        })
      ).then(
        produce((r: CollectionResponse<Pick<Entry, "body">>) => {
          r.contents.forEach((e) => {
            e.body = formatToPlain(e.body);
          });
        })
      )
    )
  ).result?.contents[0];

  const asideContents = await Data(
    APIClient.current.listCollection({
      limit: 5,
      fields: ["id", "title", "description", "eyecatch"],
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
    produce((r: CollectionResponse<Pick<Entry, "body">>) => {
      r.contents.forEach((e) => {
        e.body = formatToPlain(e.body);
      });
    })
  );

  return {
    props: {
      pinnedEntry: pinnedEntry ?? null,
      topEntries: topEntries.contents,
      site: await Data(APIClient.current.author()),
      asideContents: asideContents.contents,
    },
    revalidate: 60 * 5,
  };
};
