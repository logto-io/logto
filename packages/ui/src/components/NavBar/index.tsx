import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import ArrowPrev from '@/assets/icons/arrow-prev.svg';
import NavClose from '@/assets/icons/nav-close.svg';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './index.module.scss';

type Props = {
  title?: string;
  type?: 'back' | 'close';
};

const NavBar = ({ title, type = 'back' }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isClosable = type === 'close';

  const clickHandler = () => {
    if (isClosable) {
      window.close();
    }

    navigate(-1);
  };

  return (
    <div className={styles.navBar}>
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
    </div>
  );
};

export default NavBar;
