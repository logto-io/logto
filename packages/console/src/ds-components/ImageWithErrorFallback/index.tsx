import { Theme } from '@logto/schemas';
import type { ImgHTMLAttributes, ReactElement } from 'react';
import { cloneElement, useState } from 'react';

import FallbackImageDark from '@/assets/images/broken-image-dark.svg';
import FallbackImageLight from '@/assets/images/broken-image-light.svg';
import useTheme from '@/hooks/use-theme';

type Props = {
  readonly containerClassName?: string;
  readonly fallbackElement?: ReactElement;
} & ImgHTMLAttributes<HTMLImageElement>;

function ImageWithErrorFallback({
  src,
  alt,
  className,
  containerClassName,
  fallbackElement,
  ...props
}: Props) {
  const [hasError, setHasError] = useState(false);
  const theme = useTheme();
  const DefaultFallback = theme === Theme.Light ? FallbackImageLight : FallbackImageDark;

  const errorHandler = () => {
    setHasError(true);
  };

  if (!src || hasError) {
    return fallbackElement ? (
      cloneElement(fallbackElement, { className })
    ) : (
      <div className={containerClassName}>
        <DefaultFallback className={className} />
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <img className={className} src={src} alt={alt} onError={errorHandler} {...props} />
    </div>
  );
}

export default ImageWithErrorFallback;
