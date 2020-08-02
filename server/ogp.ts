import Konva from "konva-node";

export const OGPImage = (props: {
  siteTitle: string;
  title: string;
  authorName: string;
}) => {
  const size = { width: 1200, height: 630 };

  const mainSize = { width: 1024, height: size.height * (2 / 3) };
  const mainRect = {
    x: (size.width - mainSize.width) / 2,
    y: (size.height - mainSize.height) / 2,
    ...mainSize,
  };
  const headerSize = { width: 1024, height: size.height * (0.5 / 3) };
  const headerRect = {
    x: (size.width - headerSize.width) / 2,
    y: 0,
    ...headerSize,
  };
  const footerSize = { width: 1024, height: size.height * (0.5 / 3) };
  const footerRect = {
    x: (size.width - footerSize.width) / 2,
    y: size.height - footerSize.height,
    ...footerSize,
  };

  const stage = new Konva.Stage({ ...size } as any);

  const bgLayer = new Konva.Layer();
  bgLayer.add(new Konva.Rect({ ...size, fill: "#FFF" }));
  stage.add(bgLayer);

  const headerLayer = new Konva.Layer();
  headerLayer.add(new Konva.Rect({ ...headerRect }));
  const siteLabelText = new Konva.Text({
    text: props.siteTitle,
    align: "center",
    verticalAlign: "middle",
    padding: 5,
    fontSize: 40,
    fill: "#333",
  });
  const siteLabel = new Konva.Label({
    x: headerRect.x + (headerRect.width - siteLabelText.width()) / 2,
    y: headerRect.y + (headerRect.height - siteLabelText.height()) / 2,
  });
  siteLabel.add(new Konva.Tag({ fill: "yellow" }));
  siteLabel.add(siteLabelText);
  headerLayer.add(siteLabel);
  stage.add(headerLayer);

  const mainLayer = new Konva.Layer();
  mainLayer.add(new Konva.Rect({ ...mainRect }));
  mainLayer.add(
    new Konva.Text({
      ...mainRect,
      text: props.title,
      align: "center",
      verticalAlign: "middle",
      fontSize: 70,
      fill: "#333",
      lineHeight: 1.25,
    })
  );
  stage.add(mainLayer);

  const footerLayer = new Konva.Layer();
  footerLayer.add(new Konva.Rect({ ...footerRect }));
  footerLayer.add(
    new Konva.Text({
      ...footerRect,
      text: props.authorName,
      align: "right",
      fontSize: 40,
      fill: "#555",
    })
  );
  stage.add(footerLayer);

  return stage;
};
