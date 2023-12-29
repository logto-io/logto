import { ReservedPlanId } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { useContext, type ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import PageMeta from '@/components/PageMeta';
import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import CardTitle from '@/ds-components/CardTitle';
import InlineNotification from '@/ds-components/InlineNotification';

import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
};

function PageWrapper({ children }: Props) {
  const { isDevTenant } = useContext(TenantsContext);
  const { currentPlan } = useContext(SubscriptionDataContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const isMfaEnabled = !isCloud || currentPlan.quota.mfaEnabled;

  return (
    <div className={styles.container}>
      <PageMeta titleKey="mfa.title" />
      <CardTitle
        isBeta
        paywall={cond((!isMfaEnabled || isDevTenant) && ReservedPlanId.Pro)}
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
