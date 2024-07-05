import { type IdentificationApiPayload, type PasswordVerificationPayload } from '@logto/schemas';

import MockClient from '#src/client/index.js';

import api from '../../api/api.js';

import { experienceRoutes } from './const.js';

type RedirectResponse = {
  redirectTo: string;
};

export const identifyUser = async (cookie: string, payload: IdentificationApiPayload) =>
  api
    .post(experienceRoutes.identification, {
      headers: { cookie },
      json: payload,
    })
    .json();

export class ExperienceClient extends MockClient {
  public async identifyUser(payload: IdentificationApiPayload) {
    return api
      .post(experienceRoutes.identification, {
        headers: { cookie: this.interactionCookie },
        json: payload,
      })
      .json();
  }

  public override async submitInteraction(): Promise<RedirectResponse> {
    return api
      .post(`${experienceRoutes.prefix}/submit`, { headers: { cookie: this.interactionCookie } })
      .json<RedirectResponse>();
  }

  public async verifyPassword(payload: PasswordVerificationPayload) {
    return api
      .post(`${experienceRoutes.verification}/password`, {
        headers: { cookie: this.interactionCookie },
        json: payload,
      })
      .json<{ verificationId: string }>();
  }
}
