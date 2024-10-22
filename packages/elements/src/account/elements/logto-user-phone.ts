import { html, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import phoneIcon from '../icons/phone.svg';
import { formatToInternationalPhoneNumber } from '../utils/format.js';

import { LogtoProfileItemElement } from './LogtoProfileItemElement.js';

const tagName = 'logto-user-phone';

@customElement(tagName)
export class LogtoUserPhone extends LogtoProfileItemElement {
  static tagName = tagName;

  constructor() {
    super(phoneIcon, 'Phone number');
  }

  protected isAccessible(): boolean {
    return this.accountContext?.userProfile.primaryPhone !== undefined;
  }

  protected renderContent(): TemplateResult {
    const { primaryPhone } = this.accountContext?.userProfile ?? {};
    return when(
      primaryPhone,
      (phone) => html`<div slot="content">${formatToInternationalPhoneNumber(phone)}</div>`
    );
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HTMLElementTagNameMap {
    [tagName]: LogtoUserPhone;
  }
}
