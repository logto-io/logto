import { createContext, provide } from '@lit/context';
import { type UserInfo } from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import { LitElement, type PropertyValues, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { LogtoAccountApi } from '../utils/api.js';

/** @see {@link UserContext} */
export type UserContextType = Readonly<{
  user?: UserInfo;
  updateUser: (user: Partial<UserInfo>) => void | Promise<void>;
}>;

/**
 * Context for the current user. It's a fundamental context for the account-related elements.
 */
export const UserContext = createContext<UserContextType>('user-context');

/** The default value for the user context. */
export const userContext: UserContextType = Object.freeze({
  updateUser: noop,
});

const tagName = 'logto-user-provider';

@customElement(tagName)
export class LogtoUserProvider extends LitElement {
  static tagName = tagName;

  @provide({ context: UserContext })
  context = userContext;

  @property({ type: Object })
  api!: LogtoAccountApi | ConstructorParameters<typeof LogtoAccountApi>[0];

  render() {
    return html`<slot></slot>`;
  }

  protected updateContext(context: Partial<UserContextType>) {
    this.context = Object.freeze({ ...this.context, ...context });
  }

  protected async handlePropertiesChange(changedProperties: PropertyValues) {
    if (changedProperties.has('api')) {
      const api = this.api instanceof LogtoAccountApi ? this.api : new LogtoAccountApi(this.api);
      this.updateContext({
        updateUser: async (user) => {
          const updated = await api.updateUser(user);
          this.updateContext({ user: updated });
        },
        user: await api.getUser(),
      });
    }
  }

  protected firstUpdated(changedProperties: PropertyValues): void {
    void this.handlePropertiesChange(changedProperties);
  }
}
