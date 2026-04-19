import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import PageFooter from '@ac/components/PageFooter';
import { layoutClassNames } from '@ac/constants/layout';

import styles from '../Home/index.module.scss';

const Profile = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={classNames(styles.title, layoutClassNames.pageTitle)}>
          {t('account_center.page.profile_title')}
        </div>
        <div className={classNames(styles.description, layoutClassNames.pageDescription)}>
          {t('account_center.page.profile_description')}
        </div>
      </div>
      <div className={classNames(styles.content, layoutClassNames.pageContent)} />
      <PageFooter />
    </div>
  );
};

export default Profile;
