import { type SignInExperiencePageManagedData } from '@/pages/SignInExperience/types';

import ForgotPasswordMethodsDiffSection from './ForgotPasswordMethodsDiffSection';
import SignInDiffSection from './SignInDiffSection';
import SignUpDiffSection from './SignUpDiffSection';
import SocialTargetsDiffSection from './SocialTargetsDiffSection';

type Props = {
  readonly before: SignInExperiencePageManagedData;
  readonly after: SignInExperiencePageManagedData;
  readonly isAfter?: boolean;
};

function SignUpAndSignInDiffSection({ before, after, isAfter = false }: Props) {
  return (
    <>
      <SignUpDiffSection before={before.signUp} after={after.signUp} isAfter={isAfter} />
      <SignInDiffSection
        before={before.signIn.methods}
        after={after.signIn.methods}
        isAfter={isAfter}
      />
      <SocialTargetsDiffSection
        before={before.socialSignInConnectorTargets}
        after={after.socialSignInConnectorTargets}
        isAfter={isAfter}
      />
      <ForgotPasswordMethodsDiffSection
        before={before.forgotPasswordMethods ?? undefined}
        after={after.forgotPasswordMethods ?? undefined}
        isAfter={isAfter}
      />
    </>
  );
}

export default SignUpAndSignInDiffSection;
