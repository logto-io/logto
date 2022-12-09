import { Event } from '@logto/schemas';
import type {
  IdentifierPayload,
  PhonePasswordPayload,
  EmailPasswordPayload,
  Profile,
  UsernamePasswordPayload,
} from '@logto/schemas';

import api from './api';

export type RedirectResponse = {
  redirectTo: string;
};

export type interactionPayload = {
  event: Event;
  identifier?: IdentifierPayload;
  profile?: Profile;
};

export const signInWithPasswordIdentifiers = async (
  identifier: UsernamePasswordPayload | EmailPasswordPayload | PhonePasswordPayload,
  cookie: string
) =>
  api
    .put('interaction', {
      headers: {
        cookie,
      },
      json: {
        event: Event.SignIn,
        identifier,
      },
      followRedirect: false,
    })
    .json<RedirectResponse>();
