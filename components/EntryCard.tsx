import { Entry, RenderedEntry } from "APIClient";
import NextLink from "next/link";
export const EntryCard = ({
  entry,
}: {
  entry: Pick<
    RenderedEntry,
    "id" | "slug" | "title" | "excerpt" | "body" | "eyecatch" | "body_plain"
  >;
}) => {
  const link = {
    href: `/[slug]`,
    as: `/${encodeURIComponent(entry.slug ?? entry.id)}`,
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
            <h3 className="text-palt tracking-wider text-xl text-gray-900 font-bold mb-2 mt-2">
              {entry.title}
            </h3>
          </a>
        </NextLink>
        <p className="text-gray-700 text-base">
          {trimText(entry.excerpt ?? entry.body_plain ?? entry.body)}
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

const trimText = (text: string | undefined, max: number = 140) => {
  if (!text) return "";
  if (text.length > 140) {
    return text.slice(0, 140) + `...`;
  }
  return text;
};
