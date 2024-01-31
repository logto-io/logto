const domain = {
  status: {
    connecting: 'Connecting...',
    in_use: 'In use',
    failed_to_connect: 'Failed to connect',
  },
  update_endpoint_notice:
    'Don’t forget to update the domain for the Social connector callback URI and Logto endpoint in your application if you want to use a custom domain for the features. <a>{{link}}</a>',
  error_hint:
    'Make sure to update your DNS records. We will continue to check every {{value}} seconds.',
  custom: {
    custom_domain: 'Custom Domain',
    custom_domain_description:
      'Improve your branding by utilizing a custom domain. This domain will be used in your sign-in experience.',
    custom_domain_field: 'Custom domain',
    custom_domain_placeholder: 'your.domain.com',
    add_domain: 'Add domain',
    invalid_domain_format:
      'Please provide a valid domain URL with a minimum of three parts, e.g. "your.domain.com."',
    verify_domain: 'Verify domain',
    enable_ssl: 'Enable SSL',
    checking_dns_tip:
      'After you configuring the DNS records, the process will run automatically and may take up to 24 hours. You can leave this interface while it’s running.',
    enable_ssl_tip:
      'Enable SSL will run automatically and may take up to 24 hours. You can leave this interface while it’s running.',
    generating_dns_records: 'Generating the DNS records...',
    add_dns_records: 'Please add these DNS records to your DNS provider.',
    dns_table: {
      type_field: 'Type',
      name_field: 'Name',
      value_field: 'Value',
    },
    deletion: {
      delete_domain: 'Delete domain',
      reminder: 'Delete custom domain',
      description: 'Are you sure you want to delete this custom domain?',
      in_used_description:
        'Are you sure you want to delete this custom domain "<span>{{domain}}</span>"?',
      in_used_tip:
        'If you’ve set up this custom domain in your social connector provider or application endpoint before, you’ll need to modify the URI to the Logto default domain "<span>{{domain}}</span>" first. This is necessary for the social sign-in button to work properly.',
      deleted: 'Delete custom domain successfully!',
    },
  },
  default: {
    default_domain: 'Default domain',
    default_domain_description:
      'Logto offers a pre-configured default domain, ready to use without any additional setup. This default domain serves as a backup option even if you enabled a custom domain.',
    default_domain_field: 'Logto default domain',
  },
  custom_endpoint_note:
    'You can customize the domain name of these endpoints as your required. Choose either "{{custom}}" or "{{default}}".',
  custom_social_callback_url_note:
    'You can customize the domain name of this URI to match your application’s endpoint. Choose either "{{custom}}" or "{{default}}".',
  custom_acs_url_note:
    'You can customize the domain name of this URI to match your identity provider assertion consumer service URL. Choose either "{{custom}}" or "{{default}}".',
};

export default Object.freeze(domain);
