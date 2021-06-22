import parseHTML from "rehype-parse";
import stringify from "rehype-stringify";
import toAMP from "server/rehype-to-amp";
import plain from "server/rehype-to-plain";
import unified from "unified";

export const formatToPlain = (bodyHTML: string) =>
  unified()
    .use(parseHTML, { fragment: true })
    .use(plain as any)
    .processSync(bodyHTML)
    .toString();

export const formatToAMP = (bodyHTML: string) =>
  unified()
    .use(parseHTML, { fragment: true })
    .use(toAMP, {
      imageHandler: (elem) => {
        let width = 0;
        let height = 0;
        const src = elem.properties.src;
        if (src) {
          const url = new URL(src);
          width = Number(url.searchParams.get("w"));
          height = Number(url.searchParams.get("h"));
        }
        return { width, height, layout: "intrinsic" };
      },
    })
    .use(stringify)
    .processSync(bodyHTML)
    .toString();
