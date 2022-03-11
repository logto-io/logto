import { ConnectorDTO, ConnectorType, RequestErrorBody } from '@logto/schemas';
import ky, { HTTPError } from 'ky';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import BackLink from '@/components/BackLink';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CodeEditor from '@/components/CodeEditor';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import Status from '@/components/Status';
import TabNav, { TabNavLink } from '@/components/TabNav';
import Close from '@/icons/Close';
import * as drawerStyles from '@/scss/drawer.module.scss';
import { RequestError } from '@/swr';

import SenderTester from './components/SenderTester';
import * as styles from './index.module.scss';

const ConnectorDetails = () => {
  const { connectorId } = useParams();
  const [isReadMeOpen, setIsReadMeOpen] = useState(false);
  const [config, setConfig] = useState<string>();
  const [saveError, setSaveError] = useState<string>();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const {
    t,
    i18n: { language },
  } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error } = useSWR<ConnectorDTO, RequestError>(
    connectorId && `/api/connectors/${connectorId}`
  );
  const isLoading = !data && !error;

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
      setIsSubmitLoading(true);
      await ky
        .patch(`/api/connectors/${connectorId}`, { json: { config: configJson } })
        .json<ConnectorDTO>();
      toast.success(t('connector_details.save_success'));
    } catch (error: unknown) {
      if (error instanceof SyntaxError) {
        setSaveError(t('connector_details.save_error_json_parse_error'));
      } else if (error instanceof HTTPError) {
        const { message } = (await error.response.json()) as RequestErrorBody;
        setSaveError(message);
      } else {
        console.error(error);
      }
    }

    setIsSubmitLoading(false);
  };

  return (
    <div className={styles.container}>
      <BackLink to="/connectors">{t('connector_details.back_to_connectors')}</BackLink>
      {isLoading && <div>loading</div>}
      {error && <div>{`error occurred: ${error.metadata.code}`}</div>}
      {data && (
        <Card className={styles.header}>
          {data.metadata.logo.startsWith('http') ? (
            <img src={data.metadata.logo} className={styles.logo} />
          ) : (
            <ImagePlaceholder size={76} borderRadius={16} />
          )}
          <div className={styles.metadata}>
            <div>
              <div className={styles.name}>{data.metadata.name[language]}</div>
              <div className={styles.id}>{data.id}</div>
            </div>
            <div>
              <Status status={data.enabled ? 'operational' : 'offline'}>
                {t('connectors.connector_status', {
                  context: data.enabled ? 'enabled' : 'disabled',
                })}
              </Status>
            </div>
          </div>
          <div>
            <Button
              title="admin_console.connector_details.check_readme"
              onClick={() => {
                setIsReadMeOpen(true);
              }}
            />
            <ReactModal
              isOpen={isReadMeOpen}
              className={drawerStyles.content}
              overlayClassName={drawerStyles.overlay}
            >
              <div className={styles.readme}>
                <div className={styles.headline}>
                  <Close
                    onClick={() => {
                      setIsReadMeOpen(false);
                    }}
                  />
                </div>
                <div>README</div>
              </div>
            </ReactModal>
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
            value={config}
            onChange={(value) => {
              setConfig(value);
            }}
          />
          {data.metadata.type !== ConnectorType.Social && (
            <SenderTester connectorType={data.metadata.type} />
          )}
          {saveError && <div>{saveError}</div>}
          <div className={styles.actions}>
            <Button
              type="primary"
              title="admin_console.connector_details.save_changes"
              disabled={isSubmitLoading}
              onClick={handleSave}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default ConnectorDetails;
