import { AdminConsoleKey } from '@logto/phrases';
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
  title: AdminConsoleKey;
  description: AdminConsoleKey;
  label: AdminConsoleKey;
  link: string;
};

export const useContacts = (): ContactItem[] => {
  const theme = useTheme();
  const isLightMode = theme === AppearanceMode.LightMode;

  return [
    {
      title: 'contact.discord.title',
      icon: isLightMode ? Discord : DiscordDark,
      description: 'contact.discord.description',
      label: 'contact.discord.button',
      link: 'https://discord.gg/UEPaF3j5e6',
    },
    {
      title: 'contact.github.title',
      icon: isLightMode ? Github : GithubDark,
      description: 'contact.github.description',
      label: 'contact.github.button',
      link: 'https://github.com/logto-io/logto/issues',
    },
    {
      title: 'contact.email.title',
      icon: isLightMode ? Email : EmailDark,
      description: 'contact.email.description',
      label: 'contact.email.button',
      link: 'mailto:feedback@logto.io',
    },
  ];
};
