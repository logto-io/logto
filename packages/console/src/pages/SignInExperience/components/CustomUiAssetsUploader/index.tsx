import { type CustomUiAssets, maxUploadFileSize, type AllowedUploadMimeType } from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import { format } from 'date-fns/fp';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DeleteIcon from '@/assets/icons/delete.svg?react';
import FileIcon from '@/components/FileIcon';
import IconButton from '@/ds-components/IconButton';
import FileUploader from '@/ds-components/Uploader/FileUploader';
import useApi from '@/hooks/use-api';
import { formatBytes } from '@/utils/uploader';

import { SignInExperienceContext } from '../../contexts/SignInExperienceContextProvider';

import styles from './index.module.scss';

const requestTimeout = 300_000; // 5 minutes

type Props = {
  // eslint-disable-next-line react/boolean-prop-naming
  readonly disabled?: boolean;
  readonly value: Nullable<CustomUiAssets>;
  readonly onChange: (value: Nullable<CustomUiAssets>) => void;
};

const allowedMimeTypes: AllowedUploadMimeType[] = ['application/zip'];

function CustomUiAssetsUploader({ disabled, value, onChange }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [file, setFile] = useState<File>();
  const [error, setError] = useState<string>();
  const [abortController, setAbortController] = useState(new AbortController());
  const showUploader = !value?.id && !file && !error;
  const { setIsUploading, setCancelUpload } = useContext(SignInExperienceContext);

  const api = useApi({ timeout: requestTimeout, signal: abortController.signal });

  useEffect(() => {
    setCancelUpload(() => {
      abortController.abort();
      setIsUploading(false);
      setAbortController(new AbortController());
    });
  }, [abortController, setCancelUpload, setIsUploading]);

  const onComplete = useCallback(
    (id: string) => {
      setFile(undefined);
      onChange({ id, createdAt: Date.now() });
    },
    [onChange]
  );

  const onErrorChange = useCallback(
    (errorMessage?: string, files?: File[]) => {
      if (errorMessage) {
        setError(errorMessage);
      }
      if (files?.length) {
        setFile(files[0]);
      }
    },
    [setError, setFile]
  );

  if (showUploader) {
    return (
      <FileUploader<{ customUiAssetId: string }>
        apiInstance={api}
        disabled={disabled}
        allowedMimeTypes={allowedMimeTypes}
        maxSize={maxUploadFileSize}
        uploadUrl="api/sign-in-exp/default/custom-ui-assets"
        onUploadStart={() => {
          setIsUploading(true);
        }}
        onUploadComplete={({ customUiAssetId }) => {
          onComplete(customUiAssetId);
          setIsUploading(false);
        }}
        onUploadErrorChange={onErrorChange}
      />
    );
  }

  return (
    <div className={styles.placeholder}>
      <FileIcon />
      <div className={styles.main}>
        <div className={styles.name}>{file?.name ?? t('sign_in_exp.custom_ui.title')}</div>
        <div className={styles.secondaryInfo}>
          {!!value?.createdAt && (
            <span className={styles.info}>{format('yyyy/MM/dd HH:mm')(value.createdAt)}</span>
          )}
          {file && <span className={styles.info}>{formatBytes(file.size)}</span>}
          {error && <span className={styles.error}>{error}</span>}
        </div>
      </div>
      <IconButton
        onClick={() => {
          setFile(undefined);
          setError(undefined);
          onChange(null);
        }}
      >
        <DeleteIcon />
      </IconButton>
      {file && <div className={styles.progressBar} />}
    </div>
  );
}

export default CustomUiAssetsUploader;
