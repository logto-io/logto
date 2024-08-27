import classNames from 'classnames';
import { useState } from 'react';

import BookIcon from '@/assets/icons/book.svg?react';
import FlaskIcon from '@/assets/icons/conical-flask.svg?react';
import Button from '@/ds-components/Button';

import InstructionTab from './InstructionTab';
import TestTab from './TestTab';
import styles from './index.module.scss';

enum Tab {
  DataSource = 'data_source_tab',
  Test = 'test_tab',
}

function SettingsSection() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DataSource);

  return (
    <div className={styles.flexColumn}>
      <div className={styles.tabs}>
        {Object.values(Tab).map((tab) => (
          <Button
            key={tab}
            type="primary"
            icon={tab === Tab.DataSource ? <BookIcon /> : <FlaskIcon />}
            title={`jwt_claims.${tab}`}
            className={classNames(styles.tab, activeTab === tab && styles.active)}
            onClick={() => {
              setActiveTab(tab);
            }}
          />
        ))}
      </div>
      <InstructionTab isActive={activeTab === Tab.DataSource} />
      <TestTab isActive={activeTab === Tab.Test} />
    </div>
  );
}

export default SettingsSection;
