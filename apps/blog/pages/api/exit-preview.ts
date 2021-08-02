import { NextApiHandler } from "next";
import { withSentry } from '@sentry/nextjs'

const exitPreviewHandler: NextApiHandler = async (req, res) => {
  res.clearPreviewData();
  res.writeHead(307, { Location: `/` }).end("Preview mode exited");
};

export default withSentry(exitPreviewHandler);
