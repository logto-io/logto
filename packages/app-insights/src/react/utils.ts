export const getPrimaryDomain = () => window.location.hostname.split('.').slice(-2).join('.');
