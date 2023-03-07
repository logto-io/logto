import { generateStandardId } from '@logto/core-kit';
import { isLanguageTag } from '@logto/language-kit';
import type { ConnectorFactoryResponse, ConnectorResponse, RequestErrorBody } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import i18next from 'i18next';
import { HTTPError } from 'ky';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Close from '@/assets/images/close.svg';
import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import DangerousRaw from '@/components/DangerousRaw';
import IconButton from '@/components/IconButton';
import Markdown from '@/components/Markdown';
import { ConnectorsTabs } from '@/consts/page-tabs';
import useApi from '@/hooks/use-api';
import useConfigs from '@/hooks/use-configs';
import SenderTester from '@/pages/ConnectorDetails/components/SenderTester';

import type { ConnectorFormType } from '../../types';
import { SyncProfileMode } from '../../types';
import { splitMarkdownByTitle } from '../../utils';
import BasicForm from '../ConnectorForm/BasicForm';
import ConfigForm from '../ConnectorForm/ConfigForm';
import { useConfigParser } from '../ConnectorForm/hooks';
import { initFormData, parseFormConfig } from '../ConnectorForm/utils';
import * as styles from './index.module.scss';

const targetErrorCode = 'connector.multiple_target_with_same_platform';

type Props = {
  connector: ConnectorFactoryResponse;
  onClose: () => void;
};

const Guide = ({ connector, onClose }: Props) => {
  const api = useApi({ hideErrorToast: true });
  const navigate = useNavigate();
  const [callbackConnectorId, setCallbackConnectorId] = useState<string>(generateStandardId());
  const { updateConfigs } = useConfigs();
  const parseJsonConfig = useConfigParser();
  const [conflictConnectorName, setConflictConnectorName] = useState<Record<string, string>>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    id: connectorId,
    type: connectorType,
    name,
    readme,
    formItems,
    target,
    isStandard,
  } = connector;
  const { title, content } = splitMarkdownByTitle(readme);
  const { language } = i18next;
  const connectorName = conditional(isLanguageTag(language) && name[language]) ?? name.en;
  const isSocialConnector =
    connectorType !== ConnectorType.Sms && connectorType !== ConnectorType.Email;
  const methods = useForm<ConnectorFormType>({
    reValidateMode: 'onBlur',
    defaultValues: {
      ...(formItems ? initFormData(formItems) : {}),
      syncProfile: SyncProfileMode.OnlyAtRegister,
    },
  });
  const {
    formState: { isSubmitting },
    handleSubmit,
    watch,
    setValue,
    setError,
  } = methods;

  useEffect(() => {
    if (isSocialConnector && !isStandard) {
      setValue('target', target);
    }
  }, [isSocialConnector, target, isStandard, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    if (isSubmitting) {
      return;
    }

    // Recover error state
    setConflictConnectorName(undefined);

    const { formItems, isStandard, id: connectorId, type } = connector;
    const config = formItems ? parseFormConfig(data, formItems) : parseJsonConfig(data.config);
    const { syncProfile, name, logo, logoDark, target } = data;

    const basePayload = {
      config,
      connectorId,
      id: conditional(type === ConnectorType.Social && callbackConnectorId),
      metadata: conditional(
        isStandard && {
          logo,
          logoDark,
          target,
          name: { en: name },
        }
      ),
    };

    const payload = isSocialConnector
      ? { ...basePayload, syncProfile: syncProfile === SyncProfileMode.EachSignIn }
      : basePayload;

    try {
      const createdConnector = await api
        .post('api/connectors', {
          json: payload,
        })
        .json<ConnectorResponse>();

      await updateConfigs({
        ...conditional(!isSocialConnector && { passwordlessConfigured: true }),
      });

      onClose();
      toast.success(t('general.saved'));
      navigate(
        `/connectors/${isSocialConnector ? ConnectorsTabs.Social : ConnectorsTabs.Passwordless}/${
          createdConnector.id
        }`
      );
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const { response } = error;
        const metadata = await response.json<
          RequestErrorBody<{ connectorName: Record<string, string> }>
        >();

        if (metadata.code === targetErrorCode) {
          setConflictConnectorName(metadata.data.connectorName);
          setError('target', {}, { shouldFocus: true });

          return;
        }
      }

      throw error;
    }
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <IconButton size="large" onClick={onClose}>
          <Close className={styles.closeIcon} />
        </IconButton>
        <div className={styles.separator} />
        <CardTitle
          size="small"
          title={<DangerousRaw>{connectorName}</DangerousRaw>}
          subtitle="connectors.guide.subtitle"
        />
      </div>
      <div className={styles.content}>
        <div className={styles.readme}>
          <div className={styles.readmeTitle}>README: {title}</div>
          <Markdown className={styles.readmeContent}>{content}</Markdown>
        </div>
        <div className={styles.setup}>
          <FormProvider {...methods}>
            <form onSubmit={onSubmit}>
              {isSocialConnector && (
                <div className={styles.block}>
                  <div className={styles.blockTitle}>
                    <div className={styles.number}>1</div>
                    <div>{t('connectors.guide.general_setting')}</div>
                  </div>
                  <BasicForm
                    isAllowEditTarget={connector.isStandard}
                    isStandard={connector.isStandard}
                    conflictConnectorName={conflictConnectorName}
                  />
                </div>
              )}
              <div className={styles.block}>
                <div className={styles.blockTitle}>
                  <div className={styles.number}>{isSocialConnector ? 2 : 1}</div>
                  <div>{t('connectors.guide.parameter_configuration')}</div>
                </div>
                <ConfigForm
                  connectorId={callbackConnectorId}
                  configTemplate={connector.configTemplate}
                  connectorType={connectorType}
                  formItems={connector.formItems}
                />
              </div>
              {!isSocialConnector && (
                <div className={styles.block}>
                  <div className={styles.blockTitle}>
                    <div className={styles.number}>2</div>
                    <div>{t('connectors.guide.test_connection')}</div>
                  </div>
                  <SenderTester
                    connectorId={connectorId}
                    connectorType={connectorType}
                    config={watch('config')}
                  />
                </div>
              )}
              <div className={styles.footer}>
                <Button
                  title="connectors.save_and_done"
                  type="primary"
                  htmlType="submit"
                  isLoading={isSubmitting}
                />
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default Guide;
