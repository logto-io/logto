import {
  type IdentificationApiPayload,
  type InteractionEvent,
  type PasswordVerificationPayload,
  type VerificationCodeIdentifier,
} from '@logto/schemas';

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

  public async sendVerificationCode(payload: {
    identifier: VerificationCodeIdentifier;
    interactionEvent: InteractionEvent;
  }) {
    return api
      .post(`${experienceRoutes.verification}/verification-code`, {
        headers: { cookie: this.interactionCookie },
        json: payload,
      })
      .json<{ verificationId: string }>();
  }

  public async verifyVerificationCode(payload: {
    identifier: VerificationCodeIdentifier;
    verificationId: string;
    code: string;
  }) {
    return api
      .post(`${experienceRoutes.verification}/verification-code/verify`, {
        headers: { cookie: this.interactionCookie },
        json: payload,
      })
      .json<{ verificationId: string }>();
  }

  public async getSocialAuthorizationUri(
    connectorId: string,
    payload: {
      redirectUri: string;
      state: string;
    }
  ) {
    return api
      .post(`${experienceRoutes.verification}/social/${connectorId}/authorization-uri`, {
        headers: { cookie: this.interactionCookie },
        json: payload,
      })
      .json<{ authorizationUri: string; verificationId: string }>();
  }

  public async verifySocialAuthorization(
    connectorId: string,
    payload: {
      verificationId: string;
      connectorData: Record<string, unknown>;
    }
  ) {
    return api
      .post(`${experienceRoutes.verification}/social/${connectorId}/verify`, {
        headers: { cookie: this.interactionCookie },
        json: payload,
      })
      .json<{ verificationId: string }>();
  }
}
