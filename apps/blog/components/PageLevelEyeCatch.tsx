import { ImageRef } from "APIClient";
import Image from "next/image";
export function PageLevelEyeCatch({
  image,
  alt,
}: {
  image: ImageRef;
  alt?: string;
}) {
  return (
    <div className="h-64 relative overflow-hidden">
      <Image
        loading="eager"
        unoptimized
        alt={alt ?? ""}
        src={image.url}
        fill
        sizes="100vw"
        style={{
          objectFit: "cover"
        }} />
    </div>
  );
}
