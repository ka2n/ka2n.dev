import { SiteConfig } from "APIClient";
import NextLink from "next/link";
import React from "react";

export const Footer = ({ site }: { site: SiteConfig }) => {
  return (
    <footer className="border border-l-0 border-r-0 border-b-0 border-gray-300 bg-white mt-12 p-12 text-center text-sm text-gray-700 space-y-1">
      <div>
        <a href={site.base_url}>{site.base_url}</a>
      </div>
      <div className="text-xs">
        <NextLink href="/contact">ご感想・お問い合わせ</NextLink>
      </div>
    </footer>
  );
};
