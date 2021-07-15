import { APIClient, Data } from "APIClient";
import { GetServerSideProps } from "next";

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

  let modDates: (string | undefined)[] = [];

  const latestEntries = await Data(
    APIClient.current.listEntry({
      limit: 50,
      orders: "-updatedAt",
      fields: ["id", "slug", "updatedAt"],
    })
  );
  modDates.push(latestEntries.contents[0]?.updatedAt);

  const latestCollections = await Data(
    APIClient.current.listCollection({
      limit: 50,
      orders: "-updatedAt",
      fields: ["id", "slug", "updatedAt"],
    })
  );
  modDates.push(latestCollections.contents[0]?.updatedAt);

  const dates = modDates.filter((v) => v).map((v) => +new Date(v!));
  const indexModDate = new Date(Math.max(...dates));

  res.write(
    createSitemap([
      {
        loc: `https://${hostname}/`,
        lastmod: indexModDate ? new Date(indexModDate) : undefined,
      },
      { loc: `https://${hostname}/tools/shuffle` },
      { loc: `https://${hostname}/tools/jump` },
      ...latestEntries.contents.map((entry) => ({
        loc: `https://${hostname}/${encodeURIComponent(
          entry.slug ?? entry.id
        )}`,
        lastmod: new Date(entry.updatedAt),
      })),
      ...latestCollections.contents.map((entry) => ({
        loc: `https://${hostname}/${encodeURIComponent(
          entry.slug ?? entry.id
        )}`,
        lastmod: new Date(entry.updatedAt),
      })),
    ])
  );
  res.end();
  return { props: {} };
};

const sitemap = () => null;
export default sitemap;
