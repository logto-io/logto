import { cond } from '@silverhand/essentials';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { type LocaleKeyOptional, type LocaleKey } from '../locales/index.js';
import { unit } from '../utils/css.js';
import { vars } from '../utils/theme.js';

const tagName = 'logto-form-card';

@customElement(tagName)
export class LogtoFormCard extends LitElement {
  static tagName = tagName;
  static styles = css`
    logto-card {
      display: flex;
      padding: ${unit(6, 8)};
    }

    header {
      flex: 7;
      font: ${vars.fontSectionHeading1};
      color: ${vars.colorCardTitle};
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    div.spacer {
      flex: 1;
    }

    ::slotted(*) {
      flex: 16;
    }
  `;

  @property()
  title: LocaleKey = 'placeholders.not_available';

  @property()
  description: LocaleKeyOptional = '';

  render() {
    return html`
      <logto-card>
        <header>
          <div role="heading">${this.title}</div>
          ${cond(this.description && html`<p>${this.description}</p>`)}
        </header>
        <div class="spacer"></div>
        <slot></slot>
      </logto-card>
    `;
  }
}
