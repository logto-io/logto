import { consume } from '@lit/context';
import { html, LitElement, nothing, type TemplateResult } from 'lit';

import {
  logtoAccountContext,
  type LogtoAccountContextType,
} from '../providers/logto-account-provider.js';

export abstract class LogtoProfileItemElement extends LitElement {
  @consume({ context: logtoAccountContext, subscribe: true })
  protected readonly accountContext?: LogtoAccountContextType;

  render() {
    if (!this.accountContext) {
      return html`<span>Unable to retrieve account context.</span>`;
    }

    if (!this.isAccessible()) {
      // Render nothing if the user lacks permission to view phone number information
      return nothing;
    }

    const { icon, label } = this.getItemLabelInfo();

    return html`
      <logto-profile-item>
        <logto-icon slot="label-icon">${icon}</logto-icon>
        <div slot="label-text">${label}</div>
        ${this.renderContent()}
      </logto-profile-item>
    `;
  }
  /**
   * Determines whether the user has permission to view this profile item.
   *
   * When the user lacks permission, the corresponding field in the userProfile data will be `undefined`.
   */
  protected abstract isAccessible(): boolean;

  /**
   * The icon and label of the profile item.
   */
  protected abstract getItemLabelInfo(): {
    icon: string;
    label: string;
  };

  /**
   * The content of the profile item.
   *
   * This is the content that should be placed in the slot="content" position.
   */
  protected abstract renderContent(): TemplateResult;
}
