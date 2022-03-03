import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import Item from './components/Item';
import Section from './components/Section';
import { sections } from './consts';
import Gear from './icons/Gear';
import * as styles from './index.module.scss';
import { getPath } from './utils';

const Sidebar = () => {
  const { t: tSection } = useTranslation(undefined, {
    keyPrefix: 'admin_console.tab_sections',
  });
  const { t: tItem } = useTranslation(undefined, {
    keyPrefix: 'admin_console.tabs',
  });
  const location = useLocation();

  return (
    <div className={styles.sidebar}>
      {sections.map(({ title, items }) => (
        <Section key={title} title={tSection(title)}>
          {items.map(({ title, Icon }) => (
            <Item
              key={title}
              title={tItem(title)}
              icon={<Icon />}
              isActive={location.pathname === getPath(title)}
            />
          ))}
        </Section>
      ))}
      <div className={styles.spacer} />
      <Item title={tItem('settings')} icon={<Gear />} />
    </div>
  );
};

export default Sidebar;

export * from './consts';
export * from './utils';
