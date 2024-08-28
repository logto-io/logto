import { ServiceConnector } from '@logto/connector-kit';
import { ConnectorType } from '@logto/schemas';
import type { ConnectorFactoryResponse, ConnectorResponse } from '@logto/schemas';
import { condArray, conditional } from '@silverhand/essentials';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';

import Delete from '@/assets/icons/delete.svg';
import File from '@/assets/icons/file.svg';
import Reset from '@/assets/icons/reset.svg';
import ConnectorLogo from '@/components/ConnectorLogo';
import CreateConnectorForm from '@/components/CreateConnectorForm';
import DeleteConnectorConfirmModal from '@/components/DeleteConnectorConfirmModal';
import DetailsPage from '@/components/DetailsPage';
import DetailsPageHeader, {
  type MenuItem as ActionMenuItemItem,
} from '@/components/DetailsPage/DetailsPageHeader';
import Drawer from '@/components/Drawer';
import Markdown from '@/components/Markdown';
import PageMeta from '@/components/PageMeta';
import UnnamedTrans from '@/components/UnnamedTrans';
import { ConnectorsTabs } from '@/consts/page-tabs';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useConnectorApi from '@/hooks/use-connector-api';
import useConnectorInUse from '@/hooks/use-connector-in-use';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import ConnectorContent from './ConnectorContent';
import ConnectorTabs from './ConnectorTabs';
import ConnectorTypeName from './ConnectorTypeName';
import EmailUsage from './EmailUsage';
import * as styles from './index.module.scss';

// TODO: refactor path-related operation utils in both Connectors and ConnectorDetails page
const getConnectorsPathname = (isSocial: boolean) =>
  `/connectors/${isSocial ? ConnectorsTabs.Social : ConnectorsTabs.Passwordless}`;

function ConnectorDetails() {
  const { pathname } = useLocation();
  const { connectorId } = useParams();
  const { createConnector } = useConnectorApi();
  const { mutate: mutateGlobal } = useSWRConfig();
  const [isDeleted, setIsDeleted] = useState(false);
  const [isReadMeOpen, setIsReadMeOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate } = useSWR<ConnectorResponse, RequestError>(
    connectorId && `api/connectors/${connectorId}`,
    { keepPreviousData: true }
  );
  const {
    data: connectorFactory,
    error: fetchConnectorFactoryError,
    mutate: mutateConnectorFactory,
  } = useSWR<ConnectorFactoryResponse, RequestError>(
    data?.isStandard && `api/connector-factories/${data.connectorId}`
  );

  const requestError = error ?? fetchConnectorFactoryError;

  const { isConnectorInUse } = useConnectorInUse();
  const inUse = isConnectorInUse(data);
  const isLoading =
    (!data && !error) || (data?.isStandard && !connectorFactory && !fetchConnectorFactoryError);

  const api = useApi();
  const { navigate } = useTenantPathname();
  const isSocial = data?.type === ConnectorType.Social;

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsDeleteAlertOpen(false);
  }, [pathname]);

  const handleDelete = async () => {
    if (!connectorId || isDeleting) {
      return;
    }
    setIsDeleting(true);

    try {
      await api.delete(`api/connectors/${connectorId}`).json<ConnectorResponse>();

      setIsDeleted(true);

      toast.success(t('connector_details.connector_deleted'));
      await mutateGlobal('api/connectors');

      navigate(getConnectorsPathname(isSocial), {
        replace: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!connectorId) {
    return null;
  }

  return (
    <DetailsPage
      backLink={getConnectorsPathname(isSocial)}
      backLinkTitle="connector_details.back_to_connectors"
      isLoading={isLoading}
      error={requestError}
      onRetry={() => {
        void mutate();
        void mutateConnectorFactory();
      }}
    >
      <PageMeta titleKey="connector_details.page_title" />
      {isSocial && <ConnectorTabs target={data.target} connectorId={data.id} />}
      {data && (
        <>
          <DetailsPageHeader
            icon={<ConnectorLogo data={data} size="large" />}
            title={<UnnamedTrans resource={data.name} />}
            primaryTag={<ConnectorTypeName type={data.type} />}
            statusTag={{
              status: inUse ? 'success' : 'info',
              text: inUse
                ? 'connectors.connector_status_in_use'
                : 'connectors.connector_status_not_in_use',
            }}
            identifier={{ name: 'ID', value: data.id }}
            additionalActionButton={conditional(
              data.connectorId !== ServiceConnector.Email && {
                title: 'connector_details.check_readme',
                icon: <File />,
                onClick: () => {
                  setIsReadMeOpen(true);
                },
              }
            )}
            additionalCustomElement={conditional(
              data.type === ConnectorType.Email && data.usage !== undefined && (
                <EmailUsage usage={data.usage} />
              )
            )}
            actionMenuItems={[
              ...condArray(
                !isSocial && [
                  {
                    title:
                      data.type === ConnectorType.Sms
                        ? 'connector_details.options_change_sms'
                        : 'connector_details.options_change_email',
                    icon: <Reset />,
                    onClick: () => {
                      setIsSetupOpen(true);
                    },
                  } satisfies ActionMenuItemItem,
                ]
              ),
              {
                type: 'danger',
                title: 'general.delete',
                icon: <Delete />,
                onClick: () => {
                  setIsDeleteAlertOpen(true);
                },
              },
            ]}
          />
          <Drawer
            title="connectors.title"
            subtitle="connectors.subtitle"
            isOpen={isReadMeOpen}
            onClose={() => {
              setIsReadMeOpen(false);
            }}
          >
            <Markdown className={styles.readme}>{data.readme}</Markdown>
          </Drawer>
          <CreateConnectorForm
            isOpen={isSetupOpen}
            type={data.type}
            onClose={async (connectorId?: string) => {
              setIsSetupOpen(false);

              if (connectorId) {
                /**
                 * Note:
                 * The "Email Service Connector" is a built-in connector that can be directly created without the need for setup in the guide.
                 */
                if (connectorId === ServiceConnector.Email) {
                  const created = await createConnector({ connectorId });
                  navigate(`/connectors/${ConnectorsTabs.Passwordless}/${created.id}`, {
                    replace: true,
                  });
                  return;
                }

                navigate(`${getConnectorsPathname(isSocial)}/guide/${connectorId}`);
              }
            }}
          />
          <TabNav>
            <TabNavItem href={`${getConnectorsPathname(isSocial)}/${connectorId}`}>
              {t('general.settings_nav')}
            </TabNavItem>
          </TabNav>
          <ConnectorContent
            isDeleted={isDeleted}
            connectorData={data}
            onConnectorUpdated={(connector) => {
              void mutate(connector);
            }}
          />
          <DeleteConnectorConfirmModal
            data={data}
            isInUse={inUse}
            isOpen={isDeleteAlertOpen}
            isLoading={isDeleting}
            onCancel={() => {
              setIsDeleteAlertOpen(false);
            }}
            onConfirm={handleDelete}
          />
        </>
      )}
    </DetailsPage>
  );
}

export default ConnectorDetails;
