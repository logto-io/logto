import type { AdminConsoleKey } from '@logto/phrases';
import { Theme } from '@logto/schemas';

import CalendarDark from '@/assets/icons/calendar-dark.svg?react';
import Calendar from '@/assets/icons/calendar.svg?react';
import DiscordDark from '@/assets/icons/discord-dark.svg?react';
import Discord from '@/assets/icons/discord.svg?react';
import EmailDark from '@/assets/icons/email-dark.svg?react';
import Email from '@/assets/icons/email.svg?react';
import GithubDark from '@/assets/icons/github-dark.svg?react';
import Github from '@/assets/icons/github.svg?react';
import { contactEmailLink, discordLink, githubIssuesLink, reservationLink } from '@/consts';
import useTheme from '@/hooks/use-theme';

type ContactItem = {
  icon: SvgComponent;
  title: AdminConsoleKey;
  description: AdminConsoleKey;
  label: AdminConsoleKey;
  link: string;
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
    },
    {
      title: 'contact.github.title',
      icon: isLightMode ? Github : GithubDark,
      description: 'contact.github.description',
      label: 'contact.github.button',
      link: githubIssuesLink,
    },
    {
      title: 'contact.email.title',
      icon: isLightMode ? Email : EmailDark,
      description: 'contact.email.description',
      label: 'contact.email.button',
      link: contactEmailLink,
    },
    {
      title: 'contact.reserve.title',
      icon: isLightMode ? Calendar : CalendarDark,
      description: 'contact.reserve.description',
      label: 'contact.reserve.button',
      link: reservationLink,
    },
  ];
};
