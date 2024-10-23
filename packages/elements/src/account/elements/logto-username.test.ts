import { assert, fixture, html, waitUntil } from '@open-wc/testing';

import { createMockAccountApi } from '../__mocks__/account-api.js';
import { type LogtoAccountProvider } from '../providers/logto-account-provider.js';

import { LogtoUsername } from './logto-username.js';

const fakeLogtoEndpoint = 'https://logto.dev';

suite('logto-username', () => {
  test('is defined', () => {
    const element = document.createElement(LogtoUsername.tagName);
    assert.instanceOf(element, LogtoUsername);
  });

  test('should render error message when account context is not available', async () => {
    const element = await fixture<LogtoUsername>(html`<logto-username></logto-username>`);
    await element.updateComplete;

    assert.equal(element.shadowRoot?.textContent, 'Unable to retrieve account context.');
  });

  test('should render username if the user has permission to view username information', async () => {
    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        username: 'test_username',
      }),
    });

    const provider = await fixture<LogtoAccountProvider>(
      html`<logto-account-provider .accountApi=${mockAccountApi}>
        <logto-username></logto-username>
      </logto-account-provider>`
    );

    await provider.updateComplete;

    const logtoUsername = provider.querySelector<LogtoUsername>(LogtoUsername.tagName);

    await waitUntil(
      () =>
        logtoUsername?.shadowRoot?.querySelector('div[slot="content"]')?.textContent ===
        'test_username',
      'Unable to get username from account context'
    );
  });

  test('should render nothing if the user lacks permission to view username information', async () => {
    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        username: undefined,
      }),
    });

    const provider = await fixture<LogtoAccountProvider>(
      html`<logto-account-provider .accountApi=${mockAccountApi}>
        <logto-username></logto-username>
      </logto-account-provider>`
    );

    await provider.updateComplete;
    const logtoUsername = provider.querySelector<LogtoUsername>(LogtoUsername.tagName);

    await logtoUsername?.updateComplete;
    assert.equal(logtoUsername?.shadowRoot?.children.length, 0);
  });
});
