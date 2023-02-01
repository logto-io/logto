import { logtoUrl } from '#src/constants.js';
import { generatePassword } from '#src/utils.js';

describe('smoke testing', () => {
  const consoleUsername = 'admin';
  const consolePassword = generatePassword();

  it('opens with app element and navigates to welcome page', async () => {
    const navigation = page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.goto(logtoUrl);
    await navigation;

    await expect(page.waitForSelector('#app')).resolves.not.toBeNull();
    expect(page.url()).toBe(new URL('console/welcome', logtoUrl).href);
  });

  it('registers a new admin account and automatically signs in', async () => {
    const createAccountButton = await page.waitForSelector('button');
    expect(createAccountButton).not.toBeNull();

    const navigateToRegister = page.waitForNavigation({ waitUntil: 'networkidle0' });
    await createAccountButton.click();
    await navigateToRegister;

    expect(page.url()).toBe(new URL('register', logtoUrl).href);

    const usernameField = await page.waitForSelector('input[name=new-username]');
    const submitButton = await page.waitForSelector('button');

    await usernameField.type(consoleUsername);

    const navigateToSignIn = page.waitForNavigation({ waitUntil: 'networkidle0' });
    await submitButton.click();
    await navigateToSignIn;

    expect(page.url()).toBe(new URL('register/username/password', logtoUrl).href);

    const passwordField = await page.waitForSelector('input[name=new-password]');
    const confirmPasswordField = await page.waitForSelector('input[name=confirm-new-password]');
    const saveButton = await page.waitForSelector('button');
    await passwordField.type(consolePassword);
    await confirmPasswordField.type(consolePassword);

    const navigateToGetStarted = page.waitForNavigation({ waitUntil: 'networkidle0' });
    await saveButton.click();
    await navigateToGetStarted;

    expect(page.url()).toBe(new URL('console/get-started', logtoUrl).href);
  });

  it('signs out of admin console', async () => {
    const userElement = await page.waitForSelector('div[class$=topbar] > div[class$=container]');
    await userElement.click();

    // Try awaiting for 500ms before clicking sign-out button
    await page.waitForTimeout(500);

    const signOutButton = await page.waitForSelector(
      '.ReactModalPortal div[class$=dropdownContainer] div[class$=dropdownItem]'
    );
    const navigation = page.waitForNavigation({ waitUntil: 'networkidle0' });
    await signOutButton.click();
    await navigation;

    expect(page.url()).toBe(new URL('sign-in', logtoUrl).href);
  });

  it('signs in to admin console', async () => {
    const usernameField = await page.waitForSelector('input[name=username]');
    const passwordField = await page.waitForSelector('input[name=password]');
    const submitButton = await page.waitForSelector('button');

    await usernameField.type(consoleUsername);
    await passwordField.type(consolePassword);

    const navigation = page.waitForNavigation({ waitUntil: 'networkidle0' });
    await submitButton.click();
    await navigation;

    expect(page.url()).toBe(new URL('console/get-started', logtoUrl).href);

    const userElement = await page.waitForSelector('div[class$=topbar] > div:last-child');
    const usernameString = await userElement.$eval('div > div', (element) => element.textContent);
    expect(usernameString).toBe(consoleUsername);
  });

  it('renders SVG correctly with viewbox property', async () => {
    const logoSvg = await page.waitForSelector('div[class$=topbar] > svg[viewbox]');

    expect(logoSvg).not.toBeNull();
  });
});
