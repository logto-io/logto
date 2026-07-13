import {
  type DomainVerificationFile,
  DomainVerificationFileContentType,
  domainVerificationFileGuard,
  domainVerificationFilePathGuard,
} from '@logto/schemas';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Delete from '@/assets/icons/delete.svg?react';
import Edit from '@/assets/icons/edit.svg?react';
import Plus from '@/assets/icons/plus.svg?react';
import Button from '@/ds-components/Button';
import IconButton from '@/ds-components/IconButton';
import Select, { type Option } from '@/ds-components/Select';
import { Ring as Spinner } from '@/ds-components/Spinner';
import TextInput from '@/ds-components/TextInput';
import Textarea from '@/ds-components/Textarea';
import useApi from '@/hooks/use-api';

import styles from './index.module.scss';

const maxVerificationFiles = 10;

type Props = {
  readonly domain: string;
  readonly domainId: string;
  readonly isReadonly?: boolean;
};

const emptyVerificationFile: DomainVerificationFile = {
  path: '',
  content: '',
  contentType: DomainVerificationFileContentType.Text,
};

function VerificationFiles({ domain, domainId, isReadonly }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const endpoint = `api/domains/${domainId}/verification-files`;
  const { data: verificationFiles, mutate } = useSWR<DomainVerificationFile[]>(endpoint);
  const [draft, setDraft] = useState<DomainVerificationFile>();
  const [editingPath, setEditingPath] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  const contentTypeOptions = useMemo<Array<Option<DomainVerificationFileContentType>>>(
    () => [
      {
        value: DomainVerificationFileContentType.Text,
        title: t('domain.custom.verification_files.content_type_text'),
      },
      {
        value: DomainVerificationFileContentType.Json,
        title: t('domain.custom.verification_files.content_type_json'),
      },
    ],
    [t]
  );

  const files = verificationFiles ?? [];
  const hasDuplicatePath = Boolean(
    draft && files.some(({ path }) => path === draft.path && path !== editingPath)
  );
  const getPathError = () => {
    if (draft === undefined) {
      return;
    }

    if (draft.path.length === 0) {
      return t('domain.custom.verification_files.required');
    }

    if (!domainVerificationFilePathGuard.safeParse(draft.path).success) {
      return t('domain.custom.verification_files.invalid_path');
    }

    if (hasDuplicatePath) {
      return t('domain.custom.verification_files.duplicate_path');
    }
  };
  const getContentError = () => {
    if (draft === undefined) {
      return;
    }

    if (draft.content.length === 0) {
      return t('domain.custom.verification_files.required');
    }

    if (draft.content.length > 16 * 1024) {
      return t('domain.custom.verification_files.content_too_long');
    }

    if (
      draft.contentType === DomainVerificationFileContentType.Json &&
      !domainVerificationFileGuard.safeParse(draft).success
    ) {
      return t('domain.custom.verification_files.invalid_json');
    }
  };
  const pathError = getPathError();
  const contentError = getContentError();

  const updateVerificationFiles = async (nextFiles: DomainVerificationFile[]) => {
    const updatedFiles = await api
      .put(endpoint, { json: { verificationFiles: nextFiles } })
      .json<DomainVerificationFile[]>();
    await mutate(updatedFiles, false);
  };

  const handleSave = async () => {
    if (draft === undefined) {
      return;
    }

    if (pathError ?? contentError) {
      return;
    }

    if (!domainVerificationFileGuard.safeParse(draft).success) {
      return;
    }

    setIsSaving(true);
    try {
      await updateVerificationFiles(
        editingPath
          ? files.map((file) => (file.path === editingPath ? draft : file))
          : [...files, draft]
      );
      setDraft(undefined);
      setEditingPath(undefined);
      toast.success(t('general.saved'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (path: string) => {
    setIsSaving(true);
    try {
      await updateVerificationFiles(files.filter((file) => file.path !== path));
      if (editingPath === path) {
        setDraft(undefined);
        setEditingPath(undefined);
      }
      toast.success(t('general.deleted'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>{t('domain.custom.verification_files.title')}</div>
          <div className={styles.description}>
            {t('domain.custom.verification_files.description')}
          </div>
        </div>
        {!isReadonly && files.length < maxVerificationFiles && !draft && (
          <Button
            size="small"
            type="outline"
            icon={<Plus />}
            title="domain.custom.verification_files.add"
            onClick={() => {
              setEditingPath(undefined);
              setDraft(emptyVerificationFile);
            }}
          />
        )}
      </div>

      {verificationFiles ? (
        <div className={styles.fileList}>
          {files.length === 0 && !draft && (
            <div className={styles.empty}>{t('domain.custom.verification_files.empty')}</div>
          )}
          {files.map((file) => (
            <div key={file.path} className={styles.fileItem}>
              <div className={styles.fileInfo}>
                <a
                  className={styles.path}
                  href={`https://${domain}${file.path}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {file.path}
                </a>
                <span className={styles.contentType}>{file.contentType}</span>
              </div>
              {!isReadonly && (
                <div className={styles.actions}>
                  <IconButton
                    size="small"
                    title={t('general.edit')}
                    aria-label={t('general.edit')}
                    disabled={isSaving}
                    onClick={() => {
                      setEditingPath(file.path);
                      setDraft(file);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    title={t('general.delete')}
                    aria-label={t('general.delete')}
                    disabled={isSaving}
                    onClick={() => {
                      void handleDelete(file.path);
                    }}
                  >
                    <Delete />
                  </IconButton>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Spinner className={styles.spinner} />
      )}

      {draft && (
        <div className={styles.form}>
          <label>
            <span className={styles.label}>{t('domain.custom.verification_files.path')}</span>
            <TextInput
              value={draft.path}
              placeholder="/.well-known/verification.txt"
              error={pathError}
              description={`https://${domain}${draft.path}`}
              onChange={({ currentTarget: { value } }) => {
                setDraft({ ...draft, path: value });
              }}
            />
          </label>
          <label>
            <span className={styles.label}>
              {t('domain.custom.verification_files.content_type')}
            </span>
            <Select
              value={draft.contentType}
              options={contentTypeOptions}
              onChange={(contentType) => {
                if (contentType) {
                  setDraft({ ...draft, contentType });
                }
              }}
            />
          </label>
          <label>
            <span className={styles.label}>{t('domain.custom.verification_files.content')}</span>
            <Textarea
              value={draft.content}
              rows={6}
              error={contentError}
              placeholder={t('domain.custom.verification_files.content_placeholder')}
              onChange={({ currentTarget: { value } }) => {
                setDraft({ ...draft, content: value });
              }}
            />
          </label>
          <div className={styles.formActions}>
            <Button
              type="primary"
              title="general.save"
              isLoading={isSaving}
              disabled={Boolean(pathError ?? contentError)}
              onClick={() => {
                void handleSave();
              }}
            />
            <Button
              title="general.cancel"
              disabled={isSaving}
              onClick={() => {
                setDraft(undefined);
                setEditingPath(undefined);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default VerificationFiles;
