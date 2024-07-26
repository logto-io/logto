import { Navigate, type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

import { SignInExperienceTab } from '@/pages/SignInExperience/types';

const SignInExperience = safeLazy(async () => import('@/pages/SignInExperience'));

export const signInExperience: RouteObject = {
  path: 'sign-in-experience',
  children: [
    { index: true, element: <Navigate replace to={SignInExperienceTab.Branding} /> },
    { path: ':tab', element: <SignInExperience /> },
  ],
};
