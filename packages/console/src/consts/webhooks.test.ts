import { InteractionHookEvent } from '@logto/schemas';

import {
  availableHookEvents,
  interactionHookEvents,
  schemaGroupedDataHookEvents,
} from './webhooks';

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
