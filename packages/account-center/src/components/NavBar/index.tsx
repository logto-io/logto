import ArrowPrev from '@experience/shared/assets/icons/arrow-prev.svg?react';
import NavClose from '@experience/shared/assets/icons/nav-close.svg?react';
import FlipOnRtl from '@experience/shared/components/FlipOnRtl';
import { onKeyDownHandler } from '@experience/shared/utils/a11y';
import classNames from 'classnames';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './index.module.scss';

type Props = {
  readonly title?: string;
  readonly type?: 'back' | 'close';
  readonly isHidden?: boolean;
  readonly onClose?: () => void;
  readonly onSkip?: () => void;
};

const NavBar = ({ title, type = 'back', isHidden, onClose, onSkip }: Props) => {
  const { t } = useTranslation();

  const isClosable = type === 'close';

  const clickHandler = useCallback(() => {
    if (onClose) {
      onClose();

      return;
    }

    if (isClosable) {
      window.close();

      return;
    }

    // Navigate back in history
    window.history.back();
  }, [isClosable, onClose]);

  return (
    <div className={classNames(styles.navBar, isHidden && styles.hidden)}>
      <div
        role="button"
        tabIndex={0}
        className={styles.navButton}
        onKeyDown={onKeyDownHandler(clickHandler)}
        onClick={clickHandler}
      >
        {isClosable ? (
          <NavClose />
        ) : (
          <FlipOnRtl>
            <ArrowPrev />
          </FlipOnRtl>
        )}
        {!isClosable && <span>{t('action.nav_back')}</span>}
      </div>
      {title && <div className={styles.title}>{title}</div>}
      {onSkip && (
        <div
          role="button"
          tabIndex={0}
          className={styles.skipButton}
          onKeyDown={onKeyDownHandler(onSkip)}
          onClick={onSkip}
        >
          <span>{t('action.nav_skip')}</span>
        </div>
      )}
    </div>
  );
};

export default NavBar;
