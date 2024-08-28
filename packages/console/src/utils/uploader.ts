import type { AllowedUploadMimeType } from '@logto/schemas';
import { deduplicate } from '@silverhand/essentials';

import { mimeTypeToFileExtensionMappings } from '@/consts/user-assets';

export const convertToFileExtensionArray = (mimeTypes: AllowedUploadMimeType[]) =>
  deduplicate(
    mimeTypes
      .flatMap((type) => mimeTypeToFileExtensionMappings[type])
      .map((extension) => extension.toUpperCase())
  );
