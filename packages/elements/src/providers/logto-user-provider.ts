import { createContext, provide } from '@lit/context';
import { type UserInfo } from '@logto/schemas';
import { LitElement, type PropertyValues, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/** @see {@link UserContext} */
export type UserContextType = { user?: UserInfo };

/**
 * Context for the current user. It's a fundamental context for the account-related elements.
 */
export const UserContext = createContext<UserContextType>('modal-context');

/** The default value for the user context. */
export const userContext: UserContextType = {};

const tagName = 'logto-user-provider';

@customElement(tagName)
export class LogtoUserProvider extends LitElement {
  static tagName = tagName;

  @provide({ context: UserContext })
  context = userContext;

  @property({ type: Object })
  user?: UserInfo;

  render() {
    return html`<slot></slot>`;
  }

  protected handlePropertiesChange(changedProperties: PropertyValues) {
    if (changedProperties.has('user')) {
      this.context.user = this.user;
    }
  }

  protected firstUpdated(changedProperties: PropertyValues): void {
    this.handlePropertiesChange(changedProperties);
  }

  protected updated(changedProperties: PropertyValues): void {
    this.handlePropertiesChange(changedProperties);
  }
}
