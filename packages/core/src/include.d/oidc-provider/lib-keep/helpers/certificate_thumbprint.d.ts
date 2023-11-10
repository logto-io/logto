// https://github.com/panva/node-oidc-provider/blob/cf2069cbb31a6a855876e95157372d25dde2511c/lib/helpers/certificate_thumbprint.js
declare module 'oidc-provider/lib/helpers/certificate_thumbprint.js' {
  import { type X509Certificate } from 'node:crypto';

  export default function certificateThumbprint(cert: string | X509Certificate): string;
}
