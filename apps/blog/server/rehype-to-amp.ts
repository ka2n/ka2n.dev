import { Plugin, Processor } from "unified";
import { Node, Parent } from "unist";

export type AMPSetting = {
  imageHandler: (
    node: ElementNode & { tagName: "img" }
  ) => {
    width: number;
    height: number;
  };
};

const format: Plugin<[AMPSetting]> = function format(
  this: Processor<{}>,
  settings
) {
  const conv = convert.bind(undefined, settings);
  return function (node, vfile, done) {
    try {
      visit(conv, node, null, 0);
      done?.(null, node, vfile);
    } catch (err) {
      done?.(err, node, vfile);
    }
  };
};
export default format;

function convert(
  settings: AMPSetting,
  node: TNode,
  parent: TNode | null,
  index: number
) {
  if (node.type === "element") {
    const element: ElementNode = node as any;
    if (element.tagName === "img") {
      element.tagName = "amp-img";
      const props = settings.imageHandler(element as any);
      element.properties = { ...element.properties, ...props };
      return true;
    }
  }
  return false;
}

type ElementNode = Parent & {
  type: "element";
  tagName: string;
  properties: Record<string, any>;
};

type TNode = Parent | Node;

function visit(
  visitor: (node: TNode, parentNode: TNode | null, index: number) => boolean,
  node: TNode,
  parentNode: TNode | null,
  index: number
) {
  if (visitor(node, parentNode, index)) {
    return;
  }

  if (!node.children) {
    return;
  }

  for (let i = 0; i < (node.children as TNode[]).length; i++) {
    visit(visitor, (node.children as TNode[])[i], node, i);
  }
}
