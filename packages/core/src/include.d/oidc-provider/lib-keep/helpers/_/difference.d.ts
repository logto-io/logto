declare module 'oidc-provider/lib/helpers/_/difference.js' {
  /** Returns an array of values that are in `setA` but not in `setB`. */
  export default function difference<T>(setA: T[], setB: T[]): T[];
}
