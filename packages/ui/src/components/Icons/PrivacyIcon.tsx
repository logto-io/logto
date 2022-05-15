import classNames from 'classnames';
import React, { SVGProps } from 'react';

import Icon from '@/assets/icons/privacy-icon.svg';

import styles from './PrivacyIcon.module.scss';

type Props = {
  type?: 'show' | 'hide';
} & SVGProps<SVGSVGElement>;

const PrivacyIcon = ({ type = 'show', ...rest }: Props) => {
  return (
    <span className={classNames(styles[type], styles.privacyIcon)}>
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...rest}>
        <use href={`${Icon}#show`} />
      </svg>
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...rest}>
        <use href={`${Icon}#hide`} />
      </svg>
    </span>
  );
};

export default PrivacyIcon;
