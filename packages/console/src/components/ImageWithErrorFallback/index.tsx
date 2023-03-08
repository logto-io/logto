import { AppearanceMode } from '@logto/schemas';
import type { ImgHTMLAttributes } from 'react';
import { useState } from 'react';

import FallbackImageDark from '@/assets/images/broken-image-dark.svg';
import FallbackImageLight from '@/assets/images/broken-image-light.svg';
import { useTheme } from '@/hooks/use-theme';

const ImageWithErrorFallback = ({
  src,
  alt,
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) => {
  const [hasError, setHasError] = useState(false);
  const theme = useTheme();
  const Fallback = theme === AppearanceMode.LightMode ? FallbackImageLight : FallbackImageDark;

  const errorHandler = () => {
    setHasError(true);
  };

  if (!src || hasError) {
    return <Fallback className={className} />;
  }

  return <img className={className} src={src} alt={alt} onError={errorHandler} {...props} />;
};

export default ImageWithErrorFallback;
