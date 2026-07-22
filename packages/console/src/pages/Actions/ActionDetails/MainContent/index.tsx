import { type LogtoAction, type LogtoActionKey } from '@logto/schemas';
import classNames from 'classnames';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSWRConfig, type KeyedMutator } from 'swr';

import SubmitFormChangesActionBar from '@/components/SubmitFormChangesActionBar';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import useApi from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { trySubmitSafe } from '@/utils/form';

import { ActionPageMode } from '../../types';
import {
  getActionApiPath,
  getActionPagePath,
  invalidateActionCache,
  actionsPath,
} from '../../utils';
import { type ActionForm } from '../type';
import { formatFormDataToRequestData, formatResponseDataToFormData } from '../utils/format';

import ScriptSection from './ScriptSection';
import SettingsSection from './SettingsSection';
import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly actionType: LogtoActionKey;
  readonly data?: LogtoAction;
  readonly mutate: KeyedMutator<LogtoAction>;
  readonly mode: ActionPageMode;
};

function MainContent({ className, actionType, data, mutate, mode }: Props) {
  const api = useApi();
  const { navigate } = useTenantPathname();
  const { mutate: globalMutate } = useSWRConfig();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const methods = useForm<ActionForm>({
    defaultValues: formatResponseDataToFormData(actionType, mode, data),
  });

  const {
    formState: { isDirty, isSubmitting },
    reset,
    handleSubmit,
  } = methods;

  const onSubmitHandler = handleSubmit(
    trySubmitSafe(async (formData) => {
      if (isSubmitting) {
        return;
      }

      const payload = formatFormDataToRequestData(formData);
      const apiPath = getActionApiPath(actionType);

      const updatedAction = await api.put(apiPath, { json: payload }).json<LogtoAction>();

      await mutate(updatedAction);
      await invalidateActionCache(globalMutate, actionType);

      reset(formatResponseDataToFormData(actionType, mode, updatedAction));

      if (mode === ActionPageMode.Create) {
        toast.success(t('actions.created'));
        navigate(getActionPagePath(actionType, ActionPageMode.Edit), { replace: true });
        return;
      }

      toast.success(t('actions.saved'));
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
        isOpen={isDirty || mode === ActionPageMode.Create}
        isSubmitting={isSubmitting}
        confirmText={mode === ActionPageMode.Create ? 'general.create' : 'general.save_changes'}
        className={classNames(styles.submitActionBar, styles.overwrite)}
        onDiscard={
          mode === ActionPageMode.Create
            ? () => {
                navigate(actionsPath);
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
