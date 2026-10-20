import { InteractionHookEvent } from '@logto/schemas';

import {
  availableHookEvents,
  interactionHookEvents,
  schemaGroupedDataHookEvents,
} from './webhooks';

jest.mock('@/consts/env', () => ({ isDevFeaturesEnabled: true }));

it('includes the adaptive MFA hook event', () => {
  expect(interactionHookEvents).toContain(InteractionHookEvent.PostSignInAdaptiveMfaTriggered);
});

it('exposes and groups trusted-device events', () => {
  expect(availableHookEvents).toEqual(
    expect.arrayContaining(['TrustedDevice.Created', 'TrustedDevice.Deleted'])
  );
  expect(schemaGroupedDataHookEvents).toContainEqual([
    'TrustedDevice',
    ['TrustedDevice.Created', 'TrustedDevice.Deleted'],
  ]);
});

it('exposes user role assignment events', () => {
  expect(availableHookEvents).toEqual(
    expect.arrayContaining(['User.Roles.Updated', 'Organization.UserRoles.Updated'])
  );
  expect(schemaGroupedDataHookEvents).toContainEqual([
    'User',
    expect.arrayContaining(['User.Roles.Updated']),
  ]);
  expect(schemaGroupedDataHookEvents).toContainEqual([
    'Organization',
    expect.arrayContaining(['Organization.UserRoles.Updated']),
  ]);
});
