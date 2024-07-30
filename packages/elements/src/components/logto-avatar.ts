import { msg } from '@lit/localize';
import { LitElement, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { unit } from '../utils/css.js';

const tagName = 'logto-avatar';

const sizes = Object.freeze({
  medium: unit(8),
  large: unit(10),
});

@customElement(tagName)
export class LogtoAvatar extends LitElement {
  static tagName = tagName;
  static styles = css`
    :host {
      display: block;
      border-radius: ${unit(2)};
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
  `;

  @property({ reflect: true })
  size: 'medium' | 'large' = 'medium';

  @property({ reflect: true })
  src = '';

  @property({ reflect: true })
  alt = msg('Avatar', {
    id: 'account.profile.personal-info.avatar',
    desc: 'The avatar of the user.',
  });

  connectedCallback(): void {
    super.connectedCallback();
    this.style.setProperty('width', sizes[this.size].cssText);
    this.style.setProperty('height', sizes[this.size].cssText);

    if (this.src) {
      // Show the image holder with the provided image.
      this.style.setProperty('background-color', '#adaab422');
      this.style.setProperty('background-image', `url(${this.src})`);
    } else {
      // A temporary default fallback color. Need to implement the relevant logic in `<UserAvatar />` later.
      this.style.setProperty('background-color', '#e74c3c');
    }
  }
}
