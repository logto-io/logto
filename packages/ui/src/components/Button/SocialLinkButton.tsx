import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ConnectorData } from '@/types';

import * as socialLinkButtonStyles from './SocialLinkButton.module.scss';
import * as styles from './index.module.scss';

export type Props = {
  isDisabled?: boolean;
  className?: string;
  connector: ConnectorData;
  onClick?: () => void;
};

const SocialLinkButton = ({ isDisabled, className, connector, onClick }: Props) => {
  const { target, name, logo } = connector;

  const {
    i18n: { language },
  } = useTranslation();
  // TODO: LOG-2393 should fix name[locale] syntax error
  const foundName = Object.entries(name).find(([lang]) => lang === language);
  const localName = foundName ? foundName[1] : name.en;

  return (
    <button
      disabled={isDisabled}
      className={classNames(
        styles.button,
        styles.secondary,
        styles.large,
        isDisabled && styles.disabled,
        className
      )}
      type="button"
      onClick={onClick}
    >
      {logo && <img src={logo} alt={target} className={socialLinkButtonStyles.icon} />}
      {localName}
    </button>
  );
};

export default SocialLinkButton;
