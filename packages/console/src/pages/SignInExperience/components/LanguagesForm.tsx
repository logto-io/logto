import { languageOptions } from '@logto/phrases-ui';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/components/FormField';
import RadioGroup, { Radio } from '@/components/RadioGroup';
import Select from '@/components/Select';

import { LanguageMode, SignInExperienceForm } from '../types';
import * as styles from './index.module.scss';

const LanguagesForm = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { watch, control } = useFormContext<SignInExperienceForm>();
  const mode = watch('languageInfo.mode');

  return (
    <>
      <div className={styles.title}>{t('sign_in_exp.others.languages.title')}</div>
      <FormField title="sign_in_exp.others.languages.mode">
        <Controller
          name="languageInfo.mode"
          control={control}
          defaultValue={LanguageMode.Auto}
          render={({ field: { onChange, value, name } }) => (
            <RadioGroup value={value} name={name} onChange={onChange}>
              <Radio value={LanguageMode.Auto} title="sign_in_exp.others.languages.auto" />
              <Radio value={LanguageMode.Fixed} title="sign_in_exp.others.languages.fixed" />
            </RadioGroup>
          )}
        />
      </FormField>
      {mode === LanguageMode.Auto && (
        <FormField
          title="sign_in_exp.others.languages.fallback_language"
          tooltip="sign_in_exp.others.languages.fallback_language_tip"
        >
          <Controller
            name="languageInfo.fallbackLanguage"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Select value={value} options={languageOptions} onChange={onChange} />
            )}
          />
        </FormField>
      )}
      {mode === LanguageMode.Fixed && (
        <FormField title="sign_in_exp.others.languages.fixed_language">
          <Controller
            name="languageInfo.fixedLanguage"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Select value={value} options={languageOptions} onChange={onChange} />
            )}
          />
        </FormField>
      )}
    </>
  );
};

export default LanguagesForm;
