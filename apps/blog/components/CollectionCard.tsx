import { Entry, Collection } from "APIClient";
import NextLink from "next/link";
import Image from "next/image";

export const CollectionCard = ({
  collection,
}: {
  collection: Pick<
    Collection<Pick<Entry, "id">>,
    "id" | "title" | "description" | "entries" | "eyecatch" | "slug"
  >;
}) => (
  <div className="rounded overflow-hidden border-4 border-double bg-white link-overlay">
    {collection.eyecatch && (
      <div className="relative h-24 w-full overflow-hidden">
        <Image
          src={collection.eyecatch.url}
          layout="fill"
          objectFit="cover"
          unoptimized
          alt=""
        />
      </div>
    )}
    <NextLink
      href={`/c/[slug]`}
      as={`/c/${encodeURIComponent(collection.slug ?? collection.id)}`}
    >
      <a className="link-overlay-link">
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
