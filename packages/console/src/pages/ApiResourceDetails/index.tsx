import type { Resource } from '@logto/schemas';
import { AppearanceMode, managementResource } from '@logto/schemas';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';

import ApiResourceDark from '@/assets/images/api-resource-dark.svg';
import ApiResource from '@/assets/images/api-resource.svg';
import Back from '@/assets/images/back.svg';
import Delete from '@/assets/images/delete.svg';
import More from '@/assets/images/more.svg';
import ActionMenu, { ActionMenuItem } from '@/components/ActionMenu';
import Card from '@/components/Card';
import CopyToClipboard from '@/components/CopyToClipboard';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import DetailsSkeleton from '@/components/DetailsSkeleton';
import TabNav, { TabNavItem } from '@/components/TabNav';
import TextLink from '@/components/TextLink';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import * as detailsStyles from '@/scss/details.module.scss';

import ApiResourceSettings from './ApiResourceSettings';
import * as styles from './index.module.scss';

const ApiResourceDetails = () => {
  const location = useLocation();
  const { id } = useParams();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
  const { data, error, mutate } = useSWR<Resource, RequestError>(id && `/api/resources/${id}`);
  const isLoading = !data && !error;
  const theme = useTheme();
  const Icon = theme === AppearanceMode.LightMode ? ApiResource : ApiResourceDark;

  const isLogtoManagementApiResource = data?.id === managementResource.id;

  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const api = useApi();

  const onDelete = async () => {
    if (!data || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await api.delete(`/api/resources/${data.id}`);
      toast.success(t('api_resource_details.api_resource_deleted', { name: data.name }));
      navigate(`/api-resources`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={detailsStyles.container}>
      <TextLink to="/api-resources" icon={<Back />} className={styles.backLink}>
        {t('api_resource_details.back_to_api_resources')}
      </TextLink>
      {isLoading && <DetailsSkeleton />}
      {!data && error && <div>{`error occurred: ${error.body?.message ?? error.message}`}</div>}
      {data && (
        <>
          <Card className={styles.header}>
            <div className={styles.info}>
              <Icon className={styles.icon} />
              <div className={styles.meta}>
                <div className={styles.name}>{data.name}</div>
                <CopyToClipboard size="small" value={data.indicator} />
              </div>
            </div>
            {!isLogtoManagementApiResource && (
              <div className={styles.operations}>
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
            <TabNavItem href={location.pathname}>{t('general.settings_nav')}</TabNavItem>
          </TabNav>
          <ApiResourceSettings
            data={data}
            isDeleting={isDeleting}
            isLogtoManagementApiResource={isLogtoManagementApiResource}
            onResourceUpdated={(resource) => {
              void mutate(resource);
            }}
          />
        </>
      )}
    </div>
  );
};

export default ApiResourceDetails;
