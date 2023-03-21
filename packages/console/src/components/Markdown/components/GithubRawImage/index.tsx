import type { HTMLProps } from 'react';
import { useRef, useState } from 'react';

const githubRawUrlPrefix = 'https://raw.githubusercontent.com/logto-io/logto/master';

function GithubRawImage({ src, alt }: HTMLProps<HTMLImageElement>) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [width, setWidth] = useState(0);

  const onLoad = () => {
    if (imgRef.current) {
      const { naturalWidth, parentElement } = imgRef.current;
      const parentClientWidth = parentElement?.clientWidth ?? 0;
      const preferredWidth = Math.min(parentClientWidth, naturalWidth / 2);

      setWidth(preferredWidth);
    }
  };

  if (!src) {
    return null;
  }

  return (
    <img
      ref={imgRef}
      src={`${githubRawUrlPrefix}${src}`}
      alt={alt}
      width={`${width}px`}
      onLoad={onLoad}
    />
  );
}

export default GithubRawImage;
