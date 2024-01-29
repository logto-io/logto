const protected_app = {
  name: 'Protected App',
  title: 'Create a Protected App with epic speed and simplicity',
  description:
    "Deploy with Logto secure workers, powered by Cloudflare's edge network for top-tier performance and 0ms cold starts worldwide. <a>Learn more</a>",
  fast_create: 'Fast create',
  modal_title: 'Create protected app',
  modal_subtitle: 'No more integrating Logto SDK. Create you web app easily.',
  form: {
    domain_field_label: 'App domain protected',
    domain_field_placeholder: 'Custom subdomain',
    domain_field_description:
      'Specify the app domain that will be protected by authentication and redirected to the Origin URL. Custom domain can be added after creation.',
    domain_field_description_short:
      'Specify the app domain that will be protected by authentication and redirected to the Origin URL.',
    domain_field_tooltip:
      "You can use a 'protected.app' subdomain powered by Logto for quick testing or online access, which remains consistently valid. After creation, your custom domain name can be added.",
    url_field_label: 'Origin URL',
    url_field_placeholder: 'https://',
    url_field_description: 'Enter the primary website address of your application.',
    url_field_tooltip:
      "Enter primary website address of your application, excluding any '/pathname'. After creation, you can customize route authentication rules.\n\nNote: The Origin URL itself won't require authentication; only accesses via the added app domain will be protected.",
    create_application: 'Create application',
    create_protected_app: 'Create and experience auth protection',
    errors: {
      domain_required: 'Subdomain is required',
      domain_in_use: 'This subdomain name is already in use.',
      invalid_domain_format:
        "Invalid subdomain format: use only lowercase letters, hyphens '-', and underscores '_'.",
      url_required: 'Origin URL is required.',
      invalid_url:
        "Invalid Origin URL format: Use http:// or https://. Note: '/pathname' is not currently supported.",
    },
  },
  success_message:
    '🎉  App authentication successfully enabled! Explore the new protection of your website.',
};

export default Object.freeze(protected_app);
