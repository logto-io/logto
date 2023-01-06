import type { Resource } from '@logto/schemas';

export type ApiResourceDetailsOutletContext = {
  resource: Resource;
  isDeleting: boolean;
  isLogtoManagementApiResource: boolean;
  onResourceUpdated: (resource: Resource) => void;
};
