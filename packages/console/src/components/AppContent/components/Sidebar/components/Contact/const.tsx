import { I18nKey } from '@logto/phrases';

import discord from '@/assets/images/discord.svg';
import email from '@/assets/images/email.svg';
import github from '@/assets/images/github.svg';

type ContactItem = {
  icon: string;
  title: I18nKey;
  description: I18nKey;
  label: I18nKey;
  link: string;
};

export const contacts: ContactItem[] = [
  {
    title: 'admin_console.contact.discord.title',
    icon: discord,
    description: 'admin_console.contact.discord.description',
    label: 'admin_console.contact.discord.button',
    link: 'https://discord.gg/UEPaF3j5e6',
  },
  {
    title: 'admin_console.contact.github.title',
    icon: github,
    description: 'admin_console.contact.github.description',
    label: 'admin_console.contact.github.button',
    link: 'https://github.com/logto-io/logto',
  },
  {
    title: 'admin_console.contact.email.title',
    icon: email,
    description: 'admin_console.contact.email.description',
    label: 'admin_console.contact.email.button',
    link: 'mailto:feedback@logto.io',
  },
];
