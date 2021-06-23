/// <reference types="next" />
/// <reference types="next/types/global" />
/// <reference types="next/image-types/global" />

declare module "konva-node" {
  export * from "konva";
  import Konva from "konva";
  import canvas from "canvas";
  export = Konva;
}
