import { type SubscriptionPlan } from '#src/utils/subscription/types.js';

export const mockFreePlan: SubscriptionPlan = {
  id: 'free',
  name: 'Free',
  stripeProducts: [],
  quota: {
    mauLimit: 5000,
    hooksLimit: 1,
    rolesLimit: 1,
    resourcesLimit: 3,
    applicationsLimit: 3,
    omniSignInEnabled: true,
    scopesPerRoleLimit: 1,
    customDomainEnabled: false,
    machineToMachineLimit: 0,
    socialConnectorsLimit: 3,
    auditLogsRetentionDays: 3,
    scopesPerResourceLimit: 1,
    standardConnectorsLimit: 0,
    builtInEmailConnectorEnabled: true,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};
