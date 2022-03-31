import React, { SVGProps } from 'react';

import Arrow from '@/assets/icons/arrow.svg';

type Props = {
  type?: 'prev' | 'next';
} & SVGProps<SVGSVGElement>;

const NavArrowIcon = ({ type = 'prev', ...rest }: Props) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <use href={`${Arrow}#${type}`} />
    </svg>
  );
};

export default NavArrowIcon;
