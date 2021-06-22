import { AuthorIcon } from "components/AuthorIcon";
import React from "react";
import { SiteConfig } from "../APIClient";
import clsx from "clsx";
export const FooterAuthorDesc = ({
  site,
  className,
}: {
  site: SiteConfig;
  className?: string;
}) => (
  <section className={clsx("px-2 py-2", className)}>
    <div className="flex items-center">
      <div className="mr-6">
        <AuthorIcon site={site} />
      </div>
      <div>
        <h2 className="text-base text-gray-900 font-bold">
          {site?.author_name}
        </h2>
        <p className="text-sm text-gray-800">{site.author_description}</p>
      </div>
    </div>
  </section>
);
