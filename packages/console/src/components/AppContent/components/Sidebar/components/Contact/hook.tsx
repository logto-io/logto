import { I18nKey } from '@logto/phrases';
import { AppearanceMode } from '@logto/schemas';

import DiscordDark from '@/assets/images/discord-dark.svg';
import Discord from '@/assets/images/discord.svg';
import EmailDark from '@/assets/images/email-dark.svg';
import Email from '@/assets/images/email.svg';
import GithubDark from '@/assets/images/github-dark.svg';
import Github from '@/assets/images/github.svg';
import { useTheme } from '@/hooks/use-theme';

type ContactItem = {
  icon: SvgComponent;
  title: I18nKey;
  description: I18nKey;
  label: I18nKey;
  link: string;
};

export const useContacts = (): ContactItem[] => {
  const theme = useTheme();
  const isLightMode = theme === AppearanceMode.LightMode;

  return [
    {
      title: 'admin_console.contact.discord.title',
      icon: isLightMode ? Discord : DiscordDark,
      description: 'admin_console.contact.discord.description',
      label: 'admin_console.contact.discord.button',
      link: 'https://discord.gg/UEPaF3j5e6',
    },
    {
      title: 'admin_console.contact.github.title',
      icon: isLightMode ? Github : GithubDark,
      description: 'admin_console.contact.github.description',
      label: 'admin_console.contact.github.button',
      link: 'https://github.com/logto-io/logto',
    },
    {
      title: 'admin_console.contact.email.title',
      icon: isLightMode ? Email : EmailDark,
      description: 'admin_console.contact.email.description',
      label: 'admin_console.contact.email.button',
      link: 'mailto:feedback@logto.io',
    },
  ];
};
