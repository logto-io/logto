import type { SignInExperience } from '@logto/schemas';

import PageMeta from '@/components/PageMeta';

import SignInExperienceTabWrapper from '../components/SignInExperienceTabWrapper';

import AdvancedOptions from './AdvancedOptions';
import SignInForm from './SignInForm';
import SignUpFrom from './SignUpForm';
import SocialSignInForm from './SocialSignInForm';

type Props = {
  readonly isActive: boolean;
  readonly data: SignInExperience;
};

function SignUpAndSignIn({ isActive, data }: Props) {
  return (
    <SignInExperienceTabWrapper isActive={isActive}>
      {isActive && (
        <PageMeta titleKey={['sign_in_exp.tabs.sign_up_and_sign_in', 'sign_in_exp.page_title']} />
      )}
      <SignUpFrom signInExperience={data} />
      <SignInForm signInExperience={data} />
      <SocialSignInForm />
      <AdvancedOptions />
    </SignInExperienceTabWrapper>
  );
}

export default SignUpAndSignIn;
