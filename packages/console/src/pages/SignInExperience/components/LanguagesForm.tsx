import { languageOptions } from '@logto/phrases-ui';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/components/FormField';
import Select from '@/components/Select';
import Switch from '@/components/Switch';

import { SignInExperienceForm } from '../types';
import * as styles from './index.module.scss';

const LanguagesForm = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { watch, control, register } = useFormContext<SignInExperienceForm>();
  const isAutoDetect = watch('languageInfo.autoDetect');

  return (
    <>
      <div className={styles.title}>{t('sign_in_exp.others.languages.title')}</div>
      <FormField title="sign_in_exp.others.languages.enable_auto_detect">
        <Switch
          {...register('languageInfo.autoDetect')}
          label={t('sign_in_exp.others.languages.description')}
        />
      </FormField>
      <FormField title="sign_in_exp.others.languages.default_language">
        <Controller
          name="languageInfo.fallbackLanguage"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Select value={value} options={languageOptions} onChange={onChange} />
          )}
        />
        <div className={styles.defaultLanguageDescription}>
          {isAutoDetect
            ? t('sign_in_exp.others.languages.default_language_description_auto')
            : t('sign_in_exp.others.languages.default_language_description_fixed')}
        </div>
      </FormField>
    </>
  );
};

export default LanguagesForm;
