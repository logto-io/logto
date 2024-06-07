import { Theme, type Application, type Resource } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CheckPreviewDark from '@/assets/icons/check-demo-dark.svg';
import CheckPreview from '@/assets/icons/check-demo.svg';
import CreateRoleDark from '@/assets/icons/create-role-dark.svg';
import CreateRole from '@/assets/icons/create-role.svg';
import SocialDark from '@/assets/icons/social-dark.svg';
import Social from '@/assets/icons/social.svg';
import ApplicationCreation from '@/components/ApplicationCreation';
import { type SelectedGuide } from '@/components/Guide/GuideCard';
import GuideCardGroup from '@/components/Guide/GuideCardGroup';
import { useApiGuideMetadata, useAppGuideMetadata } from '@/components/Guide/hooks';
import PageMeta from '@/components/PageMeta';
import { ConnectorsTabs } from '@/consts';
import { isCloud } from '@/consts/env';
import { AppDataContext } from '@/contexts/AppDataProvider';
import { LinkButton } from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import Spacer from '@/ds-components/Spacer';
import TextLink from '@/ds-components/TextLink';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useTheme from '@/hooks/use-theme';
import useWindowResize from '@/hooks/use-window-resize';

import CreateApiForm from '../ApiResources/components/CreateForm';

import ProtectedAppCreationForm from './ProtectedAppCreationForm';
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
  const { getStructuredAppGuideMetadata } = useAppGuideMetadata();
  const apiGuideMetadata = useApiGuideMetadata();
  const [showCreateAppForm, setShowCreateAppForm] = useState<boolean>(false);
  const [showCreateApiForm, setShowCreateApiForm] = useState<boolean>(false);
  // The number of visible guide cards to show in one row per the current screen width
  const [visibleCardCount, setVisibleCardCount] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const { PreviewIcon, SocialIcon, RbacIcon } = icons[theme];

  useWindowResize(() => {
    const containerWidth = containerRef.current?.clientWidth ?? 0;

    // Responsive breakpoints (1080, 680px) are defined in `GuideCardGroup` component SCSS,
    // and we need to keep them consistent.
    setVisibleCardCount(containerWidth > 1080 ? 4 : containerWidth > 680 ? 3 : 2);
  });

  /**
   * Slice the guide metadata as we only need to show 1 row of guide cards in get-started page
   */
  const featuredAppGuides = useMemo(
    () => getStructuredAppGuideMetadata().featured.slice(0, visibleCardCount),
    [visibleCardCount, getStructuredAppGuideMetadata]
  );

  const onClickAppGuide = useCallback((data: SelectedGuide) => {
    setShowCreateAppForm(true);
    setSelectedGuide(data);
  }, []);

  const onAppCreationCompleted = useCallback(
    (newApp?: Application) => {
      if (newApp && selectedGuide) {
        navigate(`/applications/${newApp.id}/guide/${selectedGuide.id}`, { replace: true });
        return;
      }
      setShowCreateAppForm(false);
      setSelectedGuide(undefined);
    },
    [navigate, selectedGuide]
  );

  const onClickApiGuide = useCallback((data: SelectedGuide) => {
    setShowCreateApiForm(true);
    setSelectedGuide(data);
  }, []);

  const onCloseCreateApiForm = useCallback(
    (newResource?: Resource) => {
      if (newResource && selectedGuide) {
        navigate(`/api-resources/${newResource.id}/guide/${selectedGuide.id}`, { replace: true });
        return;
      }
      setShowCreateApiForm(false);
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
      <Card className={styles.card}>
        <div className={styles.title}>
          {t(`get_started.develop.title${isCloud ? '_cloud' : ''}`)}
        </div>
        {isCloud && (
          <>
            <ProtectedAppCreationForm />
            <div className={styles.subtitle}>{t('get_started.develop.subtitle_cloud')}</div>
          </>
        )}
        <GuideCardGroup
          ref={containerRef}
          hasCardBorder
          hasCardButton
          guides={featuredAppGuides}
          onClickGuide={onClickAppGuide}
        />
        {selectedGuide?.target !== 'API' && showCreateAppForm && (
          <ApplicationCreation
            defaultCreateType={selectedGuide?.target}
            defaultCreateFrameworkName={selectedGuide?.name}
            onCompleted={onAppCreationCompleted}
          />
        )}
        <TextLink to="/applications/create">{t('get_started.view_all')}</TextLink>
      </Card>
      <Card className={styles.card}>
        <div className={styles.title}>{t('get_started.customize.title')}</div>
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
              targetBlank="noopener"
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
        <div className={styles.title}>{t('get_started.secure.title')}</div>
        <GuideCardGroup
          ref={containerRef}
          hasCardBorder
          hasCardButton
          guides={apiGuideMetadata}
          onClickGuide={onClickApiGuide}
        />
        {showCreateApiForm && <CreateApiForm onClose={onCloseCreateApiForm} />}
        <TextLink to="/api-resources/create">{t('get_started.view_all')}</TextLink>
      </Card>
      <Card className={styles.card}>
        <div className={styles.title}>{t('get_started.manage.title')}</div>
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

export default GetStarted;
