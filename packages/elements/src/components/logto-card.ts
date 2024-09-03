import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { unit } from '../utils/css.js';
import { vars } from '../utils/theme.js';

const tagName = 'logto-card';

/**
 * A card with background, padding, and border radius.
 *
 * @example
 * ```html
 * <logto-card>
 *   <!-- Content goes here -->
 * </logto-card>
 * ```
 */
@customElement(tagName)
export class LogtoCard extends LitElement {
  static tagName = tagName;
  static styles = css`
    :host {
      background: ${vars.colorLayer1};
      border-radius: ${unit(4)};
      padding: ${unit(6)};
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}
