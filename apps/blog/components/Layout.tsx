import { SiteConfig } from "APIClient";
import clsx from "clsx";
import NextLink from "next/link";
import React from "react";
import { Footer } from "./Footer";
import Image from "next/image";

export const Layout: React.FC<{
  site: SiteConfig;
  preview?: boolean;
  _header?: Partial<JSX.IntrinsicElements["div"]>;
  _main?: Partial<JSX.IntrinsicElements["div"]>;
  _container?: Partial<JSX.IntrinsicElements["div"]>;
}> = ({ site, ...props }) => {
  return (
    <div
      {...props._container}
      className={clsx(
        "min-h-screen",
        "flex flex-col",
        props._container?.className
      )}
    >
      {props.preview && (
        <div className="bg-pink-700 text-white px-4">
          <div className="max-w-screen-md mx-auto text-base">
            現在プレビューモードを表示しています
            <NextLink href="/api/exit-preview" passHref className="ml-4 text-sm">
              [終了する]
            </NextLink>
          </div>
        </div>
      )}
      <header
        {...props._header}
        className={clsx(
          "w-full border-b p-4 bg-white",
          props._header?.className
        )}
      >
        <div className="max-w-screen-md w-full mx-auto">
          <NextLink href="/">

            {site.logo && site.logo_size ? (
              <Image
                src={site.logo?.url}
                className="object-contain object-left"
                width={site.logo_size.split(":")[0]}
                height={site.logo_size.split(":")[1]}
                alt={site.title}
                unoptimized
                loading="eager"
                style={{
                  maxWidth: "100%",
                  height: "auto"
                }} />
            ) : (
              site.title
            )}

          </NextLink>
        </div>
      </header>
      <main
        {...props._main}
        className={clsx("flex-grow", props._main?.className)}
      >
        {props.children}
      </main>
      <Footer site={site} />
    </div>
  );
};
