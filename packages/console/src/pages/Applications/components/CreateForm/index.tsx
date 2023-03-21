import type { Application } from '@logto/schemas';
import { ApplicationType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useController, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import Button from '@/components/Button';
import FormField from '@/components/FormField';
import ModalLayout from '@/components/ModalLayout';
import RadioGroup, { Radio } from '@/components/RadioGroup';
import TextInput from '@/components/TextInput';
import useApi from '@/hooks/use-api';
import useConfigs from '@/hooks/use-configs';
import * as modalStyles from '@/scss/modal.module.scss';
import { applicationTypeI18nKey } from '@/types/applications';

import TypeDescription from '../TypeDescription';
import * as styles from './index.module.scss';

type FormData = {
  type: ApplicationType;
  name: string;
  description?: string;
};

type Props = {
  isOpen: boolean;
  onClose?: (createdApp?: Application) => void;
};

function CreateForm({ isOpen, onClose }: Props) {
  const { updateConfigs } = useConfigs();
  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();
  const {
    field: { onChange, value, name, ref },
  } = useController({ name: 'type', control, rules: { required: true } });
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();

  if (!isOpen) {
    return null;
  }

  const onSubmit = handleSubmit(async (data) => {
    if (isSubmitting) {
      return;
    }

    const createdApp = await api.post('api/applications', { json: data }).json<Application>();
    void updateConfigs({
      applicationCreated: true,
      ...conditional(
        createdApp.type === ApplicationType.MachineToMachine && { m2mApplicationCreated: true }
      ),
    });
    onClose?.(createdApp);
  });

  return (
    <Modal
      shouldCloseOnEsc
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose?.();
      }}
    >
      <ModalLayout
        title="applications.create"
        subtitle="applications.subtitle"
        size="large"
        footer={
          <Button
            isLoading={isSubmitting}
            htmlType="submit"
            title="applications.create"
            size="large"
            type="primary"
            onClick={onSubmit}
          />
        }
        onClose={onClose}
      >
        <form>
          <FormField title="applications.select_application_type">
            <RadioGroup
              ref={ref}
              className={styles.radioGroup}
              name={name}
              value={value}
              type="card"
              onChange={onChange}
            >
              {Object.values(ApplicationType).map((value) => (
                <Radio key={value} value={value}>
                  <TypeDescription
                    type={value}
                    title={t(`${applicationTypeI18nKey[value]}.title`)}
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
          <FormField isRequired title="applications.application_name">
            <TextInput
              {...register('name', { required: true })}
              placeholder={t('applications.application_name_placeholder')}
              hasError={Boolean(errors.name)}
            />
          </FormField>
          <FormField title="applications.application_description">
            <TextInput
              {...register('description')}
              placeholder={t('applications.application_description_placeholder')}
            />
          </FormField>
        </form>
      </ModalLayout>
    </Modal>
  );
}

export default CreateForm;
