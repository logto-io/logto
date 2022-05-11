import classNames from 'classnames';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import icon from '@/assets/images/tada.svg';
import Dropdown, { DropdownItem } from '@/components/Dropdown';
import Index from '@/components/Index';
import useConfigs from '@/hooks/use-configs';

import useGetStartedMetadata from '../../hook';
import * as styles from './index.module.scss';

const GetStartedProgress = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { configs } = useConfigs();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [showDropDown, setShowDropdown] = useState(false);
  const { data, completedCount, totalCount } = useGetStartedMetadata();

  if (!configs) {
    return null;
  }

  return (
    <>
      <div
        ref={anchorRef}
        className={classNames(styles.container, showDropDown && styles.active)}
        onClick={() => {
          setShowDropdown(true);
        }}
      >
        <img src={icon} />
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
        isOpen={showDropDown}
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
