import React from 'react';
import { useTranslation } from 'react-i18next';

import Item from './components/Item';
import Section from './components/Section';
import { sections } from './consts';
import * as styles from './index.module.scss';

const Sidebar = () => {
  const { t: tSection } = useTranslation(undefined, {
    keyPrefix: 'admin_console.tab_sections',
  });
  const { t: tItem } = useTranslation(undefined, {
    keyPrefix: 'admin_console.tabs',
  });

  return (
    <div className={styles.sidebar}>
      {sections.map(({ title, items }) => (
        <Section key={title} title={tSection(title)}>
          {items.map(({ title, Icon }) => (
            <Item key={title} title={tItem(title)} icon={<Icon />} />
          ))}
        </Section>
      ))}
    </div>
  );
};

export default Sidebar;
