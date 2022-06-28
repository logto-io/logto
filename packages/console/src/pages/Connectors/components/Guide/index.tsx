import { ConnectorDTO, ConnectorType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import i18next from 'i18next';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import CardTitle from '@/components/CardTitle';
import CodeEditor from '@/components/CodeEditor';
import DangerousRaw from '@/components/DangerousRaw';
import IconButton from '@/components/IconButton';
import Markdown from '@/components/Markdown';
import useApi from '@/hooks/use-api';
import useSettings from '@/hooks/use-settings';
import Close from '@/icons/Close';
import Step from '@/mdx-components/Step';
import SenderTester from '@/pages/ConnectorDetails/components/SenderTester';
import { GuideForm } from '@/types/guide';

import * as styles from './index.module.scss';

type Props = {
  connector: ConnectorDTO;
  onClose: () => void;
};

const Guide = ({ connector, onClose }: Props) => {
  const api = useApi();
  const { updateSettings } = useSettings();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { id: connectorId, type: connectorType, name, configTemplate, readme } = connector;

  const locale = i18next.language;
  // TODO: LOG-2393 should fix name[locale] syntax error
  const foundName = Object.entries(name).find(([lang]) => lang === locale);
  const connectorName = foundName ? foundName[1] : name.en;
  const isSocialConnector =
    connectorType !== ConnectorType.SMS && connectorType !== ConnectorType.Email;
  const methods = useForm<GuideForm>({ reValidateMode: 'onBlur' });
  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
    watch,
  } = methods;

  const onSubmit = handleSubmit(async ({ connectorConfigJson }) => {
    if (isSubmitting) {
      return;
    }

    try {
      const config = JSON.parse(connectorConfigJson) as JSON;
      await api
        .patch(`/api/connectors/${connectorId}`, {
          json: { config },
        })
        .json<ConnectorDTO>();
      await api
        .patch(`/api/connectors/${connectorId}/enabled`, {
          json: { enabled: true },
        })
        .json<ConnectorDTO>();

      await updateSettings({
        ...conditional(!isSocialConnector && { configurePasswordless: true }),
        ...conditional(isSocialConnector && { configureSocialSignIn: true }),
      });

      onClose();
      toast.success(t('general.saved'));
    } catch (error: unknown) {
      if (error instanceof SyntaxError) {
        toast.error(t('connector_details.save_error_json_parse_error'));
      }
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
        <Markdown className={styles.readme}>{readme}</Markdown>
        <div>
          <FormProvider {...methods}>
            <form onSubmit={onSubmit}>
              <Step
                title="Enter your json here"
                subtitle="Lorem ipsum dolor sit amet, consectetuer adipiscing elit."
                index={0}
                activeIndex={0}
                buttonText="admin_console.connectors.save_and_done"
                buttonHtmlType="submit"
                isLoading={isSubmitting}
              >
                <Controller
                  name="connectorConfigJson"
                  control={control}
                  defaultValue={configTemplate}
                  render={({ field: { onChange, value } }) => (
                    <CodeEditor
                      className={styles.editor}
                      language="json"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                {!isSocialConnector && (
                  <SenderTester
                    className={styles.tester}
                    connectorId={connectorId}
                    connectorType={connectorType}
                    config={watch('connectorConfigJson')}
                  />
                )}
              </Step>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default Guide;
