import type { AdminConsoleKey } from '@logto/phrases';
import type { Application } from '@logto/schemas';
import type { KeyboardEvent } from 'react';
import { useRef } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Button from '@/components/Button';
import FormField from '@/components/FormField';
import { convertRhfErrorMessage, createValidatorForRhf } from '@/components/MultiTextInput/utils';
import MultiTextInputField from '@/components/MultiTextInputField';
import TextInput from '@/components/TextInput';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import type { GuideForm } from '@/types/guide';
import { uriValidator } from '@/utilities/validator';

import * as styles from './index.module.scss';

type Props = {
  appId: string;
  name: 'redirectUris' | 'postLogoutRedirectUris';
  title: AdminConsoleKey;
  isSingle?: boolean;
};

const UriInputField = ({ appId, name, title, isSingle = false }: Props) => {
  const methods = useForm<Partial<GuideForm>>();
  const {
    control,
    getValues,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const { data, mutate } = useSWR<Application, RequestError>(`api/applications/${appId}`);

  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();

  const onSubmit = async (value: string[]) => {
    const updatedApp = await api
      .patch(`api/applications/${appId}`, {
        json: {
          oidcClientMetadata: {
            [name]: value.filter(Boolean),
          },
        },
      })
      .json<Application>();
    void mutate(updatedApp);
    toast.success(t('general.saved'));

    // Reset form to set 'isDirty' to false
    reset(getValues());
  };

  const onKeyPress = (event: KeyboardEvent<HTMLInputElement>, value: string[]) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void handleSubmit(async () => onSubmit(value))();
    }
  };

  return (
    <FormProvider {...methods}>
      <form>
        <Controller
          name={name}
          control={control}
          defaultValue={data?.oidcClientMetadata[name]}
          rules={{
            validate: createValidatorForRhf({
              required: t(
                isSingle ? 'errors.required_field_missing' : 'errors.required_field_missing_plural',
                { field: title }
              ),
              pattern: {
                verify: (value) => !value || uriValidator(value),
                message: t('errors.invalid_uri_format'),
              },
            }),
          }}
          render={({ field: { onChange, value = [] }, fieldState: { error, isDirty } }) => {
            const errorObject = convertRhfErrorMessage(error?.message);

            return (
              <div ref={ref} className={styles.wrapper}>
                {isSingle && (
                  <FormField
                    isRequired={name === 'redirectUris'}
                    className={styles.field}
                    title={title}
                  >
                    <TextInput
                      className={styles.field}
                      value={value[0]}
                      errorMessage={errorObject?.required ?? errorObject?.inputs?.[0]}
                      onChange={({ currentTarget: { value } }) => {
                        onChange([value]);
                      }}
                      onKeyPress={(event) => {
                        onKeyPress(event, value);
                      }}
                    />
                  </FormField>
                )}
                {!isSingle && (
                  <MultiTextInputField
                    isRequired={name === 'redirectUris'}
                    formFieldClassName={styles.field}
                    title={title}
                    value={value}
                    error={errorObject}
                    className={styles.multiTextInput}
                    onChange={onChange}
                    onKeyPress={(event) => {
                      onKeyPress(event, value);
                    }}
                  />
                )}
                <Button
                  className={styles.saveButton}
                  disabled={!isDirty}
                  isLoading={isSubmitting}
                  title="general.save"
                  type="primary"
                  onClick={handleSubmit(async () => onSubmit(value))}
                />
              </div>
            );
          }}
        />
      </form>
    </FormProvider>
  );
};

export default UriInputField;
