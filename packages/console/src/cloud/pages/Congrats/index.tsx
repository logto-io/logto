import { AppearanceMode } from '@logto/schemas';
import classNames from 'classnames';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import CalendarOutline from '@/assets/images/calendar-outline.svg';
import CongratsImageDark from '@/assets/images/congrats-dark.svg';
import CongratsImageLight from '@/assets/images/congrats.svg';
import Reservation from '@/cloud/components/Reservation';
import useUserOnboardingData from '@/cloud/hooks/use-user-onboarding-data';
import * as pageLayout from '@/cloud/scss/layout.module.scss';
import Button from '@/components/Button';
import Divider from '@/components/Divider';
import OverlayScrollbar from '@/components/OverlayScrollbar';
import { useTheme } from '@/hooks/use-theme';

import * as styles from './index.module.scss';

const Congrats = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const theme = useTheme();
  const CongratsImage = theme === AppearanceMode.LightMode ? CongratsImageLight : CongratsImageDark;
  const { update } = useUserOnboardingData();

  const navigate = useNavigate();

  const enterAdminConsole = async () => {
    await update({ isOnboardingDone: true });
    navigate('/');
  };

  return (
    <div className={pageLayout.page}>
      <OverlayScrollbar className={pageLayout.contentContainer}>
        <div className={classNames(pageLayout.content, styles.content)}>
          <CongratsImage className={styles.congratsImage} />
          <div className={styles.title}>{t('cloud.congrats.title')}</div>
          <div className={styles.description}>
            <Trans components={{ strong: <span className={styles.strong} /> }}>
              {t('cloud.congrats.description')}
            </Trans>
          </div>
          <Reservation
            title="cloud.congrats.reserve_title"
            description="cloud.congrats.reserve_description"
            reservationButtonTitle="cloud.congrats.book_button"
            reservationButtonIcon={<CalendarOutline />}
            className={styles.reservation}
          />
          <Divider className={styles.divider} />
          <Button
            size="large"
            type="primary"
            title="cloud.congrats.enter_admin_console"
            onClick={enterAdminConsole}
          />
        </div>
      </OverlayScrollbar>
    </div>
  );
};

export default Congrats;
