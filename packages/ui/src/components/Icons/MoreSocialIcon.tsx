import React, { SVGProps, forwardRef, Ref } from 'react';

import More from '@/assets/icons/more-social-icon.svg';

const MoreSocialIcon = (props: SVGProps<SVGSVGElement>, reference?: Ref<SVGSVGElement>) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
    ref={reference}
  >
    <use href={`${More}#more`} />
  </svg>
);

export default forwardRef(MoreSocialIcon);
