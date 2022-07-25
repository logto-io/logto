import { languageEnumGuard } from '@logto/phrases';
import { ConnectorDto, ConnectorType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import i18next from 'i18next';
import { Controller, useForm } from 'react-hook-form';
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
import { safeParseJson } from '@/utilities/json';

import * as styles from './index.module.scss';

type Props = {
  connector: ConnectorDto;
  onClose: () => void;
};

const Guide = ({ connector, onClose }: Props) => {
  const api = useApi();
  const { updateSettings } = useSettings();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { id: connectorId, type: connectorType, name, configTemplate, readme } = connector;

  const localeRaw = i18next.language;
  const result = languageEnumGuard.safeParse(localeRaw);
  const connectorName = result.success ? name[result.data] : name.en;

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

    const result = safeParseJson(connectorConfigJson);

    if (!result.success) {
      toast.error(result.error);

      return;
    }

    await api
      .patch(`/api/connectors/${connectorId}`, { json: { config: result.data } })
      .json<ConnectorDto>();
    await api
      .patch(`/api/connectors/${connectorId}/enabled`, { json: { enabled: true } })
      .json<ConnectorDto>();

    await updateSettings({
      ...conditional(!isSocialConnector && { passwordlessConfigured: true }),
      ...conditional(isSocialConnector && { socialSignInConfigured: true }),
    });

    onClose();
    toast.success(t('general.saved'));
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
          <Step
            title={t('connector_details.edit_config_label')}
            index={0}
            activeIndex={0}
            buttonText="connectors.save_and_done"
            buttonType="primary"
            isLoading={isSubmitting}
            onButtonClick={onSubmit}
          >
            <form {...methods}>
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
            </form>
            {!isSocialConnector && (
              <SenderTester
                className={styles.tester}
                connectorId={connectorId}
                connectorType={connectorType}
                config={watch('connectorConfigJson')}
              />
            )}
          </Step>
        </div>
      </div>
    </div>
  );
};

export default Guide;
