declare module "konva-node" {
  export * from "konva";
  import Konva from "konva";
  import canvas from "canvas";
  export = Konva;
}

declare module "rfc822-date" {
  export default function format(date: Date): string;
}
