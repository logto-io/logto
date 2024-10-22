import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

const tagName = 'logto-icon';

@customElement(tagName)
export class LogtoIcon extends LitElement {
  static tagName = tagName;

  static styles = css`
    ::slotted(svg) {
      display: block;
      width: var(--logto-icon-size, 24px);
      height: var(--logto-icon-size, 24px);
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HTMLElementTagNameMap {
    [tagName]: LogtoIcon;
  }
}
