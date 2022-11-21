import type { ConnectorResponse } from '@logto/schemas';
import { AppearanceMode, ConnectorType } from '@logto/schemas';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';

import Back from '@/assets/images/back.svg';
import Delete from '@/assets/images/delete.svg';
import More from '@/assets/images/more.svg';
import Reset from '@/assets/images/reset.svg';
import ActionMenu, { ActionMenuItem } from '@/components/ActionMenu';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ConfirmModal from '@/components/ConfirmModal';
import CopyToClipboard from '@/components/CopyToClipboard';
import DetailsSkeleton from '@/components/DetailsSkeleton';
import Drawer from '@/components/Drawer';
import LinkButton from '@/components/LinkButton';
import Markdown from '@/components/Markdown';
import Status from '@/components/Status';
import TabNav, { TabNavItem } from '@/components/TabNav';
import UnnamedTrans from '@/components/UnnamedTrans';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useConnectorInUse from '@/hooks/use-connector-in-use';
import { useTheme } from '@/hooks/use-theme';
import * as detailsStyles from '@/scss/details.module.scss';

import CreateForm from '../Connectors/components/CreateForm';
import ConnectorContent from './components/ConnectorContent';
import ConnectorTabs from './components/ConnectorTabs';
import ConnectorTypeName from './components/ConnectorTypeName';
import * as styles from './index.module.scss';

const ConnectorDetails = () => {
  const { connectorId } = useParams();
  const { mutate: mutateGlobal } = useSWRConfig();
  const [isDeleted, setIsDeleted] = useState(false);
  const [isReadMeOpen, setIsReadMeOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate } = useSWR<ConnectorResponse, RequestError>(
    connectorId && `/api/connectors/${connectorId}`
  );
  const inUse = useConnectorInUse(data?.type, data?.target);
  const isLoading = !data && !error;
  const api = useApi();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSocial = data?.type === ConnectorType.Social;
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

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

    await api
      .patch(`/api/connectors/${connectorId}/enabled`, {
        json: { enabled: false },
      })
      .json<ConnectorResponse>();

    setIsDeleted(true);

    toast.success(t('connector_details.connector_deleted'));
    await mutateGlobal('/api/connectors');

    if (isSocial) {
      navigate(`/connectors/social`, { replace: true });
    } else {
      navigate(`/connectors`, { replace: true });
    }
  };

  return (
    <div className={detailsStyles.container}>
      <LinkButton
        to={isSocial ? '/connectors/social' : '/connectors'}
        icon={<Back />}
        title="connector_details.back_to_connectors"
        className={styles.backLink}
      />
      {isLoading && <DetailsSkeleton />}
      {!data && error && <div>{`error occurred: ${error.body?.message ?? error.message}`}</div>}
      {isSocial && <ConnectorTabs target={data.target} connectorId={data.id} />}
      {data && (
        <Card className={styles.header}>
          <div className={styles.logoContainer}>
            <img
              src={theme === AppearanceMode.DarkMode && data.logoDark ? data.logoDark : data.logo}
              alt="logo"
              className={styles.logo}
            />
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
              {inUse !== undefined && (
                <Status status={inUse ? 'enabled' : 'disabled'} variant="outlined">
                  {t('connectors.connector_status', {
                    context: inUse ? 'in_use' : 'not_in_use',
                  })}
                </Status>
              )}
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
                navigate(`/connectors/${connectorId ?? ''}`);
              }}
            />
          </div>
        </Card>
      )}
      <TabNav>
        <TabNavItem href={`/connectors/${connectorId ?? ''}`}>
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
