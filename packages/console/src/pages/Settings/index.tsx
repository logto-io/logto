import {
  builtInLanguageOptions as consoleBuiltInLanguageOptions,
  getDefaultLanguageTag,
} from '@logto/phrases';
import { AppearanceMode } from '@logto/schemas';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';

import CardTitle from '@/components/CardTitle';
import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import FormField from '@/components/FormField';
import RequestDataError from '@/components/RequestDataError';
import Select from '@/components/Select';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import type { UserPreferences } from '@/hooks/use-user-preferences';
import useUserPreferences from '@/hooks/use-user-preferences';

import ChangePassword from './components/ChangePassword';
import * as styles from './index.module.scss';

const Settings = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { mutate: mutateGlobal } = useSWRConfig();

  const defaultLanguage = getDefaultLanguageTag(language);

  const { data, error, update, isLoading, isLoaded } = useUserPreferences();
  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<UserPreferences>({ defaultValues: data });

  const onSubmit = handleSubmit(async (formData) => {
    if (isSubmitting) {
      return;
    }

    await update(formData);
    reset(formData);
    toast.success(t('general.saved'));
  });

  return (
    <div className={styles.container}>
      <CardTitle
        title="settings.title"
        subtitle="settings.description"
        className={styles.cardTitle}
      />
      {isLoading && <div>loading</div>}
      {error && (
        <RequestDataError
          error={error}
          onRetry={() => {
            void mutateGlobal('api/me/custom-data');
          }}
        />
      )}
      {isLoaded && (
        <DetailsForm
          isSubmitting={isSubmitting}
          isDirty={isDirty}
          onSubmit={onSubmit}
          onDiscard={reset}
        >
          <FormCard title="settings.settings">
            <FormField title="settings.language">
              <Controller
                name="language"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Select
                    value={value ?? defaultLanguage}
                    options={consoleBuiltInLanguageOptions}
                    onChange={onChange}
                  />
                )}
              />
            </FormField>
            <FormField title="settings.appearance">
              <Controller
                name="appearanceMode"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Select
                    value={value}
                    options={[
                      {
                        value: AppearanceMode.SyncWithSystem,
                        title: t('settings.appearance_system'),
                      },
                      {
                        value: AppearanceMode.LightMode,
                        title: t('settings.appearance_light'),
                      },
                      {
                        value: AppearanceMode.DarkMode,
                        title: t('settings.appearance_dark'),
                      },
                    ]}
                    onChange={onChange}
                  />
                )}
              />
            </FormField>
            <ChangePassword />
          </FormCard>
        </DetailsForm>
      )}
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} />
    </div>
  );
};

export default Settings;
