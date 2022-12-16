import type { Optional } from '@silverhand/essentials';
import type { FC, ReactNode } from 'react';
import type { TFuncKey } from 'react-i18next';

import { PagePath } from '@/consts/pathnames';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useUserPreferences from '@/hooks/use-user-preferences';

import Contact from './components/Contact';
import BarGraph from './icons/BarGraph';
import Bolt from './icons/Bolt';
import Box from './icons/Box';
import Cloud from './icons/Cloud';
import Connection from './icons/Connection';
import ContactIcon from './icons/Contact';
import Document from './icons/Document';
import List from './icons/List';
import UserProfile from './icons/UserProfile';
import Web from './icons/Web';

type SidebarItem = {
  Icon: FC;
  title: TFuncKey<'translation', 'admin_console.tabs'>;
  isHidden?: boolean;
  modal?: (isOpen: boolean, onCancel: () => void) => ReactNode;
  externalLink?: string;
  pagePath?: PagePath;
};

type SidebarSection = {
  title: TFuncKey<'translation', 'admin_console.tab_sections'>;
  items: SidebarItem[];
};

const findFirstItem = (sections: SidebarSection[]): Optional<SidebarItem> => {
  for (const section of sections) {
    const found = section.items.find((item) => !item.isHidden);

    if (found) {
      return found;
    }
  }
};

export const useSidebarMenuItems = (): {
  sections: SidebarSection[];
  firstItem: Optional<SidebarItem>;
} => {
  const {
    data: { getStartedHidden },
  } = useUserPreferences();
  const documentationUrl = useDocumentationUrl();

  const sections: SidebarSection[] = [
    {
      title: 'overview',
      items: [
        {
          Icon: Bolt,
          title: 'get_started',
          isHidden: getStartedHidden,
          pagePath: PagePath.GetStarted,
        },
        {
          Icon: BarGraph,
          title: 'dashboard',
          pagePath: PagePath.Dashboard,
        },
      ],
    },
    {
      title: 'resource_management',
      items: [
        {
          Icon: Box,
          title: 'applications',
          pagePath: PagePath.Applications,
        },
        {
          Icon: Cloud,
          title: 'api_resources',
          pagePath: PagePath.ApiResources,
        },
        {
          Icon: Web,
          title: 'sign_in_experience',
          pagePath: PagePath.SignInExperience,
        },
        {
          Icon: Connection,
          title: 'connectors',
          pagePath: PagePath.Connectors,
        },
      ],
    },
    {
      title: 'user_management',
      items: [
        {
          Icon: UserProfile,
          title: 'users',
          pagePath: PagePath.Users,
        },
        {
          Icon: List,
          title: 'audit_logs',
          pagePath: PagePath.AuditLogs,
        },
      ],
    },
    {
      title: 'help_and_support',
      items: [
        {
          Icon: ContactIcon,
          title: 'contact_us',
          modal: (isOpen, onCancel) => <Contact isOpen={isOpen} onCancel={onCancel} />,
        },
        {
          Icon: Document,
          title: 'docs',
          externalLink: documentationUrl,
        },
      ],
    },
  ];

  return { sections, firstItem: findFirstItem(sections) };
};
