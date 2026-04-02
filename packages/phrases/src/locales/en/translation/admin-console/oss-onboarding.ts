const oss_onboarding = {
  page_title: 'Onboarding',
  title: 'A little bit about you',
  description:
    'Tell us a bit about yourself and your project. This helps us build a better Logto for everyone.',
  email: {
    label: 'Email address',
    description: 'We’ll use this address if we need to contact you about your account.',
    placeholder: 'email@example.com',
  },
  newsletter: 'Receive product updates, security advisories, and curated content from Logto.',
  project: {
    label: 'I’m using Logto for',
    personal: 'Personal project',
    company: 'Company project',
  },
  company_name: {
    label: 'Company name',
    placeholder: 'Acme.co',
  },
  company_size: {
    label: 'What’s your company size?',
  },
  errors: {
    email_required: 'Email address is required',
    email_invalid: 'Enter a valid email address',
    company_name_required: 'Company name is required',
    company_size_required: 'Company size is required',
  },
};

export default Object.freeze(oss_onboarding);
