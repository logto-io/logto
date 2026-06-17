import { type anonymousRouter } from '@logto/cloud/routes';
import { type RouterRoutes } from '@withtyped/client';

const acceptInvitationRoute = '/accept';
const invitationAuthRoute = '/api/invitations/:invitationId/auth' satisfies keyof RouterRoutes<
  typeof anonymousRouter
>['post'];

export const buildInvitationAcceptUrl = (invitationId: string) =>
  new URL(`${acceptInvitationRoute}/${invitationId}`, window.location.origin);

export const buildInvitationAuthPath = (invitationId: string, oneTimeToken: string) => {
  const searchParameters = new URLSearchParams({ one_time_token: oneTimeToken });

  return `${invitationAuthRoute.replace(
    ':invitationId',
    encodeURIComponent(invitationId)
  )}?${searchParameters.toString()}`;
};
