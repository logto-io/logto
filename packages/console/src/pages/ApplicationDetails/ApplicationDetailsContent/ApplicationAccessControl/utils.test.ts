import { createDefaultApplicationAccessControl } from '@logto/schemas';

import {
  areApplicationAccessControlsEqual,
  buildOrganizationRoleRuleId,
  getOrganizationRoleRuleCount,
  getOrganizationRoleRuleDisplayName,
  hasApplicationAccessControlRules,
  toOrganizationRoleRules,
} from './utils';

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

  it('compares access control rules by configured IDs', () => {
    const accessControl = {
      ...createDefaultApplicationAccessControl(),
      userIds: ['user_1'],
      organizationRoleRules: [
        {
          organizationId: 'organization_1',
          organizationRoleIds: ['role_1'],
        },
      ],
    };

    expect(areApplicationAccessControlsEqual(accessControl, accessControl)).toBe(true);
    expect(
      areApplicationAccessControlsEqual(accessControl, {
        ...accessControl,
        userIds: ['user_2'],
      })
    ).toBe(false);
  });

  it('compares access control rules without depending on rule order', () => {
    expect(
      areApplicationAccessControlsEqual(
        {
          ...createDefaultApplicationAccessControl(),
          userIds: ['user_2', 'user_1'],
          userRoleIds: ['role_2', 'role_1'],
          organizationIds: ['organization_2', 'organization_1'],
          organizationRoleRules: [
            {
              organizationId: 'organization_2',
              organizationRoleIds: ['role_2', 'role_1'],
            },
            {
              organizationId: 'organization_1',
              organizationRoleIds: ['role_4', 'role_3'],
            },
          ],
        },
        {
          ...createDefaultApplicationAccessControl(),
          userIds: ['user_1', 'user_2'],
          userRoleIds: ['role_1', 'role_2'],
          organizationIds: ['organization_1', 'organization_2'],
          organizationRoleRules: [
            {
              organizationId: 'organization_1',
              organizationRoleIds: ['role_3', 'role_4'],
            },
            {
              organizationId: 'organization_2',
              organizationRoleIds: ['role_1', 'role_2'],
            },
          ],
        }
      )
    ).toBe(true);
  });

  it('builds organization role rule display metadata', () => {
    expect(buildOrganizationRoleRuleId('organization_1', 'role_1')).toBe('organization_1:role_1');
    expect(getOrganizationRoleRuleDisplayName('Acme', 'Admin')).toBe('Acme - Admin');
  });

  it('converts selected organization role entries to grouped rules', () => {
    expect(
      toOrganizationRoleRules([
        {
          id: 'organization_1:role_2',
          name: 'Acme - Member',
          organizationId: 'organization_1',
          organizationRoleId: 'role_2',
        },
        {
          id: 'organization_2:role_1',
          name: 'Silverhand - Admin',
          organizationId: 'organization_2',
          organizationRoleId: 'role_1',
        },
        {
          id: 'organization_1:role_1',
          name: 'Acme - Admin',
          organizationId: 'organization_1',
          organizationRoleId: 'role_1',
        },
      ])
    ).toEqual([
      {
        organizationId: 'organization_1',
        organizationRoleIds: ['role_1', 'role_2'],
      },
      {
        organizationId: 'organization_2',
        organizationRoleIds: ['role_1'],
      },
    ]);
  });
});
