import type { DatabaseTransactionConnection } from 'slonik';
import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

enum DeprecatedBrandingStyle {
  Logo = 'Logo',
  Logo_Slogan = 'Logo_Slogan',
}

const deprecatedDefaultBrandingStyle = DeprecatedBrandingStyle.Logo;

type DeprecatedBranding = {
  style?: DeprecatedBrandingStyle;
  logoUrl?: string;
  darkLogoUrl?: string;
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

  const { logoUrl, darkLogoUrl } = originBranding;

  const branding: Branding = {
    logoUrl,
    darkLogoUrl,
  };

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
    branding: { logoUrl, darkLogoUrl },
  } = signInExperience;

  const branding: DeprecatedBranding = {
    style: deprecatedDefaultBrandingStyle,
    logoUrl,
    darkLogoUrl,
  };

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
