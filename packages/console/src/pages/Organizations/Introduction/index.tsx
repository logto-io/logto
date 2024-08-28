import { Theme } from '@logto/schemas';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import OrganizationFeatureDark from '@/assets/icons/organization-feature-dark.svg';
import OrganizationFeature from '@/assets/icons/organization-feature.svg';
import Card from '@/ds-components/Card';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import useTheme from '@/hooks/use-theme';

import FlexBox from './components/FlexBox';
import InteractiveDiagram from './components/InteractiveDiagram';
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

function Introduction() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.organizations' });
  const theme = useTheme();
  const { OrganizationIcon } = icons[theme];

  return (
    <OverlayScrollbar className={styles.stepContainer}>
      <div className={classNames(styles.content)}>
        <Card className={classNames(styles.card)}>
          <OrganizationIcon className={styles.icon} />
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
                <FlexBox isEquallyDivided gap={20}>
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
            </FlexBox>
            <FlexBox type="column">
              <div className={styles.sectionTitle}>{t('guide.introduction.section_4.title')}</div>
              <div className={styles.description}>
                {t('guide.introduction.section_4.description')}
              </div>
              <InteractiveDiagram />
            </FlexBox>
          </FlexBox>
        </Card>
      </div>
    </OverlayScrollbar>
  );
}

export default Introduction;
