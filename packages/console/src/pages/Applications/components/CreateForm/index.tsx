import type { Application } from '@logto/schemas';
import { ApplicationType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useEffect } from 'react';
import { useController, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import { isProduction } from '@/consts/env';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import useConfigs from '@/hooks/use-configs';
import * as modalStyles from '@/scss/modal.module.scss';
import { applicationTypeI18nKey } from '@/types/applications';
import { trySubmitSafe } from '@/utils/form';

import TypeDescription from '../TypeDescription';

import Footer from './Footer';
import * as styles from './index.module.scss';

type FormData = {
  type: ApplicationType;
  name: string;
  description?: string;
};

type Props = {
  isOpen: boolean;
  defaultCreateType?: ApplicationType;
  onClose?: (createdApp?: Application) => void;
};

function CreateForm({ isOpen, defaultCreateType, onClose }: Props) {
  const { updateConfigs } = useConfigs();
  const {
    handleSubmit,
    control,
    register,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const {
    field: { onChange, value, name, ref },
  } = useController({
    name: 'type',
    control,
    rules: { required: true },
  });

  useEffect(() => {
    if (defaultCreateType) {
      resetField('type', { defaultValue: defaultCreateType });
    }
  }, [defaultCreateType, resetField]);

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();

  if (!isOpen) {
    return null;
  }

  const onSubmit = handleSubmit(
    trySubmitSafe(async (data) => {
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
    })
  );

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
        footer={<Footer selectedType={value} isLoading={isSubmitting} onClickCreate={onSubmit} />}
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
              {Object.values(ApplicationType).map((type) => (
                <Radio
                  key={type}
                  value={type}
                  /**
                   * Todo: @xiaoyijun remove this condition on subscription features ready.
                   */
                  hasCheckIconForCard={isProduction || type !== ApplicationType.MachineToMachine}
                >
                  <TypeDescription
                    type={type}
                    title={t(`${applicationTypeI18nKey[type]}.title`)}
                    subtitle={t(`${applicationTypeI18nKey[type]}.subtitle`)}
                    description={t(`${applicationTypeI18nKey[type]}.description`)}
                    /**
                     * Todo: @xiaoyijun remove this condition on subscription features ready.
                     */
                    hasProTag={!isProduction && type === ApplicationType.MachineToMachine}
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
              error={Boolean(errors.name)}
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
