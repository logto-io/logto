import React, { SVGProps } from 'react';

import Loading from '@/assets/icons/loading.svg';

const LoadingIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
      <use href={`${Loading}#loading`} />
    </svg>
  );
};

export default LoadingIcon;
