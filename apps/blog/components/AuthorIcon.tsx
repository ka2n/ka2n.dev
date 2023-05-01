import { SiteConfig } from "APIClient";
import clsx from "clsx";
import Image, { ImageProps } from "next/legacy/image";

export const AuthorIcon = ({
  site,
  size,
  ...props
}: {
  site: Pick<SiteConfig, "author_icon" | "author_name">;
  size?: "sm" | "md";
} & Pick<ImageProps, "loading">) => {
  return site.author_icon ? (
    <div
      className={clsx(
        "rounded-full flex items-center justify-center",
        { sm: "w-10 h-10", md: "w-16 h-16" }[size ?? "md"]
      )}
    >
      <Image
        unoptimized
        className="rounded-full"
        width={site.author_icon.width}
        height={site.author_icon.height}
        src={site.author_icon.url}
        alt={site.author_name}
        {...props}
      />
    </div>
  ) : (
    <div className="rounded-full flex items-center justify-center bg-gray-300 text-gray-900 w-16 h-16">
      M
    </div>
  );
};
