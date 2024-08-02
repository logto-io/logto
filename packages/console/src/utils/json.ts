import { jsonGuard, jsonObjectGuard, type Json, type JsonObject } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { t } from 'i18next';

export const safeParseJson = (
  jsonString: string
): { success: true; data: Json } | { success: false; error: string } => {
  try {
    const data = jsonGuard.parse(JSON.parse(jsonString));

    return { success: true, data };
  } catch {
    return { success: false, error: t('admin_console.errors.invalid_json_format') };
  }
};

export const safeParseJsonObject = (
  jsonString: string
): { success: true; data: JsonObject } | { success: false; error: string } => {
  try {
    const data = jsonObjectGuard.parse(JSON.parse(jsonString));

    return { success: true, data };
  } catch {
    return { success: false, error: t('admin_console.errors.invalid_json_format') };
  }
};

export const isJsonObject = (value: string) => {
  const parsed = trySafe<unknown>(() => JSON.parse(value));
  return Boolean(parsed && typeof parsed === 'object');
};
