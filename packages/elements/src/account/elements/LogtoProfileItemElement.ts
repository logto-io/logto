import { consume } from '@lit/context';
import { html, LitElement, nothing, type TemplateResult } from 'lit';

import {
  logtoAccountContext,
  type LogtoAccountContextType,
} from '../providers/logto-account-provider.js';

export abstract class LogtoProfileItemElement extends LitElement {
  @consume({ context: logtoAccountContext, subscribe: true })
  protected readonly accountContext?: LogtoAccountContextType;

  constructor(
    private readonly icon: string,
    private readonly label: string
  ) {
    super();
  }

  render() {
    if (!this.accountContext) {
      return html`<span>Unable to retrieve account context.</span>`;
    }

    if (!this.isAccessible()) {
      // Render nothing if the user lacks permission to view phone number information
      return nothing;
    }

    return html`
      <logto-profile-item>
        <logto-icon slot="label-icon">${this.icon}</logto-icon>
        <div slot="label-text">${this.label}</div>
        ${this.renderContent()}
      </logto-profile-item>
    `;
  }

  protected abstract isAccessible(): boolean;

  protected abstract renderContent(): TemplateResult;
}
