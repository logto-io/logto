import { generateDarkColor } from '@logto/core-kit';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const defaultPrimaryColor = '#6139F6';

const data = {
  tenantId: 'admin',
  id: 'default',
  color: {
    primaryColor: defaultPrimaryColor,
    isDarkModeEnabled: true,
    darkPrimaryColor: generateDarkColor(defaultPrimaryColor),
  },
  branding: {
    style: 'Logo_Slogan',
    logoUrl: 'https://logto.io/logo.svg',
    darkLogoUrl: 'https://logto.io/logo-dark.svg',
    slogan: 'admin_console.welcome.title',
  },
  languageInfo: {
    autoDetect: true,
    fallbackLanguage: 'en',
  },
  termsOfUseUrl: null,
  signUp: {
    identifiers: ['username'],
    password: true,
    verify: false,
  },
  signIn: {
    methods: [
      {
        identifier: 'username',
        password: true,
        verificationCode: false,
        isPasswordPrimary: true,
      },
    ],
  },
  socialSignInConnectorTargets: [],
  customCss: null,
} as const;

const alteration: AlterationScript = {
  up: async (pool) => {
    const hasActiveUsers = await pool.exists(sql`
      select id
      from users
      where tenant_id = 'admin'
      and is_suspended = false
      limit 1
    `);
    await pool.query(sql`
      insert into sign_in_experiences (
        tenant_id,
        id,
        color,
        branding,
        language_info,
        terms_of_use_url,
        sign_up,
        sign_in,
        social_sign_in_connector_targets,
        sign_in_mode,
        custom_css
      ) values (
        ${data.tenantId},
        ${data.id},
        ${sql.jsonb(data.color)},
        ${sql.jsonb(data.branding)},
        ${sql.jsonb(data.languageInfo)},
        ${data.termsOfUseUrl},
        ${sql.jsonb(data.signUp)},
        ${sql.jsonb(data.signIn)},
        ${sql.jsonb(data.socialSignInConnectorTargets)},
        ${hasActiveUsers ? 'SignIn' : 'Register'},
        ${data.customCss}
      );
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      delete from sign_in_experiences
        where tenant_id = 'admin'
        and id = 'default';
    `);
  },
};

export default alteration;
