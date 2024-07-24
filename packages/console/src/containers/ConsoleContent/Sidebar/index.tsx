import { useTranslation } from 'react-i18next';

import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import useMatchTenantPath from '@/hooks/use-tenant-pathname';

import Item from './components/Item';
import Section from './components/Section';
import { useSidebarMenuItems } from './hook';
import styles from './index.module.scss';
import { getPath } from './utils';

export function Skeleton() {
  return <div className={styles.skeleton} />;
}

function Sidebar() {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.tab_sections',
  });
  const { sections } = useSidebarMenuItems();
  const { match } = useMatchTenantPath();

  return (
    <OverlayScrollbar className={styles.sidebar}>
      {sections.map(({ title, items }) => (
        <Section key={title} title={t(title)}>
          {items.map(
            ({ title, Icon, isHidden, modal, externalLink }) =>
              !isHidden && (
                <Item
                  key={title}
                  titleKey={title}
                  icon={<Icon />}
                  isActive={match('/' + getPath(title))}
                  modal={modal}
                  externalLink={externalLink}
                />
              )
          )}
        </Section>
      ))}
    </OverlayScrollbar>
  );
}

export default Sidebar;

export * from './utils';
