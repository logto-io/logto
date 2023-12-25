import classNames from 'classnames';
import { Suspense, useCallback } from 'react';

import { type Guide, type GuideMetadata } from '@/assets/docs/guides/types';
import Button from '@/ds-components/Button';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './index.module.scss';

export type SelectedGuide = {
  id: Guide['id'];
  target: GuideMetadata['target'];
  name: GuideMetadata['name'];
};

type Props = {
  data: Guide;
  onClick: (data: SelectedGuide) => void;
  hasBorder?: boolean;
  hasButton?: boolean;
};

function GuideCard({ data, onClick, hasBorder, hasButton }: Props) {
  const {
    id,
    Logo,
    metadata: { target, name, description },
  } = data;

  const buttonText = target === 'API' ? 'guide.get_started' : 'guide.start_building';

  const handleClick = useCallback(() => {
    onClick({ id, target, name });
  }, [id, name, target, onClick]);

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
          <Logo className={styles.logo} />
        </Suspense>
        <div className={styles.infoWrapper}>
          <div className={styles.flexRow}>
            <div className={styles.name}>{name}</div>
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
