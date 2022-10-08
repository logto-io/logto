import { AppearanceMode, ConnectorResponse, ConnectorType } from '@logto/schemas';
import classNames from 'classnames';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';

import ActionMenu, { ActionMenuItem } from '@/components/ActionMenu';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CopyToClipboard from '@/components/CopyToClipboard';
import DetailsSkeleton from '@/components/DetailsSkeleton';
import Drawer from '@/components/Drawer';
import LinkButton from '@/components/LinkButton';
import Markdown from '@/components/Markdown';
import Status from '@/components/Status';
import TabNav, { TabNavItem } from '@/components/TabNav';
import UnnamedTrans from '@/components/UnnamedTrans';
import useApi, { RequestError } from '@/hooks/use-api';
import useConnectorInUse from '@/hooks/use-connector-in-use';
import { useTheme } from '@/hooks/use-theme';
import Back from '@/icons/Back';
import Delete from '@/icons/Delete';
import More from '@/icons/More';
import Reset from '@/icons/Reset';
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

  const handleDelete = async () => {
    if (!connectorId) {
      return;
    }

    await api
      .patch(`/api/connectors/${connectorId}/enabled`, {
        json: { enabled: false },
      })
      .json<ConnectorResponse>();
    toast.success(t('connector_details.connector_deleted'));

    await mutateGlobal('/api/connectors');
    setIsDeleted(true);

    if (data?.type === ConnectorType.Social) {
      navigate(`/connectors/social`, { replace: true });
    } else {
      navigate(`/connectors`, { replace: true });
    }
  };

  return (
    <div className={detailsStyles.container}>
      <LinkButton
        to={data?.type === ConnectorType.Social ? '/connectors/social' : '/connectors'}
        icon={<Back />}
        title="connector_details.back_to_connectors"
        className={styles.backLink}
      />
      {isLoading && <DetailsSkeleton />}
      {!data && error && <div>{`error occurred: ${error.body?.message ?? error.message}`}</div>}
      {data?.type === ConnectorType.Social && (
        <ConnectorTabs target={data.target} connectorId={data.id} />
      )}
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
              {data.type !== ConnectorType.Social && (
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
              <ActionMenuItem icon={<Delete />} type="danger" onClick={handleDelete}>
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
      {data && (
        <Card className={classNames(styles.body, detailsStyles.body)}>
          <TabNav>
            <TabNavItem href={`/connectors/${connectorId ?? ''}`}>
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
        </Card>
      )}
    </div>
  );
};

export default ConnectorDetails;
