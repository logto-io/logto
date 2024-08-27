import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import { cond, noop } from '@silverhand/essentials';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import closeIcon from '../icons/close.svg';
import { unit } from '../utils/css.js';
import { vars } from '../utils/theme.js';

import { ModalContext, type ModalContextType } from './logto-modal.context.js';

const tagName = 'logto-modal-layout';

/**
 * A typical layout for a modal. It includes a header, a footer, and a slot for the content.
 *
 * Note: A consumable modal context ({@link ModalContext}) is required to use this component.
 */
@customElement(tagName)
@localized()
export class LogtoModalLayout extends LitElement {
  static tagName = tagName;

  static styles = css`
    header {
      font: ${vars.fontTitle1};
      color: ${vars.colorTextPrimary};
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: ${unit(6)};
    }

    h1 {
      all: unset;
    }

    footer:not(:empty) {
      margin-top: ${unit(6)};
      display: flex;
      justify-content: flex-end;
      gap: ${unit(4)};
      align-items: center;
    }
  `;

  @property({ reflect: true })
  heading = msg('Not set', {
    id: 'general.fallback-title',
    desc: 'A fallback title when the title or heading of a component is not provided.',
  });

  @consume({ context: ModalContext })
  context?: ModalContextType;

  render() {
    const { onClose } = this.context ?? {};

    return html`
      <header>
        <h1>${this.heading}</h1>
        ${cond(
          onClose &&
            onClose !== noop &&
            html`<logto-icon-button @click=${onClose}>${closeIcon}</logto-icon-button>`
        )}
      </header>
      <slot></slot>
      <footer>
        <slot name="footer"></slot>
      </footer>
    `;
  }
}
