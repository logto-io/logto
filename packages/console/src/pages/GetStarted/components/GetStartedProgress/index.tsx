import { AppearanceMode } from '@logto/schemas';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import TadaDark from '@/assets/images/tada-dark.svg';
import Tada from '@/assets/images/tada.svg';
import Dropdown, { DropdownItem } from '@/components/Dropdown';
import Index from '@/components/Index';
import { useTheme } from '@/hooks/use-theme';
import useUserPreferences from '@/hooks/use-user-preferences';

import useGetStartedMetadata from '../../hook';
import * as styles from './index.module.scss';

const GetStartedProgress = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    data: { getStartedHidden },
  } = useUserPreferences();
  const theme = useTheme();
  const Icon = theme === AppearanceMode.LightMode ? Tada : TadaDark;
  const anchorRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const { data, completedCount, totalCount } = useGetStartedMetadata();

  if (getStartedHidden) {
    return null;
  }

  return (
    <>
      <div
        ref={anchorRef}
        className={classNames(styles.container, showDropdown && styles.active)}
        onClick={() => {
          setShowDropdown(true);
        }}
      >
        <Icon className={styles.icon} />
        <span>
          {t('get_started.progress', {
            completed: completedCount,
            total: totalCount,
          })}
        </span>
      </div>
      <Dropdown
        anchorRef={anchorRef}
        className={styles.dropdown}
        isOpen={showDropdown}
        horizontalAlign="end"
        title={t('get_started.progress_dropdown_title')}
        titleClassName={styles.dropdownTitle}
        onClose={() => {
          setShowDropdown(false);
        }}
      >
        {data.map(({ id, title, isComplete, onClick }, index) => (
          <DropdownItem
            key={id}
            className={styles.dropdownItem}
            icon={<Index className={styles.index} index={index + 1} isComplete={isComplete} />}
            onClick={onClick}
          >
            {t(title)}
          </DropdownItem>
        ))}
      </Dropdown>
    </>
  );
};

export default GetStartedProgress;
