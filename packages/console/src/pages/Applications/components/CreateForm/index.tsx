import { Application, ApplicationType, Setting } from '@logto/schemas';
import React, { useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import useSWR from 'swr';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import FormField from '@/components/FormField';
import IconButton from '@/components/IconButton';
import RadioGroup, { Radio } from '@/components/RadioGroup';
import TextInput from '@/components/TextInput';
import useApi, { RequestError } from '@/hooks/use-api';
import Close from '@/icons/Close';
import * as modalStyles from '@/scss/modal.module.scss';
import { applicationTypeI18nKey } from '@/types/applications';

import GetStarted from '../GetStarted';
import TypeDescription from '../TypeDescription';
import * as styles from './index.module.scss';

type FormData = {
  type: ApplicationType;
  name: string;
  description?: string;
};

type Props = {
  onClose?: (createdApp?: Application) => void;
};

const CreateForm = ({ onClose }: Props) => {
  const [createdApp, setCreatedApp] = useState<Application>();
  const [isQuickStartGuideOpen, setIsQuickStartGuideOpen] = useState(false);
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm<FormData>();
  const {
    field: { onChange, value, name, ref },
  } = useController({ name: 'type', control, rules: { required: true } });
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data: setting } = useSWR<Setting, RequestError>('/api/settings');
  const api = useApi();

  const isGetStartedSkipped = setting?.adminConsole.applicationSkipGetStarted;

  const closeModal = () => {
    setIsQuickStartGuideOpen(false);
    onClose?.(createdApp);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const createdApp = await api.post('/api/applications', { json: data }).json<Application>();
      setCreatedApp(createdApp);

      if (isGetStartedSkipped) {
        closeModal();
      } else {
        setIsQuickStartGuideOpen(true);
      }
    } catch (error: unknown) {
      console.error(error);
    }
  });

  return (
    <Card className={styles.card}>
      <div className={styles.headline}>
        <CardTitle title="applications.create" subtitle="applications.subtitle" />
        <IconButton size="large" onClick={() => onClose?.()}>
          <Close />
        </IconButton>
      </div>
      <form className={styles.form} onSubmit={onSubmit}>
        <FormField title="admin_console.applications.select_application_type">
          <RadioGroup ref={ref} name={name} value={value} onChange={onChange}>
            {Object.values(ApplicationType).map((value) => (
              <Radio key={value} title={t(`${applicationTypeI18nKey[value]}.title`)} value={value}>
                <TypeDescription
                  subtitle={t(`${applicationTypeI18nKey[value]}.subtitle`)}
                  description={t(`${applicationTypeI18nKey[value]}.description`)}
                />
              </Radio>
            ))}
          </RadioGroup>
          {errors.type?.type === 'required' && (
            <div className={styles.error}>{t('applications.no_application_type_selected')}</div>
          )}
        </FormField>
        <FormField
          isRequired
          title="admin_console.applications.application_name"
          className={styles.textField}
        >
          <TextInput {...register('name', { required: true })} />
        </FormField>
        <FormField
          title="admin_console.applications.application_description"
          className={styles.textField}
        >
          <TextInput {...register('description')} />
        </FormField>
        <div className={styles.submit}>
          <Button
            htmlType="submit"
            title="admin_console.applications.create"
            size="large"
            type="primary"
          />
        </div>
      </form>
      {!isGetStartedSkipped && createdApp && (
        <Modal isOpen={isQuickStartGuideOpen} className={modalStyles.fullScreen}>
          <GetStarted appName={createdApp.name} onClose={closeModal} />
        </Modal>
      )}
    </Card>
  );
};

export default CreateForm;
