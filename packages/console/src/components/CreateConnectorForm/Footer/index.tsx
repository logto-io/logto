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
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import { type ConnectorGroup } from '@/types/connector';
import { hasReachedQuotaLimit } from '@/utils/quota';

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
  const { currentPlan } = useContext(SubscriptionDataContext);

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

  if (isCreatingSocialConnector && selectedConnectorGroup) {
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
                  planId === ReservedPlanId.Pro ? 'standard_connectors_pro' : 'standard_connectors',
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
