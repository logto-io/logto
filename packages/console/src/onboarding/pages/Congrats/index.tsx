import classNames from 'classnames';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import CalendarOutline from '@/assets/images/calendar-outline.svg';
import CongratsImage from '@/assets/images/congrats.svg';
import Button from '@/components/Button';
import Divider from '@/components/Divider';
import OverlayScrollbar from '@/components/OverlayScrollbar';
import PageMeta from '@/components/PageMeta';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Reservation from '@/onboarding/components/Reservation';
import useUserOnboardingData from '@/onboarding/hooks/use-user-onboarding-data';
import * as pageLayout from '@/onboarding/scss/layout.module.scss';
import { withAppInsights } from '@/utils/app-insights';

import * as styles from './index.module.scss';

function Congrats() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { update } = useUserOnboardingData();
  const { navigate, currentTenantId } = useContext(TenantsContext);

  const enterAdminConsole = () => {
    void update({ isOnboardingDone: true });
    // Note: navigate to the admin console page directly instead of using the router
    navigate(currentTenantId);
  };

  return (
    <div className={pageLayout.page}>
      <PageMeta titleKey="cloud.congrats.page_title" />
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
}

export default withAppInsights(Congrats);
