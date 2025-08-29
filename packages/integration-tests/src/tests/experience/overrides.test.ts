/**
 * @fileoverview Tests for overriding sign-in experience settings via `override` parameter.
 */
/* eslint max-lines: 0 */

import { ConnectorType } from '@logto/connector-kit';
import {
  ApplicationType,
  type Branding,
  type Color,
  SignInIdentifier,
  type FullSignInExperience,
  type PartialColor,
} from '@logto/schemas';
import { appendPath, pick } from '@silverhand/essentials';

import api from '#src/api/api.js';
import { setApplicationSignInExperience } from '#src/api/application-sign-in-experience.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppRedirectUri, demoAppUrl, logtoUrl } from '#src/constants.js';
import { clearConnectorsByTypes } from '#src/helpers/connector.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';

describe('overrides', () => {
  const organizationApi = new OrganizationApiTest();

  const omniColor = Object.freeze({
    primaryColor: '#f00',
    darkPrimaryColor: '#0f0',
    isDarkModeEnabled: true,
  } satisfies Color);
  const omniBranding = Object.freeze({
    logoUrl: 'mock://fake-url-for-omni/logo.png',
    darkLogoUrl: 'mock://fake-url-for-omni/dark-logo.png',
    favicon: 'mock://fake-url-for-omni/favicon.ico',
    darkFavicon: 'mock://fake-url-for-omni/dark-favicon.ico',
  } satisfies Branding);
  const omniCustomCss = '.logto_main-content { background-color: #f00 !important; }';

  const appColor = Object.freeze({
    primaryColor: '#00f',
    darkPrimaryColor: '#f0f',
  } satisfies PartialColor);
  const appBranding = Object.freeze({
    logoUrl: 'mock://fake-url-for-app/logo.png',
    darkLogoUrl: 'mock://fake-url-for-app/dark-logo.png',
    favicon: 'mock://fake-url-for-app/favicon.ico',
    darkFavicon: 'mock://fake-url-for-app/dark-favicon.ico',
  } satisfies Branding);
  const appCustomCss = '.logto_main-content { background-color: #0f0 !important; }';

  const orgColor = Object.freeze({
    primaryColor: '#0f0',
    darkPrimaryColor: '#ff0',
  } satisfies PartialColor);
  const organizationBranding = Object.freeze({
    logoUrl: 'mock://fake-url-for-org/logo.png',
    darkLogoUrl: 'mock://fake-url-for-org/dark-logo.png',
    favicon: 'mock://fake-url-for-org/favicon.ico',
    darkFavicon: 'mock://fake-url-for-org/dark-favicon.ico',
  } satisfies Branding);
  const organizationCustomCss = '.logto_main-content { background-color: #00f !important; }';

  afterEach(async () => {
    await organizationApi.cleanUp();
  });

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email, ConnectorType.Sms]);
    await updateSignInExperience({
      termsOfUseUrl: null,
      privacyPolicyUrl: null,
      color: omniColor,
      branding: omniBranding,
      customCss: omniCustomCss,
      signUp: { identifiers: [], password: true, verify: false },
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Username,
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          },
        ],
      },
    });
  });

  it('should show dark mode branding elements when dark mode is enabled', async () => {
    const experience = new ExpectExperience(await browser.newPage());
    await experience.page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    await experience.navigateTo(demoAppUrl.href);
    await experience.toMatchElement('body[class$="dark"]');
    await experience.toMatchElement(`img[src="${omniBranding.darkLogoUrl}"]`);

    const button = await experience.toMatchElement('button[name="submit"]');
    expect(
      await button.evaluate((element) => window.getComputedStyle(element).backgroundColor)
    ).toBe('rgb(0, 255, 0)');

    const { favicon: faviconElement, appleFavicon } = await experience.findFaviconUrls();
    expect(faviconElement).toBe(omniBranding.darkFavicon);
    expect(appleFavicon).toBe(omniBranding.darkFavicon);

    await experience.page.close();
  });

  it('should show the overridden organization logos', async () => {
    const organization = await organizationApi.create({
      name: 'Sign-in experience override',
      branding: organizationBranding,
    });

    const experience = new ExpectExperience(await browser.newPage());
    await experience.page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
    await experience.navigateTo(demoAppUrl.href + `?organization_id=${organization.id}`);
    await experience.toMatchElement(`img[src="${organizationBranding.logoUrl}"]`);

    await experience.page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    await experience.navigateTo(demoAppUrl.href + `?organization_id=${organization.id}`);
    await experience.toMatchElement(`img[src="${organizationBranding.darkLogoUrl}"]`);

    await experience.page.close();
  });

  it('should show app-level logo, favicon, and color', async () => {
    const application = await createApplication(
      'Sign-in experience override',
      ApplicationType.SPA,
      {
        oidcClientMetadata: {
          redirectUris: [demoAppRedirectUri],
          postLogoutRedirectUris: [demoAppRedirectUri],
        },
      }
    );

    await setApplicationSignInExperience(application.id, {
      color: appColor,
      branding: appBranding,
    });

    const experience = new ExpectExperience(await browser.newPage());
    const expectMatchBranding = async (
      theme: string,
      logoUrl: string,
      primaryColor: string,
      favicon: string
    ) => {
      await experience.page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
      await experience.navigateTo(demoAppUrl.href + `?app_id=${application.id}`);
      await experience.toMatchElement(`img[src="${logoUrl}"]`);
      const button = await experience.toMatchElement('button[name="submit"]');
      expect(
        await button.evaluate((element) => window.getComputedStyle(element).backgroundColor)
      ).toBe(primaryColor);

      const { favicon: faviconElement, appleFavicon } = await experience.findFaviconUrls();
      expect(faviconElement).toBe(favicon);
      expect(appleFavicon).toBe(favicon);
    };

    await expectMatchBranding('light', appBranding.logoUrl, 'rgb(0, 0, 255)', appBranding.favicon);
    await expectMatchBranding(
      'dark',
      appBranding.darkLogoUrl,
      'rgb(255, 0, 255)',
      appBranding.darkFavicon
    );

    await deleteApplication(application.id);
    await experience.page.close();
  });

  it('should combine app-level and organization-level branding', async () => {
    const organization = await organizationApi.create({
      name: 'Sign-in experience override',
      branding: organizationBranding,
    });

    const application = await createApplication(
      'Sign-in experience override',
      ApplicationType.SPA,
      {
        oidcClientMetadata: {
          redirectUris: [demoAppRedirectUri],
          postLogoutRedirectUris: [demoAppRedirectUri],
        },
      }
    );

    await setApplicationSignInExperience(application.id, {
      color: appColor,
      branding: appBranding,
    });

    const experience = new ExpectExperience(await browser.newPage());
    const expectMatchBranding = async (theme: string, logoUrl: string, primaryColor: string) => {
      await experience.page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
      await experience.navigateTo(
        demoAppUrl.href + `?app_id=${application.id}&organization_id=${organization.id}`
      );
      await experience.toMatchElement(`img[src="${logoUrl}"]`);
      const button1 = await experience.toMatchElement('button[name="submit"]');
      expect(
        await button1.evaluate((element) => window.getComputedStyle(element).backgroundColor)
      ).toBe(primaryColor);
    };

    await expectMatchBranding('light', organizationBranding.logoUrl, 'rgb(0, 0, 255)');
    await expectMatchBranding('dark', organizationBranding.darkLogoUrl, 'rgb(255, 0, 255)');
    await deleteApplication(application.id);
    await experience.page.close();
  });

  it('should not use app-level branding when the app is an third-party app', async () => {
    const application = await createApplication(
      'Sign-in experience override',
      ApplicationType.Traditional,
      {
        isThirdParty: true,
        oidcClientMetadata: {
          redirectUris: [demoAppRedirectUri],
          postLogoutRedirectUris: [demoAppRedirectUri],
        },
      }
    );

    await setApplicationSignInExperience(application.id, {
      color: appColor,
      branding: appBranding,
    });

    // It's hard to simulate third-party apps because their type is "Traditional" while our demo
    // app is an SPA. Only test the API response here.
    const experience = await api
      .get(appendPath(new URL(logtoUrl), 'api/.well-known/sign-in-exp'))
      .json<FullSignInExperience>();

    expect(experience.branding).toEqual(omniBranding);

    await deleteApplication(application.id);
  });

  describe('override fallback', () => {
    beforeAll(async () => {
      await updateSignInExperience({
        color: omniColor,
        branding: pick(omniBranding, 'logoUrl', 'favicon'),
        customCss: omniCustomCss,
      });
    });

    it('should fall back to light mode branding elements when dark mode is enabled but no dark mode branding elements are provided (omni)', async () => {
      const experience = new ExpectExperience(await browser.newPage());
      await experience.page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
      await experience.navigateTo(demoAppUrl.href);
      await experience.toMatchElement('body[class$="dark"]');
      await experience.toMatchElement(`img[src="${omniBranding.logoUrl}"]`);

      const { favicon: faviconElement, appleFavicon } = await experience.findFaviconUrls();
      expect(faviconElement).toBe(omniBranding.favicon);
      expect(appleFavicon).toBe(omniBranding.favicon);
      await experience.page.close();
    });
  });

  it('should fall back to light mode branding elements when dark mode is enabled but no dark mode branding elements are provided (organization)', async () => {
    const organization = await organizationApi.create({
      name: 'Sign-in experience override',
      branding: pick(organizationBranding, 'logoUrl'),
    });

    const experience = new ExpectExperience(await browser.newPage());
    await experience.page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    await experience.navigateTo(demoAppUrl.href + `?organization_id=${organization.id}`);
    await experience.toMatchElement('body[class$="dark"]');
    await experience.toMatchElement(`img[src="${organizationBranding.logoUrl}"]`);

    await experience.page.close();
  });

  it('should fall back to light mode branding elements when dark mode is enabled but no dark mode branding elements are provided (app)', async () => {
    const application = await createApplication(
      'Sign-in experience override',
      ApplicationType.SPA,
      {
        oidcClientMetadata: {
          redirectUris: [demoAppRedirectUri],
          postLogoutRedirectUris: [demoAppRedirectUri],
        },
      }
    );

    await setApplicationSignInExperience(application.id, {
      color: appColor,
      branding: pick(appBranding, 'logoUrl', 'favicon'),
    });

    const experience = new ExpectExperience(await browser.newPage());
    await experience.page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    await experience.navigateTo(demoAppUrl.href + `?app_id=${application.id}`);
    await experience.toMatchElement('body[class$="dark"]');
    await experience.toMatchElement(`img[src="${appBranding.logoUrl}"]`);

    const { favicon: faviconElement, appleFavicon } = await experience.findFaviconUrls();
    expect(faviconElement).toBe(appBranding.favicon);
    expect(appleFavicon).toBe(appBranding.favicon);

    await deleteApplication(application.id);
    await experience.page.close();
  });

  it('should fall back to light mode primary color if dark mode primary color is not provided (omni)', async () => {
    const experience = new ExpectExperience(await browser.newPage());
    await experience.page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    await experience.navigateTo(demoAppUrl.href);
    await experience.toMatchElement('body[class$="dark"]');
    await experience.toMatchElement(`img[src="${omniBranding.logoUrl}"]`);

    const { favicon: faviconElement, appleFavicon } = await experience.findFaviconUrls();
    expect(faviconElement).toBe(omniBranding.favicon);
    expect(appleFavicon).toBe(omniBranding.favicon);

    await experience.page.close();
  });

  it('should ignore all dark variants when global dark mode disabled (org/app dark provided)', async () => {
    // Disable dark mode at omni level.
    await updateSignInExperience({
      color: { ...omniColor, isDarkModeEnabled: false },
      branding: omniBranding,
      customCss: omniCustomCss,
    });

    const organization = await organizationApi.create({
      name: 'dark-disabled',
      branding: organizationBranding, // Has dark variants but should not be used.
      color: orgColor,
    });

    const application = await createApplication('dark-disabled', ApplicationType.SPA, {
      oidcClientMetadata: {
        redirectUris: [demoAppRedirectUri],
        postLogoutRedirectUris: [demoAppRedirectUri],
      },
    });
    await setApplicationSignInExperience(application.id, {
      color: appColor,
      branding: appBranding,
    });

    const experience = new ExpectExperience(await browser.newPage());
    await experience.page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    await experience.navigateTo(
      demoAppUrl.href + `?app_id=${application.id}&organization_id=${organization.id}`
    );
    // Expect organization light logo instead of dark.
    await experience.toMatchElement(`img[src="${organizationBranding.logoUrl}"]`);
    // Button color should use organization/app/omni light fallback chain -> org primary.
    const button = await experience.toMatchElement('button[name="submit"]');
    expect(await button.evaluate((node) => window.getComputedStyle(node).backgroundColor)).toBe(
      'rgb(0, 255, 0)'
    ); // Org primary color (#0f0)

    const { favicon: faviconElement } = await experience.findFaviconUrls();
    expect(faviconElement).toBe(organizationBranding.favicon);

    await experience.page.close();
    await deleteApplication(application.id);

    // Restore omni sign-in exp
    await updateSignInExperience({
      color: omniColor,
      branding: omniBranding,
      customCss: omniCustomCss,
    });
  });

  it('should prefer organization dark resources when all levels provide dark variants', async () => {
    const organization = await organizationApi.create({
      name: 'all-dark',
      branding: organizationBranding,
      color: orgColor,
    });
    const application = await createApplication('all-dark', ApplicationType.SPA, {
      oidcClientMetadata: {
        redirectUris: [demoAppRedirectUri],
        postLogoutRedirectUris: [demoAppRedirectUri],
      },
    });
    await setApplicationSignInExperience(application.id, {
      color: appColor,
      branding: appBranding,
    });

    const experience = new ExpectExperience(await browser.newPage());
    await experience.page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    await experience.navigateTo(
      demoAppUrl.href + `?app_id=${application.id}&organization_id=${organization.id}`
    );
    // Organization dark logo expected.
    await experience.toMatchElement(`img[src="${organizationBranding.darkLogoUrl}"]`);
    const button = await experience.toMatchElement('button[name="submit"]');
    expect(await button.evaluate((node) => window.getComputedStyle(node).backgroundColor)).toBe(
      'rgb(255, 255, 0)'
    ); // Org dark primary color (#ff0)

    await deleteApplication(application.id);
    await experience.page.close();
  });

  it('should use combine org dark color and app dark branding logos when org lacks dark branding', async () => {
    const organization = await organizationApi.create({
      name: 'org-has-dark-color-but-no-dark-branding',
      branding: pick(organizationBranding, 'logoUrl', 'favicon'),
      color: orgColor,
    });
    const application = await createApplication('app-dark-branding', ApplicationType.SPA, {
      oidcClientMetadata: {
        redirectUris: [demoAppRedirectUri],
        postLogoutRedirectUris: [demoAppRedirectUri],
      },
    });
    await setApplicationSignInExperience(application.id, {
      color: appColor,
      branding: appBranding,
    });

    const experience = new ExpectExperience(await browser.newPage());
    await experience.page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    await experience.navigateTo(
      demoAppUrl.href + `?app_id=${application.id}&organization_id=${organization.id}`
    );
    // Should display application dark logo
    await experience.toMatchElement(`img[src="${appBranding.darkLogoUrl}"]`);
    // Should use org dark primary color (#ff0)
    const button = await experience.toMatchElement('button[name="submit"]');
    expect(await button.evaluate((node) => window.getComputedStyle(node).backgroundColor)).toBe(
      'rgb(255, 255, 0)'
    );

    await deleteApplication(application.id);
    await experience.page.close();
  });

  it('should fall back to omni custom CSS when organization-level custom CSS is not provided', async () => {
    const organization = await organizationApi.create({
      name: 'Sign-in experience override',
    });
    const experience = new ExpectExperience(await browser.newPage());
    await experience.navigateTo(demoAppUrl.href + `?organization_id=${organization.id}`);

    const element = await experience.toMatchElement('main.logto_main-content');
    expect(await element.evaluate((node) => window.getComputedStyle(node).backgroundColor)).toBe(
      'rgb(255, 0, 0)'
    );
    await experience.page.close();
  });

  it('should apply organization > app > omni custom CSS precedence chain in one flow', async () => {
    const organization = await organizationApi.create({
      name: 'css-chain',
      customCss: organizationCustomCss,
    });
    const application = await createApplication('css-chain', ApplicationType.SPA, {
      oidcClientMetadata: {
        redirectUris: [demoAppRedirectUri],
        postLogoutRedirectUris: [demoAppRedirectUri],
      },
    });
    await setApplicationSignInExperience(application.id, { customCss: appCustomCss });

    const experience = new ExpectExperience(await browser.newPage());
    // Omni baseline
    await experience.navigateTo(demoAppUrl.href);
    const baseElement = await experience.toMatchElement('main.logto_main-content');
    expect(
      await baseElement.evaluate((node) => window.getComputedStyle(node).backgroundColor)
    ).toBe('rgb(255, 0, 0)');

    // App override
    await experience.navigateTo(demoAppUrl.href + `?app_id=${application.id}`);
    const appElement = await experience.toMatchElement('main.logto_main-content');
    expect(await appElement.evaluate((node) => window.getComputedStyle(node).backgroundColor)).toBe(
      'rgb(0, 255, 0)'
    );

    // Org override
    await experience.navigateTo(
      demoAppUrl.href + `?app_id=${application.id}&organization_id=${organization.id}`
    );
    const orgElement = await experience.toMatchElement('main.logto_main-content');
    expect(await orgElement.evaluate((node) => window.getComputedStyle(node).backgroundColor)).toBe(
      'rgb(0, 0, 255)'
    );

    await deleteApplication(application.id);
    await experience.page.close();
  });
});
