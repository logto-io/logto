import { type CimdConfig } from '@logto/schemas';

/** `enabled` has its own enable and disable flows. */
export type SettingsFormData = Required<Pick<CimdConfig, 'addConsentPromptForOfflineAccess'>>;
