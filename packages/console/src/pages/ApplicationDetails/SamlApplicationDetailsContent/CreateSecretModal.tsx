import { type SamlApplicationSecret } from '@logto/schemas';
import { addYears, format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import Select from '@/ds-components/Select';
import useApi from '@/hooks/use-api';
import modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

type FormData = { lifeSpanInYears: string };

type Props = {
  readonly appId: string;
  readonly isOpen: boolean;
  readonly onClose: (createdSamlAppSecret?: SamlApplicationSecret) => void;
};

const years = Object.freeze([1, 3, 5, 10]);

function CreateSecretModal({ appId, isOpen, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    control,
    watch,
    formState: { isSubmitting },
    handleSubmit,
    reset,
  } = useForm<FormData>({ defaultValues: { lifeSpanInYears: '1' } });
  const onCloseHandler = useCallback(
    (created?: SamlApplicationSecret) => {
      reset();
      onClose(created);
    },
    [onClose, reset]
  );
  const api = useApi();
  const expirationYears = watch('lifeSpanInYears');
  const [expirationDate, setExpirationDate] = useState<Date>(addYears(new Date(), 1));

  // Update expiration date every second since our options are relative to the current time (in years).
  useEffect(() => {
    const setDate = () => {
      setExpirationDate(addYears(new Date(), Number(expirationYears)));
    };
    const interval = setInterval(setDate, 1000);
    setDate();

    return () => {
      clearInterval(interval);
    };
  }, [expirationYears]);

  const submit = handleSubmit(
    trySubmitSafe(async ({ lifeSpanInYears }) => {
      const createdData = await api
        .post(`api/saml-applications/${appId}/secrets`, {
          json: { lifeSpanInYears: Number(lifeSpanInYears) },
        })
        .json<SamlApplicationSecret>();
      toast.success(t('application_details.secrets.create_modal.created'));
      onCloseHandler(createdData);
    })
  );

  return (
    <ReactModal
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onCloseHandler();
      }}
    >
      <ModalLayout
        title="application_details.secrets.create_modal.title"
        footer={
          <Button type="primary" title="general.create" isLoading={isSubmitting} onClick={submit} />
        }
        onClose={onCloseHandler}
      >
        <Controller
          control={control}
          name="lifeSpanInYears"
          render={({ field: { value, onChange } }) => (
            <FormField
              title="application_details.secrets.create_modal.expiration"
              description={
                <DangerousRaw>
                  {t('application_details.secrets.create_modal.expiration_description', {
                    date: format(expirationDate, 'Pp'),
                  })}
                </DangerousRaw>
              }
            >
              <Select
                options={years.map((count) => ({
                  title: t('application_details.secrets.create_modal.years', { count }),
                  value: String(count),
                }))}
                value={value}
                onChange={(value) => {
                  onChange(value);
                }}
              />
            </FormField>
          )}
        />
      </ModalLayout>
    </ReactModal>
  );
}

export default CreateSecretModal;
