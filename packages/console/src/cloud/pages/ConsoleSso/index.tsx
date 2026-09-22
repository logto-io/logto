import PageMeta from '@/components/PageMeta';
import Topbar from '@/components/Topbar';
import AppBoundary from '@/containers/AppBoundary';
import CardTitle from '@/ds-components/CardTitle';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';

import styles from './index.module.scss';

function ConsoleSso() {
  return (
    <AppBoundary>
      <div className={styles.pageContainer}>
        <PageMeta titleKey="cloud.console_sso.title" />
        <Topbar hideTenantSelector hideTitle />
        <OverlayScrollbar className={styles.scrollable}>
          <div className={styles.wrapper}>
            <CardTitle title="cloud.console_sso.title" subtitle="cloud.console_sso.description" />
          </div>
        </OverlayScrollbar>
      </div>
    </AppBoundary>
  );
}

export default ConsoleSso;
