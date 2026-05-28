import { maxUploadFileSize } from '@logto/schemas';
import classNames from 'classnames';
import { HTTPError } from 'ky';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { uploadAvatar } from '@/apis/experience/avatar';
import UserAvatar from '@/assets/icons/default-user-avatar.svg?react';
import RotatingRingIcon from '@/shared/components/Button/RotatingRingIcon';
import {
  avatarFileAccept,
  avatarFileExtensions,
  formatFileSizeLimit,
  validateAvatarFile,
} from '@/utils/avatar-upload';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly name: string;
  readonly label?: string;
  readonly description?: string;
  readonly isRequired?: boolean;
  readonly value?: string;
  readonly errorMessage?: string;
  readonly onBlur?: () => void;
  readonly onChange: (value: string) => void;
};

const AvatarUploadField = ({
  className,
  name,
  label,
  description,
  isRequired,
  value = '',
  errorMessage,
  onBlur,
  onChange,
}: Props) => {
  const { t } = useTranslation();
  const { t: tAvatar } = useTranslation(undefined, { keyPrefix: 'profile.avatar_upload' });
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController>();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const [fileInputKey, setFileInputKey] = useState(0);

  const labelWithOptionalSuffix =
    label && (isRequired ? label : t('input.label_with_optional', { label }));

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const openFilePicker = useCallback(() => {
    if (isUploading) {
      return;
    }

    inputRef.current?.click();
  }, [isUploading]);

  const handleUploadError = useCallback(
    async (error: unknown) => {
      if (error instanceof HTTPError) {
        try {
          const { message } = await error.response.json<{ message: string }>();
          setUploadError(message);
          return;
        } catch {
          // Fall through to generic error message.
        }
      }

      setUploadError(tAvatar('error_upload'));
    },
    [tAvatar]
  );

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      const validationError = validateAvatarFile(file);

      if (validationError === 'file_size_exceeded') {
        setUploadError(
          tAvatar('error_file_size', { limit: formatFileSizeLimit(maxUploadFileSize) })
        );
        return;
      }

      if (validationError === 'file_type') {
        setUploadError(tAvatar('error_file_type', { extensions: avatarFileExtensions }));
        return;
      }

      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      // eslint-disable-next-line @silverhand/fp/no-mutation
      abortControllerRef.current = abortController;

      setUploadError(undefined);
      setIsUploading(true);

      try {
        const { url } = await uploadAvatar(file, { signal: abortController.signal });
        onChange(url);
        onBlur?.();
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        await handleUploadError(error);
      } finally {
        if (!abortController.signal.aborted) {
          setIsUploading(false);
        }

        setFileInputKey((key) => key + 1);
      }
    },
    [handleUploadError, onBlur, onChange, tAvatar]
  );

  const handleRemove = useCallback(() => {
    setUploadError(undefined);
    onChange('');
    onBlur?.();
  }, [onBlur, onChange]);

  const displayError = uploadError ?? errorMessage;
  const showRemove = Boolean(value) && !isRequired && !isUploading;
  const showHint = !displayError && !isUploading;

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.row}>
        <div className={styles.avatarSlot}>
          {isUploading ? (
            <div className={styles.loadingIcon}>
              <RotatingRingIcon />
            </div>
          ) : value ? (
            <img
              className={styles.avatar}
              src={value}
              alt={label ?? name}
              referrerPolicy="no-referrer"
            />
          ) : (
            <UserAvatar className={styles.placeholder} />
          )}
        </div>
        <div className={styles.controls}>
          {labelWithOptionalSuffix && (
            <label className={styles.label} htmlFor={inputId}>
              {labelWithOptionalSuffix}
            </label>
          )}
          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.uploadButton}
              disabled={isUploading}
              onClick={openFilePicker}
            >
              {isUploading ? tAvatar('uploading') : tAvatar('upload')}
            </button>
            {showRemove && (
              <button type="button" className={styles.removeButton} onClick={handleRemove}>
                {tAvatar('remove')}
              </button>
            )}
          </div>
          {displayError ? (
            <span className={styles.errorText} role="alert">
              {displayError}
            </span>
          ) : (
            showHint && (
              <span className={styles.hint}>
                {tAvatar('hint', { limit: formatFileSizeLimit(maxUploadFileSize) })}
              </span>
            )
          )}
          {description && <span className={styles.description}>{description}</span>}
        </div>
        <input
          key={fileInputKey}
          ref={inputRef}
          id={inputId}
          className={styles.hiddenInput}
          type="file"
          name={name}
          accept={avatarFileAccept}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default AvatarUploadField;
