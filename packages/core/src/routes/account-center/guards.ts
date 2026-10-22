import { AccountCenters, accountCenterFieldControlGuard } from '@logto/schemas';

export const getAccountCenterApiGuards = () => {
  return {
    fields: accountCenterFieldControlGuard,
    accountCenter: AccountCenters.guard,
  };
};
