import classNames from 'classnames';
import { Suspense } from 'react';

import { type Guide, type GuideMetadata } from '@/assets/docs/guides/types';
import Button from '@/ds-components/Button';

import * as styles from './index.module.scss';

export type SelectedGuide = {
  target: GuideMetadata['target'];
  id: Guide['id'];
};

type Props = {
  data: Guide;
  onClick: (data: SelectedGuide) => void;
  hasBorder?: boolean;
};

function LogoSkeleton() {
  return <div className={styles.logoSkeleton} />;
}

function GuideCard({ data, onClick, hasBorder }: Props) {
  const {
    id,
    Logo,
    metadata: { target, name, description },
  } = data;

  return (
    <div className={classNames(styles.card, hasBorder && styles.hasBorder)}>
      <div className={styles.header}>
        <Suspense fallback={<LogoSkeleton />}>
          <Logo className={styles.logo} />
        </Suspense>
        <div className={styles.infoWrapper}>
          <div className={styles.name}>{name}</div>
          <div className={styles.description}>{description}</div>
        </div>
      </div>
      <Button
        title="applications.guide.start_building"
        size="small"
        onClick={() => {
          onClick({ target, id });
        }}
      />
    </div>
  );
}

export default GuideCard;
