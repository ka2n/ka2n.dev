import { ImageRef } from "APIClient";
export function PageLevelEyeCatch({ image }: { image: ImageRef }) {
  return (
    <div
      className="h-64 bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: `url(${image.url})`,
      }}
    ></div>
  );
}
