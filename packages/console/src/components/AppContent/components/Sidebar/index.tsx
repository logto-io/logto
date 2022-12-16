import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { PagePath } from '@/consts/pathnames';

import Item from './components/Item';
import Section from './components/Section';
import { useSidebarMenuItems } from './hook';
import Gear from './icons/Gear';
import * as styles from './index.module.scss';

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
            ({ title, Icon, isHidden, modal, externalLink, pagePath }) =>
              !isHidden && (
                <Item
                  key={title}
                  titleKey={title}
                  icon={<Icon />}
                  isActive={pagePath && location.pathname.startsWith(`/${pagePath}`)}
                  modal={modal}
                  externalLink={externalLink}
                  pagePath={pagePath}
                />
              )
          )}
        </Section>
      ))}
      <div className={styles.spacer} />
      <Item
        titleKey="settings"
        icon={<Gear />}
        isActive={location.pathname.startsWith(`/${PagePath.Settings}`)}
        pagePath={PagePath.Settings}
      />
    </div>
  );
};

export default Sidebar;
