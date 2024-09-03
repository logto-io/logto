import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { unit } from '../utils/css.js';
import { vars } from '../utils/theme.js';

import { buttonSizes, defaultButton, primaryButton, textButton } from './logto-button.styles.js';

const tagName = 'logto-button';

@customElement(tagName)
export class LogtoButton extends LitElement {
  static tagName = tagName;
  static styles = [
    css`
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
        border-radius: ${unit(2)};
        cursor: pointer;
      }

      :host(:disabled) {
        cursor: not-allowed;
      }
    `,
    buttonSizes,
    textButton,
    defaultButton,
    primaryButton,
  ];

  @property({ reflect: true })
  type: 'default' | 'text' | 'primary' = 'default';

  @property({ reflect: true })
  size: 'small' | 'medium' | 'large' = 'medium';

  connectedCallback(): void {
    super.connectedCallback();
    this.role = 'button';
    this.tabIndex = 0;
  }

  render() {
    return html`<slot></slot>`;
  }
}
