import { Navigate, type RouteObject } from 'react-router-dom';

import SignInExperience from '@/pages/SignInExperience';
import { SignInExperienceTab } from '@/pages/SignInExperience/types';

export const signInExperience: RouteObject = {
  path: 'sign-in-experience',
  children: [
    { index: true, element: <Navigate replace to={SignInExperienceTab.Branding} /> },
    { path: ':tab', element: <SignInExperience /> },
  ],
};
