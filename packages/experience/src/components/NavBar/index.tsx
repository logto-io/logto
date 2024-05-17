import classNames from 'classnames';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import ArrowPrev from '@/assets/icons/arrow-prev.svg';
import NavClose from '@/assets/icons/nav-close.svg';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './index.module.scss';

type Props = {
  readonly title?: string;
  readonly type?: 'back' | 'close';
  readonly isHidden?: boolean;
  readonly onClose?: () => void;
  readonly onSkip?: () => void;
};

const NavBar = ({ title, type = 'back', isHidden, onClose, onSkip }: Props) => {
  const navigate = useNavigate();
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

    navigate(-1);
  }, [isClosable, navigate, onClose]);

  return (
    <div className={classNames(styles.navBar, isHidden && styles.hidden)}>
      <div
        role="button"
        tabIndex={0}
        className={styles.navButton}
        onKeyDown={onKeyDownHandler(clickHandler)}
        onClick={clickHandler}
      >
        {isClosable ? <NavClose /> : <ArrowPrev />}
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
