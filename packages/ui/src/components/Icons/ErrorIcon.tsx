import React, { SVGProps } from 'react';

import Error from '@/assets/icons/error.svg';

const ErrorIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="230"
      height="230"
      viewBox="0 0 230 230"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <use href={`${Error}#error`} />
    </svg>
  );
};

export default ErrorIcon;
