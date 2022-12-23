import { logtoUrl } from '#src/constants.js';
import { generatePassword } from '#src/utils.js';

describe('smoke testing', () => {
  const consoleUsername = 'admin';
  const consolePassword = generatePassword();

  beforeEach(async () => {
    await page.waitForTimeout(1000);
  });

  it('opens with app element and navigates to welcome page', async () => {
    await page.goto(logtoUrl);
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    await expect(page.waitForSelector('#app')).resolves.not.toBeNull();
    expect(page.url()).toBe(new URL('console/welcome', logtoUrl).href);
  });

  it('registers a new admin account and automatically signs in', async () => {
    const createAccountButton = await page.waitForSelector('button');
    expect(createAccountButton).not.toBeNull();
    await createAccountButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    expect(page.url()).toBe(new URL('register', logtoUrl).href);

    const usernameField = await page.waitForSelector('input[name=new-username]');
    const submitButton = await page.waitForSelector('button');

    await usernameField.type(consoleUsername);
    await submitButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    expect(page.url()).toBe(new URL('register/username/password', logtoUrl).href);

    const passwordField = await page.waitForSelector('input[name=new-password]');
    const confirmPasswordField = await page.waitForSelector('input[name=confirm-new-password]');
    const saveButton = await page.waitForSelector('button');
    await passwordField.type(consolePassword);
    await confirmPasswordField.type(consolePassword);
    await saveButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    expect(page.url()).toBe(new URL('console/get-started', logtoUrl).href);
  });

  it('signs out of admin console', async () => {
    const userElement = await page.waitForSelector('div[class$=topbar] > div[class$=container]');
    await userElement.click();
    const signOutButton = await page.waitForSelector('.ReactModalPortal ul li');
    await signOutButton.click();

    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    expect(page.url()).toBe(new URL('sign-in', logtoUrl).href);
  });

  it('signs in to admin console', async () => {
    const usernameField = await page.waitForSelector('input[name=username]');
    const passwordField = await page.waitForSelector('input[name=password]');
    const submitButton = await page.waitForSelector('button');

    await usernameField.type(consoleUsername);
    await passwordField.type(consolePassword);
    await submitButton.click();

    await page.waitForNavigation({ waitUntil: 'networkidle0' });
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
