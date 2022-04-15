import React, { SVGProps } from 'react';

import ExpandMore from '@/assets/icons/expand-icon.svg';

const ExpandMoreIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <use href={`${ExpandMore}#more`} />
  </svg>
);

export default ExpandMoreIcon;
