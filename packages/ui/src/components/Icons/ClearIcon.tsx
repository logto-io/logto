import React, { SVGProps } from 'react';

import CloseIcon from '@/assets/icons/close-icon.svg';

const ClearIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg" {...props}>
    <use href={`${CloseIcon}#close-icon`} />
  </svg>
);

export default ClearIcon;
