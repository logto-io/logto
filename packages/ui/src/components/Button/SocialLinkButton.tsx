import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import * as socialLinkButtonStyles from './SocialLinkButton.module.scss';
import * as styles from './index.module.scss';

export type Props = {
  isDisabled?: boolean;
  className?: string;
  target: string;
  logo: string;
  name: Record<string, string>;
  onClick?: () => void;
};

const SocialLinkButton = ({ isDisabled, className, target, name, logo, onClick }: Props) => {
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
        socialLinkButtonStyles.socialButton,
        isDisabled && styles.disabled,
        className
      )}
      type="button"
      onClick={onClick}
    >
      {logo && <img src={logo} alt={target} className={socialLinkButtonStyles.icon} />}
      <div className={socialLinkButtonStyles.name}>
        <div className={socialLinkButtonStyles.placeHolder} />
        <span>{t('action.sign_in_with', { name: localName })}</span>
        <div className={socialLinkButtonStyles.placeHolder} />
      </div>
    </button>
  );
};

export default SocialLinkButton;
