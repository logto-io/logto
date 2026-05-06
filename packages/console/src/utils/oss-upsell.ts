type OpenCloudUpsellOptions = {
  readonly entry: OssUpsellEntry;
  readonly target?: '_blank' | '_self';
};

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

type OssUpsellEntry = (typeof ossUpsellEntries)[keyof typeof ossUpsellEntries];

// Cloud upsell disabled in self-hosted fork
export const buildCloudUpsellUrl = (_entry: OssUpsellEntry) => '#';

// Cloud upsell disabled in self-hosted fork
export const openCloudUpsell = ({ entry: _entry, target: _target = '_blank' }: OpenCloudUpsellOptions) => {
  return '#';
};
