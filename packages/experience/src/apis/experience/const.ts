export const prefix = 'api/experience';

export const experienceRoutes = Object.freeze({
  prefix,
  identification: `${prefix}/identification`,
  verification: `${prefix}/verification`,
  profile: `${prefix}/profile`,
  mfa: `${prefix}/profile/mfa`,
});

export type VerificationResponse = {
  verificationId: string;
};
