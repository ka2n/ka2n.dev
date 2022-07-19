import { APIClient } from "APIClient";
import { ServerResponse } from "http";
import { GetServerSideProps } from "next";
import { Builder } from "xml2js";
import formatDate from "rfc822-date";
import { siteConfig } from "lib/site-config";
import { formatToRSS } from "Formatter";

const EmptyPage = () => null;
export default EmptyPage;

export const getServerSideProps: GetServerSideProps<{}> = async ({ res }) => {
  const entries = await APIClient.current.listEntry({
    fields: [
      "id",
      "title",
      "body",
      "excerpt",
      "publishedAt",
      "revisedAt",
      "createdAt",
      "slug",
      "eyecatch",
    ],
    limit: 50,
    orders: "-updatedAt",
  });
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
  renderRSSFeed(
    res,
    {
      title: siteConfig.title,
      copyright: siteConfig.author_name,
      base_url: siteConfig.base_url,
      self_url: `${siteConfig.base_url}/feed.xml`,
    },
    await Promise.all(
      entries.data.contents.map(async (entry) => {
        const canonical = `${siteConfig.base_url}/${entry.slug ?? entry.id}`;
        const [content, description] = await Promise.all([
          makeContentSummary(entry.body),
          makeDescription(entry.excerpt ?? entry.body),
        ]);
        return {
          title: entry.title,
          content,
          description,
          guid: canonical,
          link: canonical,
          pubDate: Date.parse(entry.publishedAt ?? entry.createdAt),
          modDate: Date.parse(
            entry.revisedAt ?? entry.publishedAt ?? entry.createdAt
          ),
        };
      })
    )
  );

  return {
    props: {},
  };
};

type Site = {
  title: string;
  copyright: string;
  base_url: string;
  self_url: string;
  description?: string;
  channel?: Record<string, any>;
  $?: Record<string, any>;
  pubDate?: number;
};

type Entry = {
  title: string;
  thumbnail_url?: string;
  description?: string;
  content: string;
  pubDate: number;
  modDate: number;
  link?: string;
  guid: string;
  [key: string]: any;
};

const renderRSSFeed = (res: ServerResponse, site: Site, entries: Entry[]) => {
  const lastUpdated = Math.max(...entries.map((s) => s.modDate));
  const lastPublished = Math.max(...entries.map((s) => s.pubDate));
  res.setHeader("Content-Type", "application/xml");

  res.write(
    new Builder({ cdata: true }).buildObject({
      rss: {
        $: {
          "xmlns:atom": "http://www.w3.org/2005/Atom",
          "xmlns:content": "http://purl.org/rss/1.0/modules/content/",
          "xmlns:media": "http://search.yahoo.com/mrss/",
          version: "2.0",
          ...site.$,
        },
        channel: {
          ...site.channel,
          title: site.title,
          copyright: site.copyright,
          description: site.description,
          link: site.base_url,
          "atom:link": {
            $: {
              rel: "self",
              type: "application/rss+xml",
              href: site.self_url,
            },
          },
          language: "ja",
          pubDate: formatDate(new Date(lastPublished)),
          lastBuildDate: formatDate(new Date(lastUpdated)),
          item: entries.map(
            ({ thumbnail, content, pubDate, modDate, guid, link, title, description }) => {
              return tidy({
                guid,
                link,
                title,
                description,
                "content:encoded": content,
                pubDate: formatDate(new Date(pubDate)),
                modDate: modDate ? formatDate(new Date(modDate)) : undefined,
                "media:thumbnail": thumbnail
                  ? { $: { url: thumbnail } }
                  : undefined,
              });
            }
          ),
        },
      },
    })
  );
  res.end();
  return res;
};

/** remove undefined values from object */
const tidy = <T extends object>(obj: T): T => {
  let cloned = { ...obj };
  Object.keys(cloned).forEach((k) => {
    if (cloned[k] === undefined) {
      delete cloned[k];
    }
  });
  return cloned;
};

const makeContentSummary = (contentHTML: string) => {
  return formatToRSS(contentHTML);
};

const makeDescription = (contentHTML: string) => {
  return formatToRSS(contentHTML, { truncate: { maxChars: 50 } });
};
