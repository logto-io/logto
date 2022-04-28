import { ConnectorDTO, ConnectorType } from '@logto/schemas';
import i18next from 'i18next';
import React, { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import Modal from 'react-modal';

import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import CodeEditor from '@/components/CodeEditor';
import DangerousRaw from '@/components/DangerousRaw';
import IconButton from '@/components/IconButton';
import Spacer from '@/components/Spacer';
import useApi from '@/hooks/use-api';
import Close from '@/icons/Close';
import SenderTester from '@/pages/ConnectorDetails/components/SenderTester';
import Step from '@/pages/Guide/components/Step';
import * as modalStyles from '@/scss/modal.module.scss';
import { GuideForm } from '@/types/guide';

import * as styles from './index.module.scss';

type Props = {
  connector: ConnectorDTO;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: GuideForm) => Promise<void>;
};

const onClickFetchSampleProject = (name: string) => {
  const sampleUrl = `https://github.com/logto-io/js/tree/master/packages/connectors/${name}-sample`;
  window.open(sampleUrl, '_blank');
};

const GuideModal = ({ connector, isOpen, onClose }: Props) => {
  const api = useApi();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    id: connectorId,
    type: connectorType,
    metadata: { name, configTemplate, readme },
  } = connector;

  const locale = i18next.language;
  const connectorName = name[locale] ?? name.en;
  const isSocialConnector =
    connectorType !== ConnectorType.SMS && connectorType !== ConnectorType.Email;
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
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

      setActiveStepIndex(activeStepIndex + 1);
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
            subtitle="connectors.get_started.subtitle"
          />
          <Spacer />
          <Button type="plain" size="small" title="general.skip" onClick={onClose} />
          {connectorName && (
            <Button
              type="outline"
              title="admin_console.get_started.get_sample_file"
              onClick={() => {
                onClickFetchSampleProject(connectorName);
              }}
            />
          )}
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
