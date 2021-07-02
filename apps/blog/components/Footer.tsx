import { SiteConfig } from "APIClient";
import clsx from "clsx";
import NextLink from "next/link";
import React from "react";

export const Footer = ({
  site,
  service,
  variant = "light",
  className,
}: {
  service?: { name: string; path: string };
  site: SiteConfig;
  variant?: "dark" | "light";
  className?: string;
}) => {
  return (
    <footer
      className={clsx(
        "border border-l-0 border-r-0 border-b-0 mt-12 p-12 text-center text-sm space-y-1",
        {
          dark: "border-gray-700 text-gray-700 hover:text-gray-50 focus-within:text-gray-50 transition-colors duration-500",
          light: "border-gray-300 text-gray-700",
        }[variant],
        className
      )}
    >
      <div>
        {service ? (
          <a href={service.path}>
            {service.name} powerd by {site.base_url}
          </a>
        ) : (
          <a href={site.base_url}>{site.base_url}</a>
        )}
      </div>
      <div className="text-xs">
        <NextLink href="/contact">ご感想・お問い合わせ</NextLink>
      </div>
    </footer>
  );
};
