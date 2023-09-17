import { withAppInsights } from '@logto/app-insights/react';
import type { Resource } from '@logto/schemas';
import { isManagementApi, Theme, isManagementApiIndicator } from '@logto/schemas';
import classNames from 'classnames';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import useSWR from 'swr';

import ApiResourceDark from '@/assets/icons/api-resource-dark.svg';
import ApiResource from '@/assets/icons/api-resource.svg';
import Delete from '@/assets/icons/delete.svg';
import More from '@/assets/icons/more.svg';
import DetailsPage from '@/components/DetailsPage';
import Drawer from '@/components/Drawer';
import PageMeta from '@/components/PageMeta';
import { ApiResourceDetailsTabs } from '@/consts/page-tabs';
import { TenantsContext } from '@/contexts/TenantsProvider';
import ActionMenu, { ActionMenuItem } from '@/ds-components/ActionMenu';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import DeleteConfirmModal from '@/ds-components/DeleteConfirmModal';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import Tag from '@/ds-components/Tag';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useTheme from '@/hooks/use-theme';

import GuideDrawer from './components/GuideDrawer';
import GuideModal from './components/GuideModal';
import ManagementApiIntroductionNotice from './components/ManagementApiIntroductionNotice';
import * as styles from './index.module.scss';
import { type ApiResourceDetailsOutletContext } from './types';

function ApiResourceDetails() {
  const { pathname } = useLocation();
  const { id, guideId } = useParams();
  const { navigate, match } = useTenantPathname();
  const { currentTenantId } = useContext(TenantsContext);
  const isGuideView = !!id && !!guideId && match(`/api-resources/${id}/guide/${guideId}`);

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate } = useSWR<Resource, RequestError>(id && `api/resources/${id}`);
  const isLoading = !data && !error;
  const theme = useTheme();
  const Icon = theme === Theme.Light ? ApiResource : ApiResourceDark;

  const isOnPermissionPage = pathname.endsWith(ApiResourceDetailsTabs.Permissions);
  const isLogtoManagementApiResource = isManagementApi(data?.indicator ?? '');

  const [isGuideDrawerOpen, setIsGuideDrawerOpen] = useState(false);
  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);

  useEffect(() => {
    setIsDeleteFormOpen(false);
  }, [pathname]);

  const [isDeleting, setIsDeleting] = useState(false);

  const api = useApi();

  const onDelete = async () => {
    if (!data || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await api.delete(`api/resources/${data.id}`);
      toast.success(t('api_resource_details.api_resource_deleted', { name: data.name }));
      navigate(`/api-resources`);
    } finally {
      setIsDeleting(false);
    }
  };

  const onCloseDrawer = () => {
    setIsGuideDrawerOpen(false);
  };

  if (isGuideView) {
    return (
      <GuideModal
        guideId={guideId}
        apiResource={data}
        onClose={() => {
          navigate(`/api-resources/${id}`);
        }}
      />
    );
  }

  return (
    <DetailsPage
      backLink="/api-resources"
      backLinkTitle="api_resource_details.back_to_api_resources"
      isLoading={isLoading}
      error={error}
      className={classNames(isOnPermissionPage && styles.permissionPage)}
      onRetry={mutate}
    >
      <PageMeta titleKey="api_resource_details.page_title" />
      {data?.indicator && isManagementApiIndicator(data.indicator, currentTenantId) && (
        <ManagementApiIntroductionNotice />
      )}
      {data && (
        <>
          <Card className={styles.header}>
            <div className={styles.info}>
              <Icon className={styles.icon} />
              <div className={styles.metadata}>
                <div className={styles.name}>{data.name}</div>
                <div className={styles.row}>
                  {data.isDefault && (
                    <>
                      <Tag>{t('api_resources.default_api')}</Tag>
                      <div className={styles.verticalBar} />
                    </>
                  )}
                  <div className={styles.text}>API Identifier</div>
                  <CopyToClipboard size="small" value={data.indicator} />
                </div>
              </div>
            </div>
            {!isLogtoManagementApiResource && (
              <div className={styles.operations}>
                <Button
                  title="application_details.check_guide"
                  size="large"
                  onClick={() => {
                    setIsGuideDrawerOpen(true);
                  }}
                />
                <Drawer isOpen={isGuideDrawerOpen} onClose={onCloseDrawer}>
                  <GuideDrawer apiResource={data} onClose={onCloseDrawer} />
                </Drawer>
                <ActionMenu
                  buttonProps={{ icon: <More className={styles.moreIcon} />, size: 'large' }}
                  title={t('general.more_options')}
                >
                  <ActionMenuItem
                    icon={<Delete />}
                    type="danger"
                    onClick={() => {
                      setIsDeleteFormOpen(true);
                    }}
                  >
                    {t('general.delete')}
                  </ActionMenuItem>
                </ActionMenu>
                <DeleteConfirmModal
                  isOpen={isDeleteFormOpen}
                  isLoading={isDeleting}
                  expectedInput={data.name}
                  className={styles.deleteConfirm}
                  inputPlaceholder={t('api_resource_details.enter_your_api_resource_name')}
                  onCancel={() => {
                    setIsDeleteFormOpen(false);
                  }}
                  onConfirm={onDelete}
                >
                  <div className={styles.description}>
                    <Trans components={{ span: <span className={styles.highlight} /> }}>
                      {t('api_resource_details.delete_description', { name: data.name })}
                    </Trans>
                  </div>
                </DeleteConfirmModal>
              </div>
            )}
          </Card>
          <TabNav>
            <TabNavItem href={`/api-resources/${data.id}/${ApiResourceDetailsTabs.Settings}`}>
              {t('api_resource_details.settings_tab')}
            </TabNavItem>
            <TabNavItem href={`/api-resources/${data.id}/${ApiResourceDetailsTabs.Permissions}`}>
              {t('api_resource_details.permissions_tab')}
            </TabNavItem>
          </TabNav>
          <Outlet
            context={
              {
                resource: data,
                isDeleting,
                isLogtoManagementApiResource,
                onResourceUpdated: (resource: Resource) => {
                  void mutate(resource);
                },
              } satisfies ApiResourceDetailsOutletContext
            }
          />
        </>
      )}
    </DetailsPage>
  );
}

export default withAppInsights(ApiResourceDetails);
