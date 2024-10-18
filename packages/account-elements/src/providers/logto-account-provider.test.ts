import { consume } from '@lit/context';
import { assert, fixture, html, waitUntil } from '@open-wc/testing';
import { LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { http, HttpResponse } from 'msw';

import { createMockServer } from '../__mocks__/mock-server.js';
import { mockUserProfile } from '../__mocks__/user-profile.js';

import {
  logtoAccountContext,
  type LogtoAccountContextType,
  LogtoAccountProvider,
} from './logto-account-provider.js';

const fakeLogtoEndpoint = 'http://fake.logto.app';

const mockServer = createMockServer(
  http.get(`${fakeLogtoEndpoint}/api/profile`, () => {
    return HttpResponse.json(mockUserProfile);
  })
);

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
  suiteSetup(async () => {
    await mockServer.start();
  });

  suiteTeardown(async () => {
    mockServer.stop();
  });

  test('is defined', () => {
    const element = document.createElement('logto-account-provider');
    assert.instanceOf(element, LogtoAccountProvider);
  });

  test('should throws error if logto-endpoint is not set', () => {
    const element = new LogtoAccountProvider();
    assert.throws(
      () => {
        element.connectedCallback();
      },
      Error,
      'logto-endpoint is required'
    );
  });

  test('should correctly consume logto account provider context when initialized with init function', async () => {
    const provider = await fixture<LogtoAccountProvider>(
      html`<logto-account-provider logto-endpoint=${fakeLogtoEndpoint}>
        <test-logto-account-provider-consumer></test-logto-account-provider-consumer>
      </logto-account-provider>`
    );
    // Initialize with init function
    provider.init(async () => 'mock_access_token');

    await provider.updateComplete;

    const consumer = provider.querySelector<TestLogtoAccountProviderConsumer>(
      'test-logto-account-provider-consumer'
    )!;

    await waitUntil(
      () => consumer.shadowRoot?.querySelector('#user-id')?.textContent === mockUserProfile.id,
      'Unable to get user data from account context'
    );
  });

  test('should correctly consume logto account provider context when access token fetcher is set', async () => {
    const provider = await fixture<LogtoAccountProvider>(
      html`<logto-account-provider
        logto-endpoint=${fakeLogtoEndpoint}
        .accessTokenFetcher=${() => 'mock_access_token'}
      >
        <test-logto-account-provider-consumer></test-logto-account-provider-consumer>
      </logto-account-provider>`
    );

    await provider.updateComplete;

    const consumer = provider.querySelector<TestLogtoAccountProviderConsumer>(
      'test-logto-account-provider-consumer'
    )!;

    await waitUntil(
      () => consumer.shadowRoot?.querySelector('#user-id')?.textContent === mockUserProfile.id,
      'Unable to get user data from account context'
    );
  });
});
