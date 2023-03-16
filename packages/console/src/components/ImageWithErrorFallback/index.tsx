import type { ImgHTMLAttributes } from 'react';
import { useState } from 'react';

import FallbackImageDark from '@/assets/images/broken-image-dark.svg';
import FallbackImageLight from '@/assets/images/broken-image-light.svg';
import useTheme from '@/hooks/use-theme';
import { Theme } from '@/types/theme';

type Props = { containerClassName?: string } & ImgHTMLAttributes<HTMLImageElement>;

const ImageWithErrorFallback = ({ src, alt, className, containerClassName, ...props }: Props) => {
  const [hasError, setHasError] = useState(false);
  const theme = useTheme();
  const Fallback = theme === Theme.Light ? FallbackImageLight : FallbackImageDark;

  const errorHandler = () => {
    setHasError(true);
  };

  if (!src || hasError) {
    return <Fallback className={className} />;
  }

  return (
    <div className={containerClassName}>
      <img className={className} src={src} alt={alt} onError={errorHandler} {...props} />
    </div>
  );
};

export default ImageWithErrorFallback;
