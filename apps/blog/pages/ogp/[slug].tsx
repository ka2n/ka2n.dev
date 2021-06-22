import { APIClient, Result } from "APIClient";
import { siteConfig } from "lib/site-config";
import { GetServerSideProps } from "next";
import { OGPImage } from "server/ogp";

const ogp = () => null;

export default ogp;

type EntryQuery = {
  slug: string;
};

export const getServerSideProps: GetServerSideProps<any, EntryQuery> = async (
  ctx
) => {
  const res = ctx.res;
  // slugで取得してなければ探す
  if (!ctx.params?.slug) {
    res.writeHead(400).end();
    return {
      props: {},
    };
  }
  const previewData = ctx?.previewData as any;
  const draftKey = previewData?.draftKey;
  const entryResult = await Result(
    APIClient.current.findEntry(ctx.params.slug, {
      draftKey,
    })
  );
  const site = siteConfig;
  const entry = entryResult?.result?.data;
  if (!site || !entry) {
    res.writeHead(400).end();
    return {
      props: {},
    };
  }

  const imageURL = await new Promise<string>((done) =>
    OGPImage({
      siteTitle: site.title,
      authorName: site.author_name,
      title: entry.title,
    }).toDataURL({
      mimeType: "image/png",
      callback: done,
    })
  );
  const decoder = require("image-data-uri");
  const decoded = decoder.decode(imageURL);

  res.setHeader("Content-Type", decoded.imageType);
  res.setHeader(
    "Cache-Control",
    "public, max-age=0, stale-while-revalidate=300"
  );
  res.write(decoded.dataBuffer);
  res.end();

  return {
    props: {},
  };
};
