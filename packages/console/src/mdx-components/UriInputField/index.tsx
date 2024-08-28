import type { AdminConsoleKey } from '@logto/phrases';
import type { Application } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import type { KeyboardEvent } from 'react';
import { useContext, useRef } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { GuideContext } from '@/components/Guide';
import MultiTextInputField from '@/components/MultiTextInputField';
import Button from '@/ds-components/Button';
import {
  convertRhfErrorMessage,
  createValidatorForRhf,
} from '@/ds-components/MultiTextInput/utils';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import type {
  CustomClientMetadataKey,
  GuideForm,
  Name,
  OidcClientMetadataKey,
} from '@/types/guide';
import { trySubmitSafe } from '@/utils/form';
import { uriValidator } from '@/utils/validator';

import * as styles from './index.module.scss';

const nameToKey: Record<Name, AdminConsoleKey> = Object.freeze({
  redirectUris: 'application_details.redirect_uri',
  postLogoutRedirectUris: 'application_details.post_sign_out_redirect_uri',
  corsAllowedOrigins: 'application_details.cors_allowed_origins',
});

type Props =
  | {
      readonly name: OidcClientMetadataKey;
      readonly type?: 'oidcClientMetadata';
      /** The default value of the input field when there's no data. */
      readonly defaultValue?: string;
    }
  | {
      readonly name: CustomClientMetadataKey;
      readonly type: 'customClientMetadata';
      /** The default value of the input field when there's no data. */
      readonly defaultValue?: string;
    };

function UriInputField(props: Props) {
  const { name, defaultValue } = props;
  const type = props.type ?? 'oidcClientMetadata';

  const methods = useForm<Partial<GuideForm>>();
  const {
    control,
    getValues,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;
  const { app } = useContext(GuideContext);
  const appId = app?.id;
  const { data, mutate } = useSWR<Application, RequestError>(appId && `api/applications/${appId}`);

  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const title: AdminConsoleKey = nameToKey[name];

  const onSubmit = trySubmitSafe(async (value: string[]) => {
    if (!appId) {
      return;
    }
    const updatedApp = await api
      .patch(`api/applications/${appId}`, {
        json: {
          [type]: {
            [name]: value.filter(Boolean),
          },
        },
      })
      .json<Application>();
    void mutate(updatedApp);
    toast.success(t('general.saved'));

    // Reset form to set 'isDirty' to false
    reset(getValues());
  });

  const onKeyPress = (event: KeyboardEvent<HTMLInputElement>, value: string[]) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void handleSubmit(async () => onSubmit(value))();
    }
  };

  const dataValue =
    props.type === 'customClientMetadata'
      ? data?.customClientMetadata[props.name]
      : data?.oidcClientMetadata[props.name];

  const defaultValueArray = dataValue?.length
    ? dataValue
    : conditional(defaultValue && [defaultValue]);

  return (
    <FormProvider {...methods}>
      <form className={styles.form}>
        <Controller
          name={name}
          control={control}
          defaultValue={defaultValueArray}
          rules={{
            validate: createValidatorForRhf({
              required: t('errors.required_field_missing_plural', { field: t(title) }),
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
}

export default UriInputField;
