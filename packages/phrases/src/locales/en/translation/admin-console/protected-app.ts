const protected_app = {
  name: 'Protected App',
  title: 'Create a Protected App: Add authentication with simplicity and epic speed',
  description:
    'Protected App securely maintains user sessions and proxies your app requests. Powered by Cloudflare Workers, enjoy the top-tier performance and 0ms cold start worldwide. <a>Learn more</a>',
  fast_create: 'Fast create',
  modal_title: 'Create Protected App',
  modal_subtitle:
    'Enable secure and fast protection with clicks. Add authentication to your existing web app with ease.',
  form: {
    url_field_label: 'Your origin URL',
    url_field_placeholder: 'https://domain.com/',
    url_field_description: 'Provide the address of your app requiring authentication protection.',
    url_field_modification_notice:
      'Modifications to the origin URL may take up to 1-2 minutes to become effective across global network locations.',
    url_field_tooltip:
      "Provide the address of your application, excluding any '/pathname'. After creation, you can customize route authentication rules.\n\nNote: The origin URL itself doesn't necessitate authentication; protection is applied exclusively to accesses via the designated app domain.",
    domain_field_label: 'App domain',
    domain_field_placeholder: 'your-domain',
    domain_field_description:
      'This URL serves as an authentication protection proxy for the original URL. Custom domain can be applied after creation.',
    domain_field_description_short:
      'This URL serves as an authentication protection proxy for the original URL.',
    domain_field_tooltip:
      "Apps protected by Logto will be hosted at 'your-domain.{{domain}}' by default. Custom domain can be applied after creation.",
    create_application: 'Create application',
    create_protected_app: 'Fast create',
    errors: {
      domain_required: 'Your domain is required.',
      domain_in_use: 'This subdomain name is already in use.',
      invalid_domain_format:
        "Invalid subdomain format: use only lowercase letters, numbers, and hyphens '-'.",
      url_required: 'Origin URL is required.',
      invalid_url:
        "Invalid origin URL format: Use http:// or https://. Note: '/pathname' is not currently supported.",
      localhost:
        'Please expose your local server to the internet first. Learn more about <a>local development</a>.',
    },
  },
  success_message:
    '🎉 App authentication successfully enabled! Explore the new experience of your website.',
};

export default Object.freeze(protected_app);
