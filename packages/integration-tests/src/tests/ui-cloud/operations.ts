import { type Page } from 'puppeteer';

export const onboardingWelcome = async (page: Page) => {
  // Select the project type option
  await page.click('div[role=radio]:has(input[name=project][value=personal])');

  // Select the deployment type option
  await page.click('div[role=radio]:has(input[name=deploymentType][value=open-source])');

  // Click the next button
  await page.click('div[class$=actions] button:first-child');
};

export const onboardingUserSurvey = async (page: Page) => {
  // Wait for the sie config to load
  await page.waitForTimeout(1000);

  // Select the first reason option
  await page.click('div[role=button][class$=item]');

  // Click the next button
  await page.click('div[class$=actions] button:first-child');
};

export const onboardingSieConfig = async (page: Page) => {
  // Wait for the sie config to load
  await page.waitForTimeout(1000);

  // Select username as the identifier
  await page.click('div[role=radio]:has(input[name=identifier][value=username])');

  // Click the finish button
  await page.click('div[class$=continueActions] button:last-child');
};

export const onboardingFinish = async (page: Page) => {
  // Wait for the sie config to load
  await page.waitForTimeout(1000);

  // Click the enter ac button
  await page.click('div[class$=content] >button');

  // Wait for the admin console to load
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
};

export const openTenantDropdown = async (page: Page) => {
  // Click 'current tenant card' locates in topbar
  const currentTenantCard = await page.waitForSelector(
    'div[class$=topbar] > div[class$=currentTenantCard][role=button]:has(div[class$=name])'
  );
  await currentTenantCard?.click();
};

export const openCreateTenantModal = async (page: Page) => {
  const createTenantButton = await page.waitForSelector(
    'div[class$=ReactModalPortal] div[class$=dropdownContainer] div[class$=dropdown] div[class$=createTenantButton][role=button]'
  );
  await createTenantButton?.click();
};

export const fillAndCreateTenant = async (page: Page, tenantName: string) => {
  // Create tenant with name 'new-tenant' and tag 'production'
  await page.waitForTimeout(500);
  await page.waitForSelector(
    'div[class$=ReactModalPortal] div[class*=card][class$=medium] input[type=text][name=name]'
  );
  await page.waitForSelector(
    'div[class$=ReactModalPortal] div[class*=radioGroup][class$=small] div[class*=radio][class$=small][role=radio] > div[class$=content]:has(input[value=production])'
  );
  await page.type(
    'div[class$=ReactModalPortal] div[class*=card][class$=medium] input[type=text][name=name]',
    tenantName
  );
  await page.click(
    'div[class$=ReactModalPortal] div[class*=radioGroup][class$=small] div[class*=radio][class$=small][role=radio] > div[class$=content]:has(input[value=production])'
  );

  // Click create button
  await page.waitForTimeout(500);
  await page.click(
    'div[class$=ReactModalPortal] div[class*=card][class$=medium] div[class$=footer] button[type=submit]'
  );
};

export const createNewTenant = async (page: Page, tenantName: string) => {
  await page.waitForTimeout(500);
  await openTenantDropdown(page);

  await page.waitForTimeout(500);
  await openCreateTenantModal(page);

  await fillAndCreateTenant(page, tenantName);
};
