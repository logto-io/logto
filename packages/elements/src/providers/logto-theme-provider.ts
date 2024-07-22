import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { defaultTheme, darkTheme, toLitCss } from '../utils/theme.js';

const tagName = 'logto-theme-provider';

@customElement(tagName)
export class LogtoThemeProvider extends LitElement {
  static tagName = tagName;
  static styles = css`
    ${toLitCss(defaultTheme)}
    ${toLitCss(darkTheme, 'dark')}
  `;

  @property({ reflect: true })
  theme: 'default' | 'dark' = 'default';

  render() {
    return html`<slot></slot>`;
  }
}
