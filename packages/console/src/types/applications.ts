import { AdminConsoleKey } from '@logto/phrases';
import { ApplicationType } from '@logto/schemas';

export const applicationTypeI18nKey: Record<ApplicationType, AdminConsoleKey> = {
  [ApplicationType.Native]: 'applications.type.native',
  [ApplicationType.SPA]: 'applications.type.spa',
  [ApplicationType.Traditional]: 'applications.type.tranditional',
};
