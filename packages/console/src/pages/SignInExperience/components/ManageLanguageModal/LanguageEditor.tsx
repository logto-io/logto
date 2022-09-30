import { languages, LanguageTag } from '@logto/language-kit';
import resource, { isBuiltInLanguageTag } from '@logto/phrases-ui';
import en from '@logto/phrases-ui/lib/locales/en';
import { Translation } from '@logto/schemas';
import cleanDeep from 'clean-deep';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Button from '@/components/Button';
import useApi, { RequestError } from '@/hooks/use-api';
import Delete from '@/icons/Delete';

import { CustomPhrasesContext } from '../../hooks/use-custom-phrases-context';
import { CustomPhraseResponse } from '../../types';
import { createEmptyUiTranslation, flattenTranslation } from '../../utilities';
import EditSection from './EditSection';
import * as style from './LanguageEditor.module.scss';

const emptyUiTranslation = createEmptyUiTranslation();

const LanguageEditor = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    selectedLanguageTag,
    appendToCustomPhraseList,
    setIsCurrentCustomPhraseDirty,
    stopAddingLanguage,
  } = useContext(CustomPhrasesContext);

  const isBuiltIn = isBuiltInLanguageTag(selectedLanguageTag);

  const translationEntries = useMemo(
    () => Object.entries((isBuiltIn ? resource[selectedLanguageTag] : en).translation),
    [isBuiltIn, selectedLanguageTag]
  );

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

  const defaultFormValues = useMemo(
    () =>
      customPhrase && Object.keys(customPhrase.translation).length > 0
        ? customPhrase.translation
        : emptyUiTranslation,
    [customPhrase]
  );

  const formMethods = useForm<Translation>({
    defaultValues: defaultFormValues,
  });

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting, isDirty, dirtyFields },
  } = formMethods;

  useEffect(() => {
    /**
     * Note: This is a workaround for dirty state checking,
     * for the `isDirty` state does not work correctly when comparing form data with empty / undefined values.
     * Reference: https://github.com/react-hook-form/react-hook-form/issues/4740
     */
    setIsCurrentCustomPhraseDirty(isDirty && Object.keys(dirtyFields).length > 0);
  }, [
    /**
     * Note: `isDirty` is used to trigger this `useEffect`; for `dirtyFields` object only marks filed dirty at field level.
     * When `dirtyFields` is changed from `{keyA: false}` to `{keyA: true}`, this `useEffect` won't be triggered.
     */
    isDirty,
    dirtyFields,
    setIsCurrentCustomPhraseDirty,
  ]);

  const api = useApi();

  const upsertCustomPhrase = useCallback(
    async (languageTag: LanguageTag, translation: Translation) => {
      const updatedCustomPhrase = await api
        .put(`/api/custom-phrases/${languageTag}`, {
          json: {
            ...cleanDeep(translation),
          },
        })
        .json<CustomPhraseResponse>();

      appendToCustomPhraseList(updatedCustomPhrase);

      stopAddingLanguage();

      return updatedCustomPhrase;
    },
    [api, appendToCustomPhraseList, stopAddingLanguage]
  );

  const onSubmit = handleSubmit(async (formData: Translation) => {
    const updatedCustomPhrase = await upsertCustomPhrase(selectedLanguageTag, formData);
    void mutate(updatedCustomPhrase);
    toast.success(t('general.saved'));
  });

  useEffect(() => {
    reset(defaultFormValues);
  }, [
    /**
     * Note: trigger form reset when selectedLanguageTag changed,
     * for the `defaultValues` will not change when switching between languages with unavailable custom phrases.
     */
    selectedLanguageTag,
    defaultFormValues,
    reset,
  ]);

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
                        for (const [key, value] of Object.entries(
                          flattenTranslation(emptyUiTranslation)
                        )) {
                          setValue(key, value, { shouldDirty: true });
                        }
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
