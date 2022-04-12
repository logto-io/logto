import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import TabNav, { TabNavLink } from '@/components/TabNav';
import * as detailsStyles from '@/scss/details.module.scss';

import * as styles from './index.module.scss';

const SignInExperience = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.wrapper}>
      <Card className={classNames(detailsStyles.container, styles.setup)}>
        <CardTitle title="sign_in_exp.title" subtitle="sign_in_exp.description" />
        <TabNav className={styles.tabs}>
          <TabNavLink href="/sign-in-experience/experience">
            {t('sign_in_exp.tabs.experience')}
          </TabNavLink>
          <TabNavLink href="/sign-in-experience/methods">
            {t('sign_in_exp.tabs.methods')}
          </TabNavLink>
          <TabNavLink href="/sign-in-experience/others">{t('sign_in_exp.tabs.others')}</TabNavLink>
        </TabNav>
        <div>TODO</div>
        <div className={detailsStyles.footer}>
          <Button type="primary" title="general.save_changes" />
        </div>
      </Card>
      <Card className={styles.preview}>TODO</Card>
    </div>
  );
};

export default SignInExperience;
