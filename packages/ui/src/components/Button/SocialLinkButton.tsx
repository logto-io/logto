import { ConnectorMetadata } from '@logto/schemas';
import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import * as socialLinkButtonStyles from './SocialLinkButton.module.scss';
import * as styles from './index.module.scss';

export type Props = {
  isDisabled?: boolean;
  className?: string;
  connector: Pick<ConnectorMetadata, 'target' | 'name' | 'logo'>;
  onClick?: (id: string) => void;
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
        isDisabled && styles.disabled,
        socialLinkButtonStyles.socialButton,
        className
      )}
      type="button"
      onClick={() => {
        onClick?.(target);
      }}
    >
      {logo && <img src={logo} alt={localName} className={socialLinkButtonStyles.icon} />}
      {localName}
    </button>
  );
};

export default SocialLinkButton;
