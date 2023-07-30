import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import * as connectorLinkButtonStyles from './ConnectorLinkButton.module.scss';
import * as styles from './index.module.scss';

export type Props = {
  isDisabled?: boolean;
  className?: string;
  target: string;
  logo: string;
  name: Record<string, string>;
  onClick?: () => void;
};

const ConnectorLinkButton = ({ isDisabled, className, target, name, logo, onClick }: Props) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const localName = name[language] ?? name.en;

  return (
    <button
      disabled={isDisabled}
      className={classNames(
        styles.button,
        styles.secondary,
        styles.large,
        connectorLinkButtonStyles.socialButton,
        isDisabled && styles.disabled,
        className
      )}
      type="button"
      onClick={onClick}
    >
      {logo && (
        <img
          src={logo}
          alt={target}
          className={connectorLinkButtonStyles.icon}
          crossOrigin="anonymous"
        />
      )}
      <div className={connectorLinkButtonStyles.name}>
        <div className={connectorLinkButtonStyles.placeHolder} />
        <span>{t('action.sign_in_with', { name: localName })}</span>
        <div className={connectorLinkButtonStyles.placeHolder} />
      </div>
    </button>
  );
};

export default ConnectorLinkButton;
