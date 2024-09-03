import {
  type CreateExperienceApiPayload,
  type IdentificationApiPayload,
  type InteractionEvent,
  type MfaFactor,
  type PasswordVerificationPayload,
  type UpdateProfileApiPayload,
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
  public async identifyUser(payload: IdentificationApiPayload = {}) {
    return api.post(experienceRoutes.identification, {
      headers: { cookie: this.interactionCookie },
      json: payload,
    });
  }

  public async updateInteractionEvent(payload: { interactionEvent: InteractionEvent }) {
    return api
      .put(`${experienceRoutes.prefix}/interaction-event`, {
        headers: { cookie: this.interactionCookie },
        json: payload,
      })
      .json();
  }

  public async initInteraction(payload: CreateExperienceApiPayload) {
    return api
      .put(experienceRoutes.prefix, {
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

  public async getEnterpriseSsoAuthorizationUri(
    connectorId: string,
    payload: {
      redirectUri: string;
      state: string;
    }
  ) {
    return api
      .post(`${experienceRoutes.verification}/sso/${connectorId}/authorization-uri`, {
        headers: { cookie: this.interactionCookie },
        json: payload,
      })
      .json<{ authorizationUri: string; verificationId: string }>();
  }

  public async verifyEnterpriseSsoAuthorization(
    connectorId: string,
    payload: {
      verificationId: string;
      connectorData: Record<string, unknown>;
    }
  ) {
    return api
      .post(`${experienceRoutes.verification}/sso/${connectorId}/verify`, {
        headers: { cookie: this.interactionCookie },
        json: payload,
      })
      .json<{ verificationId: string }>();
  }

  public async getAvailableSsoConnectors(email: string) {
    return api
      .get(`${experienceRoutes.verification}/sso/connectors`, {
        headers: { cookie: this.interactionCookie },
        searchParams: { email },
      })
      .json<{ connectorIds: string[] }>();
  }

  public async createTotpSecret() {
    return api
      .post(`${experienceRoutes.verification}/totp/secret`, {
        headers: { cookie: this.interactionCookie },
      })
      .json<{ verificationId: string; secret: string; secretQrCode: string }>();
  }

  public async verifyTotp(payload: { verificationId?: string; code: string }) {
    return api
      .post(`${experienceRoutes.verification}/totp/verify`, {
        headers: { cookie: this.interactionCookie },
        json: payload,
      })
      .json<{ verificationId: string }>();
  }

  public async generateMfaBackupCodes() {
    return api
      .post(`${experienceRoutes.verification}/backup-code/generate`, {
        headers: { cookie: this.interactionCookie },
      })
      .json<{ verificationId: string; codes: string[] }>();
  }

  public async verifyBackupCode(payload: { code: string }) {
    return api
      .post(`${experienceRoutes.verification}/backup-code/verify`, {
        headers: { cookie: this.interactionCookie },
        json: payload,
      })
      .json<{ verificationId: string }>();
  }

  public async createNewPasswordIdentityVerification(
    payload: Pick<PasswordVerificationPayload, 'identifier'> & { password?: string }
  ) {
    return api
      .post(`${experienceRoutes.verification}/new-password-identity`, {
        headers: { cookie: this.interactionCookie },
        json: payload,
      })
      .json<{ verificationId: string }>();
  }

  public async resetPassword(payload: { password: string }) {
    return api.put(`${experienceRoutes.profile}/password`, {
      headers: { cookie: this.interactionCookie },
      json: payload,
    });
  }

  public async updateProfile(payload: UpdateProfileApiPayload) {
    return api.post(`${experienceRoutes.profile}`, {
      headers: { cookie: this.interactionCookie },
      json: payload,
    });
  }

  public async skipMfaBinding() {
    return api.post(`${experienceRoutes.mfa}/mfa-skipped`, {
      headers: { cookie: this.interactionCookie },
    });
  }

  public async bindMfa(type: MfaFactor, verificationId: string) {
    return api.post(`${experienceRoutes.mfa}`, {
      headers: { cookie: this.interactionCookie },
      json: { type, verificationId },
    });
  }
}
