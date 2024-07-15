import { localized, msg } from '@lit/localize';
import { cond } from '@silverhand/essentials';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { unit } from '../utils/css.js';
import { vars } from '../utils/theme.js';

const tagName = 'logto-form-card';

@customElement(tagName)
@localized()
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
  heading = msg('Not available', {
    id: 'form-card.fallback-title',
    desc: 'The fallback title of a form card when the title is not provided.',
  });

  @property()
  description = '';

  render() {
    return html`
      <logto-card>
        <header>
          <div role="heading">${this.heading}</div>
          ${cond(this.description && html`<p>${this.description}</p>`)}
        </header>
        <div class="spacer"></div>
        <slot></slot>
      </logto-card>
    `;
  }
}
