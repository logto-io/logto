import { withAppInsights } from '@logto/app-insights/react';
import classNames from 'classnames';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import EmailUsIcon from '@/assets/icons/email-us.svg';
import Email from '@/assets/icons/email.svg';
import CongratsImage from '@/assets/images/congrats.svg';
import PageMeta from '@/components/PageMeta';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import Divider from '@/ds-components/Divider';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import ReachLogto from '@/onboarding/components/ReachLogto';
import { emailUsLink } from '@/onboarding/constants';
import useUserOnboardingData from '@/onboarding/hooks/use-user-onboarding-data';
import * as pageLayout from '@/onboarding/scss/layout.module.scss';

import * as styles from './index.module.scss';

function Congrats() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { update } = useUserOnboardingData();
  const { navigateTenant, currentTenantId } = useContext(TenantsContext);

  const enterAdminConsole = () => {
    void update({ isOnboardingDone: true });
    // Note: navigate to the admin console page directly instead of using the router
    navigateTenant(currentTenantId);
  };

  return (
    <div className={pageLayout.page}>
      <PageMeta titleKey={['cloud.congrats.page_title', 'cloud.general.onboarding']} />
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

export default withAppInsights(Congrats);
