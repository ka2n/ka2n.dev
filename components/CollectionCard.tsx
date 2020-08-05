import { Entry, Collection } from "APIClient";
import NextLink from "next/link";
export const CollectionCard = ({
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
          <h3 className="text-palt tracking-wider text-base text-gray-900 font-semibold">
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
