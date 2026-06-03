import { createDefaultApplicationAccessControl } from '@logto/schemas';

import { getOrganizationRoleRuleCount, hasApplicationAccessControlRules } from './utils';

describe('application access control utils', () => {
  it('counts organization role rules by role assignment', () => {
    expect(
      getOrganizationRoleRuleCount({
        ...createDefaultApplicationAccessControl(),
        organizationRoleRules: [
          {
            organizationId: 'organization_1',
            organizationRoleIds: ['role_1', 'role_2'],
          },
          {
            organizationId: 'organization_2',
            organizationRoleIds: ['role_3'],
          },
        ],
      })
    ).toBe(3);
  });

  it('detects any configured access control rule', () => {
    expect(hasApplicationAccessControlRules(createDefaultApplicationAccessControl())).toBe(false);
    expect(
      hasApplicationAccessControlRules({
        ...createDefaultApplicationAccessControl(),
        organizationIds: ['organization_1'],
      })
    ).toBe(true);
  });
});
