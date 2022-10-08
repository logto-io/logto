import { languages as uiLanguageNameMapping } from '@logto/language-kit';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/components/FormField';
import Select from '@/components/Select';
import Switch from '@/components/Switch';
import * as textButtonStyles from '@/components/TextButton/index.module.scss';
import useUiLanguages from '@/hooks/use-ui-languages';

import useLanguageEditorContext from '../hooks/use-language-editor-context';
import { SignInExperienceForm } from '../types';
import ManageLanguageModal from './ManageLanguageModal';
import * as styles from './index.module.scss';

type Props = {
  isManageLanguageVisible?: boolean;
};

const LanguagesForm = ({ isManageLanguageVisible = false }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { watch, control, register } = useFormContext<SignInExperienceForm>();
  const isAutoDetect = watch('languageInfo.autoDetect');
  const [isManageLanguageFormOpen, setIsManageLanguageFormOpen] = useState(false);
  const { languages } = useUiLanguages();

  const languageOptions = useMemo(() => {
    return languages.map((languageTag) => ({
      value: languageTag,
      title: uiLanguageNameMapping[languageTag],
    }));
  }, [languages]);

  const { context: languageEditorContext, Provider: LanguageEditorContextProvider } =
    useLanguageEditorContext(languages);

  return (
    <>
      <div className={styles.title}>{t('sign_in_exp.others.languages.title')}</div>
      <FormField title="sign_in_exp.others.languages.enable_auto_detect">
        <Switch
          {...register('languageInfo.autoDetect')}
          label={t('sign_in_exp.others.languages.description')}
        />
      </FormField>
      {isManageLanguageVisible && (
        <div
          className={classNames(textButtonStyles.button, styles.manageLanguage)}
          onClick={() => {
            setIsManageLanguageFormOpen(true);
          }}
        >
          {t('sign_in_exp.others.languages.manage_language')}
        </div>
      )}
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
      <LanguageEditorContextProvider value={languageEditorContext}>
        <ManageLanguageModal
          isOpen={isManageLanguageFormOpen}
          languageTags={languages}
          onClose={() => {
            setIsManageLanguageFormOpen(false);
          }}
        />
      </LanguageEditorContextProvider>
    </>
  );
};

export default LanguagesForm;
