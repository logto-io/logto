import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

const tagName = 'logto-account-provider';
@customElement('logto-account-provider')
export class LogtoAccountProvider extends LitElement {
  static tagName = tagName;

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HTMLElementTagNameMap {
    [tagName]: LogtoAccountProvider;
  }
}
