import { readFileSync } from 'node:fs';

import { type I18nKey } from '@logto/phrases';
import { type i18n } from 'i18next';

import { escapeHtmlAttributeValue } from '#src/saml-application/SamlApplication/utils.js';

// The template's CSS is a standalone copy of the experience's design tokens, so changes to
// packages/experience/src/shared/scss and its Providers/AppBoundary styles don't reach it.
const template = readFileSync('static/html/oidc-error.html', 'utf8');

/**
 * Render the page shown when a browser hits an OIDC error that can't be sent back to the app.
 *
 * @param body The JSON error response, shown in the page's error details.
 */
export const renderOidcErrorPage = (i18n: i18n, body: unknown) => {
  const values: Record<string, string> = {
    lang: i18n.language,
    dir: i18n.dir(),
    title: i18n.t<string, I18nKey>('oidc.error_page.title'),
    description: i18n.t<string, I18nKey>('oidc.error_page.description'),
    detailsLabel: i18n.t<string, I18nKey>('oidc.error_page.details'),
    details: JSON.stringify(body, undefined, 2),
  };

  // One pass with a replacer function, so a value can't expand `$&` or another placeholder.
  return template.replaceAll(/\${(\w+)}/g, (_, key: string) =>
    escapeHtmlAttributeValue(values[key] ?? '')
  );
};
