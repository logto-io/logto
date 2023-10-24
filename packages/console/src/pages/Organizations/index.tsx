import { joinPath } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import CardTitle from '@/ds-components/CardTitle';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import * as pageLayout from '@/scss/page-layout.module.scss';

import Settings from './Settings';
import * as styles from './index.module.scss';

const pathnames = Object.freeze({
  organizations: 'organizations',
  settings: 'settings',
});

function Organizations() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { tab } = useParams();

  return (
    <div className={pageLayout.container}>
      <div className={pageLayout.headline}>
        <CardTitle title="organizations.title" subtitle="organizations.subtitle" />
      </div>
      <TabNav className={styles.tabs}>
        <TabNavItem href={joinPath('..', pathnames.organizations)} isActive={!tab}>
          {t('organizations.title')}
        </TabNavItem>
        <TabNavItem href={pathnames.settings} isActive={tab === pathnames.settings}>
          {t('general.settings_nav')}
        </TabNavItem>
      </TabNav>
      {!tab && <>Not found</>}
      {tab === pathnames.settings && <Settings />}
    </div>
  );
}

export default Organizations;
