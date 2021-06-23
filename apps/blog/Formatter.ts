import parseHTML from "rehype-parse";
import plain from "server/rehype-to-plain";
import unified from "unified";
import html from "rehype-stringify";
import splitP from "rehype-split-paragraph";

export const formatToPlain = (bodyHTML: string) =>
  unified()
    .use(parseHTML, { fragment: true })
    .use(plain as any)
    .processSync(bodyHTML)
    .toString();

export const formatToHTML = (bodyHTML: string) =>
  [processHTMLAST, unwrapImageRoughly].reduce((v, f) => f(v), bodyHTML);

const processHTMLAST = (input: string): string =>
  unified()
    .use(parseHTML, { fragment: true })
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

const unwrapImageRoughly = (input: string): string =>
  input.replace(/<p>(<img[^>]*>)<\/p>/g, "$1");
