import { localized, msg } from '@lit/localize';
import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { vars } from '../utils/theme.js';

const tagName = 'logto-profile-card';

@customElement(tagName)
@localized()
export class LogtoProfileCard extends LitElement {
  static tagName = tagName;
  static styles = css`
    p {
      color: ${vars.colorTextSecondary};
    }
  `;

  render() {
    return html`
      <logto-form-card heading=${msg('Profile', { id: 'account.profile.title' })}>
        <logto-card-section
          heading=${msg('Personal information', { id: 'account.profile.personal-info.title' })}
        >
          <p>🚧 This section is a dev feature that is still working in progress.</p>
        </logto-card-section>
      </logto-form-card>
    `;
  }
}
