export const duplicatedDomainsErrorCode = 'single_sign_on.duplicated_domains';
export const forbiddenDomainsErrorCode = 'single_sign_on.forbidden_domains';
export const invalidDomainFormatErrorCode = 'single_sign_on.invalid_domain_format';

// RegExp to domain string.
// eslint-disable-next-line prefer-regex-literals
export const domainRegExp = new RegExp('\\S+[\\.]{1}\\S+');
