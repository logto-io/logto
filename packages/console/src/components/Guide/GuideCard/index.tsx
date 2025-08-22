import { Theme } from '@logto/schemas';
import classNames from 'classnames';
import { type ReactNode, Suspense, useCallback, useContext } from 'react';

import { type Guide, type GuideMetadata } from '@/assets/docs/guides/types';
import { BetaTag } from '@/components/FeatureTag';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import useTheme from '@/hooks/use-theme';
import { onKeyDownHandler } from '@/utils/a11y';

import styles from './index.module.scss';

export type SelectedGuide = {
  id: Guide['id'];
  metadata: GuideMetadata;
};

type Props = {
  readonly data: Guide;
  readonly onClick: (data: SelectedGuide) => void;
  readonly hasBorder?: boolean;
  readonly hasButton?: boolean;
  readonly paywallTag?: ReactNode;
  readonly isBeta?: boolean;
};

function GuideCard({ data, onClick, hasBorder, hasButton, paywallTag, isBeta }: Props) {
  const { id, Logo, DarkLogo, metadata } = data;
  const {
    currentSubscription: { isEnterprisePlan },
  } = useContext(SubscriptionDataContext);

  const { target, name, description } = metadata;
  const buttonText = target === 'API' ? 'guide.get_started' : 'guide.start_building';
  const theme = useTheme();
  const hasTags = Boolean(paywallTag) || Boolean(isBeta);

  const handleClick = useCallback(() => {
    onClick({ id, metadata });
  }, [onClick, id, metadata]);

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
            {hasTags && (
              <div className={styles.tagWrapper}>
                {paywallTag}
                {isBeta && <BetaTag />}
              </div>
            )}
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
