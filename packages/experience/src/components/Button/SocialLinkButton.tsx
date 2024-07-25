import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useDebouncedLoader } from 'use-debounced-loader';

import RotatingRingIcon from './RotatingRingIcon';
import socialLinkButtonStyles from './SocialLinkButton.module.scss';
import styles from './index.module.scss';

export type Props = {
  readonly isDisabled?: boolean;
  readonly isLoading?: boolean;
  readonly className?: string;
  readonly target: string;
  readonly logo: string;
  readonly name: Record<string, string>;
  readonly onClick?: () => void;
};

const SocialLinkButton = ({
  isDisabled,
  isLoading = false,
  className,
  target,
  name,
  logo,
  onClick,
}: Props) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const localName = name[language] ?? name.en;

  const isLoadingActive = useDebouncedLoader(isLoading, 300);

  return (
    <button
      disabled={isDisabled}
      className={classNames(
        styles.button,
        styles.secondary,
        styles.large,
        socialLinkButtonStyles.socialButton,
        (isDisabled ?? isLoadingActive) && styles.disabled,
        className
      )}
      type="button"
      onClick={onClick}
    >
      {logo && !isLoadingActive && (
        <img
          src={logo}
          alt={target}
          className={socialLinkButtonStyles.icon}
          crossOrigin="anonymous"
        />
      )}
      {isLoadingActive && (
        <span className={socialLinkButtonStyles.loadingIcon}>
          <RotatingRingIcon />
        </span>
      )}
      <div className={socialLinkButtonStyles.name}>
        <div className={socialLinkButtonStyles.placeHolder} />
        <span>{t('action.sign_in_with', { name: localName })}</span>
        <div className={socialLinkButtonStyles.placeHolder} />
      </div>
    </button>
  );
};

export default SocialLinkButton;
