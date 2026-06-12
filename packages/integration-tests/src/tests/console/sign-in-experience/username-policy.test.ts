import { defaultUsernamePolicy } from '@logto/schemas';
import { type ElementHandle } from 'puppeteer';

import { deleteUser, getSignInExperience, updateSignInExperience } from '#src/api/index.js';
import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import {
  expectModalWithTitle,
  expectToClickModalAction,
  expectToClickNavTab,
  goToAdminConsole,
  waitForToast,
} from '#src/ui-helpers/index.js';
import { appendPathname, expectNavigation, generateUsername } from '#src/utils.js';

await page.setViewport({ width: 1920, height: 1080 });

const logtoConsoleUrl = new URL(logtoConsoleUrlString);

const goToSignUpAndSignInTab = async () => {
  await expectNavigation(
    page.goto(appendPathname('/console/sign-in-experience', logtoConsoleUrl).href)
  );
  await expectToClickNavTab(page, 'Sign-up and sign-in');
};

const openUsernamePolicyModal = async () => {
  await expect(page).toClick('div[class$=entry] button', { text: 'Manage' });
  await expectModalWithTitle(page, 'Username policy');
};

const closeModal = async () => {
  await page.keyboard.press('Escape');
  await page.waitForSelector('.ReactModalPortal', { hidden: true });
};

const expectSaveDisabled = async (disabled: boolean) => {
  const saveButton = await page.waitForSelector(
    '.ReactModalPortal div[class$=footer] button:last-child'
  );
  expect(await saveButton?.evaluate((element) => element.disabled)).toBe(disabled);
};

const toggleAllowedChar = async (label: string) => {
  await expect(page).toClick('.ReactModalPortal span[class$=label]', { text: label });
};

const setLengthInput = async (input: ElementHandle<HTMLInputElement>, value: string) => {
  await input.click({ clickCount: 3 });
  await input.type(value);
};

describe('sign-in experience (username policy)', () => {
  beforeAll(async () => {
    await goToAdminConsole();
    await goToSignUpAndSignInTab();
  });

  afterAll(async () => {
    // Restore the default policy so other tests on the shared tenant are unaffected. (The conflict
    // test deletes its own seeded users in a `finally`.)
    await updateSignInExperience({ usernamePolicy: defaultUsernamePolicy });
  });

  it('opens the username policy modal from the Manage button', async () => {
    await openUsernamePolicyModal();
    await expectSaveDisabled(true); // Pristine form, nothing to save yet.
    await closeModal();
  });

  it('blocks a numbers-only policy with an inline error and disabled Save', async () => {
    await openUsernamePolicyModal();

    // Leave only "Numbers" enabled, which is not a valid leading-character set.
    await toggleAllowedChar('Uppercase letters (A-Z)');
    await toggleAllowedChar('Lowercase letters (a-z)');
    await toggleAllowedChar('Underscores (_)');

    await expect(page).toMatchElement('.ReactModalPortal div[class$=error]', {
      text: /Numbers alone aren/,
    });
    await expectSaveDisabled(true);

    // Turning off the last remaining type (Numbers) swaps in the empty-selection message.
    await toggleAllowedChar('Numbers (0-9)');
    await expect(page).toMatchElement('.ReactModalPortal div[class$=error]', {
      text: 'Select at least one character type.',
    });
    await expectSaveDisabled(true);

    // Discard the invalid edits without saving.
    await closeModal();
  });

  it('disables Save when the minimum length exceeds the maximum', async () => {
    await openUsernamePolicyModal();

    const [minInput, maxInput] = await page.$$('.ReactModalPortal input[type=number]');
    if (!minInput || !maxInput) {
      throw new Error('Username length inputs not found');
    }

    // Set the maximum below the minimum to violate the policy.
    await setLengthInput(maxInput, '5');
    await setLengthInput(minInput, '10');

    await expect(page).toMatchElement('.ReactModalPortal', {
      text: 'The minimum length cannot be greater than the maximum length.',
    });
    await expectSaveDisabled(true);

    await closeModal();
  });

  it('shows the case-conflict callout when switching off case sensitivity with conflicts', async () => {
    // Self-contained baseline: a case-sensitive policy plus two case-colliding usernames.
    await updateSignInExperience({
      usernamePolicy: { ...defaultUsernamePolicy, caseSensitive: true },
    });
    const base = generateUsername();
    const users = await Promise.all([
      createUserByAdmin({ username: base.toLowerCase() }),
      createUserByAdmin({ username: base.toUpperCase() }),
    ]);

    try {
      // Reload so the modal seeds the case-sensitive policy we just set.
      await goToSignUpAndSignInTab();
      await openUsernamePolicyModal();

      // Toggle the case-sensitive Switch off (the only Switch in the modal); this triggers the
      // debounced conflict probe.
      await expect(page).toClick('.ReactModalPortal label[class$=switch]');

      await expect(page).toMatchElement('.ReactModalPortal', {
        text: 'Existing username conflicts detected',
        timeout: 5000,
      });
      await expectSaveDisabled(true);

      await closeModal();
    } finally {
      // Always remove the seeded users, even if an assertion above fails.
      await Promise.all(users.map(async ({ id }) => deleteUser(id)));
    }
  });

  it('saves an updated policy and persists it', async () => {
    await openUsernamePolicyModal();

    // Toggling a single char type off keeps the policy valid and marks the form dirty.
    await toggleAllowedChar('Numbers (0-9)');
    await expectSaveDisabled(false);

    await expectToClickModalAction(page, 'Save changes');
    await waitForToast(page, { text: 'Saved' });

    const { usernamePolicy } = await getSignInExperience();
    expect(usernamePolicy.allowedChars.numbers).toBe(false);
  });
});
