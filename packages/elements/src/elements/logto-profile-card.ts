import { localized, msg } from '@lit/localize';
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { vars } from '../utils/theme.js';

const tagName = 'logto-profile-card';

@customElement(tagName)
@localized()
export class LogtoProfileCard extends LitElement {
  static tagName = tagName;
  static styles = css`
    p.dev {
      color: ${vars.colorTextSecondary};
    }
  `;

  @state()
  updateNameOpened = false;

  render() {
    return html`
      <logto-form-card heading=${msg('Profile', { id: 'account.profile.title' })}>
        <p class="dev">🚧 This section is a dev feature that is still working in progress.</p>
        <logto-card-section
          heading=${msg('Personal information', { id: 'account.profile.personal-info.title' })}
        >
          <logto-list>
            <logto-list-row>
              <div slot="title">
                ${msg('Avatar', {
                  id: 'account.profile.personal-info.avatar',
                  desc: 'The avatar of the user.',
                })}
              </div>
              <div slot="content">
                <logto-avatar size="large" src="https://github.com/logto-io.png"></logto-avatar>
              </div>
              <div slot="actions">
                <logto-button type="text">
                  ${msg('Change', { id: 'general.change' })}
                </logto-button>
              </div>
            </logto-list-row>
            <logto-list-row>
              <div slot="title">
                ${msg('Name', {
                  id: 'account.profile.personal-info.name',
                  desc: 'The name of the user.',
                })}
              </div>
              <div slot="content">John Doe</div>
              <div slot="actions">
                <logto-button
                  type="text"
                  @click=${() => {
                    this.updateNameOpened = true;
                  }}
                >
                  ${msg('Update', { id: 'general.update' })}
                </logto-button>
              </div>
            </logto-list-row>
          </logto-list>
        </logto-card-section>
      </logto-form-card>
      <logto-modal
        ?open=${this.updateNameOpened}
        .onClose=${() => {
          this.updateNameOpened = false;
        }}
      >
        <logto-modal-layout
          heading=${msg('Update name', {
            id: 'account.profile.personal-info.update-name',
          })}
        >
          <logto-text-input>
            <input
              placeholder=${msg('Person Doe', {
                id: 'account.profile.personal-info.name-placeholder',
                desc: 'The placeholder for the name input field.',
              })}
              value=""
            />
          </logto-text-input>
        </logto-modal-layout>
      </logto-modal>
    `;
  }
}
