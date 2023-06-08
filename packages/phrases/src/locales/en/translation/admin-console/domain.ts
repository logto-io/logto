const domain = {
  status: {
    connecting: 'Connecting',
    in_used: 'In used',
    failed_to_connect: 'Failed to connect',
  },
  update_endpoint_notice:
    'Your custom domain has been successfully set up. Remember to update the domain used for the social connector callback URI and Logto endpoint for your application if you had previously configured the resources previously. <a>{{link}}</a>',
  error_hint:
    'Make sure to update your DNS records. We will continue to check every {{value}} seconds.',
  custom: {
    custom_domain: 'Custom Domain',
    custom_domain_description:
      'Replace the default domain with your own domain to maintain consistency with your brand and personalize the sign-in experience for your users.',
    custom_domain_field: 'Custom domain',
    custom_domain_placeholder: 'your.domain.com',
    add_domain: 'Add domain',
    invalid_domain_format:
      'Invalid subdomain format. Please enter a subdomain with at least three parts.',
    verify_domain: 'Verify domain',
    enable_ssl: 'Enable SSL',
    checking_dns_tip:
      'After you configuring the DNS records, the process will run automatically and may take up to 24 hours. You can leave this interface while it’s running.',
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
      'We provide a default domain name that can be used directly online. It is always available, ensuring that your application can always be accessed for sign-in, even if you switch to a custom domain.',
    default_domain_field: 'Logto default domain',
  },
};

export default domain;
