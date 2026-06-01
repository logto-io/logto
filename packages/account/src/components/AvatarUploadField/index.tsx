import UserAvatar from '@experience/assets/icons/default-user-avatar.svg?react';
import RotatingRingIcon from '@experience/shared/components/Button/RotatingRingIcon';
import {
  avatarFileAccept,
  avatarFileExtensions,
  formatFileSizeLimit,
  getAvatarUploadErrorMessage,
  validateAvatarFile,
} from '@experience/utils/avatar-upload';
import { useLogto } from '@logto/react';
import { maxUploadFileSize, type RequestErrorBody } from '@logto/schemas';
import classNames from 'classnames';
import { HTTPError } from 'ky';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { uploadAccountAvatar } from '@ac/apis/avatar';
import { layoutClassNames } from '@ac/constants/layout';

import profileStyles from '../../pages/Profile/index.module.scss';

import styles from './index.module.scss';

const isAbortError = (error: unknown) =>
  (error instanceof DOMException || error instanceof Error) && error.name === 'AbortError';

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
  const abortControllerRef = useRef<AbortController>();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const [fileInputKey, setFileInputKey] = useState(0);

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

  const resetFileInput = useCallback(() => {
    setFileInputKey((key) => key + 1);
  }, []);

  const handleUploadError = useCallback(
    async (error: unknown) => {
      if (error instanceof HTTPError) {
        try {
          const errorBody = await error.response.json<RequestErrorBody>();
          setUploadError(getAvatarUploadErrorMessage(errorBody, tAvatar));
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
        resetFileInput();
        return;
      }

      if (validationError === 'file_type') {
        setUploadError(tAvatar('error_file_type', { extensions: avatarFileExtensions }));
        resetFileInput();
        return;
      }

      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      // eslint-disable-next-line @silverhand/fp/no-mutation
      abortControllerRef.current = abortController;

      setUploadError(undefined);
      setIsUploading(true);

      try {
        const accessToken = await getAccessToken();

        if (!accessToken) {
          throw new Error('Session expired');
        }

        const { url } = await uploadAccountAvatar(accessToken, file, {
          signal: abortController.signal,
        });
        await onChange(url);
      } catch (error: unknown) {
        if (isAbortError(error) || abortController.signal.aborted) {
          return;
        }

        await handleUploadError(error);
      } finally {
        if (!abortController.signal.aborted) {
          setIsUploading(false);
          setFileInputKey((key) => key + 1);
        }
      }
    },
    [getAccessToken, handleUploadError, onChange, resetFileInput, tAvatar]
  );

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
          {uploadError && (
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
    </div>
  );
};

export default AvatarUploadField;
