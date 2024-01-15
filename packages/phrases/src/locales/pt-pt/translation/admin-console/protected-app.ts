const protected_app = {
  /** UNTRANSLATED */
  name: 'Protected App',
  /** UNTRANSLATED */
  title: 'Create a Protected App with epic speed and simplicity',
  /** UNTRANSLATED */
  description:
    "Deploy with Logto secure workers, powered by Cloudflare's edge network for top-tier performance and 0ms cold starts worldwide. <a>Learn more</a>",
  /** UNTRANSLATED */
  fast_create: 'Fast create',
  /** UNTRANSLATED */
  modal_title: 'Create protected app',
  /** UNTRANSLATED */
  modal_subtitle: 'No more integrating Logto SDK. Create you web app easily.',
  form: {
    /** UNTRANSLATED */
    domain_field_label: 'App domain protected',
    /** UNTRANSLATED */
    domain_field_placeholder: 'Custom subdomain',
    /** UNTRANSLATED */
    domain_field_description:
      'Specify the app domain that will be protected by authentication and redirected to the Origin URL.',
    /** UNTRANSLATED */
    domain_field_tooltip:
      "You can use a 'protected.app' subdomain powered by Logto for quick testing or online access, which remains consistently valid. After creation, your custom domain name can be added.",
    /** UNTRANSLATED */
    url_field_label: 'Origin URL',
    /** UNTRANSLATED */
    url_field_placeholder: 'https://',
    /** UNTRANSLATED */
    url_field_tooltip:
      "Enter primary website address of your application, excluding any '/routes'. After creation, you can customize route authentication rules.\n\nNote: The Origin URL itself won't require authentication; only accesses via the added app domain will be protected.",
    /** UNTRANSLATED */
    create_application: 'Create application',
    errors: {
      /** UNTRANSLATED */
      domain_required: 'Subdomain is required',
      /** UNTRANSLATED */
      domain_in_use: 'This subdomain name is already in use.',
      /** UNTRANSLATED */
      invalid_domain_format:
        "Invalid subdomain format: use only lowercase letters, hyphens '-', and underscores '_'.",
      /** UNTRANSLATED */
      url_required: 'Origin URL is required.',
      /** UNTRANSLATED */
      invalid_url:
        "Invalid Origin URL format: Use http:// or https://. Note: '/routes' is not currently supported.",
    },
  },
};

export default Object.freeze(protected_app);
