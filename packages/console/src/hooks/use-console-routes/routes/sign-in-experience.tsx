import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import { SignInExperienceTab } from '@/pages/SignInExperience/types';

const SignInExperience = lazy(async () => import('@/pages/SignInExperience'));

export const signInExperience: RouteObject = {
  path: 'sign-in-experience',
  children: [
    { index: true, element: <Navigate replace to={SignInExperienceTab.Branding} /> },
    { path: ':tab', element: <SignInExperience /> },
  ],
};
