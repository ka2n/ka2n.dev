import { NextApiHandler } from "next";

const exitPreviewHandler: NextApiHandler = async (req, res) => {
  res.clearPreviewData();
  res.writeHead(307, { Location: `/` }).end("Preview mode exited");
};

export default exitPreviewHandler;
