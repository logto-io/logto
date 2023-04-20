/**
 * **CAUTION:** This function takes the last two parts of the hostname which may cause issues for
 * some second-level domains, e.g. `.co.uk`.
 */
export const getPrimaryDomain = () => window.location.hostname.split('.').slice(-2).join('.');
