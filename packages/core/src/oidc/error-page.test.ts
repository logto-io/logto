import resources, { builtInLanguages } from '@logto/phrases';
import { assert } from '@silverhand/essentials';
import { createInstance } from 'i18next';

import { escapeHtmlAttributeValue } from '#src/saml-application/SamlApplication/utils.js';
import { i18next } from '#src/utils/i18n.js';

import { renderOidcErrorPage } from './error-page.js';

const rtlLanguages = new Set(['ar', 'fa-IR']);

describe('renderOidcErrorPage', () => {
  it.each(builtInLanguages)('renders the %s copy, language, and direction', async (language) => {
    const i18n = createInstance();
    await i18n.init({ lng: language, resources });

    const { title, description, details } = resources[language].translation?.oidc?.error_page ?? {};
    assert(title && description && details, new Error(`Missing copy for ${language}`));

    const html = renderOidcErrorPage(i18n, {});

    expect(html).toContain(
      `<html lang="${language}" dir="${rtlLanguages.has(language) ? 'rtl' : 'ltr'}">`
    );
    expect(html).toContain(`<title>${escapeHtmlAttributeValue(title)}</title>`);
    expect(html).toContain(`<h1 class="title">${escapeHtmlAttributeValue(title)}</h1>`);
    expect(html).toContain(`<p class="message">${escapeHtmlAttributeValue(description)}</p>`);
    expect(html).toContain(`<summary>${escapeHtmlAttributeValue(details)}<svg`);
  });

  it.each(builtInLanguages.filter((language) => language !== 'en'))(
    'does not reuse the English copy for %s',
    (language) => {
      const english = resources.en.translation.oidc.error_page;
      const copy = resources[language].translation?.oidc?.error_page;

      expect(copy?.title).not.toBe(english.title);
      expect(copy?.description).not.toBe(english.description);
      expect(copy?.details).not.toBe(english.details);
    }
  );

  it('shows the error body as formatted JSON', () => {
    const html = renderOidcErrorPage(i18next, { code: 'oidc.invalid_redirect_uri', status: 400 });

    expect(html).toContain(
      '<pre dir="ltr">{\n  &quot;code&quot;: &quot;oidc.invalid_redirect_uri&quot;,\n  &quot;status&quot;: 400\n}</pre>'
    );
  });

  it('escapes HTML in the error body', () => {
    const html = renderOidcErrorPage(i18next, {
      state: '</pre><script>alert(1)</script>',
      error_description: `<img src=x onerror=alert(1)> "double" 'single'`,
    });

    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;/pre&gt;&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('\\&quot;double\\&quot; &#39;single&#39;');
  });

  it('keeps replacement patterns and placeholders in the body literal', () => {
    // eslint-disable-next-line no-template-curly-in-string -- a placeholder that must stay literal
    const state = '$& $` ${title}';
    const html = renderOidcErrorPage(i18next, { state });

    expect(html).toContain(`&quot;state&quot;: &quot;${escapeHtmlAttributeValue(state)}&quot;`);
  });

  it('references no scripts or external resources', () => {
    expect(renderOidcErrorPage(i18next, {})).not.toMatch(
      /<script|<link|src=|href=|@import|url\((?!#)/
    );
  });
});
