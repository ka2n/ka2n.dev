import parseHTML from "rehype-parse";
import plain from "server/rehype-to-plain";
import unified from "unified";

export const formatToPlain = (bodyHTML: string) =>
  unified()
    .use(parseHTML, { fragment: true })
    .use(plain as any)
    .processSync(bodyHTML)
    .toString();
