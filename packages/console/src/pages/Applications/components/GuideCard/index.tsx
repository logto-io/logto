import classNames from 'classnames';
import { Suspense } from 'react';

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
  isCompact?: boolean;
};

function LogoSkeleton() {
  return <div className={styles.logoSkeleton} />;
}

function GuideCard({ data, onClick, hasBorder, isCompact }: Props) {
  const {
    id,
    Logo,
    metadata: { target, name, description },
  } = data;

  const onClickCard = () => {
    if (!isCompact) {
      return;
    }

    onClick({ id, target, name });
  };

  return (
    <div
      className={classNames(
        styles.card,
        hasBorder && styles.hasBorder,
        isCompact && styles.compact
      )}
      {...(isCompact && {
        tabIndex: 0,
        role: 'button',
        onKeyDown: onKeyDownHandler(onClickCard),
        onClick: onClickCard,
      })}
    >
      <div className={styles.header}>
        <Suspense fallback={<LogoSkeleton />}>
          <Logo className={styles.logo} />
        </Suspense>
        <div className={styles.infoWrapper}>
          <div className={styles.name}>{name}</div>
          <div className={styles.description}>{description}</div>
        </div>
      </div>
      {!isCompact && (
        <Button
          title="applications.guide.start_building"
          size="small"
          onClick={() => {
            onClick({ id, target, name });
          }}
        />
      )}
    </div>
  );
}

export default GuideCard;
