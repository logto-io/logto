export const applyDomain = (url: string, domain: string) => url.replace(new URL(url).host, domain);
