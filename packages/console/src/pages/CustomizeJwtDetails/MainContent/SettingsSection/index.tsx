import classNames from 'classnames';
import { useState } from 'react';

import BookIcon from '@/assets/icons/book.svg?react';
import FlaskIcon from '@/assets/icons/conical-flask.svg?react';
import ErrorHandlingIcon from '@/assets/icons/error-handling.svg?react';
import { isDevFeaturesEnabled } from '@/consts/env';
import Button from '@/ds-components/Button';

import InstructionTab, { InstructionTabSection } from './InstructionTab';
import TestTab from './TestTab';
import styles from './index.module.scss';

enum Tab {
  DataSource = 'data_source_tab',
  ErrorHandling = 'error_handling_tab',
  Test = 'test_tab',
}

function SettingsSection() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DataSource);
  const tabs = [
    Tab.DataSource,
    Tab.Test,
    ...(isDevFeaturesEnabled ? [Tab.ErrorHandling] : []),
  ] as const;

  const tabIcons = {
    [Tab.DataSource]: <BookIcon />,
    [Tab.ErrorHandling]: <ErrorHandlingIcon />,
    [Tab.Test]: <FlaskIcon />,
  };

  return (
    <div className={styles.flexColumn}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <Button
            key={tab}
            type="primary"
            icon={tabIcons[tab]}
            title={`jwt_claims.${tab}`}
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
      {isDevFeaturesEnabled && (
        <InstructionTab
          isActive={activeTab === Tab.ErrorHandling}
          section={InstructionTabSection.ErrorHandling}
        />
      )}
    </div>
  );
}

export default SettingsSection;
