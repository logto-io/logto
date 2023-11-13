// https://github.com/panva/node-oidc-provider/blob/cf2069cbb31a6a855876e95157372d25dde2511c/lib/helpers/filter_claims.js
declare module 'oidc-provider/lib/helpers/filter_claims.js' {
  import { type ClaimsParameter } from 'oidc-provider';
  import type Provider from 'oidc-provider';

  export default function filterClaims(
    source: ClaimsParameter | undefined,
    target: keyof ClaimsParameter,
    grant: InstanceType<Provider['Grant']>
  ): NonNullable<ClaimsParameter[keyof ClaimsParameter]>;
}
