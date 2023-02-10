import { isLanguageTag } from '@logto/language-kit';
import type { ConnectorFactoryResponse, ConnectorResponse } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import i18next from 'i18next';
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
import ConnectorForm from '../ConnectorForm';
import { useConfigParser } from '../ConnectorForm/hooks';
import { initFormData, parseFormConfig } from '../ConnectorForm/utils';
import * as styles from './index.module.scss';

type Props = {
  connector: ConnectorFactoryResponse;
  onClose: () => void;
};

const Guide = ({ connector, onClose }: Props) => {
  const api = useApi();
  const navigate = useNavigate();
  const { updateConfigs } = useConfigs();
  const parseJsonConfig = useConfigParser();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { id: connectorId, type: connectorType, name, readme, isStandard, formItems } = connector;
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
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    if (isSubmitting) {
      return;
    }

    const { formItems, isStandard, id: connectorId } = connector;
    const config = formItems ? parseFormConfig(data, formItems) : parseJsonConfig(data.config);
    const { syncProfile, name, logo, logoDark, target } = data;

    const basePayload = {
      config,
      connectorId,
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

    const createdConnector = await api
      .post('/api/connectors', {
        json: payload,
      })
      .json<ConnectorResponse>();

    await updateConfigs({
      ...conditional(!isSocialConnector && { passwordlessConfigured: true }),
      ...conditional(isSocialConnector && { socialSignInConfigured: true }),
    });

    onClose();
    toast.success(t('general.saved'));
    navigate(
      `/connectors/${isSocialConnector ? ConnectorsTabs.Social : ConnectorsTabs.Passwordless}/${
        createdConnector.id
      }`
    );
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
        <Markdown className={styles.readme}>{readme}</Markdown>
        <div className={styles.setup}>
          <div className={styles.title}>{t('connectors.guide.connector_setting')}</div>
          <FormProvider {...methods}>
            <form onSubmit={onSubmit}>
              <ConnectorForm
                isAllowEditTarget
                connectorType={connector.type}
                configTemplate={connector.configTemplate}
                isStandard={connector.isStandard}
                formItems={connector.formItems}
              />
              {!isSocialConnector && (
                <SenderTester
                  className={styles.tester}
                  connectorId={connectorId}
                  connectorType={connectorType}
                  config={watch('config')}
                />
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
