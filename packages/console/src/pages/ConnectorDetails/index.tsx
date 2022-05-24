import { ConnectorDTO, ConnectorType } from '@logto/schemas';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';

import ActionMenu, { ActionMenuItem } from '@/components/ActionMenu';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CodeEditor from '@/components/CodeEditor';
import DetailsSkeleton from '@/components/DetailsSkeleton';
import Drawer from '@/components/Drawer';
import LinkButton from '@/components/LinkButton';
import Markdown from '@/components/Markdown';
import Status from '@/components/Status';
import TabNav, { TabNavItem } from '@/components/TabNav';
import UnnamedTrans from '@/components/UnnamedTrans';
import useApi, { RequestError } from '@/hooks/use-api';
import Back from '@/icons/Back';
import Delete from '@/icons/Delete';
import More from '@/icons/More';
import Reset from '@/icons/Reset';
import * as detailsStyles from '@/scss/details.module.scss';

import CreateForm from '../Connectors/components/CreateForm';
import ConnectorTabs from './components/ConnectorTabs';
import SenderTester from './components/SenderTester';
import * as styles from './index.module.scss';

const ConnectorDetails = () => {
  const { connectorId } = useParams();
  const [isReadMeOpen, setIsReadMeOpen] = useState(false);
  const [config, setConfig] = useState<string>();
  const [saveError, setSaveError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error } = useSWR<ConnectorDTO, RequestError>(
    connectorId && `/api/connectors/${connectorId}`
  );
  const isLoading = !data && !error;
  const api = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      setConfig(JSON.stringify(data.config, null, 2));
    }
  }, [data]);

  const handleSave = async () => {
    if (!connectorId) {
      return;
    }

    if (!config) {
      setSaveError(t('connector_details.save_error_empty_config'));

      return;
    }

    try {
      const configJson = JSON.parse(config) as JSON;
      setIsSubmitting(true);
      await api
        .patch(`/api/connectors/${connectorId}`, {
          json: { config: configJson },
        })
        .json<ConnectorDTO>();
      toast.success(t('connector_details.save_success'));
    } catch (error: unknown) {
      if (error instanceof SyntaxError) {
        setSaveError(t('connector_details.save_error_json_parse_error'));
      }
    }

    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!connectorId) {
      return;
    }

    await api
      .patch(`/api/connectors/${connectorId}/enabled`, {
        json: { enabled: false },
      })
      .json<ConnectorDTO>();
    toast.success(t('connector_details.connector_deleted'));

    if (data?.type === ConnectorType.Social) {
      navigate(`/connectors/social`);
    } else {
      navigate(`/connectors`);
    }
  };

  return (
    <div className={detailsStyles.container}>
      <LinkButton
        to={data?.type === ConnectorType.Social ? '/connectors/social' : '/connectors'}
        icon={<Back />}
        title="admin_console.connector_details.back_to_connectors"
        className={styles.backLink}
      />
      {isLoading && <DetailsSkeleton />}
      {!data && error && <div>{`error occurred: ${error.body?.message ?? error.message}`}</div>}
      {data?.type === ConnectorType.Social && (
        <ConnectorTabs target={data.target} connectorId={data.id} />
      )}
      {data && (
        <Card className={styles.header}>
          <div className={styles.imagePlaceholder}>
            <img src={data.logo} className={styles.logo} />
          </div>
          <div className={styles.metadata}>
            <div>
              <div className={styles.name}>
                <UnnamedTrans resource={data.name} />
              </div>
              <div className={styles.id}>{data.id}</div>
            </div>
            <div>
              <Status status={data.enabled ? 'enabled' : 'disabled'}>
                {t('connectors.connector_status', {
                  context: data.enabled ? 'enabled' : 'disabled',
                })}
              </Status>
            </div>
          </div>
          <div className={styles.operations}>
            <Button
              title="admin_console.connector_details.check_readme"
              size="large"
              onClick={() => {
                setIsReadMeOpen(true);
              }}
            />
            <Drawer
              isOpen={isReadMeOpen}
              onClose={() => {
                setIsReadMeOpen(false);
              }}
            >
              <Markdown>{data.readme}</Markdown>
            </Drawer>
            <ActionMenu
              buttonProps={{ icon: <More />, size: 'large' }}
              title={t('connector_details.more_options')}
            >
              {data.type !== ConnectorType.Social && (
                <ActionMenuItem
                  icon={<Reset />}
                  onClick={() => {
                    setIsSetupOpen(true);
                  }}
                >
                  {t(
                    data.type === ConnectorType.SMS
                      ? 'connector_details.options_change_sms'
                      : 'connector_details.options_change_email'
                  )}
                </ActionMenuItem>
              )}
              <ActionMenuItem icon={<Delete />} type="danger" onClick={handleDelete}>
                {t('connector_details.options_delete')}
              </ActionMenuItem>
            </ActionMenu>
            <CreateForm
              isOpen={isSetupOpen}
              type={data.type}
              onClose={() => {
                setIsSetupOpen(false);
              }}
            />
          </div>
        </Card>
      )}
      {data && (
        <Card className={classNames(styles.body, detailsStyles.body)}>
          <TabNav>
            <TabNavItem href={`/connectors/${connectorId ?? ''}`}>
              {t('connector_details.tab_settings')}
            </TabNavItem>
          </TabNav>
          <div className={styles.main}>
            <CodeEditor
              language="json"
              value={config}
              onChange={(value) => {
                setConfig(value);
              }}
            />
            {data.type !== ConnectorType.Social && <SenderTester connectorType={data.type} />}
            {saveError && <div>{saveError}</div>}
          </div>
          <div className={detailsStyles.footer}>
            <div className={detailsStyles.footerMain}>
              <Button
                type="primary"
                title="admin_console.connector_details.save_changes"
                isLoading={isSubmitting}
                onClick={handleSave}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ConnectorDetails;
