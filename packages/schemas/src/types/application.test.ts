import { describe, expect, it } from 'vitest';

import {
  applicationAccessControlGuard,
  createDefaultApplicationAccessControl,
} from './application.js';

describe('applicationAccessControlGuard', () => {
  it('deduplicates direct user and role rules', () => {
    expect(
      applicationAccessControlGuard.parse({
        userIds: ['user-1', 'user-2', 'user-1'],
        userRoleIds: ['role-1', 'role-1', 'role-2'],
        organizationIds: ['organization-1', 'organization-1', 'organization-2'],
        organizationRoleRules: [],
      })
    ).toMatchObject({
      userIds: ['user-1', 'user-2'],
      userRoleIds: ['role-1', 'role-2'],
      organizationIds: ['organization-1', 'organization-2'],
      organizationRoleRules: [],
    });
  });

  it('merges organization role rules by organization', () => {
    expect(
      applicationAccessControlGuard.parse({
        userIds: [],
        userRoleIds: [],
        organizationIds: [],
        organizationRoleRules: [
          {
            organizationId: 'organization-1',
            organizationRoleIds: ['organization-role-1', 'organization-role-2'],
          },
          {
            organizationId: 'organization-1',
            organizationRoleIds: ['organization-role-1', 'organization-role-3'],
          },
          {
            organizationId: 'organization-2',
            organizationRoleIds: ['organization-role-1'],
          },
        ],
      })
    ).toMatchObject({
      userIds: [],
      userRoleIds: [],
      organizationIds: [],
      organizationRoleRules: [
        {
          organizationId: 'organization-1',
          organizationRoleIds: [
            'organization-role-1',
            'organization-role-2',
            'organization-role-3',
          ],
        },
        {
          organizationId: 'organization-2',
          organizationRoleIds: ['organization-role-1'],
        },
      ],
    });
  });

  it('creates a fresh default rule set', () => {
    const first = createDefaultApplicationAccessControl();
    const second = createDefaultApplicationAccessControl();

    expect(first).not.toBe(second);
    expect(first.userIds).not.toBe(second.userIds);
    expect(first.userRoleIds).not.toBe(second.userRoleIds);
    expect(first.organizationIds).not.toBe(second.organizationIds);
    expect(first.organizationRoleRules).not.toBe(second.organizationRoleRules);
  });

  it('rejects oversized rule lists', () => {
    const oversizedIds = Array.from({ length: 1001 }, (_, index) => `id-${index}`);
    const emptyAccessControl = createDefaultApplicationAccessControl();

    expect(() =>
      applicationAccessControlGuard.parse({ ...emptyAccessControl, userIds: oversizedIds })
    ).toThrow();
    expect(() =>
      applicationAccessControlGuard.parse({
        ...emptyAccessControl,
        organizationRoleRules: oversizedIds.map((organizationId) => ({
          organizationId,
          organizationRoleIds: [],
        })),
      })
    ).toThrow();
    expect(() =>
      applicationAccessControlGuard.parse({
        ...emptyAccessControl,
        organizationRoleRules: [
          { organizationId: 'organization-1', organizationRoleIds: oversizedIds },
        ],
      })
    ).toThrow();
  });

  it('enforces rule list limits after normalization', () => {
    const emptyAccessControl = createDefaultApplicationAccessControl();
    const duplicateHeavyIds = Array.from({ length: 1001 }, () => 'user-1');
    const mergedOrganizationRoleRules = [
      {
        organizationId: 'organization-1',
        organizationRoleIds: Array.from({ length: 1000 }, (_, index) => `role-${index}`),
      },
      {
        organizationId: 'organization-1',
        organizationRoleIds: ['role-1000'],
      },
    ];

    expect(
      applicationAccessControlGuard.parse({ ...emptyAccessControl, userIds: duplicateHeavyIds })
    ).toMatchObject({ userIds: ['user-1'] });
    expect(() =>
      applicationAccessControlGuard.parse({
        ...emptyAccessControl,
        organizationRoleRules: mergedOrganizationRoleRules,
      })
    ).toThrow();
  });

  it('rejects overly large raw rule inputs before normalization', () => {
    const emptyAccessControl = createDefaultApplicationAccessControl();
    const oversizedDuplicateIds = Array.from({ length: 2001 }, () => 'id-1');

    expect(() =>
      applicationAccessControlGuard.parse({ ...emptyAccessControl, userIds: oversizedDuplicateIds })
    ).toThrow();
    expect(() =>
      applicationAccessControlGuard.parse({
        ...emptyAccessControl,
        organizationRoleRules: oversizedDuplicateIds.map(() => ({
          organizationId: 'organization-1',
          organizationRoleIds: [],
        })),
      })
    ).toThrow();
    expect(() =>
      applicationAccessControlGuard.parse({
        ...emptyAccessControl,
        organizationRoleRules: [
          { organizationId: 'organization-1', organizationRoleIds: oversizedDuplicateIds },
        ],
      })
    ).toThrow();
  });
});
