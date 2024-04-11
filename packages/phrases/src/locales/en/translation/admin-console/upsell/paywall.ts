const paywall = {
  applications:
    '{{count, number}} application of <planName/> limit reached. Upgrade plan to meet your team’s needs. For any assistance, feel free to <a>contact us</a>.',
  applications_other:
    '{{count, number}} applications of <planName/> limit reached. Upgrade plan to meet your team’s needs. For any assistance, feel free to <a>contact us</a>.',
  machine_to_machine_feature:
    'Switch to the <strong>Pro</strong> plan to gain extra machine-to-machine applications and enjoy all premium features. <a>Contact us</a> if you have questions.',
  machine_to_machine:
    '{{count, number}} machine-to-machine application of <planName/> limit reached. Upgrade plan to meet your team’s needs. For any assistance, feel free to <a>contact us</a>.',
  machine_to_machine_other:
    '{{count, number}} machine-to-machine applications of <planName/> limit reached. Upgrade plan to meet your team’s needs. For any assistance, feel free to <a>contact us</a>.',
  resources:
    '{{count, number}} API resource of <planName/> limit reached. Upgrade plan to meet your team’s needs. <a>Contact us</a> for any assistant.',
  resources_other:
    '{{count, number}} API resources of <planName/> limit reached. Upgrade plan to meet your team’s needs. <a>Contact us</a> for any assistant.',
  scopes_per_resource:
    '{{count, number}} permission per API resource of <planName/> limit reached. Upgrade now to expand. <a>Contact us</a> for any assistant.',
  scopes_per_resource_other:
    '{{count, number}} permissions per API resource of <planName/> limit reached. Upgrade now to expand. <a>Contact us</a> for any assistant.',
  custom_domain:
    'Unlock custom domain functionality by upgrading to <strong>Hobby</strong> or <strong>Pro</strong> plan. Don’t hesitate to <a>contact us</a> if you need any assistance.',
  social_connectors:
    '{{count, number}} social connector of <planName/> limit reached. To meet your team’s needs, upgrade plan for additional social connectors and the ability to create your own connectors using OIDC, OAuth 2.0, and SAML protocols. Feel free to <a>contact us</a> if you need any assistance.',
  social_connectors_other:
    '{{count, number}} social connectors of <planName/> limit reached. To meet your team’s needs, upgrade plan for additional social connectors and the ability to create your own connectors using OIDC, OAuth 2.0, and SAML protocols. Feel free to <a>contact us</a> if you need any assistance.',
  standard_connectors_feature:
    'Upgrade to the <strong>Hobby</strong> or <strong>Pro</strong> plan to create your own connectors using OIDC, OAuth 2.0, and SAML protocols, plus unlimited social connectors and all the premium features. Feel free to <a>contact us</a> if you need any assistance.',
  standard_connectors:
    '{{count, number}} social connector of <planName/> limit reached. To meet your team’s needs, upgrade plan for additional social connectors and the ability to create your own connectors using OIDC, OAuth 2.0, and SAML protocols. Feel free to <a>contact us</a> if you need any assistance.',
  standard_connectors_other:
    '{{count, number}} social connectors of <planName/> limit reached. To meet your team’s needs, upgrade plan for additional social connectors and the ability to create your own connectors using OIDC, OAuth 2.0, and SAML protocols. Feel free to <a>contact us</a> if you need any assistance.',
  standard_connectors_pro:
    '{{count, number}} standard connector of <planName/> limit reached. To meet your team’s needs, upgrade to the Enterprise plan for additional social connectors and the ability to create your own connectors using OIDC, OAuth 2.0, and SAML protocols. Feel free to <a>contact us</a> if you need any assistance.',
  standard_connectors_pro_other:
    '{{count, number}} standard connectors of <planName/> limit reached. To meet your team’s needs, upgrade to the Enterprise plan for additional social connectors and the ability to create your own connectors using OIDC, OAuth 2.0, and SAML protocols. Feel free to <a>contact us</a> if you need any assistance.',
  roles:
    '{{count, number}} role of <planName/> limit reached. Upgrade plan to add additional roles and permissions. Feel free to <a>contact us</a> if you need any assistance.',
  roles_other:
    '{{count, number}} roles of <planName/> limit reached. Upgrade plan to add additional roles and permissions. Feel free to <a>contact us</a> if you need any assistance.',
  machine_to_machine_roles:
    '{{count, number}} machine-to-machine role of <planName/> limit reached. Upgrade plan to add additional roles and permissions. Feel free to <a>contact us</a> if you need any assistance.',
  machine_to_machine_roles_other:
    '{{count, number}} machine-to-machine roles of <planName/> limit reached. Upgrade plan to add additional roles and permissions. Feel free to <a>contact us</a> if you need any assistance.',
  scopes_per_role:
    '{{count, number}} permission per role of <planName/> limit reached. Upgrade plan to add additional roles and permissions. For any assistance, feel free to <a>contact us</a>.',
  scopes_per_role_other:
    '{{count, number}} permissions per role of <planName/> limit reached. Upgrade plan to add additional roles and permissions. For any assistance, feel free to <a>contact us</a>.',
  hooks:
    '{{count, number}} webhook of <planName/> limit reached. Upgrade plan to create more webhooks. Feel free to <a>contact us</a> if you need any assistance.',
  hooks_other:
    '{{count, number}} webhooks of <planName/> limit reached. Upgrade plan to create more webhooks. Feel free to <a>contact us</a> if you need any assistance.',
  mfa: 'Unlock MFA to verification security by upgrading to a paid plan. Don’t hesitate to <a>contact us</a> if you need any assistance.',
  organizations:
    'Unlock organizations by upgrading to a paid plan. Don’t hesitate to <a>contact us</a> if you need any assistance.',
  third_party_apps:
    'Unlock Logto as IdP for third-party apps by upgrading to a paid plan. For any assistance, feel free to <a>contact us</a>.',
  sso_connectors:
    'Unlock enterprise sso by upgrading to a paid plan. For any assistance, feel free to <a>contact us</a>.',
  tenant_members:
    'Unlock collaboration feature by upgrading to a paid plan. For any assistance, feel free to <a>contact us</a>.',
  tenant_members_dev_plan:
    "You've reached your {{limit}}-member limit. Release a member or revoke a pending invitation to add someone new. Need more seats? Feel free to contact us.",
};

export default Object.freeze(paywall);
