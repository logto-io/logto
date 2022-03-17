import React, { SVGProps } from 'react';

import RadioButton from '@/assets/icons/radio-button.svg';

const RadioButtonIcon = ({
  checked,
  ...props
}: SVGProps<SVGSVGElement> & { checked?: boolean }) => {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" {...props}>
      <use href={`${RadioButton}#${checked ? 'checked' : 'unchecked'}`} />
    </svg>
  );
};

export default RadioButtonIcon;
