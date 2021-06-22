import { ImageRef } from "APIClient";
import Image from "next/image";
export function PageLevelEyeCatch({ image }: { image: ImageRef }) {
  return (
    <div className="h-64 relative overflow-hidden">
      <Image
        layout="fill"
        loading="eager"
        objectFit="cover"
        unoptimized
        src={image.url}
      />
    </div>
  );
}
