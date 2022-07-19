import { Element, Node, Text, Comment } from "hast";
import fromParse5 from "hast-util-from-parse5";
import hljs from "highlight.js";
import parse5 from "parse5";
import parseHTML from "rehype-parse";
import splitP from "rehype-split-paragraph";
import html from "rehype-stringify";
import plain from "server/rehype-to-plain";
import { unified, Plugin, Transformer } from "unified";
import autolink from "rehype-autolink-headings";
import truncate, { Option as TruncateOption } from "rehype-truncate";
import { visit } from "unist-util-visit";

export const formatToPlain = async (bodyHTML: string) =>
  unified()
    .use(parseHTML, { fragment: true })
    .use(plain as any)
    .processSync(bodyHTML)
    .toString();

export const formatToHTML = async (bodyHTML: string) =>
  [processHTMLAST, unwrapImageRoughly].reduce(
    async (v, f) => v.then(f),
    Promise.resolve(bodyHTML)
  );

export const formatToRSS = async (
  bodyHTML: string,
  option?: { truncate?: TruncateOption }
) =>
  unified()
    .use(parseHTML, { fragment: true })
    .use(rehypePluginRSS, option)
    .use(html)
    .process(bodyHTML)
    .then((r) => r.toString());

const processHTMLAST = async (input: string): Promise<string> =>
  unified()
    .use(parseHTML, { fragment: true })
    .use(rehypePluginCode)
    .use(rehypePluginHighlight)
    // .use(rehypeShiki, {
    //   highlighter: await shiki.getHighlighter({ theme: "github-light" }),
    // })
    .use(splitP, {
      cleanParagraph: true,
    })
    .use(autolink, {
      behavior: "prepend",
      properties: {
        className: ["anchor"],
      },
    })
    .use(html, {
      quoteSmart: true,
      tightSelfClosing: true,
      closeSelfClosing: true,
    })
    .processSync(input)
    .toString();

const unwrapImageRoughly = async (input: string) =>
  input.replace(/<p>(<img[^>]*>)<\/p>/g, "$1");

/** コードブロックの1行目に以下の記法で言語を入力するとcodeタグにclassNameを追加します
 * - `<code>:::sh\nfoo bar</code>` -> `<code class="language-sh">foo bar</code>
 */
const rehypePluginCode: Plugin = function (options: any): Transformer {
  function visitor(node: Element) {
    if (node.tagName === "pre") {
      const codeElem = node.children.find(
        (child) => child.type === "element" && child.tagName === "code"
      ) as Element;
      if (!codeElem || !(codeElem.children?.[0]?.type === "text")) return;
      const textNode: Text = codeElem.children[0];
      const m = textNode.value.match(/^:::(.+)\n/);
      if (!m) return;
      const [match, lang] = m;
      textNode.value = textNode.value.slice(match.length);
      codeElem.properties ??= {};
      codeElem.properties.className ??= [];
      (codeElem.properties.className as string[]).push(`language-${lang}`);
    }
  }

  return function transformer(tree: Node): void {
    visit(tree, "element", visitor);
  };
};

const rehypePluginHighlight: Plugin = function (options: any): Transformer {
  function visitor(node: Element) {
    if (node.tagName === "pre") {
      const codeElem = node.children.find(
        (child) => child.type === "element" && child.tagName === "code"
      ) as Element;
      if (!codeElem || !(codeElem.children?.[0]?.type === "text")) return;

      const classNames = codeElem.properties?.className as string[] | undefined;
      if (!classNames) return;
      const lang = classNames.find((cn) => cn.match(/language-(.+)/));
      if (lang) {
        const value = hljs.highlightAuto(codeElem.children[0].value).value;
        if (value) {
          codeElem.children = [
            fromParse5(
              parse5.parseFragment(value, { sourceCodeLocationInfo: true })
            ) as any,
          ];
        }
      }
    }
  }

  return function transformer(tree: Node): void {
    visit(tree, "element", visitor);
  };
};

type RehypePluginRSSOption = { truncate?: TruncateOption };

const rehypePluginRSS: Plugin = function (
  options?: RehypePluginRSSOption
): Transformer {
  const truncateOption = options?.truncate ?? { maxChars: 140 };
  function visitor(node: Element) {
    removeAttributesForRSS(node);
  }
  return function transformer(tree: Node) {
    visit(tree, "element", visitor);
    return truncate.call(this, truncateOption)(tree);
  };
};

const removeAttributesForRSS = function (
  node: Node | Element | Comment | Text
) {
  if ("properties" in node && typeof node["properties"] === "object") {
    delete node.properties["style"];
    delete node.properties["id"];
    delete node.properties["name"];
    delete node.properties["rel"];
  }
};
