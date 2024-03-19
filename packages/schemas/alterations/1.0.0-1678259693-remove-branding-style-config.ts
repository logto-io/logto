import type { DatabaseTransactionConnection } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

enum DeprecatedBrandingStyle {
  Logo = 'Logo',
  Logo_Slogan = 'Logo_Slogan',
}

const deprecatedDefaultBrandingStyle = DeprecatedBrandingStyle.Logo_Slogan;
const deprecatedDefaultSlogan = 'admin_console.welcome.title';

type DeprecatedBranding = {
  style?: DeprecatedBrandingStyle;
  logoUrl?: string;
  darkLogoUrl?: string;
  favicon?: string;
  slogan?: string;
};

type DeprecatedSignInExperience = {
  id: string;
  tenantId: string;
  branding: DeprecatedBranding;
};

type Branding = {
  logoUrl?: string;
  darkLogoUrl?: string;
  favicon?: string;
};

type SignInExperience = {
  id: string;
  tenantId: string;
  branding: Branding;
};

const alterBranding = async (
  signInExperience: DeprecatedSignInExperience,
  pool: DatabaseTransactionConnection
) => {
  const { id, tenantId, branding: originBranding } = signInExperience;

  const {
    style, // Extract to remove from branding
    slogan, // Extract to remove from branding
    logoUrl,
    darkLogoUrl,
    favicon,
  } = originBranding;

  const branding: Branding = { logoUrl, darkLogoUrl, favicon };

  await pool.query(
    sql`update sign_in_experiences set branding = ${JSON.stringify(
      branding
    )} where id = ${id} and tenant_id = ${tenantId}`
  );
};

const rollbackBranding = async (
  signInExperience: SignInExperience,
  pool: DatabaseTransactionConnection
) => {
  const {
    id,
    tenantId,
    branding: { logoUrl, darkLogoUrl, favicon },
  } = signInExperience;

  const adminBranding: DeprecatedBranding = {
    style: DeprecatedBrandingStyle.Logo_Slogan,
    slogan: 'admin_console.welcome.title',
    logoUrl,
    darkLogoUrl,
    favicon,
  };

  const defaultBranding: DeprecatedBranding = {
    style: DeprecatedBrandingStyle.Logo,
    logoUrl,
    darkLogoUrl,
    favicon,
  };

  const branding: DeprecatedBranding = tenantId === 'admin' ? adminBranding : defaultBranding;

  await pool.query(
    sql`update sign_in_experiences set branding = ${JSON.stringify(
      branding
    )} where id = ${id} and tenant_id = ${tenantId}`
  );
};

const alteration: AlterationScript = {
  up: async (pool) => {
    const rows = await pool.many<DeprecatedSignInExperience>(
      sql`select * from sign_in_experiences`
    );

    await Promise.all(rows.map(async (row) => alterBranding(row, pool)));
  },
  down: async (pool) => {
    const rows = await pool.many<SignInExperience>(sql`select * from sign_in_experiences`);

    await Promise.all(rows.map(async (row) => rollbackBranding(row, pool)));
  },
};

export default alteration;
