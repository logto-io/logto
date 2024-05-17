import PageMeta from '@/components/PageMeta';

import SignInExperienceTabWrapper from '../components/SignInExperienceTabWrapper';

import AdvancedOptions from './AdvancedOptions';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import SocialSignInForm from './SocialSignInForm';

type Props = {
  readonly isActive: boolean;
};

function SignUpAndSignIn({ isActive }: Props) {
  return (
    <SignInExperienceTabWrapper isActive={isActive}>
      {isActive && (
        <PageMeta titleKey={['sign_in_exp.tabs.sign_up_and_sign_in', 'sign_in_exp.page_title']} />
      )}
      <SignUpForm />
      <SignInForm />
      <SocialSignInForm />
      <AdvancedOptions />
    </SignInExperienceTabWrapper>
  );
}

export default SignUpAndSignIn;
