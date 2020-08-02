import { NextPage, GetServerSideProps } from "next";
import { APIClient } from "APIClient";

const createSitemap = (
  pages: {
    loc: string;
    lastmod?: Date;
    changefreq?: "always" | "hourly" | "daily" | "monthly" | "yearly" | "never";
    priority?: number;
  }[]
) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${pages
      .map((page) => {
        const kv = {
          ...page,
          lastmod: page.lastmod?.toISOString(),
        };

        return `<url>${Object.entries(kv)
          .filter((kv) => !!kv[1])
          .map(([k, v]) => `<${k}>${v}</${k}>`)
          .join("\n")}
        </url>`;
      })
      .join("\n")}
    </urlset>
`;
};

export const getServerSideProps: GetServerSideProps = async ({ res, req }) => {
  const hostname = req.headers.host ?? "localhost:3000";
  res.setHeader("Content-Type", "application/xml");

  const latestEntries = await APIClient.current.listEntry({
    limit: 50,
    orders: "-updatedAt",
    fields: ["id", "slug", "updatedAt"],
  });
  const indexModDate = latestEntries.data.contents[0]?.updatedAt ?? undefined;

  res.write(
    createSitemap([
      {
        loc: `https://${hostname}/`,
        lastmod: indexModDate ? new Date(indexModDate) : undefined,
      },
      ...latestEntries.data.contents.map((entry) => ({
        loc: `https://${hostname}/${
          entry.slug ? encodeURIComponent(entry.slug) : entry.id
        }`,
        lastmod: new Date(entry.updatedAt),
      })),
    ])
  );
  res.end();
  return { props: {} };
};

const sitemap = () => null;
export default sitemap;
