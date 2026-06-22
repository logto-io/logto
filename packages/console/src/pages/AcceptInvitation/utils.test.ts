import { buildInvitationAcceptUrl, buildInvitationAuthPath } from './utils';

describe('accept invitation utils', () => {
  test('builds the accept invitation URL for the current Console origin', () => {
    expect(buildInvitationAcceptUrl('invitation-id').href).toBe(
      'http://localhost/accept/invitation-id'
    );
  });

  test('builds the invitation auth endpoint path', () => {
    expect(buildInvitationAuthPath('invitation-id', 'one-time-token')).toBe(
      '/api/invitations/invitation-id/auth?one_time_token=one-time-token'
    );
    expect(buildInvitationAuthPath('invitation/id', 'one/time token')).toBe(
      '/api/invitations/invitation%2Fid/auth?one_time_token=one%2Ftime+token'
    );
  });
});
