import { ConnectorType } from '@logto/schemas';
import type { ConnectorFactoryResponse, ConnectorResponse } from '@logto/schemas';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';

import Back from '@/assets/images/back.svg';
import Delete from '@/assets/images/delete.svg';
import More from '@/assets/images/more.svg';
import Reset from '@/assets/images/reset.svg';
import ActionMenu, { ActionMenuItem } from '@/components/ActionMenu';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ConfirmModal from '@/components/ConfirmModal';
import ConnectorLogo from '@/components/ConnectorLogo';
import CopyToClipboard from '@/components/CopyToClipboard';
import DetailsSkeleton from '@/components/DetailsSkeleton';
import Drawer from '@/components/Drawer';
import Markdown from '@/components/Markdown';
import Status from '@/components/Status';
import TabNav, { TabNavItem } from '@/components/TabNav';
import TextLink from '@/components/TextLink';
import UnnamedTrans from '@/components/UnnamedTrans';
import { ConnectorsTabs } from '@/consts/page-tabs';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useConnectorInUse from '@/hooks/use-connector-in-use';
import * as detailsStyles from '@/scss/details.module.scss';

import CreateForm from '../Connectors/components/CreateForm';
import ConnectorContent from './components/ConnectorContent';
import ConnectorTabs from './components/ConnectorTabs';
import ConnectorTypeName from './components/ConnectorTypeName';
import * as styles from './index.module.scss';

const getConnectorsPathname = (isSocial: boolean) =>
  `/connectors/${isSocial ? ConnectorsTabs.Social : ConnectorsTabs.Passwordless}`;

const ConnectorDetails = () => {
  const { pathname } = useLocation();
  const { connectorId } = useParams();
  const { mutate: mutateGlobal } = useSWRConfig();
  const [isDeleted, setIsDeleted] = useState(false);
  const [isReadMeOpen, setIsReadMeOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate } = useSWR<ConnectorResponse, RequestError>(
    connectorId && `/api/connectors/${connectorId}`
  );
  const { data: connectorFactory } = useSWR<ConnectorFactoryResponse>(
    data?.isStandard && `/api/connector-factories/${data.connectorId}`
  );
  const { isConnectorInUse } = useConnectorInUse();
  const inUse = isConnectorInUse(data);
  const isLoading = !data && !error;
  const api = useApi();
  const navigate = useNavigate();
  const isSocial = data?.type === ConnectorType.Social;
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  useEffect(() => {
    setIsDeleteAlertOpen(false);
  }, [pathname]);

  const onDeleteClick = async () => {
    if (!isSocial || !inUse) {
      await handleDelete();

      return;
    }

    setIsDeleteAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!connectorId) {
      return;
    }

    await api.delete(`/api/connectors/${connectorId}`).json<ConnectorResponse>();

    setIsDeleted(true);

    toast.success(t('connector_details.connector_deleted'));
    await mutateGlobal('/api/connectors');

    navigate(getConnectorsPathname(isSocial), {
      replace: true,
    });
  };

  if (!connectorId) {
    return null;
  }

  return (
    <div className={detailsStyles.container}>
      <TextLink to={getConnectorsPathname(isSocial)} icon={<Back />} className={styles.backLink}>
        {t('connector_details.back_to_connectors')}
      </TextLink>
      {isLoading && <DetailsSkeleton />}
      {!data && error && <div>{`error occurred: ${error.body?.message ?? error.message}`}</div>}
      {isSocial && <ConnectorTabs target={data.target} connectorId={data.id} />}
      {data && (
        <Card className={styles.header}>
          <div className={styles.logoContainer}>
            <ConnectorLogo data={data} className={styles.logo} />
          </div>
          <div className={styles.metadata}>
            <div>
              <div className={styles.name}>
                <UnnamedTrans resource={data.name} />
              </div>
            </div>
            <div>
              <ConnectorTypeName type={data.type} />
              <div className={styles.verticalBar} />
              {connectorFactory && (
                <>
                  <div className={styles.factoryName}>
                    <UnnamedTrans resource={connectorFactory.name} />
                  </div>
                  <div className={styles.verticalBar} />
                </>
              )}
              <Status status={inUse ? 'enabled' : 'disabled'} variant="outlined">
                {t('connectors.connector_status', {
                  context: inUse ? 'in_use' : 'not_in_use',
                })}
              </Status>
              <div className={styles.verticalBar} />
              <div className={styles.text}>ID</div>
              <CopyToClipboard value={data.id} />
            </div>
          </div>
          <div className={styles.operations}>
            <Button
              title="connector_details.check_readme"
              size="large"
              onClick={() => {
                setIsReadMeOpen(true);
              }}
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
            <ActionMenu
              buttonProps={{ icon: <More className={styles.moreIcon} />, size: 'large' }}
              title={t('general.more_options')}
            >
              {!isSocial && (
                <ActionMenuItem
                  icon={<Reset />}
                  iconClassName={styles.resetIcon}
                  onClick={() => {
                    setIsSetupOpen(true);
                  }}
                >
                  {t(
                    data.type === ConnectorType.Sms
                      ? 'connector_details.options_change_sms'
                      : 'connector_details.options_change_email'
                  )}
                </ActionMenuItem>
              )}
              <ActionMenuItem icon={<Delete />} type="danger" onClick={onDeleteClick}>
                {t('general.delete')}
              </ActionMenuItem>
            </ActionMenu>
            <CreateForm
              isOpen={isSetupOpen}
              type={data.type}
              onClose={(connectorId?: string) => {
                setIsSetupOpen(false);

                if (connectorId) {
                  navigate(`${getConnectorsPathname(isSocial)}/${connectorId}`);
                }
              }}
            />
          </div>
        </Card>
      )}
      <TabNav>
        <TabNavItem href={`${getConnectorsPathname(isSocial)}/${connectorId}`}>
          {t('general.settings_nav')}
        </TabNavItem>
      </TabNav>
      {data && (
        <ConnectorContent
          isDeleted={isDeleted}
          connectorData={data}
          onConnectorUpdated={(connector) => {
            void mutate(connector);
          }}
        />
      )}
      {data && (
        <ConfirmModal
          isOpen={isDeleteAlertOpen}
          confirmButtonText="general.delete"
          onCancel={() => {
            setIsDeleteAlertOpen(false);
          }}
          onConfirm={handleDelete}
        >
          <Trans
            t={t}
            i18nKey="connector_details.in_use_deletion_description"
            components={{ name: <UnnamedTrans resource={data.name} /> }}
          />
        </ConfirmModal>
      )}
    </div>
  );
};

export default ConnectorDetails;
