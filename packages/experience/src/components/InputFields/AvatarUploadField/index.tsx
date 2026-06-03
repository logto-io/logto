import { maxUploadFileSize } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { uploadAvatar } from '@/apis/experience/avatar';
import UserAvatar from '@/assets/icons/default-user-avatar.svg?react';
import AvatarCropModal from '@/components/AvatarCropModal';
import useAvatarCropUpload from '@/hooks/use-avatar-crop-upload';
import RotatingRingIcon from '@/shared/components/Button/RotatingRingIcon';
import { avatarFileAccept, formatFileSizeLimit } from '@/utils/avatar-upload';

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
  readonly onChange: (value: string) => void | Promise<void>;
  readonly onUploadingChange?: (isUploading: boolean) => void;
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
  onUploadingChange,
}: Props) => {
  const { t } = useTranslation();
  const { t: tAvatar } = useTranslation(undefined, { keyPrefix: 'profile.avatar_upload' });
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const onUploadingChangeRef = useRef(onUploadingChange);

  const {
    cropImageSource,
    isUploading,
    uploadError,
    fileInputKey,
    clearUploadError,
    handleFileChange,
    handleCropCancel,
    handleCropConfirm,
  } = useAvatarCropUpload({ upload: uploadAvatar, onChange, onBlur });

  const labelWithOptionalSuffix =
    label && (isRequired ? label : t('input.label_with_optional', { label }));

  useEffect(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- keep latest parent callback in a ref
    onUploadingChangeRef.current = onUploadingChange;
  }, [onUploadingChange]);

  useEffect(() => {
    onUploadingChangeRef.current?.(isUploading);
  }, [isUploading]);

  useEffect(() => {
    return () => {
      onUploadingChangeRef.current?.(false);
    };
  }, []);

  const openFilePicker = useCallback(() => {
    if (isUploading) {
      return;
    }

    inputRef.current?.click();
  }, [isUploading]);

  const handleRemove = useCallback(async () => {
    clearUploadError();
    await onChange('');
    onBlur?.();
  }, [clearUploadError, onBlur, onChange]);

  const displayError = cropImageSource ? errorMessage : (uploadError ?? errorMessage);
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
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => {
                  void handleRemove();
                }}
              >
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
      <AvatarCropModal
        imageSource={cropImageSource}
        isUploading={isUploading}
        uploadError={uploadError}
        onCancel={handleCropCancel}
        onConfirm={handleCropConfirm}
      />
    </div>
  );
};

export default AvatarUploadField;
