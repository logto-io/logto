import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import { cond } from '@silverhand/essentials';
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { UserContext, type UserContextType } from '../providers/logto-user-provider.js';
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

  @consume({ context: UserContext, subscribe: true })
  userContext?: UserContextType;

  @state()
  updateNameOpened = false;

  @state()
  name = '';

  render() {
    const user = this.userContext?.user;

    if (!user) {
      return html`<logto-form-card heading=${msg('Profile', { id: 'account.profile.title' })}>
        <p class="dev">⚠️ ${msg('No user provided.', { id: 'account.profile.no-user' })}</p>
      </logto-form-card>`;
    }

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
              ${cond(
                user.avatar &&
                  html`<div slot="content">
                    <logto-avatar size="large" src=${user.avatar}></logto-avatar>
                  </div>`
              )}
              <div slot="actions">
                <logto-button type="text" size="small">
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
              ${cond(user.name && html`<div slot="content">${user.name}</div>`)}
              <div slot="actions">
                <logto-button
                  type="text"
                  size="small"
                  @click=${() => {
                    this.updateNameOpened = true;
                    this.name = user.name ?? '';
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
              .value=${this.name}
              @input=${(event: InputEvent) => {
                // eslint-disable-next-line no-restricted-syntax
                this.name = (event.target as HTMLInputElement).value;
              }}
            />
          </logto-text-input>
          <logto-button
            slot="footer"
            size="large"
            type="primary"
            @click=${async () => {
              await this.userContext?.updateUser({ name: this.name });
              this.updateNameOpened = false;
            }}
          >
            ${msg('Save', { id: 'general.save' })}
          </logto-button>
        </logto-modal-layout>
      </logto-modal>
    `;
  }
}
