import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { PreviewPlatform } from '@/components/SignInExperiencePreview/types';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './PlatformTab.module.scss';

type Props = {
  isSelected: boolean;
  icon: ReactNode;
  title: AdminConsoleKey;
  tab: PreviewPlatform;
  onClick: (tab: PreviewPlatform) => void;
};

const PlatformTab = ({ isSelected, icon, title, tab, onClick }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

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
      {t(title)}
    </div>
  );
};

export default PlatformTab;
