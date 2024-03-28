import type { CustomPhrase, Translation } from '@logto/schemas';

import { authedAdminApi } from './api.js';

export const listCustomPhrases = async () =>
  authedAdminApi.get('custom-phrases').json<CustomPhrase[]>();

export const getCustomPhrase = async (languageTag: string) =>
  authedAdminApi.get(`custom-phrases/${languageTag}`).json<CustomPhrase>();

export const createOrUpdateCustomPhrase = async (languageTag: string, translation: Translation) =>
  authedAdminApi.put(`custom-phrases/${languageTag}`, { json: translation }).json<CustomPhrase>();

export const deleteCustomPhrase = async (languageTag: string) =>
  authedAdminApi.delete(`custom-phrases/${languageTag}`).json();
