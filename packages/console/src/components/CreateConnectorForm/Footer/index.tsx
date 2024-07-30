import {
  ConnectorType,
  type ConnectorResponse,
  type ConnectorFactoryResponse,
  ReservedPlanId,
} from '@logto/schemas';
import { useContext, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import PlanName from '@/components/PlanName';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import { isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import { type ConnectorGroup } from '@/types/connector';
import { hasReachedQuotaLimit, hasReachedSubscriptionQuotaLimit } from '@/utils/quota';

type Props = {
  readonly isCreatingSocialConnector: boolean;
  readonly existingConnectors: ConnectorResponse[];
  readonly selectedConnectorGroup?: ConnectorGroup<ConnectorFactoryResponse>;
  readonly isCreateButtonDisabled: boolean;
  readonly onClickCreateButton: () => void;
};

function Footer({
  isCreatingSocialConnector,
  existingConnectors,
  selectedConnectorGroup,
  isCreateButtonDisabled,
  onClickCreateButton,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.upsell.paywall' });
  const { currentPlan, currentSku, currentSubscriptionUsage, currentSubscriptionQuota } =
    useContext(SubscriptionDataContext);

  const standardConnectorCount = useMemo(
    () =>
      isDevFeaturesEnabled
        ? // No more standard connector limit in new pricing model.
          0
        : existingConnectors.filter(
            ({ isStandard, isDemo, type }) => isStandard && !isDemo && type === ConnectorType.Social
          ).length,
    [existingConnectors]
  );

  const socialConnectorCount = useMemo(
    () =>
      isDevFeaturesEnabled
        ? currentSubscriptionUsage.socialConnectorsLimit
        : existingConnectors.filter(
            ({ isStandard, isDemo, type }) =>
              !isStandard && !isDemo && type === ConnectorType.Social
          ).length,
    [existingConnectors, currentSubscriptionUsage.socialConnectorsLimit]
  );

  const isStandardConnectorsReachLimit = isDevFeaturesEnabled
    ? // No more standard connector limit in new pricing model.
      false
    : hasReachedQuotaLimit({
        quotaKey: 'standardConnectorsLimit',
        plan: currentPlan,
        usage: standardConnectorCount,
      });

  const isSocialConnectorsReachLimit = isDevFeaturesEnabled
    ? hasReachedSubscriptionQuotaLimit({
        quotaKey: 'socialConnectorsLimit',
        usage: currentSubscriptionUsage.socialConnectorsLimit,
        quota: currentSubscriptionQuota,
      })
    : hasReachedQuotaLimit({
        quotaKey: 'socialConnectorsLimit',
        plan: currentPlan,
        usage: socialConnectorCount,
      });

  if (isCreatingSocialConnector && selectedConnectorGroup) {
    const { id: planId, name: planName, quota } = currentPlan;

    if (isStandardConnectorsReachLimit && selectedConnectorGroup.isStandard) {
      return (
        <QuotaGuardFooter>
          <Trans
            components={{
              a: <ContactUsPhraseLink />,
              planName: <PlanName skuId={currentSku.id} name={planName} />,
            }}
          >
            {quota.standardConnectorsLimit === 0
              ? t('standard_connectors_feature')
              : t(
                  (isDevFeaturesEnabled ? currentSku.id : planId) === ReservedPlanId.Pro
                    ? 'standard_connectors_pro'
                    : 'standard_connectors',
                  {
                    count: quota.standardConnectorsLimit ?? 0,
                  }
                )}
          </Trans>
        </QuotaGuardFooter>
      );
    }

    if (isSocialConnectorsReachLimit && !selectedConnectorGroup.isStandard) {
      return (
        <QuotaGuardFooter>
          <Trans
            components={{
              a: <ContactUsPhraseLink />,
              planName: <PlanName skuId={currentSku.id} name={planName} />,
            }}
          >
            {t('social_connectors', {
              count:
                (isDevFeaturesEnabled
                  ? currentSubscriptionQuota.socialConnectorsLimit
                  : quota.socialConnectorsLimit) ?? 0,
            })}
          </Trans>
        </QuotaGuardFooter>
      );
    }
  }

  return (
    <Button
      title="general.next"
      type="primary"
      disabled={isCreateButtonDisabled}
      onClick={onClickCreateButton}
    />
  );
}

export default Footer;
