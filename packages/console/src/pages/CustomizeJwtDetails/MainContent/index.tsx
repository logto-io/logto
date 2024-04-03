import { type LogtoJwtTokenKeyType } from '@logto/schemas';
import classNames from 'classnames';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { type KeyedMutator } from 'swr';

import SubmitFormChangesActionBar from '@/components/SubmitFormChangesActionBar';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import useApi from '@/hooks/use-api';
import { trySubmitSafe } from '@/utils/form';

import useJwtCustomizer from '../../CustomizeJwt/use-jwt-customizer';
import { type Action, type JwtCustomizer, type JwtCustomizerForm } from '../type';
import { formatFormDataToRequestData, formatResponseDataToFormData } from '../utils/format';
import { getApiPath } from '../utils/path';

import ScriptSection from './ScriptSection';
import SettingsSection from './SettingsSection';
import * as styles from './index.module.scss';

type Props<T extends LogtoJwtTokenKeyType> = {
  className?: string;
  token: T;
  data?: JwtCustomizer<T>;
  mutate: KeyedMutator<JwtCustomizer<T>>;
  action: Action;
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
  const { mutate: mutateJwtCustomizers } = useJwtCustomizer();

  const methods = useForm<JwtCustomizerForm>({
    defaultValues: formatResponseDataToFormData(token, data),
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

      reset(formatResponseDataToFormData(tokenType, updatedJwtCustomizer));

      /**
       * Should `reset` (to set `isDirty` to false) before navigating back to the custom JWT listing page.
       * Otherwise, the unsaved changes alert modal will be triggered on clicking `create` button, which
       * is not expected.
       */
      if (action === 'create') {
        // Refresh the JWT customizers list to reflect the latest changes.
        await mutateJwtCustomizers();
        navigate(-1);
      }
    })
  );

  return (
    <>
      <FormProvider {...methods}>
        <form className={classNames(styles.content, className)}>
          <ScriptSection />
          <SettingsSection />
        </form>
      </FormProvider>
      <SubmitFormChangesActionBar
        // Always show the action bar if is the create mode
        isOpen={isDirty || action === 'create'}
        isSubmitting={isSubmitting}
        confirmText={action === 'create' ? 'general.create' : 'general.save_changes'}
        className={classNames(styles.submitActionBar, styles.overwrite)}
        onDiscard={
          // If the form is in create mode, navigate back to the previous page
          action === 'create'
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
