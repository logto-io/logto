import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import fallbackAvatar from '../icons/fallback-avatar.svg';

const tagName = 'logto-identity-info';

@customElement(tagName)
export class LogtoIdentityInfo extends LitElement {
  static tagName = tagName;

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: var(--logto-spacing-sm);
    }

    .avatar {
      --logto-icon-size: var(--logto-identity-info-avatar-size, 36px);

      > img {
        display: block;
        width: var(--logto-identity-info-avatar-size, 36px);
        height: var(--logto-identity-info-avatar-size, 36px);
        border-radius: var(--logto-identity-info-avatar-shape, var(--logto-shape-corner-md));
      }
    }

    .info {
      flex: 1;
      flex-direction: column;

      .name {
        font: var(--logto-identity-info-name-font-size, var(--logto-font-body-md));
        color: var(
          --logto-identity-info-name-color,
          var(--logto-color---logto-color-typeface-primary)
        );
      }

      .email {
        font: var(--logto-identity-info-email-font, var(--logto-font-body-sm));
        color: var(
          --logto-identity-info-email-color,
          var(--logto-color---logto-color-typeface-primary)
        );
      }
    }
  `;

  @property({ type: String })
  avatar = '';

  @property({ type: String })
  name = '';

  @property({ type: String })
  email = '';

  @state()
  failedToLoadAvatar = false;

  render() {
    return html`
      <div class="avatar">
        ${this.avatar && !this.failedToLoadAvatar
          ? html`<img src="${this.avatar}" alt="user avatar" @error=${this.handleAvatarError} />`
          : html`<logto-icon>${fallbackAvatar}</logto-icon>`}
      </div>
      <div class="info">
        <div class="name">${this.name}</div>
        <div class="email">${this.email}</div>
      </div>
    `;
  }

  private handleAvatarError() {
    this.failedToLoadAvatar = true;
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HTMLElementTagNameMap {
    [tagName]: LogtoIdentityInfo;
  }
}
