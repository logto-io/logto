const protected_app = {
  /** UNTRANSLATED */
  name: 'Protected App',
  /** UNTRANSLATED */
  title: 'Create a Protected App: Add authentication with simplicity and epic speed',
  /** UNTRANSLATED */
  description:
    'Protected App securely maintains user sessions and proxies your app requests. Powered by Cloudflare Workers, enjoy the top-tier performance and 0ms cold start worldwide. <a>Learn more</a>',
  /** UNTRANSLATED */
  fast_create: 'Fast create',
  /** UNTRANSLATED */
  modal_title: 'Create Protected App',
  /** UNTRANSLATED */
  modal_subtitle:
    'Enable secure and fast protection with clicks. Add authentication to your existing web app with ease.',
  form: {
    /** UNTRANSLATED */
    url_field_label: 'Your origin URL',
    /** UNTRANSLATED */
    url_field_placeholder: 'https://domain.com/',
    /** UNTRANSLATED */
    url_field_description: 'Provide the address of your app requiring authentication protection.',
    /** UNTRANSLATED */
    url_field_modification_notice:
      'Modifications to the origin URL may take up to 1-2 minutes to become effective across global network locations.',
    /** UNTRANSLATED */
    url_field_tooltip:
      "Provide the address of your application, excluding any '/pathname'. After creation, you can customize route authentication rules.\n\nNote: The origin URL itself doesn't necessitate authentication; protection is applied exclusively to accesses via the designated app domain.",
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
    create_protected_app: 'Fast create',
    errors: {
      /** UNTRANSLATED */
      domain_required: 'Your domain is required.',
      /** UNTRANSLATED */
      domain_in_use: 'This subdomain name is already in use.',
      /** UNTRANSLATED */
      invalid_domain_format:
        "Invalid subdomain format: use only lowercase letters, numbers, and hyphens '-'.",
      /** UNTRANSLATED */
      url_required: 'Origin URL is required.',
      /** UNTRANSLATED */
      invalid_url:
        "Invalid origin URL format: Use http:// or https://. Note: '/pathname' is not currently supported.",
      /** UNTRANSLATED */
      localhost:
        'Please expose your local server to the internet first. Learn more about <a>local development</a>.',
    },
  },
  /** UNTRANSLATED */
  success_message:
    '🎉 App authentication successfully enabled! Explore the new experience of your website.',
};

export default Object.freeze(protected_app);
