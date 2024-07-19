import { localized, msg } from '@lit/localize';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { unit } from '../utils/css.js';
import { vars } from '../utils/theme.js';

const tagName = 'logto-card-section';

@customElement(tagName)
@localized()
export class LogtoCardSection extends LitElement {
  static tagName = tagName;
  static styles = css`
    header {
      font: ${vars.fontLabel2};
      color: ${vars.colorText};
      margin-bottom: ${unit(1)};
    }
  `;

  @property()
  heading = msg('Not available', {
    id: 'form-card.fallback-title',
    desc: 'The fallback title of a form card when the title is not provided.',
  });

  render() {
    return html`
      <header>${this.heading}</header>
      <slot></slot>
    `;
  }
}
