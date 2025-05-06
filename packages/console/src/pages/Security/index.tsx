import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import PageMeta from '@/components/PageMeta';
import { isDevFeaturesEnabled } from '@/consts/env';
import { security } from '@/consts/external-links';
import CardTitle from '@/ds-components/CardTitle';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import pageLayout from '@/scss/page-layout.module.scss';

import Blocklist from './Blocklist';
import Captcha from './Captcha';
import General from './General';
import PasswordPolicy from './PasswordPolicy';
import styles from './index.module.scss';
import { SecurityTabs } from './types';

type Props = {
  readonly tab: SecurityTabs;
};

function Security({ tab }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={classNames(pageLayout.container, styles.noPaddingBottom)}>
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
          href={`/security/${SecurityTabs.PasswordPolicy}`}
          isActive={tab === SecurityTabs.PasswordPolicy}
        >
          {t('security.tabs.password_policy')}
        </TabNavItem>
        <TabNavItem
          href={`/security/${SecurityTabs.Captcha}`}
          isActive={tab === SecurityTabs.Captcha}
        >
          {t('security.tabs.captcha')}
        </TabNavItem>
        {/** TODO: @simeng remove dev feature guard */}
        {isDevFeaturesEnabled && (
          <TabNavItem
            href={`/security/${SecurityTabs.Blocklist}`}
            isActive={tab === SecurityTabs.Blocklist}
          >
            {t('security.tabs.blocklist')}
          </TabNavItem>
        )}
        <TabNavItem
          href={`/security/${SecurityTabs.General}`}
          isActive={tab === SecurityTabs.General}
        >
          {t('security.tabs.general')}
        </TabNavItem>
      </TabNav>
      {tab === SecurityTabs.Captcha && <Captcha />}
      {tab === SecurityTabs.PasswordPolicy && <PasswordPolicy />}
      {tab === SecurityTabs.General && <General />}
      {/** TODO: @simeng remove dev feature guard */}
      {isDevFeaturesEnabled && tab === SecurityTabs.Blocklist && <Blocklist />}
    </div>
  );
}

export default Security;
