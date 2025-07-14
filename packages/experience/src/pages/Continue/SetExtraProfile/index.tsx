import { useContext } from 'react';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import PageContext from '@/Providers/PageContextProvider/PageContext';
import { type ContinueFlowInteractionEvent } from '@/types';

import ExtraProfileForm from '../ExtraProfileForm';

import { useSetExtraProfile } from './use-set-extra-profile';

type Props = {
  readonly interactionEvent: ContinueFlowInteractionEvent;
};

const SetExtraProfile = ({ interactionEvent }: Props) => {
  const { experienceSettings } = useContext(PageContext);
  const submit = useSetExtraProfile(interactionEvent);

  return (
    <SecondaryPageLayout title="description.about_yourself">
      <ExtraProfileForm
        customProfileFields={[...(experienceSettings?.customProfileFields ?? [])]}
        onSubmit={submit}
      />
    </SecondaryPageLayout>
  );
};

export default SetExtraProfile;
