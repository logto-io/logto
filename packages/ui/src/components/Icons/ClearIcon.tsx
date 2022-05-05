import React, { SVGProps } from 'react';

import IconClear from '@/assets/icons/clear-icon.svg';

const ClearIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" {...props}>
    <use href={`${IconClear}#clear`} />
  </svg>
);

export default ClearIcon;
