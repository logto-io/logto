import { assert, fixture, html, waitUntil } from '@open-wc/testing';

import { createMockAccountApi } from '../__mocks__/account-api.js';
import { type LogtoAccountProvider } from '../providers/logto-account-provider.js';

import { LogtoUserEmail } from './logto-user-email.js';

suite('logto-user-email', () => {
  test('is defined', () => {
    const element = document.createElement(LogtoUserEmail.tagName);
    assert.instanceOf(element, LogtoUserEmail);
  });

  test('should render error message when account context is not available', async () => {
    const element = await fixture<LogtoUserEmail>(html`<logto-user-email></logto-user-email>`);
    await element.updateComplete;

    assert.equal(element.shadowRoot?.textContent, 'Unable to retrieve account context.');
  });

  test('should render email if the user has permission to view email information', async () => {
    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        primaryEmail: 'user@example.com',
      }),
    });

    const provider = await fixture<LogtoAccountProvider>(
      html`<logto-account-provider .accountApi=${mockAccountApi}>
        <logto-user-email></logto-user-email>
      </logto-account-provider>`
    );

    await provider.updateComplete;

    const logtoUserEmail = provider.querySelector<LogtoUserEmail>(LogtoUserEmail.tagName);

    await waitUntil(
      () =>
        logtoUserEmail?.shadowRoot?.querySelector('div[slot="content"]')?.textContent ===
        'user@example.com',
      'Unable to get email from account context'
    );
  });

  test('should render nothing if the user lacks permission to view email information', async () => {
    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        primaryEmail: undefined,
      }),
    });

    const provider = await fixture<LogtoAccountProvider>(
      html`<logto-account-provider .accountApi=${mockAccountApi}>
        <logto-user-email></logto-user-email>
      </logto-account-provider>`
    );

    await provider.updateComplete;
    const logtoUserEmail = provider.querySelector<LogtoUserEmail>(LogtoUserEmail.tagName);

    await logtoUserEmail?.updateComplete;
    assert.equal(logtoUserEmail?.shadowRoot?.children.length, 0);
  });
});
