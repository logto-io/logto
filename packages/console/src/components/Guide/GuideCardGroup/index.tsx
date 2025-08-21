import { ApplicationType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { type Ref, forwardRef, useContext } from 'react';

import { type GuideMetadata, type Guide } from '@/assets/docs/guides/types';
import { type NewSubscriptionQuota } from '@/cloud/types/router';
import FeatureTag, { CombinedAddOnAndFeatureTag } from '@/components/FeatureTag';
import { isDevFeaturesEnabled } from '@/consts/env';
import { latestProPlanId } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { isPaidPlan } from '@/utils/subscription';

import GuideCard, { type SelectedGuide } from '../GuideCard';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly categoryName?: string;
  readonly guides?: readonly Guide[];
  readonly hasCardBorder?: boolean;
  readonly hasCardButton?: boolean;
  readonly onClickGuide: (data: SelectedGuide) => void;
};

function getPaywallTag(
  guideMetadata: GuideMetadata,
  currentSubscriptionQuota: NewSubscriptionQuota,
  isPaidPlan: boolean,
  isEnterprisePlan: boolean
) {
  // TODO: remove the dev feature guard when the new add-on plan is ready for release
  if (guideMetadata.isThirdParty) {
    return isDevFeaturesEnabled ? (
      <CombinedAddOnAndFeatureTag
        hasAddOnTag={isPaidPlan && currentSubscriptionQuota.thirdPartyApplicationsLimit !== null}
        paywall={conditional(!isPaidPlan && latestProPlanId)}
      />
    ) : (
      <FeatureTag isVisible={!isPaidPlan} plan={latestProPlanId} />
    );
  }

  if (guideMetadata.target === ApplicationType.SAML) {
    return isDevFeaturesEnabled ? (
      <CombinedAddOnAndFeatureTag
        hasAddOnTag={isPaidPlan}
        paywall={conditional(!isPaidPlan && latestProPlanId)}
      />
    ) : (
      <FeatureTag isEnterprise isVisible={!isEnterprisePlan} />
    );
  }
}

function GuideCardGroup(
  { className, categoryName, guides, hasCardBorder, hasCardButton, onClickGuide }: Props,
  ref: Ref<HTMLDivElement>
) {
  const {
    currentSubscriptionQuota,
    currentSubscription: { planId, isEnterprisePlan },
  } = useContext(SubscriptionDataContext);

  const isPaidTenant = isPaidPlan(planId, isEnterprisePlan);

  if (!guides?.length) {
    return null;
  }

  return (
    <div ref={ref} className={classNames(styles.guideGroup, className)}>
      {categoryName && <label>{categoryName}</label>}
      <div className={styles.grid}>
        {guides.map((guide) => (
          <GuideCard
            key={guide.id}
            hasBorder={hasCardBorder}
            hasButton={hasCardButton}
            data={guide}
            paywallTag={getPaywallTag(
              guide.metadata,
              currentSubscriptionQuota,
              isPaidTenant,
              isEnterprisePlan
            )}
            onClick={onClickGuide}
          />
        ))}
      </div>
    </div>
  );
}

export default forwardRef<HTMLDivElement, Props>(GuideCardGroup);
