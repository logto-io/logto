import React from 'react';
import { isMobile } from 'react-device-detect';

import _CheckBoxIcon from '@/assets/icons/check-box.svg';
import RadioButtonIcon from '@/assets/icons/radio-button.svg';

type Props = {
  className?: string;
};

const CheckBoxIcon = ({ className }: Props) => (
  <span className={className}>
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <use href={`${isMobile ? RadioButtonIcon : _CheckBoxIcon}#checked`} />
    </svg>
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <use href={`${isMobile ? RadioButtonIcon : _CheckBoxIcon}#unchecked`} />
    </svg>
  </span>
);

export default CheckBoxIcon;
