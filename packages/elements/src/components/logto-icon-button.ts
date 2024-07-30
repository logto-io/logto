import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

import { unit } from '../utils/css.js';
import { vars } from '../utils/theme.js';

const tagName = 'logto-icon-button';

@customElement(tagName)
export class LogtoIconButton extends LitElement {
  static tagName = tagName;

  static styles = css`
    :host {
      all: unset;
      border-radius: ${unit(1.5)};
      transition: background 0.2s ease-in-out;
      padding: ${unit(1)};
      display: inline-flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }

    :host(:disabled) {
      cursor: not-allowed;
    }

    :host(:focus-visible) {
      background: ${vars.colorFocused};
    }

    :host(:not(:disabled):hover) {
      background: ${vars.colorHover};
    }

    ::slotted(svg) {
      color: ${vars.colorTextSecondary};
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this.role = 'button';
    this.tabIndex = 0;
  }

  render() {
    return html`<slot></slot>`;
  }
}
