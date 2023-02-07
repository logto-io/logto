import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import Item from './components/Item';
import Section from './components/Section';
import { useSidebarMenuItems } from './hook';
import Gear from './icons/Gear';
import * as styles from './index.module.scss';
import { getPath } from './utils';

const Sidebar = () => {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.tab_sections',
  });
  const location = useLocation();
  const { sections } = useSidebarMenuItems();

  return (
    <div className={styles.sidebar}>
      {sections.map(({ title, items }) => (
        <Section key={title} title={t(title)}>
          {items.map(
            ({ title, Icon, isHidden, modal, externalLink }) =>
              !isHidden && (
                <Item
                  key={title}
                  titleKey={title}
                  icon={<Icon />}
                  isActive={location.pathname.startsWith(getPath(title))}
                  modal={modal}
                  externalLink={externalLink}
                />
              )
          )}
        </Section>
      ))}
      <div className={styles.spacer} />
      <Item
        titleKey="settings"
        icon={<Gear />}
        isActive={location.pathname.startsWith(getPath('settings'))}
      />
    </div>
  );
};

export default Sidebar;

export * from './utils';
