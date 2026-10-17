import { type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

import InfraShell from '@/pages/Kubo/InfraShell';

const Kubo = safeLazy(async () => import('@/pages/Kubo'));
const KuboWizard = safeLazy(async () => import('@/pages/Kubo/KuboWizard'));
const KuboCapacity = safeLazy(async () => import('@/pages/Kubo/Capacity'));
const KuboAgent = safeLazy(async () => import('@/pages/Kubo/Agent'));
const KuboStack = safeLazy(async () => import('@/pages/Kubo/Stack'));
const KuboBundle = safeLazy(async () => import('@/pages/Kubo/Bundle'));

// Stacks overview and stack creation, backed by the Kubo operator portal (proxied by Logto core).
export const kubo: RouteObject = {
  path: 'infrastructure',
  children: [
    {
      index: true,
      element: (
        <InfraShell>
          <Kubo />
        </InfraShell>
      ),
    },
    {
      path: 'new',
      element: (
        <InfraShell>
          <KuboWizard />
        </InfraShell>
      ),
    },
    {
      path: 'capacity',
      element: (
        <InfraShell>
          <KuboCapacity />
        </InfraShell>
      ),
    },
    {
      path: 'agent',
      element: (
        <InfraShell>
          <KuboAgent />
        </InfraShell>
      ),
    },
    {
      path: 'bundle',
      element: (
        <InfraShell>
          <KuboBundle />
        </InfraShell>
      ),
    },
    {
      path: 'stacks/:namespace/:name',
      element: (
        <InfraShell>
          <KuboStack />
        </InfraShell>
      ),
    },
  ],
};
