import { languageOptions } from '@logto/phrases-ui';
import classNames from 'classnames';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/components/FormField';
import Select from '@/components/Select';
import Switch from '@/components/Switch';
import * as textButtonStyles from '@/components/TextButton/index.module.scss';

import { SignInExperienceForm } from '../types';
import ManageLanguageModal from './ManageLanguageModal';
import * as styles from './index.module.scss';

const LanguagesForm = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { watch, control, register } = useFormContext<SignInExperienceForm>();
  const isAutoDetect = watch('languageInfo.autoDetect');
  const [isManageLanguageFormOpen, setIsManageLanguageFormOpen] = useState(false);

  return (
    <>
      <div className={styles.title}>{t('sign_in_exp.others.languages.title')}</div>
      <FormField title="sign_in_exp.others.languages.enable_auto_detect">
        <Switch
          {...register('languageInfo.autoDetect')}
          label={t('sign_in_exp.others.languages.description')}
        />
      </FormField>
      <div
        className={classNames(textButtonStyles.button, styles.manageLanguage)}
        onClick={() => {
          setIsManageLanguageFormOpen(true);
        }}
      >
        {t('sign_in_exp.others.languages.manage_language')}
      </div>
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
      <ManageLanguageModal
        isOpen={isManageLanguageFormOpen}
        onClose={() => {
          setIsManageLanguageFormOpen(false);
        }}
      />
    </>
  );
};

export default LanguagesForm;
