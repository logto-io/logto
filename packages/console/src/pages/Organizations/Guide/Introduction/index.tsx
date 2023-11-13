import { Theme } from '@logto/schemas';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import OrganizationFeatureDark from '@/assets/icons/organization-feature-dark.svg';
import OrganizationFeature from '@/assets/icons/organization-feature.svg';
import ActionBar from '@/components/ActionBar';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useTheme from '@/hooks/use-theme';

import { steps } from '../const';
import * as parentStyles from '../index.module.scss';

import Diagram from './Diagram';
import * as styles from './index.module.scss';

const icons = {
  [Theme.Light]: { OrganizationIcon: OrganizationFeature },
  [Theme.Dark]: { OrganizationIcon: OrganizationFeatureDark },
};

type Props = {
  /* True if the guide is in the "Check guide" drawer of organization details page */
  isReadonly?: boolean;
};

function Introduction({ isReadonly }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.organizations.guide' });
  const { navigate } = useTenantPathname();
  const theme = useTheme();
  const { OrganizationIcon } = icons[theme];

  return (
    <>
      <OverlayScrollbar className={parentStyles.stepContainer}>
        <div className={classNames(parentStyles.content)}>
          <Card className={parentStyles.card}>
            <OrganizationIcon className={parentStyles.icon} />
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
          </Card>
        </div>
      </OverlayScrollbar>
      {!isReadonly && (
        <ActionBar step={1} totalSteps={3}>
          <Button
            title="general.next"
            type="primary"
            onClick={() => {
              navigate(`../${steps.permissionsAndRoles}`);
            }}
          />
        </ActionBar>
      )}
    </>
  );
}

export default Introduction;
