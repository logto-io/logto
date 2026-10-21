export const prefix = '/api/experience';

export const experienceApiRoutes = Object.freeze({
  prefix,
  interaction: `${prefix}/interaction`,
  identification: `${prefix}/identification`,
  submit: `${prefix}/submit`,
  abort: `${prefix}/abort`,
  verification: `${prefix}/verification`,
  profile: `${prefix}/profile`,
  mfa: `${prefix}/profile/mfa`,
});

export type VerificationResponse = {
  verificationId: string;
};
