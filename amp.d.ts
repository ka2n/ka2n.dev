declare namespace JSX {
  interface AmpScript {
    children?: Element;
    layout?: any;
    width?: any;
    height?: any;
    script?: any;
    src?: any;
  }

  interface IntrinsicElements {
    "amp-script": AmpScript;
    "amp-social-share": any;
  }
}
