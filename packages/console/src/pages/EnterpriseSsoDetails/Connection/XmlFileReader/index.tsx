import { Theme } from '@logto/schemas';
import { useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';

import Delete from '@/assets/icons/delete.svg';
import FileIconDark from '@/assets/icons/file-icon-dark.svg';
import FileIcon from '@/assets/icons/file-icon.svg';
import UploaderIcon from '@/assets/icons/upload.svg';
import Button from '@/ds-components/Button';
import IconButton from '@/ds-components/IconButton';
import useTheme from '@/hooks/use-theme';

import { type SamlGuideFormType } from '../../../EnterpriseSso/types';
import { calculateXmlFileSize } from '../SamlMetadataForm/utils';

import * as styles from './index.module.scss';

const xmlMimeTypes = ['application/xml', 'text/xml'];
const xmlFileName = 'identity provider metadata.xml'; // Real file name does not matter, use a generic name.
const xmlFileSizeLimit = 500 * 1024; // 500 KB

type Props = {
  onChange: (xmlContent?: string) => void;
  value?: string;
};

function XmlFileReader({ onChange, value }: Props) {
  const theme = useTheme();

  const {
    setError,
    formState: {
      errors: { metadata: metadataError },
    },
  } = useFormContext<SamlGuideFormType>();

  /**
   * As you can see, per `useDropzone` hook's config, there are at most one file, if file is rejected, then we can return as long as we get the error message.
   */
  const onDrop = useCallback(
    async (acceptedFiles: File[] = [], fileRejection: FileRejection[] = []) => {
      if (fileRejection.length > 0) {
        const fileErrors = fileRejection[0]?.errors;
        if (fileErrors?.[0]?.message) {
          setError('metadata', {
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

      const xmlContent = await acceptedFile.text();
      onChange(xmlContent);
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
    maxSize: xmlFileSizeLimit,
    multiple: false, // Upload only one file at a time.
    accept: Object.fromEntries(xmlMimeTypes.map((mimeType) => [mimeType, []])),
  });

  return (
    <div>
      {value ? (
        <div className={styles.preview}>
          {theme === Theme.Dark ? <FileIcon /> : <FileIconDark />}
          <div className={styles.fileInfo}>
            <span className={styles.fileName}>{xmlFileName}</span>
            {/* Not using `File.size` since the file content (variable `value` in this case) is stored in DB in string type */}
            <span className={styles.fileSize}>{`${(calculateXmlFileSize(value) / 1024).toFixed(
              2
            )} KB`}</span>
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
            <Button
              icon={<UploaderIcon />}
              title="enterprise_sso_details.upload_idp_metadata_button_text"
              size="large"
            />
            <input {...getInputProps({ className: styles.fileInput })} />
          </div>
          {Boolean(metadataError) && <div className={styles.error}>{metadataError?.message}</div>}
        </>
      )}
    </div>
  );
}

export default XmlFileReader;
