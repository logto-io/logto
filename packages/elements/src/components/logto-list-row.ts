import { localized, msg } from '@lit/localize';
import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { notSet } from '../phrases/index.js';
import { unit } from '../utils/css.js';
import { vars } from '../utils/theme.js';

const tagName = 'logto-list-row';

@customElement(tagName)
@localized()
export class LogtoListRow extends LitElement {
  static tagName = tagName;
  static styles = css`
    :host {
      box-sizing: border-box;
      display: grid;
      height: ${unit(16)};
      padding: ${unit(2, 6)};
      grid-template-columns: 1fr 2fr 1fr;
      align-items: center;
      color: ${vars.colorTextPrimary};
      font: ${vars.fontBody2};
    }

    :host(:not(:last-child)) {
      border-bottom: 1px solid ${vars.colorLineDivider};
    }

    slot {
      display: block;
    }

    slot[name='title'] {
      font: ${vars.fontLabel2};
    }

    slot[name='actions'] {
      text-align: right;
    }

    span.not-set {
      color: ${vars.colorTextSecondary};
    }
  `;

  render() {
    return html`
      <slot name="title">${msg('Title', { id: 'general.title' })}</slot>
      <slot name="content"><span class="not-set">${notSet}</span></slot>
      <slot name="actions">${msg('Actions', { id: 'general.actions' })}</slot>
    `;
  }
}
