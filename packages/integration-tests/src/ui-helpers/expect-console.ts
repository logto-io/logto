import path from 'node:path';

import { appendPath, condString } from '@silverhand/essentials';

import { consolePassword, consoleUsername, logtoConsoleUrl } from '#src/constants.js';
import { cls, dcls, waitFor } from '#src/utils.js';

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

export type ConsoleTitle =
  | 'Sign-in experience'
  | 'Organizations'
  | 'API resources'
  | 'Organization template';

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

  /** Sign out from the Console by clicking the top-right dropdown. */
  async end() {
    await expect(this.page).toClick('div[class$=topbar] > div[class$=container]');
    // Try awaiting for 500ms to ensure the dropdown is rendered.
    await waitFor(500);
    await expect(this.page).toClick(
      '.ReactModalPortal div[class$=dropdownContainer] div[class$=dropdownItem]:last-child'
    );
  }

  /**
   * Alias for `expect(page).toMatchElement(...)`.
   *
   * @see {@link jest.Matchers.toMatchElement}
   */
  async toMatchElement(...args: Parameters<jest.Matchers<unknown>['toMatchElement']>) {
    return expect(this.page).toMatchElement(...args);
  }

  /**
   * Navigate to a specific page in the Console.
   * If the current page is the target page, it will not navigate.
   */
  async gotoPage(pathname: string, title: ConsoleTitle) {
    const target = this.buildUrl(path.join(this.options.tenantId, pathname));
    if (this.page.url() === target.href) {
      return;
    }

    await this.navigateTo(target);
    await expect(this.page).toMatchElement(
      [dcls('main'), dcls('container'), dcls('title')].join(' '),
      { text: title }
    );
  }

  /**
   * Expect navigation tabs with the given names to be rendered in the Console.
   *
   * @param tabNames The names of the tabs to expect, case-insensitive.
   */
  async toExpectTabs(...tabNames: string[]) {
    await Promise.all(
      tabNames.map(async (tabName) => {
        return expect(this.page).toMatchElement(
          ['nav', dcls('item'), dcls('link'), 'a'].join(' '),
          { text: new RegExp(tabName, 'i'), visible: true }
        );
      })
    );
  }

  /**
   * Expect table headers with the given names to be rendered in the Console.
   *
   * @param headers The names of the table headers to expect, case-insensitive.
   */
  async toExpectTableHeaders(...headers: string[]) {
    await Promise.all(
      headers.map(async (header) => {
        return expect(this.page).toMatchElement(
          [`table${cls('headerTable')}`, 'thead', 'tr', 'th'].join(' '),
          { text: new RegExp(header, 'i'), visible: true }
        );
      })
    );
  }

  /**
   * Expect a table cell with the given text to be rendered in the Console.
   *
   * @param text The text to expect, case-insensitive.
   */
  async toExpectTableCell(text: string) {
    await expect(this.page).toMatchElement([`table`, 'tbody', 'tr', 'td'].join(' '), {
      text: new RegExp(text, 'i'),
      visible: true,
    });
  }

  /**
   * To click a table cell with the given text.
   * @param text The text to expect, case-insensitive.
   * @param shouldNavigate Whether to navigate to the page after clicking the cell.
   */
  async toClickTableCell(text: string, shouldNavigate = true) {
    await this.toClick(
      ['table', 'tbody', 'tr', 'td'].join(' '),
      new RegExp(text, 'i'),
      shouldNavigate
    );
  }

  /**
   * Expect a modal to appear with the given title.
   *
   * @param title The title of the modal to expect, case-insensitive.
   */
  async toExpectModal(title: string) {
    await expect(this.page).toMatchElement(
      ['div.ReactModalPortal', dcls('header'), dcls('title')].join(' '),
      { text: new RegExp(title, 'i'), visible: true }
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
