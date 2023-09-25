import path from 'node:path';

import { appendPath, condString } from '@silverhand/essentials';

import { consolePassword, consoleUsername, logtoConsoleUrl } from '#src/constants.js';
import { cls, dcls } from '#src/utils.js';

import ExpectPage, { ExpectPageError } from './expect-page.js';
import { expectConfirmModalAndAct, expectToSaveChanges } from './index.js';

type ExpectConsoleOptions = {
  /** The URL of the console endpoint. */
  endpoint?: URL;
  /**
   * The tenant ID to use for the Console.
   *
   * @default 'console' as the special tenant ID for OSS
   */
  tenantId?: string;
};

export type ConsoleTitle = 'Sign-in experience';

export default class ExpectConsole extends ExpectPage {
  readonly options: Required<ExpectConsoleOptions>;

  constructor(thePage = global.page, options: ExpectConsoleOptions = {}) {
    super(thePage);
    this.options = {
      endpoint: new URL(logtoConsoleUrl),
      tenantId: 'console',
      ...options,
    };
  }

  async start() {
    const { endpoint } = this.options;
    await this.page.setViewport({ width: 1920, height: 1080 });

    await this.navigateTo(endpoint);

    if (new URL(this.page.url()).pathname === '/sign-in') {
      await this.toFillForm({
        identifier: consoleUsername,
        password: consolePassword,
      });
      await this.toClickSubmit();
    }
  }

  /**
   * Navigate to a specific page in the Console.
   */
  async gotoPage(pathname: string, title: ConsoleTitle) {
    await this.navigateTo(this.buildUrl(path.join(this.options.tenantId, pathname)));
    await expect(this.page).toMatchElement(
      [dcls('main'), dcls('container'), dcls('cardTitle')].join(' '),
      { text: title }
    );
  }

  /**
   * Expect card components to be rendered in the Console.
   *
   * @param titles The titles of the cards to expect, case-insensitive.
   */
  async toExpectCards(...titles: string[]) {
    await Promise.all(
      titles.map(async (title) => {
        return expect(this.page).toMatchElement(
          [dcls('tabContent'), dcls('card'), dcls('title')].join(' '),
          { text: new RegExp(title, 'i'), visible: true }
        );
      })
    );
  }

  async getFieldInputs(title: string) {
    const fieldTitle = await expect(this.page).toMatchElement(
      // Use `:has()` for a quick and dirty way to match the field title.
      // Not harmful in most cases.
      `${dcls('field')}:has(${dcls('title')})`,
      {
        text: new RegExp(title, 'i'),
        visible: true,
      }
    );

    return fieldTitle.$$('input');
  }

  async getFieldInput(title: string) {
    const [input] = await this.getFieldInputs(title);
    if (!input) {
      throw new ExpectPageError(`No input found for field "${title}"`, this.page);
    }
    return input;
  }

  /**
   * Click a `<nav>` navigation tab (not the page tab) in the Console.
   */
  async toClickTab(tabName: string | RegExp) {
    await expect(this.page).toClick(['nav', dcls('item'), dcls('link'), 'a'].join(' '), {
      text: tabName,
    });
  }

  /**
   * Expect a toast to appear with the given text, then remove it immediately.
   *
   * @param text The text to match.
   * @param type The type of the toast, if provided.
   */
  async waitForToast(text: string | RegExp, type?: 'success' | 'error') {
    return this.toMatchAndRemove(
      `${cls('toast')}${condString(type && cls(type))}:has(${dcls('message')})`,
      text
    );
  }

  async toSaveChanges(confirmation?: string | RegExp) {
    await expectToSaveChanges(this.page);

    if (confirmation) {
      await expectConfirmModalAndAct(this.page, {
        title: confirmation,
        actionText: 'Confirm',
      });
    }

    await this.waitForToast('Saved', 'success');
  }

  /** Build a full Console URL from a pathname. */
  protected buildUrl(pathname = '') {
    return appendPath(this.options.endpoint, pathname);
  }
}
