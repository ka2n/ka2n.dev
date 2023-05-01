import { Element } from "domhandler/lib/node";
import parse, { attributesToProps } from "html-react-parser";
import {
  cancelIdleCallback,
  requestIdleCallback,
} from "next/dist/client/request-idle-callback";
import Image from "next/legacy/image";
import React, { useEffect, useMemo, useState } from "react";
import { CgLink } from "react-icons/cg";

/** 本文を表示するコンポーネント
 *
 * ## features
 * - html to react
 *  - Non nested <img /> tag to be rendered as  next/image
 * - lazy hydration from: https://github.com/hashicorp/next-mdx-remote/blob/main/src/index.tsx
 */
export const EntryBody = ({
  children,
  ...props
}: Omit<JSX.IntrinsicElements["div"], "children"> & { children: string }) => {
  const [isReadyToRender, setIsReadyToRender] = useState(
    typeof window === "undefined"
  );
  useEffect(() => {
    const handle = requestIdleCallback(() => {
      setIsReadyToRender(true);
    });
    return () => cancelIdleCallback(handle);
  }, []);

  const body = useMemo(() => {
    // ここではHTML -> JSXへの変換のみを行う
    return parse(children, {
      replace: (node) => {
        if (!isElement(node)) {
          return;
        }
        const parent = isElement(node.parent) ? node.parent : null;
        // unwrapped image => <next/image />
        // image in p tag => <img />
        if (node.tagName === "img") {
          if (parent?.tagName !== "p") {
            const props = attributesToProps(node.attribs);
            const src = props["src"];
            if (!src) return;
            const size = sizeFromImgixURL(src);
            if (!size) return;
            const { alt, option } = parseAlt(props["alt"]);

            if (!option || option.layout) {
              return (
                <div>
                  <Image
                    src={props.src as string}
                    alt={alt}
                    layout={option?.layout ?? "responsive"}
                    width={size.w}
                    height={size.h}
                    unoptimized
                  />
                </div>
              );
            }
          } else {
            let props: JSX.IntrinsicElements["img"] = attributesToProps(
              node.attribs
            );
            const src = props["src"];
            if (!src) return;
            const size = sizeFromImgixURL(src);
            const { alt } = parseAlt(props["alt"]);
            if (size) props = { ...props, width: size.w, height: size.h };

            // eslint-disable-next-line @next/next/no-img-element
            return <img {...props} alt={alt} loading="lazy" />;
          }
        }

        if (node.tagName === "a" && parent?.tagName.indexOf("h") === 0) {
          let props: JSX.IntrinsicElements["a"] = attributesToProps(
            node.attribs
          );
          return (
            <a {...props}>
              <CgLink className="icon icon-link" />
            </a>
          );
        }
      },
    });
  }, [children]);

  if (!isReadyToRender) {
    return (
      <div
        className="entry-body"
        dangerouslySetInnerHTML={{ __html: "" }}
        suppressHydrationWarning
      />
    );
  }

  return <div className="entry-body">{body}</div>;
};

type AltOption = {
  layout?: "fixed" | "responsive" | "intrinsic";
};

const parseAlt = (
  rawAlt?: string
): {
  alt: string;
  option?: AltOption;
} => {
  if (!rawAlt) return { alt: "" };
  const [alt, rawQuery] = rawAlt.split(";", 2);
  if (!rawQuery) return { alt };
  const query = new URLSearchParams(rawQuery);

  let option: AltOption = {};
  const layoutOption = query.get("layout") as AltOption["layout"] | undefined;
  switch (layoutOption) {
    case "fixed":
    case "responsive":
    case "intrinsic":
      option.layout = layoutOption;
      break;
  }

  return { alt, option };
};

const sizeFromImgixURL = (src: string) => {
  if (!src) return false;
  if (src && src.indexOf("images.microcms-assets.io") !== -1) {
    // サイズを取得
    const w = Number(src.match(/w=([\d.]+)/)?.[1]);
    const h = Number(src.match(/h=([\d.]+)/)?.[1]);
    if (isFinite(w) && isFinite(h) && w * h > 0) {
      return { w, h };
    }
  }
};

const isElement = (node: any): node is Element =>
  node instanceof Element && "attribs" in node;
