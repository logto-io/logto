import { ReservedPlanId } from '@logto/schemas';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import { contactEmailLink } from '@/consts';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button, { LinkButton } from '@/ds-components/Button';

import useTenantMembersUsage from '../../hooks';

import * as styles from './index.module.scss';

type Props = {
  newInvitationCount?: number;
  isLoading: boolean;
  onSubmit: () => void;
};

function Footer({ newInvitationCount = 0, isLoading, onSubmit }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.upsell.paywall' });

  const { currentPlan } = useContext(SubscriptionDataContext);
  const { id: planId, quota } = currentPlan;

  const { hasTenantMembersReachedLimit, limit, usage } = useTenantMembersUsage();

  if (planId === ReservedPlanId.Free && hasTenantMembersReachedLimit) {
    return (
      <QuotaGuardFooter>
        <Trans
          components={{
            a: <ContactUsPhraseLink />,
          }}
        >
          {t('tenant_members')}
        </Trans>
      </QuotaGuardFooter>
    );
  }

  if (
    planId === ReservedPlanId.Development &&
    (hasTenantMembersReachedLimit || usage + newInvitationCount > limit)
  ) {
    // Display a custom "Contact us" footer instead of asking for upgrade
    return (
      <div className={styles.container}>
        <div className={styles.description}>
          {t('tenant_members_dev_plan', { limit: quota.tenantMembersLimit })}
        </div>
        <LinkButton
          size="large"
          type="primary"
          title="general.contact_us_action"
          href={contactEmailLink}
        />
      </div>
    );
  }

  return (
    <Button
      size="large"
      type="primary"
      title="tenant_members.invite_members"
      isLoading={isLoading}
      onClick={onSubmit}
    />
  );
}

export default Footer;
