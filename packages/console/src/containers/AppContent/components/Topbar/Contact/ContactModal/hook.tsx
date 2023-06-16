import type { AdminConsoleKey } from '@logto/phrases';
import { Theme } from '@logto/schemas';

import DiscordDark from '@/assets/icons/discord-dark.svg';
import Discord from '@/assets/icons/discord.svg';
import EmailDark from '@/assets/icons/email-dark.svg';
import Email from '@/assets/icons/email.svg';
import GithubDark from '@/assets/icons/github-dark.svg';
import Github from '@/assets/icons/github.svg';
import { contactEmailLink, discordLink, githubIssuesLink } from '@/consts';
import useTheme from '@/hooks/use-theme';

type ContactItem = {
  icon: SvgComponent;
  title: AdminConsoleKey;
  description: AdminConsoleKey;
  label: AdminConsoleKey;
  link: string;
  isVisibleToCloud: boolean;
};

export const useContacts = (): ContactItem[] => {
  const theme = useTheme();
  const isLightMode = theme === Theme.Light;

  return [
    {
      title: 'contact.discord.title',
      icon: isLightMode ? Discord : DiscordDark,
      description: 'contact.discord.description',
      label: 'contact.discord.button',
      link: discordLink,
      isVisibleToCloud: true,
    },
    {
      title: 'contact.github.title',
      icon: isLightMode ? Github : GithubDark,
      description: 'contact.github.description',
      label: 'contact.github.button',
      link: githubIssuesLink,
      isVisibleToCloud: false,
    },
    {
      title: 'contact.email.title',
      icon: isLightMode ? Email : EmailDark,
      description: 'contact.email.description',
      label: 'contact.email.button',
      link: contactEmailLink,
      isVisibleToCloud: true,
    },
  ];
};
