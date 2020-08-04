import { SiteConfig } from "APIClient";
import clsx from "clsx";
import { useAmp } from "next/amp";

export const AuthorIcon = ({
  site,
  size,
}: {
  site: Pick<SiteConfig, "author_icon" | "author_name">;
  size?: "sm" | "md";
}) => {
  const amp = useAmp();
  return site.author_icon ? (
    amp ? (
      <amp-img
        className={"rounded-full flex items-center justify-center"}
        src={site.author_icon.url}
        alt={site.author_name}
        {...{ sm: { width: 40, height: 40 }, md: { width: 64, height: 64 } }[
          size ?? "md"
        ]}
      />
    ) : (
      <img
        className={clsx(
          "rounded-full flex items-center justify-center",
          { sm: "w-10 h-10", md: "w-16 h-16" }[size ?? "md"]
        )}
        src={site.author_icon.url}
        alt={site.author_name}
      />
    )
  ) : (
    <div className="rounded-full flex items-center justify-center bg-gray-300 text-gray-900 w-16 h-16">
      M
    </div>
  );
};
