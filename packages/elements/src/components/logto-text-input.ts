import { LitElement, css, html } from 'lit';
import { customElement, property, queryAssignedElements } from 'lit/decorators.js';

import { unit } from '../utils/css.js';
import { vars } from '../utils/theme.js';

const tagName = 'logto-text-input';

@customElement(tagName)
export class LogtoTextInput extends LitElement {
  static tagName = tagName;
  static styles = css`
    :host {
      display: flex;
      position: relative;
      border-radius: ${unit(1.5)};
      border: 1px solid ${vars.colorBorder};
      outline: 3px solid transparent;
      transition-property: outline, border;
      transition-timing-function: ease-in-out;
      transition-duration: 0.2s;
      height: 36px;
      background: ${vars.colorLayer1};
      font: ${vars.fontBody2};
      padding: 0 ${unit(3)};
    }

    :host(:focus-within) {
      border-color: ${vars.colorPrimary};
      outline-color: ${vars.colorFocusedVariant};
    }

    :host([disabled]) {
      background: ${vars.colorDisabledBackground};
      color: ${vars.colorTextSecondary};
      border-color: ${vars.colorBorder};
      cursor: not-allowed;
    }

    :host([readonly]) {
      background: ${vars.colorLayer2};
    }

    :host([readonly]:focus-within) {
      border-color: ${vars.colorBorder};
      outline-color: transparent;
    }

    ::slotted(input) {
      all: unset;
      flex: 1;
      color: ${vars.colorTextPrimary};
    }

    ::slotted(input::placeholder) {
      color: ${vars.colorPlaceholder};
    }

    ::slotted(input:webkit-autofill) {
      box-shadow: 0 0 0 ${unit(6)} ${vars.colorLayer1} inset;
      -webkit-text-fill-color: ${vars.colorTextPrimary};
      caret-color: ${vars.colorTextPrimary};
    }
  `;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  readonly = false;

  @queryAssignedElements({ selector: 'input' })
  slotInputs!: HTMLInputElement[];

  render() {
    return html`<slot @slotchange=${this.handleSlotChange}></slot>`;
  }

  protected handleSlotChange() {
    if (this.slotInputs[0] && this.slotInputs.length === 1) {
      this.disabled = this.slotInputs[0].disabled;
      this.readonly = this.slotInputs[0].readOnly;
    }
  }
}
