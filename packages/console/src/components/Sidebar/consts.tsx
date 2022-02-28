import { FC } from 'react';
import { TFuncKey } from 'react-i18next';

import BarGraph from './icons/BarGraph';
import Bolt from './icons/Bolt';
import Box from './icons/Box';
import Cloud from './icons/Cloud';

type SidebarItem = {
  Icon: FC;
  title: TFuncKey<'translation', 'admin_console.tabs'>;
};

type SidebarSection = {
  title: TFuncKey<'translation', 'admin_console.tab_sections'>;
  items: SidebarItem[];
};

export const sections: SidebarSection[] = [
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
    title: 'resource_management',
    items: [
      {
        Icon: Box,
        title: 'applications',
      },
      {
        Icon: Cloud,
        title: 'api_resources',
      },
    ],
  },
];
