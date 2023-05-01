import { ImageRef } from "APIClient";
import Image from "next/legacy/image";
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
        layout="fill"
        loading="eager"
        objectFit="cover"
        unoptimized
        alt={alt ?? ""}
        src={image.url}
      />
    </div>
  );
}
