import { RoleType, type ScopeResponse } from '@logto/schemas';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import AddOnNoticeFooter from '@/components/AddOnNoticeFooter';
import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import SkuName from '@/components/SkuName';
import { addOnPricingExplanationLink } from '@/consts';
import { isDevFeaturesEnabled } from '@/consts/env';
import { rbacEnabledAddOnUnitPrice } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import TextLink from '@/ds-components/TextLink';
import useUserPreferences from '@/hooks/use-user-preferences';
import { isPaidPlan } from '@/utils/subscription';

import styles from './index.module.scss';

type Props = {
  readonly roleType: RoleType;
  readonly scopes?: ScopeResponse[];
  readonly isCreating: boolean;
  readonly onClickCreate: () => void;
};

function Footer({ roleType, scopes, isCreating, onClickCreate }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    currentSubscription: { planId, isEnterprisePlan },
    currentSubscriptionQuota,
    hasReachedSubscriptionQuotaLimit,
    hasSurpassedSubscriptionQuotaLimit,
  } = useContext(SubscriptionDataContext);

  const isPaidTenant = isPaidPlan(planId, isEnterprisePlan);

  const hasRoleReachedLimit = hasReachedSubscriptionQuotaLimit(
    roleType === RoleType.User ? 'userRolesLimit' : 'machineToMachineRolesLimit'
  );

  const hasScopesPerRoleSurpassedLimit = hasSurpassedSubscriptionQuotaLimit(
    'scopesPerRoleLimit',
    scopes?.length ?? 0
  );

  const {
    data: { rbacUpsellNoticeAcknowledged },
    update,
  } = useUserPreferences();

  if (hasRoleReachedLimit && !isPaidTenant) {
    return (
      <QuotaGuardFooter>
        <Trans
          components={{
            a: <ContactUsPhraseLink />,
            planName: <SkuName skuId={planId} />,
          }}
        >
          {/* User roles limit paywall */}
          {t('upsell.paywall.roles')}
        </Trans>
      </QuotaGuardFooter>
    );
  }

  if (
    // TODO: remove dev feature guard with roles add-on is ready
    isDevFeaturesEnabled &&
    hasRoleReachedLimit &&
    isPaidTenant &&
    !rbacUpsellNoticeAcknowledged
  ) {
    return (
      <AddOnNoticeFooter
        isLoading={isCreating}
        buttonTitle="roles.create_role_button"
        onClick={() => {
          void update({ rbacUpsellNoticeAcknowledged: true });
          onClickCreate();
        }}
      >
        <Trans
          components={{
            span: <span className={styles.strong} />,
            a: <TextLink targetBlank to={addOnPricingExplanationLink} />,
          }}
        >
          {t('upsell.add_on.footer.roles', {
            price: rbacEnabledAddOnUnitPrice,
          })}
        </Trans>
      </AddOnNoticeFooter>
    );
  }

  if (hasScopesPerRoleSurpassedLimit) {
    return (
      <QuotaGuardFooter>
        <Trans
          components={{
            a: <ContactUsPhraseLink />,
            planName: <SkuName skuId={planId} />,
          }}
        >
          {/* Role scopes limit paywall */}
          {t('upsell.paywall.scopes_per_role', {
            count: currentSubscriptionQuota.scopesPerRoleLimit ?? 0,
          })}
        </Trans>
      </QuotaGuardFooter>
    );
  }

  return (
    <Button
      isLoading={isCreating}
      htmlType="submit"
      title="roles.create_role_button"
      size="large"
      type="primary"
      onClick={onClickCreate}
    />
  );
}

export default Footer;
