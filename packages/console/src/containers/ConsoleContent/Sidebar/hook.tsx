import { type Optional } from '@silverhand/essentials';
import type { TFuncKey } from 'i18next';
import type { FC, ReactNode } from 'react';

import BarGraph from '@/assets/icons/bar-graph.svg';
import Bolt from '@/assets/icons/bolt.svg';
import Box from '@/assets/icons/box.svg';
import Connection from '@/assets/icons/connection.svg';
import Gear from '@/assets/icons/gear.svg';
import Hook from '@/assets/icons/hook.svg';
import JwtClaims from '@/assets/icons/jwt-claims.svg';
import Key from '@/assets/icons/key.svg';
import List from '@/assets/icons/list.svg';
import Organization from '@/assets/icons/organization.svg';
import UserProfile from '@/assets/icons/profile.svg';
import ResourceIcon from '@/assets/icons/resource.svg';
import Role from '@/assets/icons/role.svg';
import SecurityLock from '@/assets/icons/security-lock.svg';
import EnterpriseSso from '@/assets/icons/single-sign-on.svg';
import Web from '@/assets/icons/web.svg';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';

type SidebarItem = {
  Icon: FC;
  title: TFuncKey<'translation', 'admin_console.tabs'>;
  isHidden?: boolean;
  modal?: (isOpen: boolean, onCancel: () => void) => ReactNode;
  externalLink?: string;
};

type SidebarSection = {
  title: TFuncKey<'translation', 'admin_console.tab_sections'>;
  isHidden?: boolean;
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
  const allSections: SidebarSection[] = [
    {
      title: 'overview',
      items: [
        {
          Icon: Bolt,
          title: 'get_started',
        },
        {
          Icon: BarGraph,
          title: 'dashboard',
        },
      ],
    },
    {
      title: 'authentication',
      items: [
        {
          Icon: Box,
          title: 'applications',
        },

        {
          Icon: Web,
          title: 'sign_in_experience',
        },
        {
          Icon: SecurityLock,
          title: 'mfa',
        },
        {
          Icon: Connection,
          title: 'connectors',
        },
        {
          Icon: EnterpriseSso,
          title: 'enterprise_sso',
        },
      ],
    },
    {
      title: 'authorization',
      items: [
        {
          Icon: ResourceIcon,
          title: 'api_resources',
        },
        {
          Icon: Role,
          title: 'roles',
        },
        {
          Icon: Role,
          title: 'organization_template',
          isHidden: !isDevFeaturesEnabled,
        },
      ],
    },
    {
      title: 'users',
      items: [
        {
          Icon: Organization,
          title: 'organizations',
        },
        {
          Icon: UserProfile,
          title: 'users',
        },
      ],
    },
    {
      title: 'developer',
      items: [
        {
          Icon: Key,
          title: 'signing_keys',
        },
        {
          Icon: JwtClaims,
          title: 'customize_jwt',
          isHidden: !(isCloud && isDevFeaturesEnabled),
        },
        {
          Icon: Hook,
          title: 'webhooks',
        },
        {
          Icon: List,
          title: 'audit_logs',
        },
      ],
    },
    {
      title: 'tenant',
      isHidden: !isCloud,
      items: [
        {
          Icon: Gear,
          title: 'tenant_settings',
        },
      ],
    },
  ];

  const enabledSections = allSections.filter((section) => !section.isHidden);

  return { sections: enabledSections, firstItem: findFirstItem(enabledSections) };
};
