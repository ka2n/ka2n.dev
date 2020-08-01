// @ts-ignore
import bundleCSS from "!raw-loader!css/bundle.css";
import Document, {
  Head,
  Html,
  Main,
  NextScript,
  DocumentContext,
} from "next/document";

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const page = ctx.renderPage((App) => (props) => <App {...props} />);
    const initialProps = await Document.getInitialProps(ctx);
    return {
      ...page,
      styles: [
        ...initialProps.styles,
        <style
          key="custom"
          dangerouslySetInnerHTML={{
            __html: bundleCSS,
          }}
        />,
      ].filter((v) => !!v),
    };
  }

  render() {
    return (
      <Html>
        <Head></Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
