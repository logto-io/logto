import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { unit } from '../utils/css.js';
import { vars } from '../utils/theme.js';

const tagName = 'logto-list';

@customElement(tagName)
export class LogtoList extends LitElement {
  static tagName = tagName;
  static styles = css`
    :host {
      display: block;
      border-radius: ${unit(2)};
      border: 1px solid ${vars.colorLineDivider};
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}
