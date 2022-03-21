import React, { SVGProps } from 'react';

import CloseIcon from '@/assets/icons/close-icon.svg';

const ClearIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <use href={`${CloseIcon}#close-icon`} />
  </svg>
);

export default ClearIcon;
