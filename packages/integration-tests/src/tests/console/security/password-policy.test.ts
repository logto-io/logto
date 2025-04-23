import ExpectConsole from '#src/ui-helpers/expect-console.js';
import { getInputValue } from '#src/ui-helpers/index.js';
import { dcls } from '#src/utils.js';

const expectConsole = new ExpectConsole(await browser.newPage());

describe('security: password policy', () => {
  it('navigates to security page', async () => {
    await expectConsole.start();
    await expectConsole.gotoPage('/security', 'Security');
    await expectConsole.toClickTab('Password policy');

    await Promise.all(
      ['PASSWORD REQUIREMENTS', 'PASSWORD REJECTION'].map(async (title) => {
        return expect(expectConsole.page).toMatchElement([dcls('card'), dcls('title')].join(' '), {
          text: new RegExp(title, 'i'),
          visible: true,
        });
      })
    );
  });

  it('should be able to set minimum length', async () => {
    const input = await expectConsole.getFieldInput('Minimum length');

    // Add some zeros to make it invalid
    await input.type('000');
    await input.evaluate((element) => {
      element.blur();
    });

    // Should automatically set to the max value if the input is too large
    expect(await getInputValue(input)).toBe(await input.evaluate((element) => element.max));

    // Clear the input
    await input.evaluate((element) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      element.value = '';
    });

    // Input a valid value
    await input.type('10');

    // Should be able to save
    await expectConsole.toSaveChanges();
  });

  it('should be able to see character types selections', async () => {
    const inputs = await expectConsole.getFieldInputs('required character types');

    for (const input of inputs) {
      // eslint-disable-next-line no-await-in-loop
      expect(await input.evaluate((element) => element.type)).toBe('radio');
    }
  });

  it('should be able to see the custom words checkbox and its text input when enabled', async () => {
    const checkbox = await expect(expectConsole.page).toMatchElement('div[role=checkbox]', {
      text: 'Custom words',
      visible: true,
    });
    const getChecked = async () => checkbox.evaluate((element) => element.ariaChecked);

    if ((await getChecked()) !== 'true') {
      await checkbox.click();
    }

    expect(await getChecked()).toBe('true');

    await expect(expectConsole.page).toMatchElement(
      // Select the div with `checkbox` in class name, and followed by a textarea container
      'div[class*=checkbox]:has(+ div[class*=textarea] textarea)',
      { text: 'Custom words', visible: true }
    );
  });
});
