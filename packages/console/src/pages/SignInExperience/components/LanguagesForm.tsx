import { languages as uiLanguageNameMapping } from '@logto/language-kit';
import { SignInExperience } from '@logto/schemas';
import { useEffect, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import FormField from '@/components/FormField';
import Select from '@/components/Select';
import Switch from '@/components/Switch';
import { RequestError } from '@/hooks/use-api';
import useUiLanguages from '@/hooks/use-ui-languages';

import { SignInExperienceForm } from '../types';
import ManageLanguageButton from './ManageLanguage/ManageLanguageButton';
import * as styles from './index.module.scss';

type Props = {
  isManageLanguageVisible?: boolean;
};

const LanguagesForm = ({ isManageLanguageVisible = false }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data: signInExperience } = useSWR<SignInExperience, RequestError>('/api/sign-in-exp');
  const { watch, control, register, setValue } = useFormContext<SignInExperienceForm>();
  const isAutoDetect = watch('languageInfo.autoDetect');
  const selectedDefaultLanguage = watch('languageInfo.fallbackLanguage');
  const { languages } = useUiLanguages();

  const languageOptions = useMemo(() => {
    return languages.map((languageTag) => ({
      value: languageTag,
      title: uiLanguageNameMapping[languageTag],
    }));
  }, [languages]);

  useEffect(() => {
    if (!languages.includes(selectedDefaultLanguage)) {
      setValue(
        'languageInfo.fallbackLanguage',
        signInExperience?.languageInfo.fallbackLanguage ?? 'en'
      );
    }
  }, [languages, selectedDefaultLanguage, setValue, signInExperience]);

  return (
    <>
      <div className={styles.title}>{t('sign_in_exp.others.languages.title')}</div>
      <FormField title="sign_in_exp.others.languages.enable_auto_detect">
        <Switch
          {...register('languageInfo.autoDetect')}
          label={t('sign_in_exp.others.languages.description')}
        />
        {isManageLanguageVisible && <ManageLanguageButton />}
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
