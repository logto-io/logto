/**
 * @fileoverview Tests for overriding sign-in experience settings via `override` parameter.
 */

import { ConnectorType } from '@logto/connector-kit';
import {
  ApplicationType,
  type Branding,
  type Color,
  SignInIdentifier,
  type FullSignInExperience,
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

  const appColor = Object.freeze({
    primaryColor: '#00f',
    darkPrimaryColor: '#f0f',
    isDarkModeEnabled: true,
  } satisfies Color);
  const appBranding = Object.freeze({
    logoUrl: 'mock://fake-url-for-app/logo.png',
    darkLogoUrl: 'mock://fake-url-for-app/dark-logo.png',
    favicon: 'mock://fake-url-for-app/favicon.ico',
    darkFavicon: 'mock://fake-url-for-app/dark-favicon.ico',
  } satisfies Branding);

  const organizationBranding = Object.freeze({
    logoUrl: 'mock://fake-url-for-org/logo.png',
    darkLogoUrl: 'mock://fake-url-for-org/dark-logo.png',
  } satisfies Branding);

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
});
