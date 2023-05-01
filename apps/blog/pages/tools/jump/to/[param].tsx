import clsx from "clsx";
import { Footer } from "components/Footer";
import { useCopyButton } from "components/hooks/useCopyButton";
import { decodeInput } from "lib/jump/InputURL";
import { siteConfig } from "lib/site-config";
import { GetStaticPaths, GetStaticProps } from "next";
import { NextSeo } from "next-seo";
import NextLink from "next/link";
import React, { forwardRef, useCallback } from "react";
import rison from "rison";
import { QueryEdit, QueryNew } from "../index";

type PathParams = {
  param: string;
};

type JumpToPageProps = ValidJumpToPageProps | InvalidJumpPageProps;

type ValidJumpToPageProps = {
  valid: true;
  title: string | null;
  links: LinkData[];
  edit_link: string;
  new_link: string;
};

type InvalidJumpPageProps = {
  valid: false;
  human_message: string;
  machine_message: string;
};

type LinkData = {
  title: string | null;
  url: string;
};

export const JumpToPage = (props: JumpToPageProps) => {
  if (!props.valid) {
    return <InvalidJumpToPage {...props} />;
  }
  return <ValidJumpToPage {...props} />;
};

export default JumpToPage;

export const getStaticPaths: GetStaticPaths<PathParams> = async (ctx) => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<
  JumpToPageProps,
  PathParams
> = async (ctx) => {
  let param = ctx.params?.param!;
  if (!param || param === "serviceworker.js") {
    return {
      notFound: true,
    };
  }

  let parsed: ReturnType<typeof decodeInput>;
  try {
    parsed = decodeInput(param);
  } catch (e) {
    console.log(param);
    return {
      props: {
        valid: false,
        human_message: "URLが間違っているようです。",
        machine_message: e instanceof Error ? e.message : `${e}`,
      },
    };
  }

  const [pageTitle, contents] = parsed;
  const links: ValidJumpToPageProps["links"] = contents.map(([url, title]) => ({
    title: title ?? null,
    url,
  }));

  return {
    props: {
      valid: true,
      title: pageTitle,
      links,
      new_link: `/tools/jump?q=${rison.encode_object({
        o: "n",
      } as QueryNew)}`,
      edit_link: `/tools/jump?q=${rison.encode_object({
        o: "e",
        v: {
          title: parsed[0],
          contents: parsed[1],
        },
      } as QueryEdit)}`,
    },
  };
};

const InvalidJumpToPage = (props: InvalidJumpPageProps) => {
  return (
    <Layout>
      <NextSeo
        title="Jump"
        description="簡単なジャンプページを作成します"
        canonical={`${siteConfig.base_url}/tools/jump`}
        noindex
      />
      <div className="bg-white p-4 space-y-2 rounded-md">
        <p>URLが間違っているようです。</p>
        <p>{JSON.stringify(props.machine_message)}</p>
        <p className="text-sm">
          <NextLink href={"/tools/jump"} className="text-blue-500 hover:underline">
            こちら
          </NextLink>
          から作り直すことができます。
        </p>
      </div>
    </Layout>
  );
};

const ValidJumpToPage = (props: ValidJumpToPageProps) => {
  const { copied, onClick: onClickCopyButton } = useCopyButton(
    useCallback(() => location.href, [])
  );
  const title =
    props.title ||
    `${props.links.length} link${props.links.length > 1 ? "s" : ""}`;

  // const onClickOpenAll = useCallback(() => {
  //   props.links.forEach((link) => {
  //     window.open(link.url, "_blank", "noopener,noreferrer");
  //   });
  // }, [props.links]);

  return (
    <Layout>
      <NextSeo title={title} titleTemplate="%s | jump" description="" noindex />
      <div className="max-w-xl w-full space-y-2 flex flex-col">
        <div className="rounded-md pt-2 pb-6 px-4 bg-white space-y-4">
          <div className="flex justify-between">
            <h1 className="font-bold text-2xl">{title}</h1>
            <div>
              {/* <button
                onClick={onClickOpenAll}
                className="text-sm border border-current rounded px-2 bg-blue-500 text-white py-1"
              >
                すべて開く
              </button> */}
            </div>
          </div>
          <ul className="ml-10 list-outside list-decimal">
            {props.links.map((l, idx) => {
              const title = l.title ?? l.url;
              return (
                <li key={idx} tabIndex={idx + 1}>
                  <div className=" flex content-center">
                    <a
                      className="py-1 text-blue-500 hover:underline"
                      href={l.url}
                      rel="nofollow external noopener noreferrer"
                    >
                      {title}
                    </a>

                    <div className="flex content-center space-x-4 ml-auto">
                      <a
                        className=" border border-current text-blue-500 rounded px-2 text-sm my-auto hover:bg-blue-500 hover:text-white"
                        aria-label={`"${title}"を新規タブで開く`}
                        href={l.url}
                        rel="nofollow external noopener noreferrer"
                        target="_blank"
                        title={`"${title}"を新規タブで開く`}
                      >
                        新規タブ
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <ul className="w-full px-2 pb-20 text-gray-500 hover:text-gray-50 focus-within:text-gray-50 transition-colors duration-500 text-sm flex space-x-2">
          <li className="ml-auto">
            <NextLink href={props.edit_link} passHref legacyBehavior>
              <Link variant="dark">再編集</Link>
            </NextLink>
          </li>
          <li role="presentation">|</li>
          <li>
            <ButtonLink
              disabled={copied}
              onClick={onClickCopyButton}
              variant="dark"
            >
              {!copied && "URLをコピー"}
              {copied && "コピーしました"}
            </ButtonLink>
          </li>
          <li role="presentation">|</li>
          <li>
            <NextLink href={props.new_link} passHref legacyBehavior>
              <Link variant="dark">新しいリンク集を作る</Link>
            </NextLink>
          </li>
        </ul>
      </div>
    </Layout>
  );
};

const Layout: React.FC<{}> = (props) => (
  <div className="min-h-screen flex flex-col bg-black">
    <div className="flex-grow flex justify-center items-center">
      {props.children}
    </div>
    <Footer
      variant="dark"
      service={{ name: "Jump", path: "/tools/jump" }}
      site={siteConfig}
    />
  </div>
);

const ButtonLink = ({
  variant = "normal",
  ...props
}: JSX.IntrinsicElements["button"] & {
  variant?: "normal" | "dark";
}) => (
  <button
    {...props}
    className={clsx(
      "hover:underline",
      {
        normal: "text-blue-500",
        dark: "text-grey-500",
      }[variant],
      props.className
    )}
  />
);

const Link = forwardRef<
  HTMLAnchorElement,
  JSX.IntrinsicElements["a"] & {
    variant?: "normal" | "dark";
  }
>(({ variant = "normal", ...props }, ref) => (
  <a
    {...props}
    className={clsx(
      "hover:underline",
      {
        normal: "text-blue-500",
        dark: "text-grey-500",
      }[variant],
      props.className
    )}
    ref={ref}
  />
));
if (process.env.NODE_ENV === "development") {
  Link.displayName = "Link";
}
