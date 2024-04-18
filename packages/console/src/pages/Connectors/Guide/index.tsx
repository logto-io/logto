import { isLanguageTag } from '@logto/language-kit';
import { ConnectorType } from '@logto/schemas';
import type { ConnectorFactoryResponse, RequestErrorBody } from '@logto/schemas';
import { generateStandardId } from '@logto/shared/universal';
import { conditional } from '@silverhand/essentials';
import i18next from 'i18next';
import { HTTPError } from 'ky';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import Close from '@/assets/icons/close.svg';
import BasicForm from '@/components/ConnectorForm/BasicForm';
import ConfigForm from '@/components/ConnectorForm/ConfigForm';
import ConnectorTester from '@/components/ConnectorTester';
import Markdown from '@/components/Markdown';
import { ConnectorsTabs } from '@/consts/page-tabs';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import DangerousRaw from '@/ds-components/DangerousRaw';
import IconButton from '@/ds-components/IconButton';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import useConnectorApi from '@/hooks/use-connector-api';
import { useConnectorFormConfigParser } from '@/hooks/use-connector-form-config-parser';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import * as modalStyles from '@/scss/modal.module.scss';
import type { ConnectorFormType } from '@/types/connector';
import { SyncProfileMode } from '@/types/connector';
import { convertFactoryResponseToForm } from '@/utils/connector-form';
import { trySubmitSafe } from '@/utils/form';

import { splitMarkdownByTitle } from '../utils';

import * as styles from './index.module.scss';

const targetErrorCode = 'connector.multiple_target_with_same_platform';

type Props = {
  readonly connector?: ConnectorFactoryResponse;
  readonly onClose: (id?: string) => void;
};

function Guide({ connector, onClose }: Props) {
  const { createConnector } = useConnectorApi();
  const { navigate } = useTenantPathname();
  const callbackConnectorId = useRef(generateStandardId());
  const [conflictConnectorName, setConflictConnectorName] = useState<Record<string, string>>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { type: connectorType, formItems, isStandard, id: connectorFactoryId } = connector ?? {};
  const { language } = i18next;

  const isSocialConnector =
    connectorType !== ConnectorType.Sms && connectorType !== ConnectorType.Email;

  const methods = useForm<ConnectorFormType>({
    reValidateMode: 'onBlur',
    defaultValues: {
      jsonConfig: '{}',
      formConfig: {},
      syncProfile: SyncProfileMode.OnlyAtRegister,
    },
  });

  const {
    formState: { isSubmitting },
    handleSubmit,
    watch,
    setError,
    reset,
  } = methods;

  useEffect(() => {
    if (!connector) {
      return;
    }
    reset(convertFactoryResponseToForm(connector));
  }, [reset, connector]);

  const configParser = useConnectorFormConfigParser();

  useEffect(() => {
    setConflictConnectorName(undefined);
  }, [connector]);

  if (!connector) {
    return null;
  }

  const { id: connectorId, name, readme } = connector;
  const { title, content } = splitMarkdownByTitle(readme);
  const connectorName = conditional(isLanguageTag(language) && name[language]) ?? name.en;

  const onSubmit = handleSubmit(
    trySubmitSafe(async (data) => {
      if (isSubmitting) {
        return;
      }

      // Recover error state
      setConflictConnectorName(undefined);

      const config = configParser(data, formItems);

      const { syncProfile, name, logo, logoDark, target } = data;

      const basePayload = {
        config,
        connectorId,
        id: conditional(connectorType === ConnectorType.Social && callbackConnectorId.current),
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
        const createdConnector = await createConnector(payload);

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
    })
  );

  return (
    <Modal
      shouldCloseOnEsc
      isOpen={Boolean(connector)}
      className={modalStyles.fullScreen}
      onRequestClose={() => {
        onClose();
      }}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <IconButton
            size="large"
            onClick={() => {
              onClose(callbackConnectorId.current);
            }}
          >
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
          <OverlayScrollbar className={styles.readme}>
            <div className={styles.readmeTitle}>README: {title}</div>
            <Markdown className={styles.readmeContent}>{content}</Markdown>
          </OverlayScrollbar>
          <div className={styles.setup}>
            <FormProvider {...methods}>
              <form autoComplete="off" onSubmit={onSubmit}>
                {isSocialConnector && (
                  <div className={styles.block}>
                    <div className={styles.blockTitle}>
                      <div className={styles.number}>1</div>
                      <div>{t('connectors.guide.general_setting')}</div>
                    </div>
                    <BasicForm
                      isAllowEditTarget={isStandard}
                      isStandard={isStandard}
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
                    connectorId={callbackConnectorId.current}
                    connectorFactoryId={connectorFactoryId}
                    connectorType={connectorType}
                    formItems={formItems}
                  />
                </div>
                {!isSocialConnector && (
                  <div className={styles.block}>
                    <div className={styles.blockTitle}>
                      <div className={styles.number}>2</div>
                      <div>{t('connectors.guide.test_connection')}</div>
                    </div>
                    <ConnectorTester
                      connectorFactoryId={connectorId}
                      connectorType={connectorType}
                      parse={() => configParser(watch(), formItems)}
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
    </Modal>
  );
}

export default Guide;
