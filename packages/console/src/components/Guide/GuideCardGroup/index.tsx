import { ApplicationType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { type Ref, forwardRef, useContext } from 'react';

import { type GuideMetadata, type Guide } from '@/assets/docs/guides/types';
import { type SubscriptionQuota } from '@/cloud/types/router';
import { CombinedAddOnAndFeatureTag } from '@/components/FeatureTag';
import { latestProPlanId } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { isPaidPlan } from '@/utils/subscription';

import GuideCard, { type SelectedGuide } from '../GuideCard';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly categoryName?: string;
  readonly categoryDescription?: React.ReactNode;
  readonly guides?: readonly Guide[];
  readonly hasCardBorder?: boolean;
  readonly hasCardButton?: boolean;
  readonly onClickGuide: (data: SelectedGuide) => void;
};

function getPaywallTag(
  guideMetadata: GuideMetadata,
  currentSubscriptionQuota: SubscriptionQuota,
  isPaidPlan: boolean,
  isEnterprisePlan: boolean
) {
  if (guideMetadata.isThirdParty) {
    return (
      <CombinedAddOnAndFeatureTag
        hasAddOnTag={isPaidPlan && currentSubscriptionQuota.thirdPartyApplicationsLimit !== null}
        paywall={conditional(!isPaidPlan && latestProPlanId)}
      />
    );
  }

  if (guideMetadata.target === ApplicationType.SAML) {
    return (
      <CombinedAddOnAndFeatureTag
        hasAddOnTag={isPaidPlan}
        paywall={conditional(!isPaidPlan && latestProPlanId)}
      />
    );
  }
}

function GuideCardGroup(
  {
    className,
    categoryName,
    categoryDescription,
    guides,
    hasCardBorder,
    hasCardButton,
    onClickGuide,
  }: Props,
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
      {categoryDescription && <div className={styles.description}>{categoryDescription}</div>}
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
