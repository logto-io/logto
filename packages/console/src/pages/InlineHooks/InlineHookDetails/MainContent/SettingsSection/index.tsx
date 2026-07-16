import classNames from 'classnames';
import { useState } from 'react';

import BookIcon from '@/assets/icons/book.svg?react';
import FlaskIcon from '@/assets/icons/conical-flask.svg?react';
import ErrorHandlingIcon from '@/assets/icons/error-handling.svg?react';
import Button from '@/ds-components/Button';

import InstructionTab, { InstructionTabSection } from './InstructionTab';
import TestTab from './TestTab';
import styles from './index.module.scss';

enum Tab {
  DataSource = 'data_source_tab',
  Test = 'test_tab',
  Settings = 'settings_tab',
}

function SettingsSection() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DataSource);
  const tabs = [Tab.DataSource, Tab.Test, Tab.Settings] as const;

  const tabIcons = {
    [Tab.DataSource]: <BookIcon />,
    [Tab.Test]: <FlaskIcon />,
    [Tab.Settings]: <ErrorHandlingIcon />,
  };

  return (
    <div className={styles.flexColumn}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <Button
            key={tab}
            type="primary"
            icon={tabIcons[tab]}
            title={`inline_hooks.${tab}`}
            className={classNames(styles.tab, activeTab === tab && styles.active)}
            onClick={() => {
              setActiveTab(tab);
            }}
          />
        ))}
      </div>
      <InstructionTab
        isActive={activeTab === Tab.DataSource}
        section={InstructionTabSection.DataSource}
      />
      <TestTab isActive={activeTab === Tab.Test} />
      <InstructionTab
        isActive={activeTab === Tab.Settings}
        section={InstructionTabSection.Settings}
      />
    </div>
  );
}

export default SettingsSection;
