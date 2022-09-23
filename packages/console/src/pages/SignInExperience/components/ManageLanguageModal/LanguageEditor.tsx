import type { LanguageKey } from '@logto/core-kit';
import resource, {
  languageCodeAndDisplayNameMappings,
  Translation as UiTranslation,
} from '@logto/phrases-ui';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Button from '@/components/Button';
import useApi, { RequestError } from '@/hooks/use-api';
import Delete from '@/icons/Delete';

import { createEmptyUiTranslation, flattenObject } from '../../utilities';
import EditSection from './EditSection';
import * as style from './LanguageEditor.module.scss';
import { CustomPhraseResponse } from './types';

type LanguageEditorProps = {
  selectedLanguageKey: LanguageKey;
  onEdit: (isDirty: boolean) => void;
};

const emptyUiTranslation = createEmptyUiTranslation();

const LanguageEditor = ({ selectedLanguageKey, onEdit }: LanguageEditorProps) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const isBuiltInLanguage = Object.keys(resource).includes(selectedLanguageKey);
  const translationEntries = useMemo(
    () => Object.entries(resource[selectedLanguageKey].translation),
    [selectedLanguageKey]
  );

  const api = useApi();

  const { data: customPhrase, mutate } = useSWR<CustomPhraseResponse, RequestError>(
    `/api/custom-phrases/${selectedLanguageKey}`,
    {
      shouldRetryOnError: (error: unknown) => {
        if (error instanceof RequestError) {
          return error.status !== 404;
        }

        return true;
      },
    }
  );

  const formMethods = useForm<UiTranslation>();

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  useEffect(() => {
    onEdit(isDirty);
  }, [isDirty, onEdit]);

  const onSubmit = handleSubmit(async (formData: UiTranslation) => {
    const updatedCustomPhrase = await api
      .put(`/api/custom-phrases/${selectedLanguageKey}`, {
        json: {
          ...formData,
        },
      })
      .json<CustomPhraseResponse>();

    void mutate(updatedCustomPhrase);
    toast.success(t('general.saved'));
  });

  useEffect(() => {
    reset(customPhrase?.translation ?? emptyUiTranslation);
  }, [customPhrase, reset]);

  return (
    <div className={style.languageEditor}>
      <div className={style.title}>
        {languageCodeAndDisplayNameMappings[selectedLanguageKey]}
        <span>{selectedLanguageKey}</span>
        {isBuiltInLanguage && (
          <span className={style.builtInFlag}>
            {t('sign_in_exp.others.manage_language.logto_provided')}
          </span>
        )}
      </div>
      <form
        onSubmit={async (event) => {
          // Note: Avoid propagating the 'submit' event to the outer sign-in-experience form.
          event.stopPropagation();

          return onSubmit(event);
        }}
      >
        <div className={style.content}>
          <table>
            <thead>
              <tr>
                <th>{t('sign_in_exp.others.manage_language.key')}</th>
                <th>{t('sign_in_exp.others.manage_language.logto_source_language')}</th>
                <th>
                  <span className={style.customValuesColumn}>
                    {t('sign_in_exp.others.manage_language.custom_values')}
                    <Button
                      type="plain"
                      title="sign_in_exp.others.manage_language.clear_all"
                      className={style.clearButton}
                      icon={<Delete />}
                      onClick={() => {
                        reset(emptyUiTranslation);
                      }}
                    />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <FormProvider {...formMethods}>
                {translationEntries.map(([key, value]) => (
                  <EditSection key={key} dataKey={key} data={flattenObject(value)} />
                ))}
              </FormProvider>
            </tbody>
          </table>
        </div>
        <div className={style.footer}>
          <Button
            isLoading={isSubmitting}
            htmlType="submit"
            type="primary"
            size="large"
            title="general.save"
          />
        </div>
      </form>
    </div>
  );
};

export default LanguageEditor;
