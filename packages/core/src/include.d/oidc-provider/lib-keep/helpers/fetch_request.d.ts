// https://github.com/logto-io/node-oidc-provider/blob/513c523c0e68ee6112da8c871cce86204a136163/lib/helpers/fetch_request.js
declare module 'oidc-provider/lib/helpers/fetch_request.js' {
  /**
   * Whether the address belongs to the IANA special-purpose address registries (loopback,
   * private-use, link-local, shared address space, ...). IPv4-mapped IPv6 addresses are unwrapped
   * and judged as IPv4.
   *
   * @param address A valid IPv4 or IPv6 address, such as `socket.remoteAddress`.
   */
  export function isSpecialUseIP(address: string): boolean;

  /**
   * Attaches the SSRF guard to an undici dispatcher: on every established connection the socket's
   * remote address is inspected and the socket is destroyed when it points at a special-use IP.
   *
   * @returns The same dispatcher instance, for chaining.
   */
  export function applySSRFProtection<T>(dispatcher: T): T;
}
