import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import type { ReactNode } from 'react';

import type { PreviewPlatform } from '@/components/SignInExperiencePreview/types';
import DynamicT from '@/ds-components/DynamicT';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './PlatformTab.module.scss';

type Props = {
  isSelected: boolean;
  icon: ReactNode;
  title: AdminConsoleKey;
  tab: PreviewPlatform;
  onClick: (tab: PreviewPlatform) => void;
};

function PlatformTab({ isSelected, icon, title, tab, onClick }: Props) {
  return (
    <div
      role="tab"
      tabIndex={0}
      className={classNames(styles.tab, isSelected && styles.selected)}
      onClick={() => {
        onClick(tab);
      }}
      onKeyDown={onKeyDownHandler(() => {
        onClick(tab);
      })}
    >
      <span className={styles.icon}>{icon}</span>
      <DynamicT forKey={title} />
    </div>
  );
}

export default PlatformTab;
