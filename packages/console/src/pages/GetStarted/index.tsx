import { withAppInsights } from '@logto/app-insights/react';
import { Theme, type Application } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CheckPreviewDark from '@/assets/icons/check-demo-dark.svg';
import CheckPreview from '@/assets/icons/check-demo.svg';
import CreateRoleDark from '@/assets/icons/create-role-dark.svg';
import CreateRole from '@/assets/icons/create-role.svg';
import SocialDark from '@/assets/icons/social-dark.svg';
import Social from '@/assets/icons/social.svg';
import PageMeta from '@/components/PageMeta';
import { ConnectorsTabs } from '@/consts';
import { AppDataContext } from '@/contexts/AppDataProvider';
import { LinkButton } from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import Spacer from '@/ds-components/Spacer';
import TextLink from '@/ds-components/TextLink';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useTheme from '@/hooks/use-theme';

import CreateForm from '../Applications/components/CreateForm';
import GuideCard, { type SelectedGuide } from '../Applications/components/GuideCard';
import useAppGuideMetadata from '../Applications/components/GuideLibrary/hook';

import FreePlanNotification from './FreePlanNotification';
import * as styles from './index.module.scss';

const icons = {
  [Theme.Light]: { PreviewIcon: CheckPreview, SocialIcon: Social, RbacIcon: CreateRole },
  [Theme.Dark]: { PreviewIcon: CheckPreviewDark, SocialIcon: SocialDark, RbacIcon: CreateRoleDark },
};

function GetStarted() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();
  const { tenantEndpoint } = useContext(AppDataContext);
  const [selectedGuide, setSelectedGuide] = useState<SelectedGuide>();
  const [_, getStructuredMetadata] = useAppGuideMetadata();
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const theme = useTheme();
  const { PreviewIcon, SocialIcon, RbacIcon } = icons[theme];

  /**
   * Only need 4 featured guides at most, since by design in get-started page we need to show
   * a few most popular SDK guides, and 4 makes it easy to have a 4 x 1 or 2 x 2 card layout.
   */
  const featuredAppGuides = useMemo(
    () => getStructuredMetadata().featured.slice(0, 4),
    [getStructuredMetadata]
  );

  const onClickGuide = useCallback((data: SelectedGuide) => {
    setShowCreateForm(true);
    setSelectedGuide(data);
  }, []);

  const onCloseCreateForm = useCallback(
    (newApp?: Application) => {
      if (newApp && selectedGuide) {
        navigate(`/applications/${newApp.id}/guide/${selectedGuide.id}`, { replace: true });
        return;
      }
      setShowCreateForm(false);
      setSelectedGuide(undefined);
    },
    [navigate, selectedGuide]
  );

  return (
    <div className={styles.container}>
      <PageMeta titleKey="get_started.page_title" />
      <div className={styles.header}>
        <div className={styles.title}>{t('get_started.title')}</div>
        <div className={styles.subtitle}>{t('get_started.subtitle')}</div>
      </div>
      <FreePlanNotification />
      <Card className={styles.card}>
        <div className={styles.title}>{t('get_started.develop.title')}</div>
        <div className={styles.grid}>
          {featuredAppGuides.map((guide) => (
            <GuideCard key={guide.id} hasBorder data={guide} onClick={onClickGuide} />
          ))}
          {selectedGuide?.target !== 'API' && showCreateForm && (
            <CreateForm
              defaultCreateType={selectedGuide?.target}
              defaultCreateFrameworkName={selectedGuide?.name}
              onClose={onCloseCreateForm}
            />
          )}
        </div>
        <TextLink to="/applications/create">{t('get_started.view_all')}</TextLink>
      </Card>
      <Card className={styles.card}>
        <div className={styles.borderBox}>
          <div className={styles.rowWrapper}>
            <div className={styles.icon}>
              <PreviewIcon />
            </div>
            <div className={styles.columnWrapper}>
              <div className={styles.title}>{t('get_started.customize.preview.title')}</div>
              <div className={styles.subtitle}>{t('get_started.customize.preview.subtitle')}</div>
            </div>
          </div>
          <Spacer />
          <div className={classNames(styles.rowWrapper, styles.buttons)}>
            <LinkButton
              title="get_started.customize.continue_customizing"
              href="/sign-in-experience"
            />
            <LinkButton
              title="get_started.customize.try_now"
              href={new URL('/demo-app', tenantEndpoint).href}
              target="_blank"
            />
          </div>
        </div>
        <div className={styles.borderBox}>
          <div className={styles.rowWrapper}>
            <div className={styles.icon}>
              <SocialIcon />
            </div>
            <div className={styles.columnWrapper}>
              <div className={styles.title}>{t('get_started.customize.connector.title')}</div>
              <div className={styles.subtitle}>{t('get_started.customize.connector.subtitle')}</div>
            </div>
          </div>
          <Spacer />
          <LinkButton
            title="get_started.customize.add_more"
            href={`/connectors/${ConnectorsTabs.Social}`}
          />
        </div>
      </Card>
      <Card className={styles.card}>
        <div className={styles.borderBox}>
          <div className={styles.rowWrapper}>
            <div className={styles.icon}>
              <RbacIcon />
            </div>
            <div className={styles.columnWrapper}>
              <div className={styles.title}>{t('get_started.manage.rbac.title')}</div>
              <div className={styles.subtitle}>{t('get_started.manage.rbac.subtitle')}</div>
            </div>
          </div>
          <Spacer />
          <LinkButton title="get_started.manage.create_roles" href="/roles" />
        </div>
      </Card>
    </div>
  );
}

export default withAppInsights(GetStarted);
