import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import { useAccountLayout } from '@ac/Providers/AccountLayoutContext';
import { layoutClassNames } from '@ac/constants/layout';

import styles from '../../pages/Home/index.module.scss';

type Props = {
  readonly titleKey: string;
  readonly descriptionKey: string;
};

const AccountPageHeader = ({ titleKey, descriptionKey }: Props) => {
  const { t } = useTranslation();
  const { showsMobileTabNav } = useAccountLayout();

  if (showsMobileTabNav) {
    return null;
  }

  return (
    <div className={styles.header}>
      <div className={classNames(styles.title, layoutClassNames.pageTitle)}>{t(titleKey)}</div>
      <div className={classNames(styles.description, layoutClassNames.pageDescription)}>
        {t(descriptionKey)}
      </div>
    </div>
  );
};

export default AccountPageHeader;
