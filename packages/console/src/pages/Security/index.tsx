import { useTranslation } from 'react-i18next';

import PageMeta from '@/components/PageMeta';
import { security } from '@/consts/external-links';
import CardTitle from '@/ds-components/CardTitle';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import pageLayout from '@/scss/page-layout.module.scss';

import Captcha from './Captcha';
import styles from './index.module.scss';
import { SecurityTabs } from './types';

type Props = {
  readonly tab: SecurityTabs;
};

function Security({ tab }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={pageLayout.container}>
      <PageMeta titleKey="security.page_title" />
      <div className={pageLayout.headline}>
        <CardTitle
          title="security.title"
          subtitle="security.subtitle"
          learnMoreLink={{ href: security }}
        />
      </div>
      <TabNav className={styles.tabs}>
        <TabNavItem
          href={`/security/${SecurityTabs.Captcha}`}
          isActive={tab === SecurityTabs.Captcha}
        >
          {t('security.tabs.captcha')}
        </TabNavItem>
      </TabNav>
      {tab === SecurityTabs.Captcha && <Captcha />}
    </div>
  );
}

export default Security;
