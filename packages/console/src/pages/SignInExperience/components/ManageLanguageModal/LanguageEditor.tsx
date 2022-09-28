import { languages, LanguageTag } from '@logto/language-kit';
import resource, { isBuiltInLanguageTag } from '@logto/phrases-ui';
import en from '@logto/phrases/lib/locales/en';
import { Translation } from '@logto/schemas';
import cleanDeep from 'clean-deep';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Button from '@/components/Button';
import useApi, { RequestError } from '@/hooks/use-api';
import Delete from '@/icons/Delete';

import { createEmptyUiTranslation, flattenTranslation } from '../../utilities';
import EditSection from './EditSection';
import * as style from './LanguageEditor.module.scss';
import { CustomPhraseResponse } from './types';

type LanguageEditorProps = {
  selectedLanguageTag: LanguageTag;
  onFormStateChange: (isDirty: boolean) => void;
};

const emptyUiTranslation = createEmptyUiTranslation();

const LanguageEditor = ({ selectedLanguageTag, onFormStateChange }: LanguageEditorProps) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const isBuiltIn = isBuiltInLanguageTag(selectedLanguageTag);

  const translationEntries = useMemo(
    () => Object.entries((isBuiltIn ? resource[selectedLanguageTag] : en).translation),
    [isBuiltIn, selectedLanguageTag]
  );

  const api = useApi();

  const { data: customPhrase, mutate } = useSWR<CustomPhraseResponse, RequestError>(
    `/api/custom-phrases/${selectedLanguageTag}`,
    {
      shouldRetryOnError: (error: unknown) => {
        if (error instanceof RequestError) {
          return error.status !== 404;
        }

        return true;
      },
    }
  );

  const formMethods = useForm<Translation>();

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  useEffect(() => {
    onFormStateChange(isDirty);
  }, [isDirty, onFormStateChange]);

  const onSubmit = handleSubmit(async (formData: Translation) => {
    const updatedCustomPhrase = await api
      .put(`/api/custom-phrases/${selectedLanguageTag}`, {
        json: {
          ...cleanDeep(formData),
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
        {languages[selectedLanguageTag]}
        <span>{selectedLanguageTag}</span>
        {isBuiltIn && (
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
                  <EditSection key={key} dataKey={key} data={flattenTranslation(value)} />
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
