declare module 'oidc-provider/lib/helpers/validate_presence.js' {
  export default function validatePresence(
    ctx: KoaContextWithOIDC,
    ...required: readonly string[]
  ): void;
}
