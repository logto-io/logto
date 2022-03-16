import { ConnectorMetadata } from '@logto/schemas';
import classNames from 'classnames';
import React from 'react';

import * as SocialLinkButtonStyles from './SocialLinkButton.module.scss';
import * as styles from './index.module.scss';

export type Props = {
  isDisabled?: boolean;
  className?: string;
  connector: Pick<ConnectorMetadata, 'id' | 'name' | 'logo'>;
  onClick?: (id: string) => void;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const SocialLinkButton = ({ isDisabled, className, connector, onClick = noop }: Props) => {
  const { id, name, logo } = connector;
  const localName = name.en; // TODO: i18n

  return (
    <button
      disabled={isDisabled}
      className={classNames(styles.button, SocialLinkButtonStyles.socialButton, className)}
      type="button"
      onClick={() => {
        onClick(id);
      }}
    >
      {logo && <img src={logo} alt={localName} className={SocialLinkButtonStyles.icon} />}
      {localName}
    </button>
  );
};

export default SocialLinkButton;
