import {
  builtInLanguageOptions as consoleBuiltInLanguageOptions,
  getDefaultLanguageTag,
} from '@logto/phrases';
import { AppearanceMode } from '@logto/schemas';
import classNames from 'classnames';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import FormField from '@/components/FormField';
import Select from '@/components/Select';
import TabNav, { TabNavItem } from '@/components/TabNav';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import type { UserPreferences } from '@/hooks/use-user-preferences';
import useUserPreferences from '@/hooks/use-user-preferences';
import * as detailsStyles from '@/scss/details.module.scss';

import ChangePassword from './components/ChangePassword';
import * as styles from './index.module.scss';

const Settings = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(undefined, { keyPrefix: 'admin_console' });

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
    <Card className={classNames(detailsStyles.container, styles.container)}>
      <CardTitle title="settings.title" subtitle="settings.description" />
      <TabNav>
        <TabNavItem href="/settings">{t('settings.tabs.general')}</TabNavItem>
      </TabNav>
      {isLoading && <div>loading</div>}
      {error && <div>{`error occurred: ${error.body?.message ?? error.message}`}</div>}
      {isLoaded && (
        <form className={detailsStyles.body} onSubmit={onSubmit}>
          <div className={styles.fields}>
            <FormField title="settings.language" className={styles.textField}>
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
            <FormField title="settings.appearance" className={styles.textField}>
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
          </div>
          <div className={detailsStyles.footer}>
            <div className={detailsStyles.footerMain}>
              <Button
                isLoading={isSubmitting}
                type="primary"
                htmlType="submit"
                size="large"
                title="general.save_changes"
              />
            </div>
          </div>
        </form>
      )}
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} />
    </Card>
  );
};

export default Settings;
