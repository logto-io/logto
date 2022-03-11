import React, { SVGProps } from 'react';

import Icon from '@/assets/icons/privacy-icon.svg';

type Props = {
  type?: 'show' | 'hide';
} & SVGProps<SVGSVGElement>;

const PrivacyIcon = ({ type = 'show', ...rest }: Props) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <use href={`${Icon}#${type}`} />
    </svg>
  );
};

export default PrivacyIcon;
