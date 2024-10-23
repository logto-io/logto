import { assert, fixture, html, waitUntil } from '@open-wc/testing';

import { createMockAccountApi } from '../__mocks__/account-api.js';
import { type LogtoAccountProvider } from '../providers/logto-account-provider.js';

import { LogtoUserPhone } from './logto-user-phone.js';

suite('logto-user-phone', () => {
  test('is defined', () => {
    const element = document.createElement(LogtoUserPhone.tagName);
    assert.instanceOf(element, LogtoUserPhone);
  });

  test('should render error message when account context is not available', async () => {
    const element = await fixture<LogtoUserPhone>(html`<logto-user-phone></logto-user-phone>`);
    await element.updateComplete;

    assert.equal(element.shadowRoot?.textContent, 'Unable to retrieve account context.');
  });

  test('should render phone number if the user has permission to view phone information', async () => {
    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        primaryPhone: '12025550179',
      }),
    });

    const provider = await fixture<LogtoAccountProvider>(
      html`<logto-account-provider .accountApi=${mockAccountApi}>
        <logto-user-phone></logto-user-phone>
      </logto-account-provider>`
    );

    await provider.updateComplete;

    const logtoUserPhone = provider.querySelector<LogtoUserPhone>(LogtoUserPhone.tagName);

    await waitUntil(
      () =>
        logtoUserPhone?.shadowRoot?.querySelector('div[slot="content"]')?.textContent ===
        '+1 202 555 0179',
      'Unable to get phone number from account context'
    );
  });

  test('should render nothing if the user lacks permission to view phone information', async () => {
    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        primaryPhone: undefined,
      }),
    });

    const provider = await fixture<LogtoAccountProvider>(
      html`<logto-account-provider .accountApi=${mockAccountApi}>
        <logto-user-phone></logto-user-phone>
      </logto-account-provider>`
    );

    await provider.updateComplete;
    const logtoUserPhone = provider.querySelector<LogtoUserPhone>(LogtoUserPhone.tagName);

    await logtoUserPhone?.updateComplete;
    assert.equal(logtoUserPhone?.shadowRoot?.children.length, 0);
  });
});
