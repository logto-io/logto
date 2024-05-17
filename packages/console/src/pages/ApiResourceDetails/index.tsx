import type { Resource } from '@logto/schemas';
import { isManagementApi, Theme } from '@logto/schemas';
import { conditionalArray } from '@silverhand/essentials';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import useSWR from 'swr';

import ApiResourceDark from '@/assets/icons/api-resource-dark.svg';
import ApiResource from '@/assets/icons/api-resource.svg';
import Delete from '@/assets/icons/delete.svg';
import File from '@/assets/icons/file.svg';
import ManagementApiResourceDark from '@/assets/icons/management-api-resource-dark.svg';
import ManagementApiResource from '@/assets/icons/management-api-resource.svg';
import DetailsPage from '@/components/DetailsPage';
import DetailsPageHeader, { type MenuItem } from '@/components/DetailsPage/DetailsPageHeader';
import Drawer from '@/components/Drawer';
import PageMeta from '@/components/PageMeta';
import { ApiResourceDetailsTabs } from '@/consts/page-tabs';
import DeleteConfirmModal from '@/ds-components/DeleteConfirmModal';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useTheme from '@/hooks/use-theme';

import GuideDrawer from './components/GuideDrawer';
import GuideModal from './components/GuideModal';
import ManagementApiNotice from './components/ManagementApiNotice';
import * as styles from './index.module.scss';
import { type ApiResourceDetailsOutletContext } from './types';

const icons = {
  [Theme.Light]: { ApiIcon: ApiResource, ManagementApiIcon: ManagementApiResource },
  [Theme.Dark]: { ApiIcon: ApiResourceDark, ManagementApiIcon: ManagementApiResourceDark },
};

function ApiResourceDetails() {
  const { pathname } = useLocation();
  const { id, guideId } = useParams();
  const { navigate, match } = useTenantPathname();
  const { getDocumentationUrl } = useDocumentationUrl();
  const isGuideView = !!id && !!guideId && match(`/api-resources/${id}/guide/${guideId}`);

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate } = useSWR<Resource, RequestError>(id && `api/resources/${id}`);
  const isLoading = !data && !error;
  const theme = useTheme();
  const { ApiIcon, ManagementApiIcon } = icons[theme];

  const isOnPermissionPage = pathname.endsWith(ApiResourceDetailsTabs.Permissions);
  const isLogtoManagementApiResource = isManagementApi(data?.indicator ?? '');
  const Icon = isLogtoManagementApiResource ? ManagementApiIcon : ApiIcon;

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
      {isLogtoManagementApiResource && <ManagementApiNotice />}
      {data && (
        <>
          <DetailsPageHeader
            icon={<Icon />}
            title={data.name}
            primaryTag={data.isDefault && t('api_resources.default_api')}
            identifier={{
              name: 'API Identifier',
              value: data.indicator,
            }}
            additionalActionButton={{
              icon: <File />,
              title: 'application_details.check_guide',
              onClick: () => {
                if (isLogtoManagementApiResource) {
                  window.open(
                    getDocumentationUrl('/docs/recipes/interact-with-management-api/'),
                    '_blank'
                  );
                } else {
                  setIsGuideDrawerOpen(true);
                }
              },
            }}
            actionMenuItems={conditionalArray<MenuItem>(
              // Should not show delete button for management api resource.
              !isLogtoManagementApiResource && {
                icon: <Delete />,
                title: 'general.delete',
                type: 'danger',
                onClick: () => {
                  setIsDeleteFormOpen(true);
                },
              }
            )}
          />
          <Drawer isOpen={isGuideDrawerOpen} onClose={onCloseDrawer}>
            <GuideDrawer apiResource={data} onClose={onCloseDrawer} />
          </Drawer>
          {/* Can not delete management api resource. */}
          {!isLogtoManagementApiResource && (
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
          )}
          <TabNav>
            <TabNavItem href={`/api-resources/${data.id}/${ApiResourceDetailsTabs.Permissions}`}>
              {t('api_resource_details.permissions_tab')}
            </TabNavItem>
            <TabNavItem href={`/api-resources/${data.id}/${ApiResourceDetailsTabs.General}`}>
              {t('api_resource_details.general_tab')}
            </TabNavItem>
          </TabNav>
          <Outlet
            context={
              {
                resource: data,
                isDeleting,
                isLogtoManagementApiResource,
                onResourceUpdated: mutate,
              } satisfies ApiResourceDetailsOutletContext
            }
          />
        </>
      )}
    </DetailsPage>
  );
}

export default ApiResourceDetails;
