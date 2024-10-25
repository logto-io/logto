import { html, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import emailIcon from '../icons/email.svg';

import { LogtoProfileItemElement } from './LogtoProfileItemElement.js';

const tagName = 'logto-user-email';

@customElement(tagName)
export class LogtoUserEmail extends LogtoProfileItemElement {
  static tagName = tagName;

  protected isAccessible(): boolean {
    return this.accountContext?.userProfile.primaryEmail !== undefined;
  }

  protected getItemLabelInfo() {
    return {
      icon: emailIcon,
      label: 'Email address',
    };
  }

  protected renderContent(): TemplateResult {
    const { primaryEmail } = this.accountContext?.userProfile ?? {};

    return when(primaryEmail, (email) => html`<div slot="content">${email}</div>`);
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HTMLElementTagNameMap {
    [tagName]: LogtoUserEmail;
  }
}
