import type { LanguageTag } from '@logto/language-kit';
import { languages as uiLanguageNameMapping } from '@logto/language-kit';
import resource, { isBuiltInLanguageTag } from '@logto/phrases-experience';
import en from '@logto/phrases-experience/lib/locales/en';
import {
  type LocalePhraseGroupKey,
  type LocalePhraseKey,
} from '@logto/phrases-experience/lib/types';
import type { SignInExperience, Translation } from '@logto/schemas';
import cleanDeep from 'clean-deep';
import deepmerge from 'deepmerge';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR, { useSWRConfig } from 'swr';

import Clear from '@/assets/icons/clear.svg?react';
import Delete from '@/assets/icons/delete.svg?react';
import Button from '@/ds-components/Button';
import ConfirmModal from '@/ds-components/ConfirmModal';
import IconButton from '@/ds-components/IconButton';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
import Textarea from '@/ds-components/Textarea';
import { Tooltip } from '@/ds-components/Tip';
import useApi, { type RequestError } from '@/hooks/use-api';
import useSwrFetcher from '@/hooks/use-swr-fetcher';
import useUiLanguages from '@/hooks/use-ui-languages';
import type { CustomPhraseResponse } from '@/types/custom-phrase';
import { trySubmitSafe } from '@/utils/form';
import { shouldRetryOnError } from '@/utils/request';

import styles from './LanguageDetails.module.scss';
import { hiddenLocalePhraseGroups, hiddenLocalePhrases } from './constants';
import { LanguageEditorContext } from './use-language-editor-context';
import { createEmptyUiTranslation, flattenTranslation } from './utils';

const emptyUiTranslation = createEmptyUiTranslation();

function LanguageDetails() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data: signInExperience } = useSWR<SignInExperience, RequestError>('api/sign-in-exp');
  const { languages } = useUiLanguages();
  const { selectedLanguage, isDirty, setIsDirty, setSelectedLanguage } =
    useContext(LanguageEditorContext);
  const [isDeletionAlertOpen, setIsDeletionAlertOpen] = useState(false);
  const isBuiltIn = isBuiltInLanguageTag(selectedLanguage);
  const isDefaultLanguage = signInExperience?.languageInfo.fallbackLanguage === selectedLanguage;
  const fetchApi = useApi({ hideErrorToast: ['entity.not_found'] });
  const fetcher = useSwrFetcher<CustomPhraseResponse>(fetchApi);

  const translationData = useMemo(
    () =>
      Object.entries((isBuiltIn ? resource[selectedLanguage] : en).translation)
        .filter(
          // eslint-disable-next-line no-restricted-syntax
          ([groupKey]) => !hiddenLocalePhraseGroups.includes(groupKey as LocalePhraseGroupKey)
        )
        .map(([groupKey, value]) => ({
          key: groupKey,
          label: groupKey,
          labelClassName: styles.sectionTitle,
          data: Object.entries(flattenTranslation(value))
            .filter(
              ([phraseKey]) =>
                // eslint-disable-next-line no-restricted-syntax
                !hiddenLocalePhrases.includes(`${groupKey}.${phraseKey}` as LocalePhraseKey)
            )
            .map(([phraseKey, value]) => ({
              phraseKey,
              sourceValue: value,
              fieldKey: `${groupKey}.${phraseKey}`,
            })),
        })),
    [isBuiltIn, selectedLanguage]
  );

  const { data: customPhrase, mutate } = useSWR<CustomPhraseResponse, RequestError>(
    `api/custom-phrases/${selectedLanguage}`,
    {
      fetcher,
      shouldRetryOnError: shouldRetryOnError({ ignore: [404] }),
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
    formState: { isSubmitting, isDirty: isFormStateDirty, dirtyFields },
  } = useForm<Translation>({
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    /**
     * Note: This is a workaround for dirty state checking,
     * for the `isDirty` state does not work correctly when comparing form data with empty / undefined values.
     * Reference: https://github.com/react-hook-form/react-hook-form/issues/4740
     */
    setIsDirty(isFormStateDirty && Object.keys(dirtyFields).length > 0);
  }, [
    /**
     * Note: `isDirty` is used to trigger this `useEffect`; for `dirtyFields` object only marks field dirty at field level.
     * When `dirtyFields` is changed from `{keyA: false}` to `{keyA: true}`, this `useEffect` won't be triggered.
     */
    isFormStateDirty,
    dirtyFields,
    setIsDirty,
  ]);

  const { mutate: globalMutate } = useSWRConfig();
  const api = useApi();

  const upsertCustomPhrase = useCallback(
    async (languageTag: LanguageTag, translation: Translation) => {
      const updatedCustomPhrase = await api
        .put(`api/custom-phrases/${languageTag}`, {
          json: {
            ...cleanDeep(translation),
          },
        })
        .json<CustomPhraseResponse>();

      void globalMutate('api/custom-phrases');

      return updatedCustomPhrase;
    },
    [api, globalMutate]
  );

  const onConfirmDeletion = useCallback(async () => {
    setIsDeletionAlertOpen(false);

    if (isDefaultLanguage) {
      return;
    }

    await api.delete(`api/custom-phrases/${selectedLanguage}`);

    await globalMutate('api/custom-phrases');
    setIsDirty(false);
    setSelectedLanguage(languages.find((languageTag) => languageTag !== selectedLanguage) ?? 'en');
  }, [
    api,
    globalMutate,
    isDefaultLanguage,
    languages,
    selectedLanguage,
    setIsDirty,
    setSelectedLanguage,
  ]);

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData: Translation) => {
      const updatedCustomPhrase = await upsertCustomPhrase(selectedLanguage, formData);
      reset(updatedCustomPhrase.translation);
      void mutate(updatedCustomPhrase);
      toast.success(t('general.saved'));
    })
  );

  useEffect(() => {
    if (isDirty) {
      return;
    }
    reset(defaultFormValues);
  }, [
    /**
     * Note: trigger form reset when selectedLanguage changed,
     * for the `defaultValues` will not change when switching between languages with unavailable custom phrases.
     */
    selectedLanguage,
    defaultFormValues,
    reset,
    isDirty,
  ]);

  return (
    <div className={styles.languageDetails}>
      <div className={styles.title}>
        <div className={styles.languageInfo}>
          {uiLanguageNameMapping[selectedLanguage]}
          <span>{selectedLanguage}</span>
          {isBuiltIn && <Tag>{t('sign_in_exp.content.manage_language.logto_provided')}</Tag>}
        </div>
        {!isBuiltIn && (
          <Tooltip content={t('sign_in_exp.content.manage_language.deletion_tip')}>
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
          headerTableClassName={styles.tableWrapper}
          bodyTableWrapperClassName={styles.tableWrapper}
          rowIndexKey="phraseKey"
          rowGroups={translationData}
          columns={[
            {
              title: t('sign_in_exp.content.manage_language.key'),
              dataIndex: 'phraseKey',
              render: ({ phraseKey }) => phraseKey,
              className: styles.sectionDataKey,
            },
            {
              title: t('sign_in_exp.content.manage_language.logto_source_values'),
              dataIndex: 'sourceValue',
              render: ({ sourceValue }) => (
                <div className={styles.sectionBuiltInText}>{sourceValue}</div>
              ),
            },
            {
              title: (
                <span className={styles.customValuesColumn}>
                  {t('sign_in_exp.content.manage_language.custom_values')}
                  <Tooltip
                    anchorClassName={styles.clearButton}
                    content={t('sign_in_exp.content.manage_language.clear_all_tip')}
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
            title="general.save"
            onClick={async () => onSubmit()}
          />
        </div>
      </div>
      <ConfirmModal
        isOpen={isDeletionAlertOpen}
        title={
          isDefaultLanguage
            ? 'sign_in_exp.content.manage_language.default_language_deletion_title'
            : 'sign_in_exp.content.manage_language.deletion_title'
        }
        confirmButtonText={isDefaultLanguage ? 'general.got_it' : 'general.delete'}
        confirmButtonType={isDefaultLanguage ? 'primary' : 'danger'}
        onCancel={() => {
          setIsDeletionAlertOpen(false);
        }}
        onConfirm={onConfirmDeletion}
      >
        {isDefaultLanguage
          ? t('sign_in_exp.content.manage_language.default_language_deletion_description', {
              language: uiLanguageNameMapping[selectedLanguage],
            })
          : t('sign_in_exp.content.manage_language.deletion_description')}
      </ConfirmModal>
    </div>
  );
}

export default LanguageDetails;
