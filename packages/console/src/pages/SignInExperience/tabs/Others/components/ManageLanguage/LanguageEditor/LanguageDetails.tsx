import type { LanguageTag } from '@logto/language-kit';
import { languages as uiLanguageNameMapping } from '@logto/language-kit';
import resource, { isBuiltInLanguageTag } from '@logto/phrases-ui';
import en from '@logto/phrases-ui/lib/locales/en';
import type { SignInExperience, Translation } from '@logto/schemas';
import cleanDeep from 'clean-deep';
import deepmerge from 'deepmerge';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR, { useSWRConfig } from 'swr';

import Clear from '@/assets/images/clear.svg';
import Delete from '@/assets/images/delete.svg';
import Button from '@/components/Button';
import ConfirmModal from '@/components/ConfirmModal';
import IconButton from '@/components/IconButton';
import Table from '@/components/Table';
import Textarea from '@/components/Textarea';
import { Tooltip } from '@/components/Tip';
import useApi, { RequestError } from '@/hooks/use-api';
import useUiLanguages from '@/hooks/use-ui-languages';
import {
  createEmptyUiTranslation,
  flattenTranslation,
} from '@/pages/SignInExperience/utils/language';
import type { CustomPhraseResponse } from '@/types/custom-phrase';

import * as styles from './LanguageDetails.module.scss';
import { LanguageEditorContext } from './use-language-editor-context';

const emptyUiTranslation = createEmptyUiTranslation();

const LanguageDetails = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { data: signInExperience } = useSWR<SignInExperience, RequestError>('/api/sign-in-exp');

  const { languages } = useUiLanguages();

  const { selectedLanguage, setIsDirty, setSelectedLanguage } = useContext(LanguageEditorContext);

  const [isDeletionAlertOpen, setIsDeletionAlertOpen] = useState(false);

  const isBuiltIn = isBuiltInLanguageTag(selectedLanguage);

  const isDefaultLanguage = signInExperience?.languageInfo.fallbackLanguage === selectedLanguage;

  const translationEntries = useMemo(
    () => Object.entries((isBuiltIn ? resource[selectedLanguage] : en).translation),
    [isBuiltIn, selectedLanguage]
  );

  const { data: customPhrase, mutate } = useSWR<CustomPhraseResponse, RequestError>(
    `/api/custom-phrases/${selectedLanguage}`,
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
    () => deepmerge(emptyUiTranslation, customPhrase?.translation ?? {}),
    [customPhrase]
  );

  const {
    handleSubmit,
    reset,
    setValue,
    register,
    formState: { isSubmitting, isDirty, dirtyFields },
  } = useForm<Translation>({
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    /**
     * Note: This is a workaround for dirty state checking,
     * for the `isDirty` state does not work correctly when comparing form data with empty / undefined values.
     * Reference: https://github.com/react-hook-form/react-hook-form/issues/4740
     */
    setIsDirty(isDirty && Object.keys(dirtyFields).length > 0);
  }, [
    /**
     * Note: `isDirty` is used to trigger this `useEffect`; for `dirtyFields` object only marks filed dirty at field level.
     * When `dirtyFields` is changed from `{keyA: false}` to `{keyA: true}`, this `useEffect` won't be triggered.
     */
    isDirty,
    dirtyFields,
    setIsDirty,
  ]);

  const { mutate: globalMutate } = useSWRConfig();

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

      void globalMutate('/api/custom-phrases');

      return updatedCustomPhrase;
    },
    [api, globalMutate]
  );

  const onConfirmDeletion = useCallback(async () => {
    setIsDeletionAlertOpen(false);

    if (isDefaultLanguage) {
      return;
    }

    await api.delete(`/api/custom-phrases/${selectedLanguage}`);

    await globalMutate('/api/custom-phrases');

    setSelectedLanguage(languages.find((languageTag) => languageTag !== selectedLanguage) ?? 'en');
  }, [api, globalMutate, isDefaultLanguage, languages, selectedLanguage, setSelectedLanguage]);

  const onSubmit = handleSubmit(async (formData: Translation) => {
    console.log(formData);
    const updatedCustomPhrase = await upsertCustomPhrase(selectedLanguage, formData);
    void mutate(updatedCustomPhrase);
    toast.success(t('general.saved'));
  });

  useEffect(() => {
    reset(defaultFormValues);
  }, [
    /**
     * Note: trigger form reset when selectedLanguage changed,
     * for the `defaultValues` will not change when switching between languages with unavailable custom phrases.
     */
    selectedLanguage,
    defaultFormValues,
    reset,
  ]);

  return (
    <div className={styles.languageDetails}>
      <div className={styles.title}>
        <div className={styles.languageInfo}>
          {uiLanguageNameMapping[selectedLanguage]}
          <span>{selectedLanguage}</span>
          {isBuiltIn && (
            <span className={styles.builtInFlag}>
              {t('sign_in_exp.others.manage_language.logto_provided')}
            </span>
          )}
        </div>
        {!isBuiltIn && (
          <Tooltip content={t('sign_in_exp.others.manage_language.deletion_tip')}>
            <IconButton
              onClick={() => {
                setIsDeletionAlertOpen(true);
              }}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        )}
      </div>
      <div className={styles.container}>
        <Table
          isRowHoverEffectDisabled
          className={styles.content}
          headerClassName={styles.tableWrapper}
          bodyClassName={styles.tableWrapper}
          rowIndexKey="phraseKey"
          rowGroups={translationEntries.map(([groupKey, value]) => ({
            key: groupKey,
            label: groupKey,
            labelClassName: styles.sectionTitle,
            data: Object.entries(flattenTranslation(value)).map(([phraseKey, value]) => ({
              phraseKey,
              sourceValue: value,
              fieldKey: `${groupKey}.${phraseKey}`,
            })),
          }))}
          columns={[
            {
              title: t('sign_in_exp.others.manage_language.key'),
              dataIndex: 'phraseKey',
              render: ({ phraseKey }) => phraseKey,
              className: styles.sectionDataKey,
            },
            {
              title: t('sign_in_exp.others.manage_language.logto_source_values'),
              dataIndex: 'sourceValue',
              render: ({ sourceValue }) => (
                <div className={styles.sectionBuiltInText}>{sourceValue}</div>
              ),
            },
            {
              title: (
                <span className={styles.customValuesColumn}>
                  {t('sign_in_exp.others.manage_language.custom_values')}
                  <Tooltip
                    anchorClassName={styles.clearButton}
                    content={t('sign_in_exp.others.manage_language.clear_all_tip')}
                  >
                    <IconButton
                      size="small"
                      onClick={() => {
                        for (const [key, value] of Object.entries(
                          flattenTranslation(emptyUiTranslation)
                        )) {
                          setValue(key, value, { shouldDirty: true });
                        }
                      }}
                    >
                      <Clear className={styles.clearIcon} />
                    </IconButton>
                  </Tooltip>
                </span>
              ),
              dataIndex: 'fieldKey',
              render: ({ fieldKey }) => (
                <Textarea className={styles.sectionInputArea} {...register(fieldKey)} />
              ),
              className: styles.inputCell,
            },
          ]}
        />
        <div className={styles.footer}>
          <Button
            isLoading={isSubmitting}
            type="primary"
            size="large"
            title="general.save"
            onClick={async () => onSubmit()}
          />
        </div>
      </div>
      <ConfirmModal
        isOpen={isDeletionAlertOpen}
        title={
          isDefaultLanguage
            ? 'sign_in_exp.others.manage_language.default_language_deletion_title'
            : 'sign_in_exp.others.manage_language.deletion_title'
        }
        confirmButtonText={isDefaultLanguage ? 'general.got_it' : 'general.delete'}
        confirmButtonType={isDefaultLanguage ? 'primary' : 'danger'}
        onCancel={() => {
          setIsDeletionAlertOpen(false);
        }}
        onConfirm={onConfirmDeletion}
      >
        {isDefaultLanguage
          ? t('sign_in_exp.others.manage_language.default_language_deletion_description', {
              language: uiLanguageNameMapping[selectedLanguage],
            })
          : t('sign_in_exp.others.manage_language.deletion_description')}
      </ConfirmModal>
    </div>
  );
};

export default LanguageDetails;
