import { Translation } from '@logto/schemas';

// LOG-4385: Refactor me
// eslint-disable-next-line complexity
export const isValidStructure = (fullTranslation: Translation, partialTranslation: Translation) => {
  const fullKeys = new Set(Object.keys(fullTranslation));
  const partialKeys = Object.keys(partialTranslation);

  if (fullKeys.size === 0 || partialKeys.length === 0) {
    return true;
  }

  if (partialKeys.some((key) => !fullKeys.has(key))) {
    return false;
  }

  for (const [key, value] of Object.entries(fullTranslation)) {
    const targetValue = partialTranslation[key];

    if (targetValue === undefined) {
      continue;
    }

    if (typeof value === 'string') {
      if (typeof targetValue === 'string') {
        continue;
      }

      return false;
    }

    if (typeof targetValue === 'string' || !isValidStructure(value, targetValue)) {
      return false;
    }
  }

  return true;
};
