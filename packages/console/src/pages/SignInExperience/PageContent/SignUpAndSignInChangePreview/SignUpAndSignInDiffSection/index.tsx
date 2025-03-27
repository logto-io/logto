import type { SignInExperience } from '@logto/schemas';

import { isDevFeaturesEnabled } from '@/consts/env';

import SignInDiffSection from './SignInDiffSection';
import SignUpDiffSection, { NewSignUpDiffSection } from './SignUpDiffSection';
import SocialTargetsDiffSection from './SocialTargetsDiffSection';

type Props = {
  readonly before: SignInExperience;
  readonly after: SignInExperience;
  readonly isAfter?: boolean;
};

function SignUpAndSignInDiffSection({ before, after, isAfter = false }: Props) {
  return (
    <>
      {isDevFeaturesEnabled ? (
        <NewSignUpDiffSection before={before.signUp} after={after.signUp} isAfter={isAfter} />
      ) : (
        <SignUpDiffSection before={before.signUp} after={after.signUp} isAfter={isAfter} />
      )}
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
    </>
  );
}

export default SignUpAndSignInDiffSection;
