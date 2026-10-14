import { TenantRole } from '@logto/schemas';

import { findTenantRole, getAssignableTenantRoles, getTenantRolePhrase } from './utils';

describe('getAssignableTenantRoles', () => {
  it('offers Viewer on Cloud with dev features on', () => {
    expect(getAssignableTenantRoles({ isCloud: true, isDevFeaturesEnabled: true })).toEqual([
      TenantRole.Admin,
      TenantRole.Collaborator,
      TenantRole.Viewer,
    ]);
  });

  it('withholds Viewer on Cloud with dev features off', () => {
    expect(getAssignableTenantRoles({ isCloud: true, isDevFeaturesEnabled: false })).toEqual([
      TenantRole.Admin,
      TenantRole.Collaborator,
    ]);
  });

  it.each([true, false])(
    'never offers Viewer on self-hosted (dev features: %s)',
    (isDevFeaturesEnabled) => {
      expect(getAssignableTenantRoles({ isCloud: false, isDevFeaturesEnabled })).toEqual([
        TenantRole.Admin,
        TenantRole.Collaborator,
      ]);
    }
  );
});

describe('findTenantRole', () => {
  it.each([
    [TenantRole.Viewer, TenantRole.Viewer],
    ['unknown', undefined],
    [undefined, undefined],
  ])('resolves %s to %s', (roleId, expected) => {
    expect(findTenantRole(roleId)).toBe(expected);
  });
});

describe('getTenantRolePhrase', () => {
  it('labels each tenant role', () => {
    expect(getTenantRolePhrase(TenantRole.Admin)).toBe('admin');
    expect(getTenantRolePhrase(TenantRole.Collaborator)).toBe('collaborator');
    expect(getTenantRolePhrase(TenantRole.Viewer)).toBe('viewer');
  });

  it('labels an unknown role as Collaborator', () => {
    expect(getTenantRolePhrase('unknown')).toBe('collaborator');
  });
});
