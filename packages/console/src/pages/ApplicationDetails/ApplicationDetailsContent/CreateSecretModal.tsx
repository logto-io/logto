import { type ApplicationSecret } from '@logto/schemas';
import { addDays, format } from 'date-fns';
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
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

type FormData = { name: string; expiration: string };

type Props = {
  readonly appId: string;
  readonly isOpen: boolean;
  readonly onClose: (createdAppSecret?: ApplicationSecret) => void;
};

const days = Object.freeze([7, 30, 180, 365]);
const neverExpires = '-1';

function CreateSecretModal({ appId, isOpen, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    register,
    control,
    watch,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
  } = useForm<FormData>({ defaultValues: { name: '', expiration: neverExpires } });
  const onCloseHandler = useCallback(
    (created?: ApplicationSecret) => {
      reset();
      onClose(created);
    },
    [onClose, reset]
  );
  const api = useApi();
  const expirationDays = watch('expiration');
  const [expirationDate, setExpirationDate] = useState<Date>();

  // Update expiration date every second since our options are relative to the current time (in
  // days).
  useEffect(() => {
    const setDate = () => {
      if (expirationDays === neverExpires) {
        setExpirationDate(undefined);
      } else {
        setExpirationDate(addDays(new Date(), Number(expirationDays)));
      }
    };
    const interval = setInterval(setDate, 1000);
    setDate();

    return () => {
      clearInterval(interval);
    };
  }, [expirationDays]);

  const submit = handleSubmit(
    trySubmitSafe(async ({ expiration, ...rest }) => {
      const createdData = await api
        .post(`api/applications/${appId}/secrets`, {
          json: { ...rest, expiresAt: expirationDate?.valueOf() },
        })
        .json<ApplicationSecret>();
      toast.success(
        t('application_details.secrets.create_modal.created', { name: createdData.name })
      );
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
        <FormField isRequired title="general.name">
          <TextInput
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            placeholder="My secret"
            error={Boolean(errors.name)}
            {...register('name', { required: true })}
          />
        </FormField>
        <Controller
          control={control}
          name="expiration"
          render={({ field }) => (
            <FormField
              title="application_details.secrets.create_modal.expiration"
              description={
                expirationDate ? (
                  <DangerousRaw>
                    {t('application_details.secrets.create_modal.expiration_description', {
                      date: format(expirationDate, 'Pp'),
                    })}
                  </DangerousRaw>
                ) : (
                  'application_details.secrets.create_modal.expiration_description_never'
                )
              }
            >
              <Select
                options={[
                  ...days.map((count) => ({
                    title: t('application_details.secrets.create_modal.days', { count }),
                    value: String(count),
                  })),
                  {
                    title: t('application_details.secrets.never'),
                    value: neverExpires,
                  },
                ]}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
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
