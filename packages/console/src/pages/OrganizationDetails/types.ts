import {
  type OrganizationJitEmailDomain,
  type Organization,
  type OrganizationRole,
} from '@logto/schemas';

export type OrganizationDetailsOutletContext = {
  data: Organization;
  jit: {
    emailDomains: OrganizationJitEmailDomain[];
    ssoConnectorIds: string[];
    roles: OrganizationRole[];
  };
  /**
   * Whether the organization is being deleted, this is used to disable the unsaved
   * changes alert modal.
   */
  isDeleting: boolean;
  onUpdated: (data: Organization) => void;
};

export enum OrganizationDetailsTabs {
  Settings = 'settings',
  Members = 'members',
  MachineToMachine = 'machine-to-machine',
}
