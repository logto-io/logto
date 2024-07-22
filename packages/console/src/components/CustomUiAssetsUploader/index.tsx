import { type CustomUiAssets, maxUploadFileSize, type AllowedUploadMimeType } from '@logto/schemas';
import { format } from 'date-fns/fp';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DeleteIcon from '@/assets/icons/delete.svg';
import IconButton from '@/ds-components/IconButton';
import FileUploader from '@/ds-components/Uploader/FileUploader';
import { formatBytes } from '@/utils/uploader';

import FileIcon from '../FileIcon';

import * as styles from './index.module.scss';

type Props = {
  readonly value?: CustomUiAssets;
  readonly onChange: (value: CustomUiAssets) => void;
  // eslint-disable-next-line react/boolean-prop-naming
  readonly disabled?: boolean;
};

const allowedMimeTypes: AllowedUploadMimeType[] = ['application/zip'];

function CustomUiAssetsUploader({ value, onChange, disabled }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [file, setFile] = useState<File>();
  const [error, setError] = useState<string>();
  const showUploader = !value?.id && !file && !error;

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
        disabled={disabled}
        allowedMimeTypes={allowedMimeTypes}
        maxSize={maxUploadFileSize}
        uploadUrl="api/sign-in-exp/default/custom-ui-assets"
        onCompleted={({ customUiAssetId }) => {
          onComplete(customUiAssetId);
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
          onChange({ id: '', createdAt: 0 });
        }}
      >
        <DeleteIcon />
      </IconButton>
      {file && <div className={styles.progressBar} />}
    </div>
  );
}

export default CustomUiAssetsUploader;
