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
    '{{count, number}} API resource of <planName/> limit reached. Upgrade plan to meet your team’s needs. <a>Contact us</a> for any assistance.',
  resources_other:
    '{{count, number}} API resources of <planName/> limit reached. Upgrade plan to meet your team’s needs. <a>Contact us</a> for any assistance.',
  scopes_per_resource:
    '{{count, number}} permission per API resource of <planName/> limit reached. Upgrade now to expand. <a>Contact us</a> for any assistance.',
  scopes_per_resource_other:
    '{{count, number}} permissions per API resource of <planName/> limit reached. Upgrade now to expand. <a>Contact us</a> for any assistance.',
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
    'Upgrade plan to add additional roles and permissions. Feel free to <a>contact us</a> if you need any assistance.',
  scopes_per_role:
    '{{count, number}} permission per role of <planName/> limit reached. Upgrade plan to add additional roles and permissions. For any assistance, feel free to <a>contact us</a>.',
  scopes_per_role_other:
    '{{count, number}} permissions per role of <planName/> limit reached. Upgrade plan to add additional roles and permissions. For any assistance, feel free to <a>contact us</a>.',
  saml_applications_oss:
    'The additional SAML app is available with the Logto Enterprise plan. Contact us if you need assistance.',
  logto_pricing_button_text: 'Logto Cloud Pricing',
  saml_applications:
    'The additional SAML app is available with the Logto Enterprise plan. Contact us if you need assistance.',
  saml_applications_add_on:
    'Unlock SAML app feature by upgrading to a paid plan. For any assistance, feel free to <a>contact us</a>.',
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
  custom_jwt: {
    title: 'Add custom claims',
    description:
      "Upgrade to a paid plan for custom JWT functionality and premium benefits. Don't hesitate to <a>contact us</a> if you have any questions.",
  },
  bring_your_ui:
    'Upgrade to a paid plan for bring your custom UI functionality and premium benefits.',
  security_features:
    "Unlock advanced security features by upgrading to the Pro plan. Don't hesitate to <a>contact us</a> if you have any questions.",
  collect_user_profile:
    "Upgrade to a paid plan to collect additional user profile information during sign-up. Don't hesitate to <a>contact us</a> if you have any questions.",
};

export default Object.freeze(paywall);
