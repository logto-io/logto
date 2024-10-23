import { assert, fixture, html, waitUntil } from '@open-wc/testing';

import { createMockAccountApi } from '../__mocks__/account-api.js';
import { LogtoIdentityInfo } from '../components/logto-identity-info.js';
import { type LogtoAccountProvider } from '../providers/logto-account-provider.js';

import { LogtoSocialIdentity } from './logto-social-identity.js';

suite('logto-social-identity', () => {
  test('is defined', () => {
    const element = document.createElement(LogtoSocialIdentity.tagName);
    assert.instanceOf(element, LogtoSocialIdentity);
  });

  test('should render error message when account context is not available', async () => {
    const element = await fixture<LogtoSocialIdentity>(
      html`<logto-social-identity></logto-social-identity>`
    );
    await element.updateComplete;

    assert.equal(element.shadowRoot?.textContent, 'Unable to retrieve account context.');
  });

  test('should render correctly when user has permission to view social identity information', async () => {
    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        identities: {
          github: {
            userId: '123',
            details: {
              name: 'John Doe',
              email: 'john@example.com',
            },
          },
        },
      }),
    });

    const provider = await fixture<LogtoAccountProvider>(
      html`<logto-account-provider .accountApi=${mockAccountApi}>
        <logto-social-identity target="github"></logto-social-identity>
      </logto-account-provider>`
    );

    await provider.updateComplete;

    const logtoSocialIdentity = provider.querySelector<LogtoSocialIdentity>(
      LogtoSocialIdentity.tagName
    );

    const identityInfo = logtoSocialIdentity?.shadowRoot?.querySelector<LogtoIdentityInfo>(
      LogtoIdentityInfo.tagName
    );

    await waitUntil(
      () =>
        identityInfo?.shadowRoot?.querySelector('div[class=name]')?.textContent === 'John Doe' &&
        identityInfo.shadowRoot.querySelector('div[class=email]')?.textContent ===
          'john@example.com',
      'Unable to get social identity information from account context'
    );
  });

  test('should render nothing if the user lacks permission to view social identity information', async () => {
    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        identities: undefined,
      }),
    });

    const provider = await fixture<LogtoAccountProvider>(
      html`<logto-account-provider .accountApi=${mockAccountApi}>
        <logto-social-identity target="github" labelText="GitHub"></logto-social-identity>
      </logto-account-provider>`
    );

    await provider.updateComplete;
    const logtoSocialIdentity = provider.querySelector<LogtoSocialIdentity>(
      LogtoSocialIdentity.tagName
    );

    await logtoSocialIdentity?.updateComplete;
    assert.equal(logtoSocialIdentity?.shadowRoot?.children.length, 0);
  });
});
