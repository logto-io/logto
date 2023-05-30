import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import { goToAdminConsole } from '#src/ui-helpers/index.js';
import {
  appendPathname,
  formatPhoneNumberToInternational,
  generateEmail,
  generateName,
  generatePhone,
  generateUsername,
} from '#src/utils.js';

await page.setViewport({ width: 1280, height: 720 });

describe('user management', () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);

  beforeAll(async () => {
    await goToAdminConsole();
  });

  it('navigates to user management page on clicking sidebar menu', async () => {
    await page.goto(appendPathname('/console/users', logtoConsoleUrl).href);
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    await expect(page).toMatchElement(
      'div[class$=main] div[class$=headline] div[class$=titleEllipsis]',
      {
        text: 'User Management',
      }
    );
  });

  it('can create a new user', async () => {
    await expect(page).toClick('div[class$=main] div[class$=headline] > button');
    await expect(page).toFillForm('form', {
      primaryEmail: 'jdoe@gmail.com',
      primaryPhone: '+18105555555',
      username: 'johndoe',
    });
    await expect(page).toClick('button[type=submit]');
    await page.waitForSelector('div[class$=infoLine');
    await expect(page).toMatchElement(
      '.ReactModalPortal div[class$=header] div[class$=titleEllipsis]',
      {
        text: 'This user has been successfully created',
      }
    );
    // Go to user details page
    await expect(page).toClick('div.ReactModalPortal div[class$=footer] button:first-of-type');
    await expect(page).toMatchElement('div[class$=main] div[class$=metadata] div[class$=title]', {
      text: 'jdoe@gmail.com',
    });
    const userId = await page.$eval(
      'div[class$=main] div[class$=metadata] div[class$=row] div:first-of-type',
      (element) => element.textContent
    );
    if (userId) {
      expect(page.url()).toBe(new URL(`console/users/${userId}/settings`, logtoConsoleUrl).href);
    }
    const email = await page.$eval('form input[name=primaryEmail]', (element) =>
      element instanceof HTMLInputElement ? element.value : null
    );
    const phone = await page.$eval('form input[name=primaryPhone]', (element) =>
      element instanceof HTMLInputElement ? element.value : null
    );
    const username = await page.$eval('form input[name=username]', (element) =>
      element instanceof HTMLInputElement ? element.value : null
    );

    expect(email).toBe('jdoe@gmail.com');
    expect(phone).toBe('+1 810 555 5555');
    expect(username).toBe('johndoe');
  });

  it('fails to create user if no identifier is provided', async () => {
    await page.goto(appendPathname('/console/users', logtoConsoleUrl).href);
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    await expect(page).toClick('div[class$=main] div[class$=headline] > button');
    await expect(page).toClick('button[type=submit]');
    await expect(page).toMatchElement('.ReactModalPortal div[class$=error]', {
      text: 'You must provide at least one identifier to create a user.',
    });
  });

  it('fails to create user if any of the identifiers are existed', async () => {
    await page.goto(appendPathname('/console/users', logtoConsoleUrl).href);
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Conflicted email
    await expect(page).toClick('div[class$=main] div[class$=headline] > button');
    await expect(page).toFillForm('form', { primaryEmail: 'jdoe@gmail.com' });
    await expect(page).toClick('button[type=submit]');
    await expect(page).toMatchElement('div[class$=error] div[class$=message]', {
      text: 'This email is associated with an existing account.',
    });
    await expect(page).toClick('.ReactModalPortal div[class$=header] button');

    // Conflicted phone number
    await expect(page).toClick('div[class$=main] div[class$=headline] > button');
    await expect(page).toFillForm('form', { primaryPhone: '+1 810 555 5555' });
    await expect(page).toClick('button[type=submit]');
    await expect(page).toMatchElement('div[class$=error] div[class$=message]', {
      text: 'This phone number is associated with an existing account.',
    });
    await expect(page).toClick('.ReactModalPortal div[class$=header] button');

    // Conflicted username
    await expect(page).toClick('div[class$=main] div[class$=headline] > button');
    await expect(page).toFillForm('form', { username: 'johndoe' });
    await expect(page).toClick('button[type=submit]');
    await expect(page).toMatchElement('div[class$=error] div[class$=message]', {
      text: 'This username is already in use.',
    });
    await expect(page).toClick('.ReactModalPortal div[class$=header] button');
    // Wait for 5 seconds for the error toasts to dismiss
    await page.waitForTimeout(4000);
  });

  it('can update user details', async () => {
    // Create a new user and navigates to the user details page
    const username = generateUsername();
    await expect(page).toClick('div[class$=main] div[class$=headline] > button');

    await expect(page).toFillForm('form', { username });
    await expect(page).toClick('button[type=submit]');
    await page.waitForSelector('div[class$=infoLine');

    // Go to the user details page
    await expect(page).toClick('div.ReactModalPortal div[class$=footer] button:nth-of-type(1)');
    await expect(page).toMatchElement('div[class$=main] div[class$=metadata] div[class$=title]', {
      text: username,
    });

    const newUsername = generateUsername();
    const newEmail = generateEmail();
    const newPhone = generatePhone(true);
    const newFullName = generateName();
    await expect(page).toFillForm('form', {
      primaryEmail: newEmail,
      primaryPhone: newPhone,
      username: newUsername,
      name: newFullName,
    });
    await expect(page).toClick('form div[class$=actionBar] button:nth-of-type(2)');
    const successToastHandle = await page.waitForSelector('div[class$=success]');
    await expect(successToastHandle).toMatchElement('div[class$=message]', {
      text: 'Saved',
    });
    // Top userinfo card shows the updated user full name as the title
    await expect(page).toMatchElement('div[class$=main] div[class$=metadata] div[class$=title]', {
      text: newFullName,
    });

    await expect(page).toFillForm('form', { name: '' });
    await expect(page).toClick('form div[class$=actionBar] button:nth-of-type(2)');
    // After removing full name, top userinfo card shows the email as the title
    await expect(page).toMatchElement('div[class$=main] div[class$=metadata] div[class$=title]', {
      text: newEmail,
    });

    await page.waitForTimeout(500);
    await expect(page).toFillForm('form', { primaryEmail: '' });
    await expect(page).toClick('form div[class$=actionBar] button:nth-of-type(2)');
    // After removing email, top userinfo card shows the phone number as the title
    await expect(page).toMatchElement('div[class$=main] div[class$=metadata] div[class$=title]', {
      text: formatPhoneNumberToInternational(newPhone),
    });
    await page.waitForTimeout(500);

    await expect(page).toFillForm('form', { primaryPhone: '' });
    await expect(page).toClick('form div[class$=actionBar] button:nth-of-type(2)');
    // After removing phone number, top userinfo card shows the username as the title
    await expect(page).toMatchElement('div[class$=main] div[class$=metadata] div[class$=title]', {
      text: newUsername,
    });
    await page.waitForTimeout(500);

    await expect(page).toFillForm('form', { username: '' });
    await expect(page).toClick('form div[class$=actionBar] button:nth-of-type(2)');
    // After removing all identifiers, saving the form will pop up a confirm dialog
    await expect(page).toMatchElement('.ReactModalPortal div[class$=medium] div[class$=content]', {
      text: 'User needs to have at least one of the sign-in identifiers (username, email, phone number or social) to sign in. Are you sure you want to continue?',
    });
    await expect(page).toClick('div.ReactModalPortal div[class$=footer] button:nth-of-type(2)');
    // After all identifiers, top userinfo card shows 'Unnamed' as the title
    await expect(page).toMatchElement('div[class$=main] div[class$=metadata] div[class$=title]', {
      text: 'Unnamed',
    });
  });

  it('fails to update if any of the identifiers are conflicted with existing users', async () => {
    await page.reload();
    await page.waitForSelector('form');
    // Conflicted email
    await expect(page).toFillForm('form', { primaryEmail: 'jdoe@gmail.com' });
    await page.screenshot({ path: 'user-conflict-email.png' });
    await expect(page).toClick('form div[class$=actionBar] button:nth-of-type(2)');
    await expect(page).toMatchElement('div[class$=error] div[class$=message]', {
      text: 'This email is associated with an existing account.',
    });
    // Discard changes
    await expect(page).toClick('form div[class$=actionBar] button:nth-of-type(1)');

    // Conflicted phone number
    await expect(page).toFillForm('form', { primaryPhone: '+1 810 555 5555' });
    await expect(page).toClick('form div[class$=actionBar] button:nth-of-type(2)');
    await expect(page).toMatchElement('div[class$=error] div[class$=message]', {
      text: 'This phone number is associated with an existing account.',
    });
    // Discard changes
    await expect(page).toClick('form div[class$=actionBar] button:nth-of-type(1)');

    // Conflicted username
    await expect(page).toFillForm('form', { username: 'johndoe' });
    await expect(page).toClick('form div[class$=actionBar] button:nth-of-type(2)');
    await expect(page).toMatchElement('div[class$=error] div[class$=message]', {
      text: 'This username is already in use.',
    });
    // Discard changes
    await expect(page).toClick('form div[class$=actionBar] button:nth-of-type(1)');
  });
});
