import { ReservedPlanId } from '@logto/schemas';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import { contactEmailLink } from '@/consts';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button, { LinkButton } from '@/ds-components/Button';

import useTenantMembersUsage from '../../hooks';

import styles from './index.module.scss';

type Props = {
  readonly newInvitationCount?: number;
  readonly isLoading: boolean;
  readonly onSubmit: () => void;
};

function Footer({ newInvitationCount = 0, isLoading, onSubmit }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.upsell.paywall' });

  const { currentSku, currentSubscriptionQuota } = useContext(SubscriptionDataContext);

  const { hasTenantMembersReachedLimit, limit, usage } = useTenantMembersUsage();

  if (currentSku.id === ReservedPlanId.Free && hasTenantMembersReachedLimit) {
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
    currentSku.id === ReservedPlanId.Development &&
    (hasTenantMembersReachedLimit || usage + newInvitationCount > limit)
  ) {
    // Display a custom "Contact us" footer instead of asking for upgrade
    return (
      <div className={styles.container}>
        <div className={styles.description}>
          {t('tenant_members_dev_plan', { limit: currentSubscriptionQuota.tenantMembersLimit })}
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
