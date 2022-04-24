import { ConnectorDTO, ConnectorType } from '@logto/schemas';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';

import ActionMenu, { ActionMenuItem } from '@/components/ActionMenu';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CodeEditor from '@/components/CodeEditor';
import Drawer from '@/components/Drawer';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import LinkButton from '@/components/LinkButton';
import Markdown from '@/components/Markdown';
import Status from '@/components/Status';
import TabNav, { TabNavLink } from '@/components/TabNav';
import UnnamedTrans from '@/components/UnnamedTrans';
import useApi, { RequestError } from '@/hooks/use-api';
import Back from '@/icons/Back';
import Delete from '@/icons/Delete';
import More from '@/icons/More';
import Reset from '@/icons/Reset';
import * as detailsStyles from '@/scss/details.module.scss';

import CreateForm from '../Connectors/components/CreateForm';
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

    if (data?.metadata.type === ConnectorType.Social) {
      navigate(`/connectors/social`);
    } else {
      navigate(`/connectors`);
    }
  };

  return (
    <div className={detailsStyles.container}>
      <LinkButton
        to="/connectors"
        icon={<Back />}
        title="admin_console.connector_details.back_to_connectors"
        className={styles.backLink}
      />
      {isLoading && <div>loading</div>}
      {error && <div>{`error occurred: ${error.body.message}`}</div>}
      {data && (
        <Card className={styles.header}>
          <div className={styles.imagePlaceholder}>
            {data.metadata.logo.startsWith('http') ? (
              <img src={data.metadata.logo} className={styles.logo} />
            ) : (
              <ImagePlaceholder size={60} borderRadius={16} />
            )}
          </div>
          <div className={styles.metadata}>
            <div>
              <div className={styles.name}>
                <UnnamedTrans resource={data.metadata.name} />
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
              <Markdown>{data.metadata.readme}</Markdown>
            </Drawer>
            <ActionMenu
              buttonProps={{ icon: <More />, size: 'large' }}
              title={t('connector_details.more_options')}
            >
              {data.metadata.type !== ConnectorType.Social && (
                <ActionMenuItem
                  icon={<Reset />}
                  onClick={() => {
                    setIsSetupOpen(true);
                  }}
                >
                  {t(
                    data.metadata.type === ConnectorType.SMS
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
              type={data.metadata.type}
              onClose={() => {
                setIsSetupOpen(false);
              }}
            />
          </div>
        </Card>
      )}
      {data && (
        <Card className={styles.body}>
          <TabNav>
            <TabNavLink href={`/connectors/${connectorId ?? ''}`}>
              {t('connector_details.tab_settings')}
            </TabNavLink>
          </TabNav>
          <CodeEditor
            language="json"
            value={config}
            onChange={(value) => {
              setConfig(value);
            }}
          />
          {data.metadata.type !== ConnectorType.Social && (
            <SenderTester connectorType={data.metadata.type} />
          )}
          {saveError && <div>{saveError}</div>}
          <div className={detailsStyles.footer}>
            <Button
              type="primary"
              title="admin_console.connector_details.save_changes"
              isLoading={isSubmitting}
              onClick={handleSave}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default ConnectorDetails;
