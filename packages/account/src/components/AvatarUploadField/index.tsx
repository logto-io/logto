import UserAvatar from '@experience/assets/icons/default-user-avatar.svg?react';
import AvatarCropModal from '@experience/components/AvatarCropModal';
import useAvatarCropUpload from '@experience/hooks/use-avatar-crop-upload';
import RotatingRingIcon from '@experience/shared/components/Button/RotatingRingIcon';
import { avatarFileAccept } from '@experience/utils/avatar-upload';
import { useLogto } from '@logto/react';
import classNames from 'classnames';
import { useCallback, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { uploadAccountAvatar } from '@ac/apis/avatar';
import { layoutClassNames } from '@ac/constants/layout';

import profileStyles from '../../pages/Profile/index.module.scss';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly label: string;
  readonly value?: string;
  readonly onChange: (value: string) => void | Promise<void>;
};

const AvatarUploadField = ({ className, label, value = '', onChange }: Props) => {
  const { t } = useTranslation();
  const { t: tAvatar } = useTranslation(undefined, { keyPrefix: 'profile.avatar_upload' });
  const { getAccessToken } = useLogto();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File, options: { signal: AbortSignal }) => {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error('Session expired');
      }

      return uploadAccountAvatar(accessToken, file, options);
    },
    [getAccessToken]
  );

  const {
    cropImageSource,
    isUploading,
    uploadError,
    fileInputKey,
    handleFileChange,
    handleCropCancel,
    handleCropConfirm,
  } = useAvatarCropUpload({ upload, onChange });

  const openFilePicker = useCallback(() => {
    if (isUploading) {
      return;
    }

    inputRef.current?.click();
  }, [isUploading]);

  const actionLabel = isUploading
    ? tAvatar('uploading')
    : value
      ? t('account_center.security.change')
      : tAvatar('upload');

  return (
    <div className={classNames(profileStyles.row, layoutClassNames.row, className)}>
      <div className={profileStyles.topLine}>
        <label className={profileStyles.name} htmlFor={inputId}>
          {label}
        </label>
        <div className={profileStyles.actions}>
          <button
            type="button"
            className={profileStyles.changeButton}
            disabled={isUploading}
            onClick={openFilePicker}
          >
            {actionLabel}
          </button>
        </div>
      </div>
      <div className={profileStyles.value}>
        <div className={styles.valueContent}>
          {isUploading ? (
            <div className={styles.loadingIcon}>
              <RotatingRingIcon />
            </div>
          ) : value ? (
            <img
              className={profileStyles.avatar}
              src={value}
              alt={label}
              referrerPolicy="no-referrer"
            />
          ) : (
            <UserAvatar className={styles.placeholder} />
          )}
          {uploadError && !cropImageSource && (
            <span className={styles.errorText} role="alert">
              {uploadError}
            </span>
          )}
        </div>
      </div>
      <input
        key={fileInputKey}
        ref={inputRef}
        id={inputId}
        className={styles.hiddenInput}
        type="file"
        accept={avatarFileAccept}
        onChange={handleFileChange}
      />
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
