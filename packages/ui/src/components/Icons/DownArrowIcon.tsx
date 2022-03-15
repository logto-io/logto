import React, { SVGProps } from 'react';

import Arrow from '@/assets/icons/arrow.svg';

const DownArrowIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <use href={`${Arrow}#down`} transform="translate(0, 1)" />
    </svg>
  );
};

export default DownArrowIcon;
