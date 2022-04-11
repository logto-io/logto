import { I18nKey } from '@logto/phrases';

import slack from '@/assets/images/slack.svg';

type ContactItem = {
  icon: string;
  title: I18nKey;
  description: I18nKey;
  label: I18nKey;
};

export const contacts: ContactItem[] = [
  {
    title: 'admin_console.contact.slack.title',
    icon: slack,
    description: 'admin_console.contact.slack.description',
    label: 'admin_console.contact.slack.button',
  },
  {
    title: 'admin_console.contact.github.title',
    icon: slack,
    description: 'admin_console.contact.github.description',
    label: 'admin_console.contact.github.button',
  },
  {
    title: 'admin_console.contact.email.title',
    icon: slack,
    description: 'admin_console.contact.email.description',
    label: 'admin_console.contact.email.button',
  },
];
