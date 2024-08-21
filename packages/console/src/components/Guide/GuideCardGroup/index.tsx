import classNames from 'classnames';
import { type Ref, forwardRef, useContext } from 'react';

import { type Guide } from '@/assets/docs/guides/types';
import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';

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

function GuideCardGroup(
  { className, categoryName, guides, hasCardBorder, hasCardButton, onClickGuide }: Props,
  ref: Ref<HTMLDivElement>
) {
  const { isDevTenant } = useContext(TenantsContext);
  const { currentSubscriptionQuota } = useContext(SubscriptionDataContext);

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
            hasPaywall={
              isCloud &&
              guide.metadata.isThirdParty &&
              (currentSubscriptionQuota.thirdPartyApplicationsLimit === 0 || isDevTenant)
            }
            onClick={onClickGuide}
          />
        ))}
      </div>
    </div>
  );
}

export default forwardRef<HTMLDivElement, Props>(GuideCardGroup);
