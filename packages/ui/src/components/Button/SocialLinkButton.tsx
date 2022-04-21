import { ConnectorMetadata } from '@logto/connector-types';
import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import * as socialLinkButtonStyles from './SocialLinkButton.module.scss';
import * as styles from './index.module.scss';

export type Props = {
  isDisabled?: boolean;
  className?: string;
  connector: Pick<ConnectorMetadata, 'id' | 'name' | 'logo'>;
  onClick?: (id: string) => void;
};

const SocialLinkButton = ({ isDisabled, className, connector, onClick }: Props) => {
  const { id, name, logo } = connector;

  const {
    i18n: { language },
  } = useTranslation();
  const localName = name[language] ?? name.en;

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
        onClick?.(id);
      }}
    >
      {logo && <img src={logo} alt={localName} className={socialLinkButtonStyles.icon} />}
      {localName}
    </button>
  );
};

export default SocialLinkButton;
