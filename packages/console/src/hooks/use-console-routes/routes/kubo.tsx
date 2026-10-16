import { type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

const Kubo = safeLazy(async () => import('@/pages/Kubo'));
const KuboWizard = safeLazy(async () => import('@/pages/Kubo/Wizard'));
const KuboCapacity = safeLazy(async () => import('@/pages/Kubo/Capacity'));
const KuboAgent = safeLazy(async () => import('@/pages/Kubo/Agent'));
const KuboStack = safeLazy(async () => import('@/pages/Kubo/Stack'));
const KuboBundle = safeLazy(async () => import('@/pages/Kubo/Bundle'));

// Stacks overview and stack creation, backed by the Kubo operator portal (proxied by Logto core).
export const kubo: RouteObject = {
  path: 'infrastructure',
  children: [
    { index: true, element: <Kubo /> },
    { path: 'new', element: <KuboWizard /> },
    { path: 'capacity', element: <KuboCapacity /> },
    { path: 'agent', element: <KuboAgent /> },
    { path: 'bundle', element: <KuboBundle /> },
    { path: 'stacks/:namespace/:name', element: <KuboStack /> },
  ],
};
