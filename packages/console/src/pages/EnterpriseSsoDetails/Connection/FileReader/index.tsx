import { type AdminConsoleKey } from '@logto/phrases';
import { Theme } from '@logto/schemas';
import { useCallback } from 'react';
import { useDropzone, type FileRejection, type Accept } from 'react-dropzone';
import { type FieldError } from 'react-hook-form';

import Delete from '@/assets/icons/delete.svg?react';
import FileIconDark from '@/assets/icons/file-icon-dark.svg?react';
import FileIcon from '@/assets/icons/file-icon.svg?react';
import UploaderIcon from '@/assets/icons/upload.svg?react';
import Button from '@/ds-components/Button';
import IconButton from '@/ds-components/IconButton';
import useTheme from '@/hooks/use-theme';

import { calculateFileSize } from '../SamlMetadataForm/utils';

import styles from './index.module.scss';

const fileSizeLimit = 500 * 1024; // 500 KB

export type Props = {
  readonly onChange: (fileContent?: string) => void;
  readonly value?: string;
  readonly attributes: {
    accept: Accept; // File reader accepted file types.
    buttonTitle: AdminConsoleKey; // I18n key for the button title.
    defaultFilename: string; // Default file name.
    defaultFileMimeType: string; // Default file MIME type when calculating the file size.
  };
  readonly fieldError?: FieldError;
  readonly setError: (error: FieldError) => void;
};

function FileReader({ onChange, value, attributes, fieldError, setError }: Props) {
  const theme = useTheme();

  const { accept, buttonTitle, defaultFilename, defaultFileMimeType } = attributes;

  /**
   * As you can see, per `useDropzone` hook's config, there are at most one file, if file is rejected, then we can return as long as we get the error message.
   */
  const onDrop = useCallback(
    async (acceptedFiles: File[] = [], fileRejection: FileRejection[] = []) => {
      if (fileRejection.length > 0) {
        const fileErrors = fileRejection[0]?.errors;
        if (fileErrors?.[0]?.message) {
          setError({
            type: 'custom',
            message: fileErrors[0]?.message,
          });
        }
        return;
      }

      const acceptedFile = acceptedFiles[0];
      if (!acceptedFile) {
        return;
      }

      const fileContent = await acceptedFile.text();
      onChange(fileContent);
    },
    [onChange, setError]
  );

  const handleRemove = () => {
    onChange(undefined);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noDrag: true, // Only allow file selection via the file input.
    maxFiles: 1,
    maxSize: fileSizeLimit,
    multiple: false, // Upload only one file at a time.
    accept,
  });

  return (
    <div>
      {value ? (
        <div className={styles.preview}>
          {theme === Theme.Dark ? <FileIconDark /> : <FileIcon />}
          <div className={styles.fileInfo}>
            <span className={styles.fileName}>{defaultFilename}</span>
            {/* Not using `File.size` since the file content (variable `value` in this case) is stored in DB in string type */}
            <span className={styles.fileSize}>{`${(
              calculateFileSize(value, defaultFilename, defaultFileMimeType) / 1024
            ).toFixed(2)} KB`}</span>
          </div>
          <IconButton
            className={styles.delete}
            onClick={() => {
              handleRemove();
            }}
          >
            <Delete className={styles.icon} />
          </IconButton>
        </div>
      ) : (
        <>
          <div {...getRootProps()}>
            <Button icon={<UploaderIcon />} title={buttonTitle} size="large" />
            <input {...getInputProps({ className: styles.fileInput })} />
          </div>
          {Boolean(fieldError) && <div className={styles.error}>{fieldError?.message}</div>}
        </>
      )}
    </div>
  );
}

export default FileReader;
