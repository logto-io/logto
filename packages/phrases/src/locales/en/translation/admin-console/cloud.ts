const cloud = {
  self_hosted_licenses: {
    title: 'Self-hosted licenses',
    description:
      'View the licenses owned by your account and copy keys for your self-hosted deployments.',
    empty_title: 'No self-hosted licenses yet',
    empty_description:
      "If you've purchased a license, make sure you're signed in with the account you used to purchase it.",
    load_error: 'Unable to load licenses. Please try again.',
    period_end: 'Current period ends',
    keys_title: 'License keys',
    keys_description:
      'Keep these keys private. Use the key that matches your deployment environment.',
    production_key: 'Production key',
    non_production_key: 'Non-production key',
    keys_unavailable: 'Keys are unavailable for this license. Contact support if you need help.',
    keys_pending: 'Keys will be available once the license is active.',
    keys_payment_required:
      'Keys are unavailable until the outstanding invoice is paid. Use "Manage payment" to pay it, and the keys will be available again.',
    manage_payment: 'Manage payment',
    issue_keys: 'Get license keys',
    issue_error: 'Unable to issue license keys. Please try again.',
    install_title: 'Install your license',
    install_description:
      'Both keys unlock the same features and quotas. Unless your order form states otherwise, your subscription covers one production deployment.',
    install_copy:
      'Copy the production key for a production deployment, or the non-production key for development and testing.',
    install_paste:
      'In your self-hosted Console, open Settings → License, paste the key, and install it.',
    usage_warning_description: 'This license is above the usage limits of its plan:',
    usage_warning_metric: '{{metric}} ({{env}}): {{value}} (limit {{limit}})',
    deployments_title: 'Deployments',
    deployments_description:
      'Deployments that refreshed this license, with the latest usage each one reported. Monthly figures are the higher of last month and this month so far. Inactive deployments have not refreshed in the last 15 days and do not count toward the limits.',
    deployments_empty: 'No deployment has refreshed this license yet.',
    deployment_id: 'Deployment ID',
    logto_version: 'Logto version',
    last_seen: 'Last seen',
    inactive: 'Inactive',
    status: {
      pending: 'Activating',
      active: 'Active',
      past_due: 'Past due',
      canceling: 'Cancels at period end',
      canceled: 'Canceled',
      unpaid: 'Unpaid',
      expired: 'Expired',
      revoked: 'Revoked',
    },
    purchase: {
      buy: 'Buy a license',
      description: 'Unlock paid features on your own Logto instance with a yearly subscription.',
      price_per_month: '{{price}}/mo',
      billed_annually: 'Billed annually',
      price_unavailable: 'Price unavailable',
      feature_branding: 'Hide the Logto branding',
      feature_custom_ui: 'Bring your own sign-in UI',
      feature_collaboration: 'Console collaboration',
      feature_saml: 'Unlimited SAML applications',
      feature_deployment: 'One production deployment',
      subscribe: 'Subscribe',
      enterprise: 'Need Enterprise? <a>Contact us</a>',
      activating: 'Payment received. Activating your license...',
      processing:
        'Your payment is still being processed. The license will appear here once it is active.',
      checkout_expired: 'The checkout session has expired. Please subscribe again.',
    },
    cancel: {
      action: 'Cancel subscription',
      keep: 'Keep subscription',
      confirm_title: 'Cancel subscription?',
      confirm_content:
        'The license stays active until the end of the current period and will not renew. After that, its keys can no longer be refreshed.',
      success: 'The subscription will be canceled at the end of the current period.',
      payment_required:
        'Pay the outstanding invoice before canceling. Use "Manage payment" to pay it.',
      failed: 'Unable to cancel the subscription. Please try again.',
    },
  },
  console_sso: {
    back_to_list: 'Back to Console SSO',
    create: 'Add connector',
    title: 'Console SSO',
    description:
      'Configure your own identity provider to sign in to Logto Console with single sign-on.',
    domain_bound: 'Bound',
    domain_pending: 'Verifying',
    domain_verify_step: 'Verify your domain',
    domain_bind_step: 'Bind email domain',
    domain_add_placeholder: 'Add an email domain',
    domain_bound_description:
      'This domain is active for Console SSO. Its TXT challenge has been removed.',
    domain_dns_instructions: 'Add this TXT record to your DNS provider to verify domain ownership.',
    domain_waiting_for_dns: 'Waiting for the TXT record. We check again every 10 seconds.',
    domain_proven_unbound: 'Domain ownership is verified, but binding is incomplete.',
    domain_verified: 'Domain ownership verified.',
    domain_binding_pending: 'Binding starts automatically after verification.',
    domain_remove_description:
      'Remove {{domain}} from Console SSO? Removing a bound domain stops SSO discovery for its email addresses.',
    domain_invalid: 'Enter a valid email domain.',
    domain_conflict: 'This domain is already bound to another Console SSO connector.',
    domain_invalid_provider: 'Complete the Connection settings before binding this domain.',
    domain_dns_timeout: 'The DNS check failed. We will retry automatically.',
    domain_recovery: 'The domain change is incomplete.',
    start_over: 'Start over',
    start_over_confirmation:
      'Starting over may delete your incomplete SSO configuration. Do you want to continue?',
    resume_creation:
      'An unfinished creation was found. Continue with the same provider to recover this connector.',
    creation_charge_notice:
      'Standard pricing: <span>${{price, number}}/month per Console SSO connector</span>. For any assistance, feel free to <a>contact us</a>.',
  },
  general: {
    onboarding: 'Onboarding',
  },
  create_tenant: {
    page_title: 'Create tenant',
    title: 'Create your first tenant',
    description:
      'A tenant is an isolated environment where you can manage user identities, applications, and all other Logto resources.',
    invite_collaborators: 'Invite your collaborators by email',
    hear_about_us: {
      title: 'How did you first hear about Logto?',
      detail_placeholder: 'Tell us more (optional)',
      options: {
        search_engine: 'Search engine (Google, Bing...)',
        ai_assistant: 'AI assistant (ChatGPT, Claude, Gemini...)',
        github_oss: 'GitHub or open-source directories',
        friend_colleague: 'A friend or colleague',
        powered_by: 'Sign-in page of an app using Logto',
        content_social: 'Social media, article, or video (YouTube, X, Reddit...)',
        other: 'Other',
      },
    },
  },
  social_callback: {
    title: "You've successfully signed in",
    description:
      'You have successfully signed in using your social account. To ensure seamless integration and access to all the features of Logto, we recommend that you proceed to configure your own social connector.',
    notice:
      "Please avoid using the demo connector for production purposes. Once you've completed testing, kindly delete the demo connector and set up your own connector with your credentials.",
  },
  tenant: {
    create_tenant: 'Create tenant',
  },
};

export default Object.freeze(cloud);
