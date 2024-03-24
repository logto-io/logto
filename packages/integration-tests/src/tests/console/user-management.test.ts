import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import {
  goToAdminConsole,
  expectToSaveChanges,
  waitForToast,
  expectToDiscardChanges,
  expectModalWithTitle,
  expectToClickModalAction,
} from '#src/ui-helpers/index.js';
import {
  appendPathname,
  expectNavigation,
  formatPhoneNumberToInternational,
  generateEmail,
  generateName,
  generatePhone,
  generateUsername,
  waitFor,
} from '#src/utils.js';

await page.setViewport({ width: 1280, height: 720 });

describe('user management', () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);

  beforeAll(async () => {
    await goToAdminConsole();
  });

  it('navigates to user management page on clicking sidebar menu', async () => {
    await expectNavigation(page.goto(appendPathname('/console/users', logtoConsoleUrl).href));

    await expect(page).toMatchElement(
      'div[class$=main] div[class$=headline] div[class$=titleEllipsis]',
      {
        text: 'User management',
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
    await expectModalWithTitle(page, 'This user has been successfully created');

    // Go to user details page
    await expectToClickModalAction(page, 'Check user detail');
    await expect(page).toMatchElement('div[class$=main] div[class$=metadata] div[class$=name]', {
      text: 'jdoe@gmail.com',
    });
    const userId = await page.$eval(
      'div[class$=main] div[class$=metadata] div[class$=row] div[class$=content]',
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
    await expectNavigation(page.goto(appendPathname('/console/users', logtoConsoleUrl).href));

    await expect(page).toClick('div[class$=main] div[class$=headline] > button');
    await expect(page).toClick('button[type=submit]');
    await expect(page).toMatchElement('.ReactModalPortal div[class$=error]', {
      text: 'You must provide at least one identifier to create a user.',
    });
  });

  it('fails to create user if any of the identifiers are existed', async () => {
    await expectNavigation(page.goto(appendPathname('/console/users', logtoConsoleUrl).href));

    // Conflicted email
    await expect(page).toClick('div[class$=main] div[class$=headline] > button');
    await expect(page).toFillForm('form', { primaryEmail: 'jdoe@gmail.com' });
    await expect(page).toClick('button[type=submit]');
    await waitForToast(page, {
      text: 'This email is associated with an existing account.',
      type: 'error',
    });

    await expect(page).toClick('.ReactModalPortal div[class$=header] button');

    // Conflicted phone number
    await expect(page).toClick('div[class$=main] div[class$=headline] > button');
    await expect(page).toFillForm('form', { primaryPhone: '+1 810 555 5555' });
    await expect(page).toClick('button[type=submit]');
    await waitForToast(page, {
      text: 'This phone number is associated with an existing account.',
      type: 'error',
    });

    await expect(page).toClick('.ReactModalPortal div[class$=header] button');

    // Conflicted username
    await expect(page).toClick('div[class$=main] div[class$=headline] > button');
    await expect(page).toFillForm('form', { username: 'johndoe' });
    await expect(page).toClick('button[type=submit]');
    await waitForToast(page, { text: 'This username is already in use.', type: 'error' });

    await expect(page).toClick('.ReactModalPortal div[class$=header] button');
  });

  it('can update user details', async () => {
    // Create a new user and navigates to the user details page
    const username = generateUsername();
    await expect(page).toClick('div[class$=main] div[class$=headline] > button');

    await expect(page).toFillForm('form', { username });
    await expect(page).toClick('button[type=submit]');
    await page.waitForSelector('div[class$=infoLine');

    // Go to the user details page
    await expectToClickModalAction(page, 'Check user detail');
    await expect(page).toMatchElement('div[class$=main] div[class$=metadata] div[class$=name]', {
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
    await expectToSaveChanges(page);
    await waitForToast(page, { text: 'Saved' });
    // Top userinfo card shows the updated user full name as the title
    await expect(page).toMatchElement('div[class$=main] div[class$=metadata] div[class$=name]', {
      text: newFullName,
    });

    await expect(page).toFillForm('form', { name: '' });
    await expectToSaveChanges(page);
    // After removing full name, top userinfo card shows the email as the title
    await expect(page).toMatchElement('div[class$=main] div[class$=metadata] div[class$=name]', {
      text: newEmail,
    });

    await waitFor(500);
    await expect(page).toFillForm('form', { primaryEmail: '' });
    await expectToSaveChanges(page);
    // After removing email, top userinfo card shows the phone number as the title
    await expect(page).toMatchElement('div[class$=main] div[class$=metadata] div[class$=name]', {
      text: formatPhoneNumberToInternational(newPhone),
    });
    await waitFor(500);

    await expect(page).toFillForm('form', { primaryPhone: '' });
    await expectToSaveChanges(page);
    // After removing phone number, top userinfo card shows the username as the title
    await expect(page).toMatchElement('div[class$=main] div[class$=metadata] div[class$=name]', {
      text: newUsername,
    });
    await waitFor(500);

    await expect(page).toFillForm('form', { username: '' });
    await expectToSaveChanges(page);
    // After removing all identifiers, saving the form will pop up a confirm dialog
    await expect(page).toMatchElement('.ReactModalPortal div[class$=medium] div[class$=content]', {
      text: 'User needs to have at least one of the sign-in identifiers (username, email, phone number or social) to sign in. Are you sure you want to continue?',
    });
    await expectToClickModalAction(page, 'Confirm');
    // After all identifiers, top userinfo card shows 'Unnamed' as the title
    await expect(page).toMatchElement('div[class$=main] div[class$=metadata] div[class$=name]', {
      text: 'Unnamed',
    });
  });

  it('fails to update if any of the identifiers are conflicted with existing users', async () => {
    await page.reload();
    await page.waitForSelector('form');
    // Conflicted email
    await expect(page).toFillForm('form', { primaryEmail: 'jdoe@gmail.com' });
    await expectToSaveChanges(page);
    await waitForToast(page, {
      text: 'This email is associated with an existing account.',
      type: 'error',
    });
    await expectToDiscardChanges(page);

    // Conflicted phone number
    await expect(page).toFillForm('form', { primaryPhone: '+1 810 555 5555' });
    await expectToSaveChanges(page);
    await waitForToast(page, {
      text: 'This phone number is associated with an existing account.',
      type: 'error',
    });
    await expectToDiscardChanges(page);

    // Conflicted username
    await expect(page).toFillForm('form', { username: 'johndoe' });
    await expectToSaveChanges(page);
    await waitForToast(page, { text: 'This username is already in use.', type: 'error' });
    await expectToDiscardChanges(page);
  });
});
