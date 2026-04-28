import { type LogtoJwtTokenKeyType } from '@logto/schemas';
import classNames from 'classnames';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useSWRConfig, type KeyedMutator } from 'swr';

import SubmitFormChangesActionBar from '@/components/SubmitFormChangesActionBar';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import useApi from '@/hooks/use-api';
import { getApiPath } from '@/pages/CustomizeJwt/utils/path';
import { Action, type Action as JwtAction } from '@/pages/CustomizeJwt/utils/type';
import { trySubmitSafe } from '@/utils/form';

import { type JwtCustomizer, type JwtCustomizerForm } from '../type';
import { formatFormDataToRequestData, formatResponseDataToFormData } from '../utils/format';

import ScriptSection from './ScriptSection';
import SettingsSection from './SettingsSection';
import styles from './index.module.scss';

type Props<T extends LogtoJwtTokenKeyType> = {
  readonly className?: string;
  readonly token: T;
  readonly data?: JwtCustomizer<T>;
  readonly mutate: KeyedMutator<JwtCustomizer<T>>;
  readonly action: JwtAction;
};

function MainContent<T extends LogtoJwtTokenKeyType>({
  className,
  token,
  data,
  mutate,
  action,
}: Props<T>) {
  const api = useApi();
  const navigate = useNavigate();
  const { mutate: globalMutate } = useSWRConfig();

  const methods = useForm<JwtCustomizerForm>({
    defaultValues: formatResponseDataToFormData(token, action, data),
  });

  const {
    formState: { isDirty, isSubmitting },
    reset,
    handleSubmit,
  } = methods;

  const onSubmitHandler = handleSubmit(
    trySubmitSafe(async (data) => {
      if (isSubmitting) {
        return;
      }

      const { tokenType } = data;
      const payload = formatFormDataToRequestData(data);

      const updatedJwtCustomizer = await api
        .put(getApiPath(tokenType), { json: payload })
        .json<JwtCustomizer<T>>();

      await mutate(updatedJwtCustomizer);

      // Need to reset the form data ahead to avoid the unsaved changes alert
      reset(formatResponseDataToFormData(tokenType, action, updatedJwtCustomizer));

      // If the form is in create mode, navigate back to the previous page
      if (action === Action.Create) {
        // Need to trigger a global mutate to update the cache
        // Keep asynchrony to avoid page idling
        void globalMutate(getApiPath());
        navigate(-1);
      }
    })
  );

  return (
    <>
      <FormProvider {...methods}>
        <form className={classNames(styles.content, className)}>
          <ScriptSection />
          <SettingsSection action={action} />
        </form>
      </FormProvider>
      <SubmitFormChangesActionBar
        // Always show the action bar if is the create mode
        isOpen={isDirty || action === Action.Create}
        isSubmitting={isSubmitting}
        confirmText={action === Action.Create ? 'general.create' : 'general.save_changes'}
        className={classNames(styles.submitActionBar, styles.overwrite)}
        onDiscard={
          // If the form is in create mode, navigate back to the previous page
          action === Action.Create
            ? () => {
                navigate(-1);
              }
            : reset
        }
        onSubmit={onSubmitHandler}
      />
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty && !isSubmitting} onConfirm={reset} />
    </>
  );
}

export default MainContent;
