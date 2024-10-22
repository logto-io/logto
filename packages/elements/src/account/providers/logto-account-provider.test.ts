import { consume } from '@lit/context';
import { assert, fixture, html, nextFrame, waitUntil } from '@open-wc/testing';
import { type Optional } from '@silverhand/essentials';
import { LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { createMockAccountApi } from '../__mocks__/account-api.js';

import {
  logtoAccountContext,
  type LogtoAccountContextType,
  LogtoAccountProvider,
} from './logto-account-provider.js';

@customElement('test-logto-account-provider-consumer')
export class TestLogtoAccountProviderConsumer extends LitElement {
  @consume({ context: logtoAccountContext, subscribe: true })
  @property({ attribute: false })
  accountContext?: LogtoAccountContextType;

  render() {
    if (!this.accountContext) {
      return nothing;
    }

    return html`<div id="user-id">${this.accountContext.userProfile.id}</div>`;
  }
}

suite('logto-account-provider', () => {
  test('is defined', () => {
    const element = document.createElement('logto-account-provider');
    assert.instanceOf(element, LogtoAccountProvider);
  });

  test('should render not initialized content when account api is not provided', async () => {
    const provider = await fixture<LogtoAccountProvider>(
      html`<logto-account-provider></logto-account-provider>`
    );

    await provider.updateComplete;

    assert.equal(
      provider.shadowRoot?.textContent,
      `${LogtoAccountProvider.tagName} not initialized.`
    );
  });

  test('should correctly consume logto account provider context', async () => {
    const testUserId = '123';

    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        id: testUserId,
      }),
    });

    const provider = await fixture<LogtoAccountProvider>(
      html`<logto-account-provider .accountApi=${mockAccountApi}>
        <test-logto-account-provider-consumer></test-logto-account-provider-consumer>
      </logto-account-provider>`
    );

    await provider.updateComplete;

    const consumer = provider.querySelector<TestLogtoAccountProviderConsumer>(
      'test-logto-account-provider-consumer'
    )!;

    await waitUntil(
      () => consumer.shadowRoot?.querySelector('#user-id')?.textContent === testUserId,
      'Unable to get user data from account context'
    );
  });

  test('should render error content and dispatch error event when initialize failed', async () => {
    const errorMessage = 'Failed to fetch user profile';
    // eslint-disable-next-line @silverhand/fp/no-let
    let dispatchedErrorEvent: Optional<ErrorEvent>;

    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => {
        // Simulate network delay
        await nextFrame();
        throw new Error(errorMessage);
      },
    });

    const provider = await fixture<LogtoAccountProvider>(
      html`<logto-account-provider .accountApi=${mockAccountApi}>
        <test-logto-account-provider-consumer></test-logto-account-provider-consumer>
      </logto-account-provider>`
    );

    provider.addEventListener('error', (event) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      dispatchedErrorEvent = event;
    });

    await provider.updateComplete;

    await waitUntil(
      () => provider.shadowRoot?.textContent === `${LogtoAccountProvider.tagName}: ${errorMessage}`
    );

    assert.equal(dispatchedErrorEvent?.error.message, errorMessage);
  });
});
