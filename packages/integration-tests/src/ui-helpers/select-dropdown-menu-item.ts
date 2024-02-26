import { type Page } from 'puppeteer';

import { dcls } from '#src/utils.js';

export const selectDropdownMenuItem = async (page: Page, itemSelector: string, text: string) => {
  // Wait for the dropdown menu to appear
  const dropdownMenu = await page.waitForSelector(
    ['.ReactModalPortal', dcls('dropdownContainer')].join(' ')
  );

  // Click on the dropdown menu item
  await page.evaluate(
    (dropdownMenu, itemSelector, text) => {
      if (dropdownMenu) {
        const optionElements = dropdownMenu.querySelectorAll(itemSelector);
        const targetOption = Array.from(optionElements).find(
          (element) => element.textContent === text
        );

        if (targetOption) {
          const clickEvent = new MouseEvent('click', { bubbles: true });
          targetOption.dispatchEvent(clickEvent);
        }
      }
    },
    dropdownMenu,
    itemSelector,
    text
  );
};
