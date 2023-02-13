import type { AdminConsoleKey } from '@logto/phrases';
import type { ReactNode } from 'react';

export type Option = {
  icon?: ReactNode;
  title: AdminConsoleKey;
  value: string;
};
