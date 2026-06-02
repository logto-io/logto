import { maxUploadFileSize, type RequestErrorBody } from '@logto/schemas';
import { HTTPError } from 'ky';
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import {
  avatarFileExtensions,
  buildCroppedAvatarFile,
  formatFileSizeLimit,
  getAvatarPersistErrorMessage,
  getAvatarUploadErrorMessage,
  validateAvatarFile,
} from '../utils/avatar-upload';

const isAbortError = (error: unknown) =>
  (error instanceof DOMException || error instanceof Error) && error.name === 'AbortError';

type UploadAvatar = (file: File, options: { signal: AbortSignal }) => Promise<{ url: string }>;

type Options = {
  /** Uploads the cropped avatar file and resolves with the stored asset URL. */
  readonly upload: UploadAvatar;
  /** Persists the uploaded avatar URL into the consuming form/value. */
  readonly onChange: (value: string) => void | Promise<void>;
  /** Optional blur callback, used by the Experience form to trigger validation. */
  readonly onBlur?: () => void;
};

/**
 * Shared avatar select → crop → upload orchestration for the Experience and Account Center
 * avatar fields.
 *
 * Owns the object-URL lifecycle, abort controller, client-side validation, crop-to-upload flow,
 * and HTTP error mapping so both surfaces stay in sync. The crop modal UI is provided separately
 * by `AvatarCropModal`; this hook only manages the state that drives it.
 */
const useAvatarCropUpload = ({ upload, onChange, onBlur }: Options) => {
  const { t: tAvatar } = useTranslation(undefined, { keyPrefix: 'profile.avatar_upload' });
  const abortControllerRef = useRef<AbortController>();
  const cropImageSourceRef = useRef<string>();
  const pendingFileNameRef = useRef<string>();
  const uploadedUrlRef = useRef<string>();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const [fileInputKey, setFileInputKey] = useState(0);
  const [cropImageSource, setCropImageSource] = useState<string>();

  const resetFileInput = useCallback(() => {
    setFileInputKey((key) => key + 1);
  }, []);

  const revokeCropImageSource = useCallback(() => {
    if (cropImageSourceRef.current) {
      if (typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(cropImageSourceRef.current);
      }
      // eslint-disable-next-line @silverhand/fp/no-mutation
      cropImageSourceRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      revokeCropImageSource();
    };
  }, [revokeCropImageSource]);

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

  const handlePersistError = useCallback(
    async (error: unknown) => {
      if (error instanceof HTTPError) {
        try {
          const errorBody = await error.response.json<RequestErrorBody>();
          setUploadError(getAvatarPersistErrorMessage(errorBody, tAvatar));
          return;
        } catch {
          // Fall through to generic error message.
        }
      }

      setUploadError(tAvatar('error_save'));
    },
    [tAvatar]
  );

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
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
        setUploadError(tAvatar('error_file_type', { extensions: String(avatarFileExtensions) }));
        resetFileInput();
        return;
      }

      setUploadError(undefined);
      // eslint-disable-next-line @silverhand/fp/no-mutation
      uploadedUrlRef.current = undefined;
      revokeCropImageSource();
      const objectUrl = URL.createObjectURL(file);
      // eslint-disable-next-line @silverhand/fp/no-mutation
      cropImageSourceRef.current = objectUrl;
      // eslint-disable-next-line @silverhand/fp/no-mutation
      pendingFileNameRef.current = file.name;
      setCropImageSource(objectUrl);
    },
    [resetFileInput, revokeCropImageSource, tAvatar]
  );

  const handleCropCancel = useCallback(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    uploadedUrlRef.current = undefined;
    revokeCropImageSource();
    setCropImageSource(undefined);
    resetFileInput();
  }, [resetFileInput, revokeCropImageSource]);

  const clearUploadError = useCallback(() => {
    setUploadError(undefined);
  }, []);

  const handleCropConfirm = useCallback(
    async (blob: Blob) => {
      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      // eslint-disable-next-line @silverhand/fp/no-mutation
      abortControllerRef.current = abortController;

      setUploadError(undefined);
      setIsUploading(true);

      try {
        if (!uploadedUrlRef.current) {
          const file = buildCroppedAvatarFile(blob, pendingFileNameRef.current);
          const { url } = await upload(file, { signal: abortController.signal });
          // eslint-disable-next-line @silverhand/fp/no-mutation
          uploadedUrlRef.current = url;
        }

        await onChange(uploadedUrlRef.current);
        // eslint-disable-next-line @silverhand/fp/no-mutation
        uploadedUrlRef.current = undefined;
        onBlur?.();
        revokeCropImageSource();
        setCropImageSource(undefined);
      } catch (error: unknown) {
        if (isAbortError(error) || abortController.signal.aborted) {
          return;
        }

        await (uploadedUrlRef.current ? handlePersistError(error) : handleUploadError(error));
      } finally {
        if (!abortController.signal.aborted) {
          setIsUploading(false);
          setFileInputKey((key) => key + 1);
        }
      }
    },
    [handlePersistError, handleUploadError, onBlur, onChange, revokeCropImageSource, upload]
  );

  return {
    cropImageSource,
    isUploading,
    uploadError,
    fileInputKey,
    clearUploadError,
    handleFileChange,
    handleCropCancel,
    handleCropConfirm,
  };
};

export default useAvatarCropUpload;
