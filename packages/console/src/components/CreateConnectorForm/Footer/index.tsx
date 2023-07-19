import {
  ConnectorType,
  type ConnectorResponse,
  type ConnectorFactoryResponse,
} from '@logto/schemas';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import PlanName from '@/components/PlanName';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import { ReservedPlanId } from '@/consts/subscriptions';
import Button from '@/ds-components/Button';
import useCurrentSubscriptionPlan from '@/hooks/use-current-subscription-plan';
import { type ConnectorGroup } from '@/types/connector';
import { hasReachedQuotaLimit } from '@/utils/quota';

type Props = {
  isCreatingSocialConnector: boolean;
  existingConnectors: ConnectorResponse[];
  selectedConnectorGroup?: ConnectorGroup<ConnectorFactoryResponse>;
  isCreateButtonDisabled: boolean;
  onClickCreateButton: () => void;
};

function Footer({
  isCreatingSocialConnector,
  existingConnectors,
  selectedConnectorGroup,
  isCreateButtonDisabled,
  onClickCreateButton,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.upsell.paywall' });
  const { data: currentPlan } = useCurrentSubscriptionPlan();

  const standardConnectorCount = useMemo(
    () =>
      existingConnectors.filter(
        ({ isStandard, isDemo, type }) => isStandard && !isDemo && type === ConnectorType.Social
      ).length,
    [existingConnectors]
  );

  const socialConnectorCount = useMemo(
    () =>
      existingConnectors.filter(
        ({ isStandard, isDemo, type }) => !isStandard && !isDemo && type === ConnectorType.Social
      ).length,
    [existingConnectors]
  );

  const isStandardConnectorsReachLimit = hasReachedQuotaLimit({
    quotaKey: 'standardConnectorsLimit',
    plan: currentPlan,
    usage: standardConnectorCount,
  });

  const isSocialConnectorsReachLimit = hasReachedQuotaLimit({
    quotaKey: 'socialConnectorsLimit',
    plan: currentPlan,
    usage: socialConnectorCount,
  });

  if (isCreatingSocialConnector && currentPlan && selectedConnectorGroup) {
    const { id: planId, name: planName, quota } = currentPlan;

    if (isStandardConnectorsReachLimit && selectedConnectorGroup.isStandard) {
      return (
        <QuotaGuardFooter>
          <Trans
            components={{
              a: <ContactUsPhraseLink />,
              planName: <PlanName name={planName} />,
            }}
          >
            {quota.standardConnectorsLimit === 0
              ? t('standard_connectors_feature')
              : t(
                  planId === ReservedPlanId.pro ? 'standard_connectors_pro' : 'standard_connectors',
                  {
                    count: quota.standardConnectorsLimit,
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
              planName: <PlanName name={planName} />,
            }}
          >
            {t('social_connectors', {
              count: quota.socialConnectorsLimit ?? 0,
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
