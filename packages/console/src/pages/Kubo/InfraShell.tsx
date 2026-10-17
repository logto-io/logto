import { Theme } from '@logto/schemas';
import type { ReactNode } from 'react';

import useTheme from '@/hooks/use-theme';

import CometBackground from './CometBackground';
import styles from './index.module.scss';

// Wraps the infrastructure pages in the MeshX design tokens (from foundation-frontend),
// following the console's light or dark mode.
function InfraShell({ children }: { readonly children: ReactNode }) {
  const theme = useTheme();
  return (
    <div className={styles.infraShell} data-theme={theme === Theme.Dark ? 'dark' : 'light'}>
      <CometBackground />
      {children}
    </div>
  );
}

export default InfraShell;
