import { localized } from '@lit/localize';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { notSet } from '../phrases/index.js';
import { unit } from '../utils/css.js';
import { vars } from '../utils/theme.js';

const tagName = 'logto-card-section';

/** A section in a form card with a heading. It is used to group related content. */
@customElement(tagName)
@localized()
export class LogtoCardSection extends LitElement {
  static tagName = tagName;
  static styles = css`
    header {
      font: ${vars.fontLabel2};
      color: ${vars.colorTextPrimary};
      margin-bottom: ${unit(1)};
    }
  `;

  @property()
  heading = notSet;

  render() {
    return html`
      <header>${this.heading}</header>
      <slot></slot>
    `;
  }
}
