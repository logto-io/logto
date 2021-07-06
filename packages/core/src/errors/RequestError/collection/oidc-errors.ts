export enum OidcErrorCode {
  Aborted = 'oidc.aborted',
}

export const oidcErrorMessage: Record<OidcErrorCode, string> = {
  [OidcErrorCode.Aborted]: 'The end-user aborted interaction.',
};
