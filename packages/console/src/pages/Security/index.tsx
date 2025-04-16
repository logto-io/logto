import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import PageMeta from '@/components/PageMeta';
import { isDevFeaturesEnabled } from '@/consts/env';
import { security } from '@/consts/external-links';
import CardTitle from '@/ds-components/CardTitle';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import pageLayout from '@/scss/page-layout.module.scss';

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
        {isDevFeaturesEnabled && (
          <TabNavItem
            href={`/security/${SecurityTabs.PasswordPolicy}`}
            isActive={tab === SecurityTabs.PasswordPolicy}
          >
            {t('security.tabs.password_policy')}
          </TabNavItem>
        )}
        <TabNavItem
          href={`/security/${SecurityTabs.Captcha}`}
          isActive={tab === SecurityTabs.Captcha}
        >
          {t('security.tabs.captcha')}
        </TabNavItem>
        {isDevFeaturesEnabled && (
          <TabNavItem
            href={`/security/${SecurityTabs.General}`}
            isActive={tab === SecurityTabs.General}
          >
            {t('security.tabs.general')}
          </TabNavItem>
        )}
      </TabNav>
      {tab === SecurityTabs.Captcha && <Captcha />}
      {/** TODO: Remove the dev feature guard */}
      {tab === SecurityTabs.PasswordPolicy && isDevFeaturesEnabled && <PasswordPolicy />}
      {tab === SecurityTabs.General && isDevFeaturesEnabled && <General />}
    </div>
  );
}

export default Security;
