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

import JohnRelations from './JohnRelations';
import SarahRelations from './SarahRelations';
import FlexBox from './components/FlexBox';
import Panel from './components/Panel';
import Permission from './components/Permission';
import Role from './components/Role';
import Section from './components/Section';
import User from './components/User';
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
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.organizations' });
  const { navigate } = useTenantPathname();
  const theme = useTheme();
  const { OrganizationIcon } = icons[theme];

  return (
    <>
      <OverlayScrollbar className={parentStyles.stepContainer}>
        <div className={classNames(parentStyles.content)}>
          <Card className={parentStyles.card}>
            <OrganizationIcon className={parentStyles.icon} />
            <FlexBox type="column" gap={24}>
              <div className={styles.title}>{t('guide.introduction.title')}</div>
              <FlexBox type="column">
                <div className={styles.sectionTitle}>{t('guide.introduction.section_1.title')}</div>
                <Section
                  title={t('organization_and_member')}
                  description={t('organization_and_member_description')}
                >
                  <Panel label={t('organization')}>
                    <FlexBox gap={20} style={{ justifyContent: 'center' }}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <User key={index} name={t('guide.member')} />
                      ))}
                      <User hasIcon={false} name="......" />
                    </FlexBox>
                  </Panel>
                </Section>
              </FlexBox>
              <FlexBox type="column">
                <div className={styles.sectionTitle}>{t('guide.introduction.section_2.title')}</div>
                <div className={styles.description}>
                  {t('guide.introduction.section_2.description')}
                </div>
                <Section
                  title={t('guide.organization_permissions')}
                  description={t('guide.introduction.section_2.permission_description')}
                >
                  <FlexBox
                    isEquallyDivided
                    gap={20}
                    style={{ padding: '12px 0', justifyContent: 'center' }}
                  >
                    <Permission name="read:resource" />
                    <Permission name="edit:resource" />
                    <Permission name="delete:resource" />
                    <Permission name="......" isMonospace={false} />
                  </FlexBox>
                </Section>
                <Section
                  title={t('guide.organization_roles')}
                  description={t('guide.introduction.section_2.role_description')}
                >
                  <FlexBox gap={20}>
                    <Role
                      label={t('guide.admin')}
                      permissions={['read:resource', 'edit:resource', 'delete:resource']}
                    />
                    <Role
                      label={t('guide.member')}
                      permissions={['read:resource', 'edit:resource']}
                    />
                    <Role label={t('guide.guest')} permissions={['read:resource']} />
                    <Role label="......" />
                  </FlexBox>
                </Section>
              </FlexBox>
              <FlexBox type="column">
                <div className={styles.sectionTitle}>{t('guide.introduction.section_3.title')}</div>
                <div className={styles.description}>
                  {t('guide.introduction.section_3.description')}
                </div>
                <FlexBox type="column" gap={32} style={{ padding: '12px 0' }}>
                  <FlexBox>
                    <User variant="blue" name="John" />
                    <JohnRelations />
                    <Panel
                      className={styles.panel}
                      label={`${t('organization')} A`}
                      size="small"
                      variant="blue"
                    >
                      <FlexBox isEquallyDivided gap={10} style={{ marginBottom: '8px' }}>
                        <Role size="small" label={`${t('role')}: Admin`} />
                        <Role size="small" label={`${t('role')}: Member`} />
                        <Role size="small" label={`${t('role')}: Guest`} />
                        <Role size="small" label="..." />
                      </FlexBox>
                      <User size="small" variant="blue" name="John" />
                    </Panel>
                  </FlexBox>
                  <FlexBox>
                    <User variant="pink" name="Sarah" />
                    <SarahRelations />
                    <Panel
                      className={styles.panel}
                      label={`${t('organization')} B`}
                      size="small"
                      variant="purple"
                    >
                      <FlexBox isEquallyDivided gap={10} style={{ marginBottom: '8px' }}>
                        <Role size="small" label={`${t('role')}: Admin`} />
                        <Role size="small" label={`${t('role')}: Member`} />
                        <Role size="small" label={`${t('role')}: Guest`} />
                        <Role size="small" label="..." />
                      </FlexBox>
                      <FlexBox isEquallyDivided gap={10}>
                        <div>
                          <User variant="pink" name="Sarah" size="small" />
                        </div>
                        <div>
                          <User variant="blue" name="John" size="small" />
                        </div>
                      </FlexBox>
                    </Panel>
                  </FlexBox>
                </FlexBox>
              </FlexBox>
            </FlexBox>
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
