import { html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import usernameIcon from '../icons/username.svg';

import { LogtoProfileItemElement } from './LogtoProfileItemElement.js';

const tagName = 'logto-social-identity';

@customElement(tagName)
export class LogtoSocialIdentity extends LogtoProfileItemElement {
  static tagName = tagName;

  @property({ type: String })
  target = '';

  constructor() {
    // Todo: @xiaoyijun replace with correct label text when related connector API is ready
    super(usernameIcon, 'Social');
  }

  protected isAccessible(): boolean {
    return this.accountContext?.userProfile.identities !== undefined;
  }

  protected renderContent(): TemplateResult {
    const { identities } = this.accountContext?.userProfile ?? {};

    const identity = identities?.[this.target];
    // Todo: @xiaoyijun add identifier fallback logic
    const { avatar = '', name = '', email = '' } = identity?.details ?? {};

    return when(
      identity,
      () =>
        html`<logto-identity-info
          slot="content"
          .avatar=${String(avatar)}
          .name=${String(name)}
          .email=${String(email)}
        ></logto-identity-info>`
    );
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HTMLElementTagNameMap {
    [tagName]: LogtoSocialIdentity;
  }
}
