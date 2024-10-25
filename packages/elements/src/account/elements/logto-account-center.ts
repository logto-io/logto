import { consume } from '@lit/context';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import {
  logtoAccountContext,
  type LogtoAccountContextType,
} from '../providers/logto-account-provider.js';

const tagName = 'logto-account-center';

@customElement(tagName)
export class LogtoAccountCenter extends LitElement {
  static tagName = tagName;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--logto-account-center-item-spacing, var(--logto-spacing-md));
    }
  `;

  @consume({ context: logtoAccountContext, subscribe: true })
  private readonly accountContext?: LogtoAccountContextType;

  render() {
    if (!this.accountContext) {
      return html`<span>Unable to retrieve account context.</span>`;
    }

    const {
      userProfile: { username, primaryEmail, primaryPhone, hasPassword, identities },
    } = this.accountContext;

    return html`
      ${username !== undefined && html`<logto-username></logto-username>`}
      ${primaryEmail !== undefined && html`<logto-user-email></logto-user-email>`}
      ${primaryPhone !== undefined && html`<logto-user-phone></logto-user-phone>`}
      ${hasPassword !== undefined && html`<logto-user-password></logto-user-password>`}
      ${identities !== undefined &&
      Object.entries(identities).map(
        ([target]) => html`<logto-social-identity target=${target}></logto-social-identity>`
      )}
    `;
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HTMLElementTagNameMap {
    [tagName]: LogtoAccountCenter;
  }
}
