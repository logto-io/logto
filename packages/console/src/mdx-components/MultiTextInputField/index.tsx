import { I18nKey } from '@logto/phrases';
import { Application } from '@logto/schemas';
import React, { useRef } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Button from '@/components/Button';
import FormField from '@/components/FormField';
import MultiTextInput from '@/components/MultiTextInput';
import { createValidatorForRhf, convertRhfErrorMessage } from '@/components/MultiTextInput/utils';
import useApi, { RequestError } from '@/hooks/use-api';
import { GuideForm } from '@/types/guide';
import { uriValidator } from '@/utilities/validator';

import * as styles from './index.module.scss';

type Props = {
  appId: string;
  name: 'redirectUris' | 'postLogoutRedirectUris';
  title: I18nKey;
};

const MultiTextInputField = ({ appId, name, title }: Props) => {
  const methods = useForm<GuideForm>();
  const {
    control,
    getValues,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const { data, mutate } = useSWR<Application, RequestError>(`/api/applications/${appId}`);

  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();

  const onSubmit = async (value: string[]) => {
    const updatedApp = await api
      .patch(`/api/applications/${appId}`, {
        json: {
          oidcClientMetadata: {
            [name]: value.filter(Boolean),
          },
        },
      })
      .json<Application>();
    void mutate(updatedApp);

    // Reset form to set 'isDirty' to false
    reset(getValues());
  };

  return (
    <FormProvider {...methods}>
      <form>
        <FormField isRequired className={styles.field} title={title}>
          <Controller
            name={name}
            control={control}
            defaultValue={data?.oidcClientMetadata[name]}
            rules={{
              validate: createValidatorForRhf({
                required: t('errors.required_field_missing_plural', { field: title }),
                pattern: {
                  verify: (value) => !value || uriValidator(value),
                  message: t('errors.invalid_uri_format'),
                },
              }),
            }}
            render={({ field: { onChange, value }, fieldState: { error, isDirty } }) => (
              <div ref={ref} className={styles.wrapper}>
                <MultiTextInput
                  title={title}
                  value={value}
                  error={convertRhfErrorMessage(error?.message)}
                  onChange={onChange}
                  onKeyPress={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      void handleSubmit(async () => onSubmit(value))();
                    }
                  }}
                />
                <Button
                  disabled={!isDirty}
                  isLoading={isSubmitting}
                  title="general.save"
                  type="primary"
                  onClick={handleSubmit(async () => onSubmit(value))}
                />
              </div>
            )}
          />
        </FormField>
      </form>
    </FormProvider>
  );
};

export default MultiTextInputField;
