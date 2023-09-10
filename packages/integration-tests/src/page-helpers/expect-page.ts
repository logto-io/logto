import { type ElementHandle, type Page } from 'puppeteer';

import { expectNavigation } from '#src/utils.js';

class ExpectPageError extends Error {
  constructor(
    message: string,
    public readonly page: Page
  ) {
    super(message);
  }
}

/**
 * A class that provides a set of methods to assert the state of page tests and its side effects.
 */
export default class ExpectPage {
  constructor(public readonly page = global.page) {}

  async toStart(initialUrl: URL) {
    await expectNavigation(this.page.goto(initialUrl.href), this.page);
    await expect(this.page).toMatchElement('#app');
  }

  async toClick(selector: string, text?: string | RegExp, shouldNavigate = true) {
    const clicked = expect(this.page).toClick(selector, { text });
    return shouldNavigate ? expectNavigation(clicked, this.page) : clicked;
  }

  async toClickSubmit(shouldNavigate = true) {
    return this.toClick('button[type=submit]', undefined, shouldNavigate);
  }

  async toSubmit(shouldNavigate = true) {
    const form = await expect(this.page).toMatchElement('form');
    // eslint-disable-next-line no-restricted-syntax
    const submitted = (form as ElementHandle<HTMLFormElement>).evaluate((form) => {
      form.submit();
    });
    return shouldNavigate ? expectNavigation(submitted, this.page) : submitted;
  }

  async toFillInput(
    name: string,
    value: string,
    options?: { submit: true; shouldNavigate?: boolean }
  ) {
    await expect(this.page).toFill(`input[name=${name}]`, value);
    if (options?.submit) {
      await this.toClickSubmit(options.shouldNavigate);
    }
  }

  async toFillForm(
    values: Record<string, string>,
    options?: { submit: true; shouldNavigate?: boolean }
  ) {
    await expect(this.page).toFillForm('form', values);
    if (options?.submit) {
      await this.toClickSubmit(options.shouldNavigate);
    }
  }

  async toMatchAlert(text?: string | RegExp): Promise<ElementHandle> {
    return expect(this.page).toMatchElement('*[role=alert]', { text });
  }

  toMatchUrl(url: URL | string) {
    expect(this.page.url()).toBe(typeof url === 'string' ? url : url.href);
  }

  async waitForToast(text: string | RegExp) {
    const toast = await expect(this.page).toMatchElement(`.ReactModal__Content[class*=toast]`, {
      text,
    });

    // Remove immediately to prevent waiting for the toast to disappear and matching the same toast again
    await toast.evaluate((element) => {
      element.remove();
    });
  }

  protected throwError(message: string): never {
    throw new ExpectPageError(message, this.page);
  }
}
