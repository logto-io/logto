import { ReservedPlanId, Theme } from '@logto/schemas';
import classNames from 'classnames';
import { Suspense, useCallback, useContext } from 'react';

import { type Guide, type GuideMetadata } from '@/assets/docs/guides/types';
import FeatureTag, { BetaTag } from '@/components/FeatureTag';
import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import useTheme from '@/hooks/use-theme';
import { onKeyDownHandler } from '@/utils/a11y';

import styles from './index.module.scss';

export type SelectedGuide = {
  id: Guide['id'];
  target: GuideMetadata['target'];
  name: GuideMetadata['name'];
  isThirdParty: GuideMetadata['isThirdParty'];
};

type Props = {
  readonly data: Guide;
  readonly onClick: (data: SelectedGuide) => void;
  readonly hasBorder?: boolean;
  readonly hasButton?: boolean;
};

function GuideCard({ data, onClick, hasBorder, hasButton }: Props) {
  const {
    id,
    Logo,
    DarkLogo,
    metadata: { target, name, description, isThirdParty },
  } = data;

  const buttonText = target === 'API' ? 'guide.get_started' : 'guide.start_building';
  const { currentPlan } = useContext(SubscriptionDataContext);
  const theme = useTheme();

  const showPaywallTag = isCloud && isThirdParty;
  const showBetaTag = isCloud && isThirdParty;

  const handleClick = useCallback(() => {
    onClick({ id, target, name, isThirdParty });
  }, [onClick, id, target, name, isThirdParty]);

  return (
    <div
      className={classNames(
        styles.card,
        hasBorder && styles.hasBorder,
        hasButton && styles.hasButton
      )}
      {...(!hasButton && {
        tabIndex: 0,
        role: 'button',
        onKeyDown: onKeyDownHandler(handleClick),
        onClick: handleClick,
      })}
    >
      <div className={styles.header}>
        <Suspense fallback={<div className={styles.logoSkeleton} />}>
          <div className={styles.logo}>
            {theme === Theme.Dark && DarkLogo ? <DarkLogo /> : <Logo />}
          </div>
        </Suspense>
        <div className={styles.infoWrapper}>
          <div className={styles.flexRow}>
            <div className={styles.name}>{name}</div>
            {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
            {showPaywallTag || showBetaTag ? (
              <div className={styles.tagWrapper}>
                {showPaywallTag && (
                  <FeatureTag
                    isVisible={currentPlan.quota.thirdPartyApplicationsLimit === 0}
                    plan={ReservedPlanId.Pro}
                  />
                )}
                {showBetaTag && <BetaTag />}
              </div>
            ) : null}
          </div>
          <div className={styles.description} title={description}>
            {description}
          </div>
        </div>
      </div>
      {hasButton && <Button title={buttonText} size="small" onClick={handleClick} />}
    </div>
  );
}

export default GuideCard;
