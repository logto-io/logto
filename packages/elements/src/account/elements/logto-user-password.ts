import { css, html, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import passwordIcon from '../icons/password.svg';

import { LogtoProfileItemElement } from './LogtoProfileItemElement.js';

const tagName = 'logto-user-password';

@customElement(tagName)
export class LogtoUserPassword extends LogtoProfileItemElement {
  static tagName = tagName;

  static styles = css`
    .status {
      display: flex;
      align-items: center;
      gap: var(--logto-spacing-sm);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--logto-color-container-on-success);
    }
  `;

  protected isAccessible(): boolean {
    // The password is always accessible
    return true;
  }

  protected getItemLabelInfo() {
    return {
      icon: passwordIcon,
      label: 'Password',
    };
  }

  protected renderContent(): TemplateResult {
    const { hasPassword } = this.accountContext?.userProfile ?? {};
    return when(
      hasPassword,
      () =>
        html`<div slot="content">
          <div class="status">
            <span class="status-dot"></span>
            Configured
          </div>
        </div>`
    );
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HTMLElementTagNameMap {
    [tagName]: LogtoUserPassword;
  }
}
