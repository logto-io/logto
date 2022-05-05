import React, { SVGProps } from 'react';

import IconClose from '@/assets/icons/close-icon.svg';

const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <use href={`${IconClose}#close-icon`} />
  </svg>
);

export default CloseIcon;
