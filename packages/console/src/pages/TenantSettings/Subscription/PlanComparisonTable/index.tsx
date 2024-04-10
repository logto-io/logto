import { type AdminConsoleKey } from '@logto/phrases';
import { type TFuncKey } from 'i18next';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  freePlanAuditLogsRetentionDays,
  freePlanM2mLimit,
  freePlanMauLimit,
  freePlanPermissionsLimit,
  freePlanRoleLimit,
  proPlanAuditLogsRetentionDays,
} from '@/consts/subscriptions';
import DynamicT from '@/ds-components/DynamicT';

import TableDataWrapper from './TableDataWrapper';
import * as styles from './index.module.scss';

const featuredPlanPhraseKey: AdminConsoleKey[] = [
  'subscription.free_plan',
  'subscription.pro_plan',
  'subscription.enterprise',
];

type TableRow = {
  /**
   * The plan quota item name for the row.
   */
  name: string;
  /**
   * The data for each plan. The order of the data is [free, pro, enterprise].
   * Each data is a string that uses `|` to separate the content, the tooltip and extra information.
   * For example:
   * - `✓`
   * - `✓|This is a tooltip`
   * - `✓|This is a tooltip|This is extra information`
   * - `✓`||This is extra information
   *
   * The `✓` in the content section will be replaced with a checkmark icon.
   */
  data: string[];
};

type Table = {
  title: TFuncKey<'translation', 'admin_console.subscription.quota_table'>;
  rows: TableRow[];
};

function PlanComparisonTable() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.subscription.quota_table' });
  const { t: adminConsoleTranslation } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const tables: Table[] = useMemo(() => {
    const contact = t('contact');
    const unlimited = t('unlimited');
    const paidQuotaLimitTip = t('paid_quota_limit_tip');
    const paidAddOnFeatureTip = t('paid_add_on_feature_tip');
    const addOn = t('add_on');
    const comingSoon = adminConsoleTranslation('general.coming_soon');

    // Basics
    const basePrice = t('quota.base_price');
    const proPlanBasePrice = t('monthly_price', { value: 16 });
    const mauLimit = t('quota.mau_limit');
    const mauLimitTip = t('mau_tip');
    const includedTokens = t('quota.included_tokens');
    const includedTokensTip = t('tokens_tip');
    const proPlanIncludedTokens = t('million', { value: 1 });
    const proPlanIncludedTokensTip = t('paid_token_limit_tip');

    // Applications
    const totalApplications = t('application.total');
    const m2mApps = t('application.m2m');
    const proPlanM2mAppLimit = t('included', { value: 1 });
    const proPlanM2mAppPrice = t('extra_quota_price', { value: 8 });
    const thirdPartyApps = t('application.third_party');
    const thirdPartyAppsTip = t('third_party_tip');

    // API resources
    const resourceCount = t('resource.resource_count');
    const proPlanResourceLimit = t('included', { value: 3 });
    const proPlanResourcePrice = t('extra_quota_price', { value: 4 });
    const permissionsPerResource = t('resource.scopes_per_resource');

    // UI and branding
    const customDomain = t('branding.custom_domain');
    const customCss = t('branding.custom_css');
    const appLogoAndFavicon = t('branding.app_logo_and_favicon');
    const darkMode = t('branding.dark_mode');
    const i18n = t('branding.i18n');

    // User authentication
    const omniSignIn = t('user_authn.omni_sign_in');
    const password = t('user_authn.password');
    const passwordless = t('user_authn.passwordless');
    const emailConnector = t('user_authn.email_connector');
    const smsConnector = t('user_authn.sms_connector');
    const socialConnectors = t('user_authn.social_connectors');
    const ssoPrice = t('per_month_each', { value: 48 });
    const sso = t('user_authn.sso');
    const mfa = t('user_authn.mfa');
    const mfaPrice = t('monthly_price', { value: 48 });
    const adaptiveMfa = t('user_authn.adaptive_mfa');

    // User management
    const userManagement = t('user_management.user_management');
    const userRoles = t('user_management.roles');
    const m2mRoles = t('user_management.machine_to_machine_roles');
    const permissionsPerRole = t('user_management.scopes_per_role');

    // Organizations
    const mao = t('organizations.monthly_active_organization');
    const maoTip = t('mao_tip');
    const maoLimit = t('included_mao', { value: 100 });
    const maoPrice = t('extra_mao_price', { value: 0.64 });
    const allowedUsersPerOrg = t('organizations.allowed_users_per_org');
    const invitation = t('organizations.invitation');
    const orgRoles = t('organizations.org_roles');
    const orgPermissions = t('organizations.org_permissions');
    const jitProvisioning = t('organizations.just_in_time_provisioning');

    // Developers and platform
    const webhooks = t('developers_and_platform.hooks');
    const auditLogRetention = t('developers_and_platform.audit_logs_retention');
    const freePlanLogRetention = t('days', { count: freePlanAuditLogsRetentionDays });
    const paidPlanLogRetention = t('days', { count: proPlanAuditLogsRetentionDays });
    const jwtClaims = t('developers_and_platform.jwt_claims');
    const tenantMembers = t('developers_and_platform.tenant_members');
    const tenantMembersLimit = t('included', { value: 3 });
    const tenantMembersPrice = t('per_member', { value: 8 });

    // Compliance and support
    const community = t('support.community');
    const emailTicketSupport = t('support.email_ticket_support');
    const soc2Report = t('support.soc2_report');
    const hipaaOrBaaReport = t('support.hipaa_or_baa_report');

    return [
      {
        title: 'quota.title',
        rows: [
          { name: basePrice, data: ['0', proPlanBasePrice, contact] },
          {
            name: `${mauLimit}|${mauLimitTip}`,
            data: [freePlanMauLimit.toLocaleString(), unlimited, contact],
          },
          {
            name: `${includedTokens}|${includedTokensTip}`,
            data: ['500,000', `${proPlanIncludedTokens}|${proPlanIncludedTokensTip}`, contact],
          },
        ],
      },
      {
        title: 'application.title',
        rows: [
          { name: totalApplications, data: ['3', unlimited, contact] },
          {
            name: m2mApps,
            data: [
              `${freePlanM2mLimit}`,
              `${proPlanM2mAppLimit}|${paidQuotaLimitTip}|${proPlanM2mAppPrice}`,
              contact,
            ],
          },
          { name: `${thirdPartyApps}|${thirdPartyAppsTip}`, data: ['-', unlimited, contact] },
        ],
      },
      {
        title: 'resource.title',
        rows: [
          {
            name: resourceCount,
            data: [
              '1',
              `${proPlanResourceLimit}|${paidQuotaLimitTip}|${proPlanResourcePrice}`,
              contact,
            ],
          },
          { name: permissionsPerResource, data: ['1', unlimited, contact] },
        ],
      },
      {
        title: 'branding.title',
        rows: [
          { name: customDomain, data: ['✓', '✓', '✓'] },
          { name: customCss, data: ['✓', '✓', '✓'] },
          { name: appLogoAndFavicon, data: ['✓', '✓', '✓'] },
          { name: darkMode, data: ['✓', '✓', '✓'] },
          { name: i18n, data: ['✓', '✓', '✓'] },
        ],
      },
      {
        title: 'user_authn.title',
        rows: [
          { name: omniSignIn, data: ['✓', '✓', '✓'] },
          { name: password, data: ['✓', '✓', '✓'] },
          { name: passwordless, data: ['✓', '✓', '✓'] },
          { name: emailConnector, data: ['✓', '✓', '✓'] },
          { name: smsConnector, data: ['✓', '✓', '✓'] },
          { name: socialConnectors, data: ['3', unlimited, contact] },
          { name: sso, data: ['-', `${ssoPrice}|${paidAddOnFeatureTip}|${addOn}`, contact] },
          { name: mfa, data: ['-', `${mfaPrice}|${paidAddOnFeatureTip}|${addOn}`, contact] },
          {
            name: adaptiveMfa,
            data: ['-', comingSoon, contact],
          },
        ],
      },
      {
        title: 'user_management.title',
        rows: [
          { name: userManagement, data: ['✓', '✓', '✓'] },
          { name: userRoles, data: [`${freePlanRoleLimit}`, unlimited, contact] },
          { name: m2mRoles, data: ['1', unlimited, contact] },
          { name: permissionsPerRole, data: [`${freePlanPermissionsLimit}`, unlimited, contact] },
        ],
      },
      {
        title: 'organizations.title',
        rows: [
          {
            name: `${mao}|${maoTip}`,
            data: ['-', `${maoLimit}|${paidQuotaLimitTip}|${maoPrice}`, contact],
          },
          { name: allowedUsersPerOrg, data: ['-', unlimited, contact] },
          { name: invitation, data: ['-', comingSoon, contact] },
          { name: orgRoles, data: ['-', unlimited, contact] },
          { name: orgPermissions, data: ['-', unlimited, contact] },
          { name: jitProvisioning, data: ['-', comingSoon, contact] },
        ],
      },
      {
        title: 'developers_and_platform.title',
        rows: [
          { name: webhooks, data: ['1', '10', contact] },
          { name: auditLogRetention, data: [freePlanLogRetention, paidPlanLogRetention, contact] },
          { name: jwtClaims, data: ['-', comingSoon, comingSoon] },
          {
            name: tenantMembers,
            data: [
              '1',
              `${tenantMembersLimit}|${paidAddOnFeatureTip}|${tenantMembersPrice}`,
              contact,
            ],
          },
        ],
      },
      {
        title: 'support.title',
        rows: [
          { name: community, data: ['✓', '✓', '✓'] },
          { name: emailTicketSupport, data: ['-', '✓ (48h)', contact] },
          { name: soc2Report, data: ['-', comingSoon, comingSoon] },
          { name: hipaaOrBaaReport, data: ['-', '-', comingSoon] },
        ],
      },
    ];
  }, [adminConsoleTranslation, t]);

  return (
    <div className={styles.container}>
      <table>
        <thead>
          <tr>
            <th />
            {featuredPlanPhraseKey.map((key) => (
              <th key={key}>
                <DynamicT forKey={key} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tables.map(({ title, rows }) => (
            <Fragment key={title}>
              <tr>
                <td colSpan={4} className={styles.groupLabel}>
                  <DynamicT forKey={`subscription.quota_table.${title}`} />
                </td>
              </tr>
              {rows.map(({ name, data }) => (
                <tr key={`${title}-${name}`}>
                  <td className={styles.quotaKeyColumn}>
                    <TableDataWrapper isLeftAligned value={name} />
                  </td>
                  {data.map((value, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <td key={`${title}-${name}-${index}`}>
                      <TableDataWrapper value={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PlanComparisonTable;
