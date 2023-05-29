import {
  consolePassword,
  consoleUsername,
  logtoConsoleUrl as logtoConsoleUrlString,
} from '#src/constants.js';

export const goToAdminConsole = async () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);
  await page.goto(logtoConsoleUrl.href);
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  if (page.url() === new URL('sign-in', logtoConsoleUrl).href) {
    await expect(page).toFillForm('form', {
      identifier: consoleUsername,
      password: consolePassword,
    });
    await expect(page).toClick('button[name=submit]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
  }
};
