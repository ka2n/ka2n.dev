import parseHTML from "rehype-parse";
import plain from "server/rehype-to-plain";
import unified from "unified";
import html from "rehype-stringify";
import splitP from "rehype-split-paragraph";
import rehypeShiki from "@leafac/rehype-shiki";
import * as shiki from "shiki";
import { Plugin, Transformer } from "unified";
import { Node, Root, Text } from "hast";
// import { visit } from "unist-util-visit";
import { Element } from "hast";
const visit = require("unist-util-visit");

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

const processHTMLAST = async (input: string): Promise<string> =>
  unified()
    .use(parseHTML, { fragment: true })
    .use(rehypePluginCode)
    .use(rehypeShiki, {
      highlighter: await shiki.getHighlighter({ theme: "light-plus" }),
    })
    .use(html, {
      quoteSmart: true,
      tightSelfClosing: true,
      closeSelfClosing: true,
    })
    .use(splitP, {
      cleanParagraph: true,
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
        (child) => child.tagName === "code"
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
