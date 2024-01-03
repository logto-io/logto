import type { AllowedUploadMimeType } from '@logto/schemas';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { convertToFileExtensionArray } from '@/utils/uploader';

export const maxImageSizeLimit = 500 * 1024; // 500 KB

const allowedImageMimeTypes: AllowedUploadMimeType[] = [
  'image/svg+xml',
  'image/png',
  'image/jpeg',
  'image/vnd.microsoft.icon',
  'image/x-icon',
];

const useImageMimeTypes = (
  mimeTypes?: AllowedUploadMimeType[]
): { allowedMimeTypes: AllowedUploadMimeType[]; description: string } => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const allowedMimeTypes = useMemo(() => {
    return mimeTypes?.length ? mimeTypes : allowedImageMimeTypes;
  }, [mimeTypes]);

  const description = useMemo(() => {
    return t('components.uploader.image_limit', {
      size: maxImageSizeLimit / 1024,
      extensions: convertToFileExtensionArray(allowedMimeTypes),
    });
  }, [allowedMimeTypes, t]);

  return { allowedMimeTypes, description };
};

export default useImageMimeTypes;
