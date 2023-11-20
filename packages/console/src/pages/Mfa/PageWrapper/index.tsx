import { ReservedPlanId } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { useContext, type ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import PageMeta from '@/components/PageMeta';
import { TenantsContext } from '@/contexts/TenantsProvider';
import CardTitle from '@/ds-components/CardTitle';
import InlineNotification from '@/ds-components/InlineNotification';
import useSubscriptionPlan from '@/hooks/use-subscription-plan';

import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
};

function PageWrapper({ children }: Props) {
  const { currentTenantId, isDevTenant } = useContext(TenantsContext);
  const { data: currentPlan } = useSubscriptionPlan(currentTenantId);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  // Note: fallback to true for OSS version
  const isMfaEnabled = currentPlan?.quota.mfaEnabled ?? true;

  return (
    <div className={styles.container}>
      <PageMeta titleKey="mfa.title" />
      <CardTitle
        isBeta
        paywall={cond((!isMfaEnabled || isDevTenant) && ReservedPlanId.Hobby)}
        title="mfa.title"
        subtitle="mfa.description"
        className={styles.cardTitle}
      />
      {isMfaEnabled && (
        <InlineNotification hasIcon={false} className={styles.betaNotice}>
          <Trans
            components={{
              ContactLink: <ContactUsPhraseLink />,
            }}
          >
            {t('general.beta_notice', { feature: 'MFA' })}
          </Trans>
        </InlineNotification>
      )}
      {children}
    </div>
  );
}

export default PageWrapper;
