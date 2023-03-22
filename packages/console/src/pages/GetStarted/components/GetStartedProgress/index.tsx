import { Theme } from '@logto/schemas';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import TadaDark from '@/assets/images/tada-dark.svg';
import Tada from '@/assets/images/tada.svg';
import Dropdown, { DropdownItem } from '@/components/Dropdown';
import Index from '@/components/Index';
import useTheme from '@/hooks/use-theme';
import useUserPreferences from '@/hooks/use-user-preferences';
import { onKeyDownHandler } from '@/utils/a11y';

import useGetStartedMetadata from '../../hook';
import * as styles from './index.module.scss';

function GetStartedProgress() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    data: { getStartedHidden },
  } = useUserPreferences();
  const theme = useTheme();
  const Icon = theme === Theme.Light ? Tada : TadaDark;
  const anchorRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const { data, completedCount, totalCount } = useGetStartedMetadata();

  if (getStartedHidden) {
    return null;
  }

  const showDropDown = () => {
    setShowDropdown(true);
  };

  const hideDropDown = () => {
    setShowDropdown(false);
  };

  return (
    <>
      <div
        ref={anchorRef}
        role="button"
        tabIndex={0}
        className={classNames(styles.progress, showDropdown && styles.active)}
        onKeyDown={onKeyDownHandler({
          Esc: hideDropDown,
          Enter: showDropDown,
          ' ': showDropDown,
        })}
        onClick={showDropDown}
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
        onClose={hideDropDown}
      >
        <div className={styles.dropdownItemWrapper}>
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
        </div>
      </Dropdown>
    </>
  );
}

export default GetStartedProgress;
