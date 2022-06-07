import { ConnectorDTO, ConnectorType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import i18next from 'i18next';
import React, { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import Modal from 'react-modal';

import CardTitle from '@/components/CardTitle';
import CodeEditor from '@/components/CodeEditor';
import DangerousRaw from '@/components/DangerousRaw';
import IconButton from '@/components/IconButton';
import useApi from '@/hooks/use-api';
import useSettings from '@/hooks/use-settings';
import Close from '@/icons/Close';
import Step from '@/mdx-components/Step';
import SenderTester from '@/pages/ConnectorDetails/components/SenderTester';
import * as modalStyles from '@/scss/modal.module.scss';
import { GuideForm } from '@/types/guide';

import * as styles from './index.module.scss';

type Props = {
  connector: ConnectorDTO;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: GuideForm) => Promise<void>;
};

const GuideModal = ({ connector, isOpen, onClose }: Props) => {
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
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const steps = isSocialConnector ? 1 : 2;
  const methods = useForm<GuideForm>({ reValidateMode: 'onBlur' });
  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
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

      if (activeStepIndex === steps - 1) {
        onClose();
      } else {
        setActiveStepIndex(activeStepIndex + 1);
      }
      toast.success(t('connector_details.save_success'));
    } catch (error: unknown) {
      if (error instanceof SyntaxError) {
        toast.error(t('connector_details.save_error_json_parse_error'));
      }
    }
  });

  return (
    <Modal isOpen={isOpen} className={modalStyles.fullScreen}>
      <div className={styles.container}>
        <div className={styles.header}>
          <IconButton size="large" onClick={onClose}>
            <Close />
          </IconButton>
          <div className={styles.separator} />
          <CardTitle
            size="small"
            title={<DangerousRaw>{connectorName}</DangerousRaw>}
            subtitle="connectors.guide.subtitle"
          />
        </div>
        <div className={styles.content}>
          <ReactMarkdown
            className={styles.readme}
            components={{
              code: ({ node, inline, className, children, ...props }) => {
                const [, codeBlockType] = /language-(\w+)/.exec(className ?? '') ?? [];

                return inline ? (
                  <code {...props}>{children}</code>
                ) : (
                  <CodeEditor isReadonly language={codeBlockType} value={String(children)} />
                );
              },
            }}
          >
            {readme}
          </ReactMarkdown>
          <div>
            <FormProvider {...methods}>
              <form onSubmit={onSubmit}>
                <Step
                  title="Enter your json here"
                  subtitle="Lorem ipsum dolor sit amet, consectetuer adipiscing elit."
                  index={0}
                  activeIndex={activeStepIndex}
                  buttonHtmlType="submit"
                  buttonText={steps === 1 ? 'general.done' : undefined}
                >
                  <Controller
                    name="connectorConfigJson"
                    control={control}
                    defaultValue={configTemplate}
                    render={({ field: { onChange, value } }) => (
                      <CodeEditor language="json" value={value} onChange={onChange} />
                    )}
                  />
                </Step>
              </form>
            </FormProvider>
            {!isSocialConnector && (
              <Step
                title="Test your message"
                subtitle="Lorem ipsum dolor sit amet, consectetuer adipiscing elit."
                index={1}
                activeIndex={activeStepIndex}
                buttonHtmlType="button"
                buttonText="general.done"
                onNext={onClose}
              >
                <SenderTester connectorType={connectorType} />
              </Step>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GuideModal;
