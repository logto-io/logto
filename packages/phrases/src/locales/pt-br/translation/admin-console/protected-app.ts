const protected_app = {
  /** UNTRANSLATED */
  name: 'Protected app',
  /** UNTRANSLATED */
  title: 'Create a Protected App: Epic speed, simplicity, non-SDK integration',
  /** UNTRANSLATED */
  description:
    'Serverless deployment with Logto Workers, powered by Cloudflare for top-tier performance and 0ms cold starts worldwide. <a>Learn more</a>',
  /** UNTRANSLATED */
  fast_create: 'Fast create',
  /** UNTRANSLATED */
  modal_title: 'Create protected app',
  /** UNTRANSLATED */
  modal_subtitle:
    'No more integrating Logto SDK. Add authentication to your existing web app with ease.',
  form: {
    /** UNTRANSLATED */
    url_field_label: 'Your origin URL',
    /** UNTRANSLATED */
    url_field_placeholder: 'https://',
    /** UNTRANSLATED */
    url_field_description:
      'Enter the primary website address of your application requiring authentication.',
    /** UNTRANSLATED */
    url_field_modification_notice:
      'Modifications to the Origin URL may take up to 1-2 minutes to become effective across global network locations.',
    /** UNTRANSLATED */
    url_field_tooltip:
      "Enter primary website address of your application, excluding any '/pathname'. After creation, you can customize route authentication rules.\n\nNote: The Origin URL itself doesn't necessitate authentication; protection is applied exclusively to accesses via the designated app domain.",
    /** UNTRANSLATED */
    domain_field_label: 'App domain',
    /** UNTRANSLATED */
    domain_field_placeholder: 'your-domain',
    /** UNTRANSLATED */
    domain_field_description:
      'This URL serves as an authentication protection proxy for the original URL. Custom domain can be applied after creation.',
    /** UNTRANSLATED */
    domain_field_description_short:
      'This URL serves as an authentication protection proxy for the original URL.',
    /** UNTRANSLATED */
    domain_field_tooltip:
      "Apps protected by Logto will be hosted at 'your-domain.{{domain}}' by default. Custom domain can be applied after creation.",
    /** UNTRANSLATED */
    create_application: 'Create application',
    /** UNTRANSLATED */
    create_protected_app: 'Create and experience instantly',
    errors: {
      /** UNTRANSLATED */
      domain_required: 'Subdomain is required.',
      /** UNTRANSLATED */
      domain_in_use: 'This subdomain name is already in use.',
      /** UNTRANSLATED */
      invalid_domain_format:
        "Invalid subdomain format: use only lowercase letters, numbers, and hyphens '-'.",
      /** UNTRANSLATED */
      url_required: 'Origin URL is required.',
      /** UNTRANSLATED */
      invalid_url:
        "Invalid Origin URL format: Use http:// or https://. Note: '/pathname' is not currently supported.",
    },
  },
  /** UNTRANSLATED */
  success_message:
    '🎉  App authentication successfully enabled! Explore the new protection of your website.',
};

export default Object.freeze(protected_app);
