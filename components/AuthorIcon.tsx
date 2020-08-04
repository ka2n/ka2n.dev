import { SiteConfig } from "APIClient";
import clsx from "clsx";

export const AuthorIcon = ({
  site,
  size,
}: {
  site: Pick<SiteConfig, "author_icon" | "author_name">;
  size?: "sm" | "md";
}) => {
  return site.author_icon ? (
    <img
      className={clsx(
        "rounded-full flex items-center justify-center",
        { sm: "w-10 h-10", md: "w-16 h-16" }[size ?? "md"]
      )}
      src={site.author_icon.url}
      alt={site.author_name}
    />
  ) : (
    <div className="rounded-full flex items-center justify-center bg-gray-300 text-gray-900 w-16 h-16">
      M
    </div>
  );
};
