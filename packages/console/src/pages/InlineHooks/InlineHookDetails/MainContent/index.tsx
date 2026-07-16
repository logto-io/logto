import { type InlineHook, type LogtoInlineHookKey } from '@logto/schemas';
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

import { InlineHookAction } from '../../types';
import {
  getInlineHookApiPath,
  getInlineHookPagePath,
  invalidateInlineHookCache,
  inlineHooksPath,
} from '../../utils';
import { type InlineHookForm } from '../type';
import { formatFormDataToRequestData, formatResponseDataToFormData } from '../utils/format';

import ScriptSection from './ScriptSection';
import SettingsSection from './SettingsSection';
import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly hookType: LogtoInlineHookKey;
  readonly data?: InlineHook;
  readonly mutate: KeyedMutator<InlineHook>;
  readonly action: InlineHookAction;
};

function MainContent({ className, hookType, data, mutate, action }: Props) {
  const api = useApi();
  const { navigate } = useTenantPathname();
  const { mutate: globalMutate } = useSWRConfig();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const methods = useForm<InlineHookForm>({
    defaultValues: formatResponseDataToFormData(hookType, action, data),
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
      const apiPath = getInlineHookApiPath(hookType);

      const updatedInlineHook = await api.put(apiPath, { json: payload }).json<InlineHook>();

      await mutate(updatedInlineHook);
      await invalidateInlineHookCache(globalMutate, hookType);

      reset(formatResponseDataToFormData(hookType, action, updatedInlineHook));

      if (action === InlineHookAction.Create) {
        toast.success(t('inline_hooks.created'));
        navigate(getInlineHookPagePath(hookType, InlineHookAction.Edit), { replace: true });
        return;
      }

      toast.success(t('inline_hooks.saved'));
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
        isOpen={isDirty || action === InlineHookAction.Create}
        isSubmitting={isSubmitting}
        confirmText={action === InlineHookAction.Create ? 'general.create' : 'general.save_changes'}
        className={classNames(styles.submitActionBar, styles.overwrite)}
        onDiscard={
          action === InlineHookAction.Create
            ? () => {
                navigate(inlineHooksPath);
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
