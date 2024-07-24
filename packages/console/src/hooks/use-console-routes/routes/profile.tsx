import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';

const ChangePasswordModal = lazy(
  async () => import('@/pages/Profile/containers/ChangePasswordModal')
);
const LinkEmailModal = lazy(async () => import('@/pages/Profile/containers/LinkEmailModal'));
const VerificationCodeModal = lazy(
  async () => import('@/pages/Profile/containers/VerificationCodeModal')
);
const VerifyPasswordModal = lazy(
  async () => import('@/pages/Profile/containers/VerifyPasswordModal')
);

export const profile: RouteObject[] = [
  { path: 'verify-password', element: <VerifyPasswordModal /> },
  { path: 'change-password', element: <ChangePasswordModal /> },
  { path: 'link-email', element: <LinkEmailModal /> },
  { path: 'verification-code', element: <VerificationCodeModal /> },
];
