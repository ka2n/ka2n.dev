import { NextApiHandler } from "next";
import { APIClient, Result } from "APIClient";
import { withSentry } from '@sentry/nextjs'

const previewHandler: NextApiHandler = async (req, res) => {
  if (!req.query.slug) {
    return res.status(404).end();
  }
  const content = await Result(
    APIClient.current.preview(
      req.query.slug as string,
      req.query.draftKey as string
    )
  );
  if (!content.result) {
    return res.status(401).json({ message: "Invalid slug" });
  }

  res.setPreviewData({
    slug: content.result.data.id,
    draftKey: req.query.draftKey,
  });
  res.writeHead(307, { Location: `/${content.result.data.id}` });
  res.end("Preview mode enabled");
};

export default withSentry(previewHandler);
