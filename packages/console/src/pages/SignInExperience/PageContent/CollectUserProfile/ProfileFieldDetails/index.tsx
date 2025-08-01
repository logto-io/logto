import { type CustomProfileField } from '@logto/schemas';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import DetailsPage from '@/components/DetailsPage';
import PageMeta from '@/components/PageMeta';
import { type RequestError } from '@/hooks/use-api';

import { collectUserProfilePathname } from '../consts';

import ProfileFieldDetailsForm from './ProfileFieldDetailsForm';

function ProfileFieldDetails() {
  const { fieldName } = useParams();

  const { data, error, mutate, isLoading } = useSWR<CustomProfileField, RequestError>(
    `api/custom-profile-fields/${fieldName}`
  );

  if (!fieldName) {
    return null;
  }

  return (
    <DetailsPage
      backLink={collectUserProfilePathname}
      backLinkTitle="sign_in_exp.custom_profile_fields.details.back_to_sie"
      isLoading={isLoading}
      error={error}
      onRetry={mutate}
    >
      <PageMeta titleKey="sign_in_exp.custom_profile_fields.details.page_title" />
      {data && <ProfileFieldDetailsForm data={data} />}
    </DetailsPage>
  );
}

export default ProfileFieldDetails;
