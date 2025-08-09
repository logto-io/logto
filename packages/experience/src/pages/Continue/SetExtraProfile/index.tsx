import { CustomProfileFieldType, type FieldPart } from '@logto/schemas';
import { useContext, useMemo } from 'react';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import PageContext from '@/Providers/PageContextProvider/PageContext';
import { type ContinueFlowInteractionEvent } from '@/types';

import ExtraProfileForm from '../ExtraProfileForm';

import { useSetExtraProfile } from './use-set-extra-profile';

type Props = {
  readonly interactionEvent: ContinueFlowInteractionEvent;
};

const getDefaultParts = (parts?: FieldPart[]) =>
  Object.fromEntries(parts?.map(({ name, config }) => [name, config?.defaultValue ?? '']) ?? []);

const SetExtraProfile = ({ interactionEvent }: Props) => {
  const { experienceSettings } = useContext(PageContext);
  const submit = useSetExtraProfile(interactionEvent);

  const defaultValues = useMemo(() => {
    return experienceSettings?.customProfileFields?.reduce(
      (accumulator, { type, name, config }) => {
        if (type === CustomProfileFieldType.Address) {
          return { ...accumulator, address: getDefaultParts(config.parts) };
        }
        if (type === CustomProfileFieldType.Fullname) {
          return { ...accumulator, ...getDefaultParts(config.parts) };
        }
        return { ...accumulator, [name]: config.defaultValue ?? '' };
      },
      {} satisfies Record<string, unknown>
    );
  }, [experienceSettings?.customProfileFields]);

  return (
    <SecondaryPageLayout title="description.about_yourself">
      <ExtraProfileForm
        customProfileFields={[...(experienceSettings?.customProfileFields ?? [])]}
        defaultValues={defaultValues}
        onSubmit={submit}
      />
    </SecondaryPageLayout>
  );
};

export default SetExtraProfile;
