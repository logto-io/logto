import type { ImgHTMLAttributes } from 'react';
import { useContext, useState } from 'react';

import FallbackImageDark from '@/assets/images/broken-image-dark.svg';
import FallbackImageLight from '@/assets/images/broken-image-light.svg';
import { AppThemeContext } from '@/contexts/AppThemeProvider';
import { Theme } from '@/types/theme';

type Props = { containerClassName?: string } & ImgHTMLAttributes<HTMLImageElement>;

const ImageWithErrorFallback = ({ src, alt, className, containerClassName, ...props }: Props) => {
  const [hasError, setHasError] = useState(false);
  const { theme } = useContext(AppThemeContext);
  const Fallback = theme === Theme.LightMode ? FallbackImageLight : FallbackImageDark;

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
