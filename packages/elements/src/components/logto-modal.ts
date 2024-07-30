import { provide } from '@lit/context';
import { noop } from '@silverhand/essentials';
import { LitElement, html, css, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type Ref, createRef, ref } from 'lit/directives/ref.js';

import { unit } from '../utils/css.js';
import { vars } from '../utils/theme.js';

import { ModalContext, modalContext } from './logto-modal.context.js';

const tagName = 'logto-modal';

@customElement(tagName)
export class LogtoModal extends LitElement {
  static tagName = tagName;

  static styles = css`
    dialog {
      padding: 0;
      border: none;
      color: ${vars.colorTextPrimary};
      background: ${vars.colorLayer1};
      border-radius: ${unit(4)};
      padding: ${unit(6)};
      width: 95%;
      max-width: 600px;
      min-width: 300px;
    }

    dialog::backdrop {
      background-color: ${vars.colorOverlay};
    }
  `;

  @property({ type: Boolean, reflect: true })
  open = false;

  @property()
  onClose = noop;

  @provide({ context: ModalContext })
  context = modalContext;

  protected dialogRef: Ref<HTMLDialogElement> = createRef();

  render() {
    return html`<dialog
      ${ref(this.dialogRef)}
      @keydown=${(event: KeyboardEvent) => {
        // The "right" way should be to use the `@cancel` event, but it doesn't always work and the
        // browser support is unknown. See: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/cancel_event#browser_compatibility
        if (event.key === 'Escape') {
          event.preventDefault();
          this.onClose();
        }
      }}
    >
      <slot></slot>
    </dialog> `;
  }

  protected toggleDialog() {
    if (this.open) {
      this.dialogRef.value?.showModal();
    } else {
      this.dialogRef.value?.close();
    }
  }

  protected handlePropertiesChange(changedProperties: PropertyValues) {
    if (changedProperties.has('open')) {
      this.toggleDialog();
    }

    if (changedProperties.has('onClose')) {
      this.context.onClose = this.onClose;
    }
  }

  protected firstUpdated(changedProperties: PropertyValues): void {
    this.handlePropertiesChange(changedProperties);
  }

  protected updated(changedProperties: PropertyValues): void {
    this.handlePropertiesChange(changedProperties);
  }
}
