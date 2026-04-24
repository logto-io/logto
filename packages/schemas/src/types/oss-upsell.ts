export const ossUpsellEntries = Object.freeze({
  samlAppApplicationsLimitNotice: 'saml_app_applications_limit_notice',
  samlAppCreateModalLimitBanner: 'saml_app_create_modal_limit_banner',
  signInExpBringYourUiOssCard: 'sign_in_exp_bring_your_ui_oss_card',
  signInExpHideLogtoBrandingOssNote: 'sign_in_exp_hide_logto_branding_oss_note',
  getStartedOssCloudBanner: 'get_started_oss_cloud_banner',
  ossSidebarCloudCard: 'oss_sidebar_cloud_card',
  tenantSettingsMembersOssUpsell: 'tenant_settings_members_oss_upsell',
  connectorEmailBuiltinUpsellBanner: 'connector_email_builtin_upsell_banner',
});

export type OssUpsellEntry = (typeof ossUpsellEntries)[keyof typeof ossUpsellEntries];

export enum OssUpsellSearchParameterKey {
  Entry = 'entry',
  ClickId = 'click_id',
  Timestamp = 'ts',
}

export const ossUpsellSearchParameterKeys = [
  OssUpsellSearchParameterKey.Entry,
  OssUpsellSearchParameterKey.ClickId,
  OssUpsellSearchParameterKey.Timestamp,
] as const;

export const ossUpsellEntryValues: ReadonlySet<string> = new Set(Object.values(ossUpsellEntries));

export const isOssUpsellEntry = (value: string): value is OssUpsellEntry =>
  ossUpsellEntryValues.has(value);
