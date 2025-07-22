import { type CustomProfileField } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import useSWR, { mutate } from 'swr';

import Plus from '@/assets/icons/plus.svg?react';
import CollectUserProfileEmptyDark from '@/assets/images/collect-user-profile-empty-dark.svg?react';
import CollectUserProfileEmpty from '@/assets/images/collect-user-profile-empty.svg?react';
import PageMeta from '@/components/PageMeta';
import { collectUserProfile } from '@/consts';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import Table from '@/ds-components/Table';
import TablePlaceholder from '@/ds-components/Table/TablePlaceholder';
import Tag from '@/ds-components/Tag';
import { type RequestError } from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import pageLayout from '@/scss/page-layout.module.scss';

import SignInExperienceTabWrapper from '../components/SignInExperienceTabWrapper';

import styles from './index.module.scss';
import { isBuiltInCustomProfileFieldKey } from './utils';

type Props = {
  readonly isActive: boolean;
};

type CreateButtonProps = {
  readonly className?: string;
  readonly size: 'large' | 'small';
};

function CreateButton({ size, className }: CreateButtonProps) {
  const { navigate } = useTenantPathname();
  return (
    <Button
      className={className}
      title="connectors.create"
      type="primary"
      size={size}
      icon={<Plus />}
      onClick={() => {
        navigate('/sign-in-exp/collect-user-profile/create');
      }}
    />
  );
}

function CollectUserProfile({ isActive }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.sign_in_exp' });
  const { navigate } = useTenantPathname();

  const {
    data: customProfileFields,
    error,
    isLoading,
  } = useSWR<CustomProfileField[], RequestError>('api/custom-profile-fields');

  return (
    <SignInExperienceTabWrapper isActive={isActive}>
      {isActive && (
        <PageMeta titleKey={['sign_in_exp.tabs.collect_user_profile', 'sign_in_exp.page_title']} />
      )}
      <Table
        className={pageLayout.table}
        filter={
          <div className={styles.buttonWrapper}>
            <CreateButton size="small" />
          </div>
        }
        rowIndexKey="id"
        rowGroups={[{ key: 'customProfileFields', data: customProfileFields }]}
        columns={[
          {
            title: t('custom_profile_fields.table.title.field_label'),
            dataIndex: 'name',
            colSpan: 3,
            render: ({ name, label }) =>
              isBuiltInCustomProfileFieldKey(name) ? (
                <DynamicT forKey={`profile.fields.${name}`} />
              ) : (
                label
              ),
          },
          {
            title: t('custom_profile_fields.table.title.type'),
            dataIndex: 'type',
            colSpan: 3,
            render: ({ type }) => t(`custom_profile_fields.type.${type}`),
          },
          {
            title: t('custom_profile_fields.table.title.user_data_key'),
            dataIndex: 'data-key',
            colSpan: 4,
            render: ({ name, config }) => {
              const { parts } = config;
              const keys = parts
                ?.filter(({ enabled }) => Boolean(enabled))
                .map(({ key }) => key) ?? [name];

              return (
                <div className={styles.tags}>
                  {keys.map((key) => (
                    <Tag key={key} variant="cell">
                      {key}
                    </Tag>
                  ))}
                </div>
              );
            },
          },
        ]}
        rowClickHandler={({ name }) => {
          navigate(`/sign-in-experience/collect-user-profile/${name}`);
        }}
        isLoading={isLoading}
        errorMessage={error?.body?.message ?? error?.message}
        placeholder={
          <TablePlaceholder
            image={<CollectUserProfileEmpty />}
            imageDark={<CollectUserProfileEmptyDark />}
            title="sign_in_exp.custom_profile_fields.table.placeholder.title"
            description="sign_in_exp.custom_profile_fields.table.placeholder.description"
            learnMoreLink={{ href: collectUserProfile }}
            action={<CreateButton size="large" />}
          />
        }
        onRetry={async () => mutate(undefined, true)}
      />
    </SignInExperienceTabWrapper>
  );
}

export default CollectUserProfile;
