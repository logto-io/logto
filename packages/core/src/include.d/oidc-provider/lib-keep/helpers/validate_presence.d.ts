// https://github.com/panva/node-oidc-provider/blob/cf2069cbb31a6a855876e95157372d25dde2511c/lib/helpers/validate_presence.js
declare module 'oidc-provider/lib/helpers/validate_presence.js' {
  export default function validatePresence(
    ctx: KoaContextWithOIDC,
    ...required: readonly string[]
  ): void;
}
