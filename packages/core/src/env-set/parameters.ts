import { getEnv } from '@silverhand/essentials';

export const isTrue = (value: string) => ['1', 'true', 'y', 'yes', 'yep', 'yeah'].includes(value);

const parameters = new Set(process.argv.slice(2));
export const noInquiry = parameters.has('--no-inquiry') || isTrue(getEnv('NO_INQUIRY'));
export const fromRoot = parameters.has('--from-root') || isTrue(getEnv('FROM_ROOT'));
export const allYes = parameters.has('--all-yes') || isTrue(getEnv('ALL_YES'));
export const deployMigration = parameters.has('--deploy-migration');
