import { Language } from '@logto/phrases';
import { AppearanceMode, Setting } from '@logto/schemas';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import FormField from '@/components/FormField';
import Select from '@/components/Select';
import TabNav, { TabNavLink } from '@/components/TabNav';
import { themeStorageKey } from '@/consts';
import useApi, { RequestError } from '@/hooks/use-api';
import * as detailsStyles from '@/scss/details.module.scss';

import * as styles from './index.module.scss';

const Settings = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate } = useSWR<Setting, RequestError>('/api/settings');
  const {
    reset,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<Setting>();
  const api = useApi();

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    if (!data || isSubmitting) {
      return;
    }

    const updatedData = await api
      .patch('/api/settings', {
        json: {
          ...formData,
        },
      })
      .json<Setting>();
    void mutate(updatedData);
    localStorage.setItem(themeStorageKey, updatedData.adminConsole.appearanceMode);
    toast.success(t('settings.saved'));
  });

  return (
    <Card className={classNames(detailsStyles.container, styles.container)}>
      <CardTitle title="settings.title" subtitle="settings.description" />
      <TabNav>
        <TabNavLink href="/settings">{t('settings.tabs.general')}</TabNavLink>
      </TabNav>
      {!data && !error && <div>loading</div>}
      {error && <div>{`error occurred: ${error.body.message}`}</div>}
      {data && (
        <form className={detailsStyles.body} onSubmit={onSubmit}>
          <div className={styles.fields}>
            <FormField
              isRequired
              title="admin_console.settings.language"
              className={styles.textField}
            >
              <Controller
                name="adminConsole.language"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Select
                    value={value}
                    options={[
                      {
                        value: Language.English,
                        title: t('settings.language_english'),
                      },
                      {
                        value: Language.Chinese,
                        title: t('settings.language_chinese'),
                      },
                    ]}
                    onChange={onChange}
                  />
                )}
              />
            </FormField>
            <FormField
              isRequired
              title="admin_console.settings.appearance"
              className={styles.textField}
            >
              <Controller
                name="adminConsole.appearanceMode"
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
          </div>
          <div className={detailsStyles.footer}>
            <div className={detailsStyles.footerMain}>
              <Button
                isLoading={isSubmitting}
                type="primary"
                htmlType="submit"
                title="general.save_changes"
              />
            </div>
          </div>
        </form>
      )}
    </Card>
  );
};

export default Settings;
