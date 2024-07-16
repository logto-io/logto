import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { unit } from '../utils/css.js';
import { vars } from '../utils/theme.js';

const tagName = 'logto-button';

@customElement(tagName)
export class LogtoButton extends LitElement {
  static tagName = tagName;
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      outline: none;
      font: ${vars.fontLabel2};
      transition: background-color 0.2s ease-in-out;
      white-space: nowrap;
      user-select: none;
      position: relative;
      text-decoration: none;
      gap: ${unit(2)};
      cursor: pointer;
    }

    :host(:disabled) {
      cursor: not-allowed;
    }

    :host([type='text']) {
      background: none;
      border-color: none;
      font: ${vars.fontLabel2};
      color: ${vars.colorTextLink};
      padding: ${unit(0.5, 1)};
      border-radius: ${unit(1)};
    }

    :host([type='text']:disabled) {
      color: ${vars.colorDisabled};
    }

    :host([type='text']:focus-visible) {
      outline: 2px solid ${vars.colorFocusedVariant};
    }

    :host([type='text']:not(:disabled):hover) {
      background: ${vars.colorHoverVariant};
    }
  `;

  @property()
  type: 'default' | 'text' = 'default';

  connectedCallback(): void {
    super.connectedCallback();
    this.role = 'button';
    this.tabIndex = 0;
  }

  render() {
    return html`<slot></slot>`;
  }
}
