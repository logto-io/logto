import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

const tagName = 'logto-profile-item';

/**
 * LogtoProfileItem: A custom element for displaying profile information
 *
 * It provides a consistent layout and styling for profile-related items
 *
 * Example usage:
 *
 * <logto-profile-item>
 *   <logto-icon slot="label-icon">...</logto-icon>
 *   <div slot="label-text">Label</div>
 *   <div slot="content">Content</div>
 * </logto-profile-item>
 */
@customElement(tagName)
export class LogtoProfileItem extends LitElement {
  static tagName = tagName;

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      background-color: var(--logto-profile-item-container-color, var(--logto-color-background));
      border-radius: var(--logto-profile-item-container-shape, var(--logto-shape-corner-lg));
      padding-inline-start: var(
        --logto-profile-item-container-leading-space,
        var(--logto-spacing-xl)
      );
      padding-inline-end: var(
        --logto-profile-item-container-trailing-space,
        var(--logto-spacing-xl)
      );
      height: var(--logto-profile-item-height, 64px);
    }

    .label {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--logto-profile-item-label-gap, var(--logto-spacing-sm));
    }

    ::slotted([slot='label-icon']) {
      color: var(--logto-profile-item-label-icon-color, var(--logto-color-typeface-secondary));

      --logto-icon-size: var(--logto-profile-item-label-icon-size, 24px);
    }

    ::slotted([slot='label-text']) {
      font: var(--logto-profile-item-label-font, var(--logto-font-label-md));
      color: var(--logto-profile-item-label-color, var(--logto-color-typeface-primary));
    }

    ::slotted([slot='content']),
    slot[name='content'] {
      display: flex;
      flex: 2;
      font: var(--logto-profile-item-value-font, var(--logto-font-body-md));
      color: var(--logto-profile-item--color, var(--logto-color-typeface-primary));
    }

    .no-value {
      font: var(--logto-profile-item-no-value-font, var(--logto-font-body-md));
      color: var(--logto-profile-item-no-value-color, var(--logto-color-typeface-secondary));
    }

    ::slotted([slot='actions']) {
      display: flex;
      flex: 1;
    }
  `;

  render() {
    return html`
      <div class="label">
        <slot name="label-icon"></slot>
        <slot name="label-text"></slot>
      </div>
      <slot name="content"><span class="no-value">Not set</span></slot>
      <slot name="actions"></slot>
    `;
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HTMLElementTagNameMap {
    [tagName]: LogtoProfileItem;
  }
}
