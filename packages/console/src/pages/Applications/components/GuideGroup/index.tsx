import classNames from 'classnames';

import { type Guide } from '@/assets/docs/guides/types';

import GuideCard, { type SelectedGuide } from '../GuideCard';

import * as styles from './index.module.scss';

type GuideGroupProps = {
  className?: string;
  categoryName?: string;
  guides?: readonly Guide[];
  hasCardBorder?: boolean;
  isCompact?: boolean;
  onClickGuide: (data: SelectedGuide) => void;
};

function GuideGroup({
  className,
  categoryName,
  guides,
  hasCardBorder,
  isCompact,
  onClickGuide,
}: GuideGroupProps) {
  if (!guides?.length) {
    return null;
  }

  return (
    <div className={classNames(styles.guideGroup, className)}>
      {categoryName && <label>{categoryName}</label>}
      <div className={styles.grid}>
        {guides.map((guide) => (
          <GuideCard
            key={guide.id}
            isCompact={isCompact}
            hasBorder={hasCardBorder}
            data={guide}
            onClick={onClickGuide}
          />
        ))}
      </div>
    </div>
  );
}

export default GuideGroup;
