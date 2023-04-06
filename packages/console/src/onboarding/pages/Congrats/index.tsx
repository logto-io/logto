import { appInsightsReact } from '@logto/app-insights/react';
import classNames from 'classnames';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import CongratsImage from '@/assets/images/congrats.svg';
import EmailUsIcon from '@/assets/images/email-us.svg';
import Email from '@/assets/images/email.svg';
import Button from '@/components/Button';
import Divider from '@/components/Divider';
import OverlayScrollbar from '@/components/OverlayScrollbar';
import PageMeta from '@/components/PageMeta';
import { TenantsContext } from '@/contexts/TenantsProvider';
import ReachLogto from '@/onboarding/components/ReachLogto';
import { emailUsLink } from '@/onboarding/constants';
import useUserOnboardingData from '@/onboarding/hooks/use-user-onboarding-data';
import * as pageLayout from '@/onboarding/scss/layout.module.scss';

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
          <ReachLogto
            title="cloud.congrats.email_us_title"
            description="cloud.congrats.email_us_description"
            buttonTitle="cloud.congrats.email_us_button"
            buttonIcon={<EmailUsIcon />}
            icon={<Email />}
            link={emailUsLink}
            className={styles.emailUs}
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

export default appInsightsReact.withAppInsights(Congrats);
