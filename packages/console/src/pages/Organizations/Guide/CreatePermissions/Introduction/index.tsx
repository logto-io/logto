import { useTranslation } from 'react-i18next';

import Diagram from './Diagram';
import * as styles from './index.module.scss';

function Introduction() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.organizations.guide' });

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <div className={styles.title}>{t('introduction.section_1.title')}</div>
        <div className={styles.description}>{t('introduction.section_1.description')}</div>
      </div>
      <div className={styles.title}>{t('introduction.section_2.title')}</div>
      <div className={styles.section}>
        <div className={styles.subtitle}>{t('organization_permissions')}</div>
        <div className={styles.description}>
          {t('introduction.section_2.organization_permission_description')}
        </div>
        <div className={styles.panel}>
          <div className={styles.header}>{t('organization_permissions')}</div>
          <div className={styles.body}>
            <div className={styles.cell}>
              <div className={styles.cellTitle}>{t('read_resource')}</div>
            </div>
            <div className={styles.cell}>
              <div className={styles.cellTitle}>{t('edit_resource')}</div>
            </div>
            <div className={styles.cell}>
              <div className={styles.cellTitle}>{t('delete_resource')}</div>
            </div>
            <div className={styles.cell}>
              <div className={styles.cellTitle}>{t('ellipsis')}</div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.section}>
        <div className={styles.subtitle}>{t('organization_roles')}</div>
        <div className={styles.description}>
          {t('introduction.section_2.organization_role_description')}
        </div>
        <div className={styles.panel}>
          <div className={styles.header}>{t('organization_roles')}</div>
          <div className={styles.body}>
            <div className={styles.cell}>
              <div className={styles.cellTitle}>{t('admin')}</div>
              <div className={styles.items}>
                <div>{t('read_resource')}</div>
                <div>{t('edit_resource')}</div>
                <div>{t('delete_resource')}</div>
              </div>
            </div>
            <div className={styles.cell}>
              <div className={styles.cellTitle}>{t('member')}</div>
              <div className={styles.items}>
                <div>{t('read_resource')}</div>
                <div>{t('edit_resource')}</div>
              </div>
            </div>
            <div className={styles.cell}>
              <div className={styles.cellTitle}>{t('guest')}</div>
              <div className={styles.items}>
                <div>{t('read_resource')}</div>
              </div>
            </div>
            <div className={styles.cell}>
              <div className={styles.cellTitle}>{t('ellipsis')}</div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.section}>
        <div className={styles.title}>{t('introduction.section_3.title')}</div>
        <div className={styles.description}>{t('introduction.section_3.description')}</div>
        <Diagram />
      </div>
    </div>
  );
}

export default Introduction;
