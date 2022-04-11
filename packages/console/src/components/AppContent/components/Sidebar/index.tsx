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
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.tab_sections',
  });
  const location = useLocation();

  return (
    <div className={styles.sidebar}>
      {sections.map(({ title, items }) => (
        <Section key={title} title={t(title)}>
          {items.map(({ title, Icon, modal }) => (
            <Item
              key={title}
              titleKey={title}
              icon={<Icon />}
              isActive={location.pathname.startsWith(getPath(title))}
              modal={modal}
            />
          ))}
        </Section>
      ))}
      <div className={styles.spacer} />
      <Item titleKey="settings" icon={<Gear />} />
    </div>
  );
};

export default Sidebar;

export * from './consts';
export * from './utils';
