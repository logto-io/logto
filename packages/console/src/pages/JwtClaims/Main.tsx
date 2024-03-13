import {
  type AccessTokenJwtCustomizer,
  LogtoJwtTokenPath,
  type ClientCredentialsJwtCustomizer,
} from '@logto/schemas';
import classNames from 'classnames';
import { useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { type KeyedMutator } from 'swr';

import SubmitFormChangesActionBar from '@/components/SubmitFormChangesActionBar';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import useApi from '@/hooks/use-api';
import { trySubmitSafe } from '@/utils/form';

import ScriptSection from './ScriptSection';
import SettingsSection from './SettingsSection';
import * as styles from './index.module.scss';
import { type JwtClaimsFormType } from './type';
import { formatResponseDataToFormData, formatFormDataToRequestData, getApiPath } from './utils';

type Props = {
  tab: LogtoJwtTokenPath;
  accessTokenJwtCustomizer: AccessTokenJwtCustomizer | undefined;
  clientCredentialsJwtCustomizer: ClientCredentialsJwtCustomizer | undefined;
  mutateAccessTokenJwtCustomizer: KeyedMutator<AccessTokenJwtCustomizer>;
  mutateClientCredentialsJwtCustomizer: KeyedMutator<ClientCredentialsJwtCustomizer>;
};

function Main({
  tab,
  accessTokenJwtCustomizer,
  clientCredentialsJwtCustomizer,
  mutateAccessTokenJwtCustomizer,
  mutateClientCredentialsJwtCustomizer,
}: Props) {
  const api = useApi();

  const userJwtClaimsForm = useForm<JwtClaimsFormType>({
    defaultValues: formatResponseDataToFormData(
      LogtoJwtTokenPath.AccessToken,
      accessTokenJwtCustomizer
    ),
  });

  const machineToMachineJwtClaimsForm = useForm<JwtClaimsFormType>({
    defaultValues: formatResponseDataToFormData(
      LogtoJwtTokenPath.ClientCredentials,
      clientCredentialsJwtCustomizer
    ),
  });

  const activeForm = useMemo(
    () =>
      tab === LogtoJwtTokenPath.AccessToken ? userJwtClaimsForm : machineToMachineJwtClaimsForm,
    [machineToMachineJwtClaimsForm, tab, userJwtClaimsForm]
  );

  const {
    formState: { isDirty, isSubmitting },
    reset,
    handleSubmit,
  } = activeForm;

  const onSubmitHandler = handleSubmit(
    trySubmitSafe(async (data) => {
      if (isSubmitting) {
        return;
      }

      const { tokenType } = data;
      const payload = formatFormDataToRequestData(data);

      await api.put(getApiPath(tokenType), { json: payload });

      const mutate =
        tokenType === LogtoJwtTokenPath.AccessToken
          ? mutateAccessTokenJwtCustomizer
          : mutateClientCredentialsJwtCustomizer;

      const result = await mutate();

      reset(formatResponseDataToFormData(tokenType, result));
    })
  );

  return (
    <>
      <FormProvider {...activeForm}>
        <form className={classNames(styles.tabContent)}>
          <ScriptSection />
          <SettingsSection />
        </form>
      </FormProvider>
      <SubmitFormChangesActionBar
        isOpen={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={reset}
        onSubmit={onSubmitHandler}
      />
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty && !isSubmitting} />
    </>
  );
}

export default Main;
