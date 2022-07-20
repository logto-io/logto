import { t } from 'i18next';

export const safeParseJson = (
  jsonString: string
): { success: true; data: unknown } | { success: false; error: string } => {
  try {
    // eslint-disable-next-line no-restricted-syntax
    const data = JSON.parse(jsonString) as unknown;

    return { success: true, data };
  } catch {
    return { success: false, error: t('admin_console.errors.invalid_json_format') };
  }
};
