import type { AllowedUploadMimeType } from '@logto/schemas';

import { mimeTypeToFileExtensionMappings } from '@/consts/user-assets';

export const convertToFileExtensionArray = (mimeTypes: AllowedUploadMimeType[]) =>
  mimeTypes
    .flatMap((type) => mimeTypeToFileExtensionMappings[type])
    .map((extension) => extension.toUpperCase());
