import { localized } from '@lit/localize';
import { cond } from '@silverhand/essentials';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { notSet } from '../phrases/index.js';
import { unit } from '../utils/css.js';
import { vars } from '../utils/theme.js';

const tagName = 'logto-form-card';

/**
 * A card that contains a form or form-like content. A heading and an optional description can be
 * provided to describe the purpose of the content.
 *
 * To group related content in a form card, use the `logto-card-section` element.
 *
 * @example
 * ```tsx
 * html`
 *   <logto-form-card heading=${msg('Account', ...)}>
 *     <logto-card-section heading=${msg('Personal information', ...)}>
 *       <!-- Content goes here -->
 *     </logto-card-section>
 *     <logto-card-section heading=${msg('Account settings', ...)}>
 *       <!-- Content goes here -->
 *     </logto-card-section>
 *   </logto-form-card>
 * `
 * ```
 */
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

    slot {
      display: block;
      flex: 16;
    }
  `;

  @property()
  heading = notSet;

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
