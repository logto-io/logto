import classNames from 'classnames';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import DeleteIcon from '@ac/assets/icons/delete.svg?react';
import { layoutClassNames } from '@ac/constants/layout';

import styles from './index.module.scss';

const DeleteAccountSection = () => {
  const { t } = useTranslation();
  const { accountCenterSettings } = useContext(PageContext);

  const deleteAccountUrl = accountCenterSettings?.deleteAccountUrl;

  if (!deleteAccountUrl) {
    return null;
  }

  return (
    <div className={classNames(styles.section, layoutClassNames.section)}>
      <div className={classNames(styles.sectionTitle, layoutClassNames.sectionTitle)}>
        {t('account_center.security.account_removal')}
      </div>
      <div className={classNames(styles.card, layoutClassNames.card)}>
        <div className={classNames(styles.row, layoutClassNames.row)}>
          <div className={styles.info}>
            <DeleteIcon className={styles.icon} />
            <div className={styles.name}>{t('account_center.security.delete_your_account')}</div>
          </div>
          <a className={styles.actionButton} href={deleteAccountUrl}>
            {t('account_center.security.delete_account')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountSection;
