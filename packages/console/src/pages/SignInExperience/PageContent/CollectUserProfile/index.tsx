import { Theme, type CustomProfileField } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import classNames from 'classnames';
import { useContext, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Plus from '@/assets/icons/plus.svg?react';
import CollectUserProfileEmptyDark from '@/assets/images/collect-user-profile-empty-dark.svg?react';
import CollectUserProfileEmpty from '@/assets/images/collect-user-profile-empty.svg?react';
import RequestErrorDarkImage from '@/assets/images/request-error-dark.svg?react';
import RequestErrorImage from '@/assets/images/request-error.svg?react';
import PageMeta from '@/components/PageMeta';
import { collectUserProfile } from '@/consts';
import { latestProPlanId } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import TablePlaceholder from '@/ds-components/Table/TablePlaceholder';
import { type RequestError } from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useTheme from '@/hooks/use-theme';
import { isPaidPlan } from '@/utils/subscription';

import SignInExperienceTabWrapper from '../components/SignInExperienceTabWrapper';

import CreateProfileFieldModal from './CreateProfileFieldModal';
import ProfileFieldList from './ProfileFieldList';
import { collectUserProfilePathname } from './consts';
import styles from './index.module.scss';

type Props = {
  readonly isActive: boolean;
};

type CreateButtonProps = {
  readonly className?: string;
  readonly size: 'medium' | 'large';
};

function CreateButton({ size, className }: CreateButtonProps) {
  const { navigate } = useTenantPathname();
  return (
    <Button
      className={className}
      title="sign_in_exp.custom_profile_fields.table.add_button"
      type="primary"
      size={size}
      icon={<Plus />}
      onClick={() => {
        navigate(`${collectUserProfilePathname}/create`);
      }}
    />
  );
}

function Skeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, rowIndex) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={`row-${rowIndex}`} className={classNames(styles.row, styles.skeleton)}>
          <div className={classNames(styles.cell, styles.itemPreview)}>
            <div className={styles.avatar} />
            <div className={styles.content}>
              <div className={styles.title} />
              <div className={styles.subTitle} />
            </div>
          </div>
          <div className={styles.cell}>
            <div className={styles.bone} />
          </div>
          <div className={styles.cell}>
            <div className={styles.bone} />
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyPlaceholder({ children }: { readonly children: ReactNode }) {
  return (
    <div className={styles.emptyPlaceholder}>
      <div className={styles.topSpace} />
      {children}
      <div className={styles.bottomSpace} />
    </div>
  );
}

function TableError({
  errorMessage,
  onRetry,
}: {
  readonly errorMessage?: string;
  readonly onRetry?: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  return (
    <div className={styles.errorContainer}>
      {theme === Theme.Light ? <RequestErrorImage /> : <RequestErrorDarkImage />}
      <div className={styles.label}>{t('errors.something_went_wrong')}</div>
      <div className={styles.errorMessage}>{errorMessage ?? t('errors.unknown_server_error')}</div>
      {onRetry && <Button title="general.retry" onClick={onRetry} />}
    </div>
  );
}

function CollectUserProfile({ isActive }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate, match } = useTenantPathname();

  const isCreating = match(`${collectUserProfilePathname}/create`);

  const { data, error, isLoading, mutate } = useSWR<CustomProfileField[], RequestError>(
    'api/custom-profile-fields'
  );

  const {
    currentSubscription: { planId, isEnterprisePlan },
  } = useContext(SubscriptionDataContext);
  const isPaidTenant = isPaidPlan(planId, isEnterprisePlan);

  return (
    <>
      <SignInExperienceTabWrapper isActive={isActive}>
        {isActive && (
          <PageMeta
            titleKey={['sign_in_exp.tabs.collect_user_profile', 'sign_in_exp.page_title']}
          />
        )}
        <div className={styles.tableContainer}>
          <div className={styles.buttonWrapper}>
            <CreateButton size="medium" />
          </div>
          <div className={classNames(styles.row, styles.header)}>
            <div className={styles.cell}>
              {t('sign_in_exp.custom_profile_fields.table.title.field_label')}
            </div>
            <div className={styles.cell}>
              {t('sign_in_exp.custom_profile_fields.table.title.type')}
            </div>
            <div className={styles.cell}>
              {t('sign_in_exp.custom_profile_fields.table.title.user_data_key')}
            </div>
          </div>
          {isLoading && <Skeleton />}
          {!isLoading && !data?.length && (
            <EmptyPlaceholder>
              <TablePlaceholder
                image={<CollectUserProfileEmpty />}
                imageDark={<CollectUserProfileEmptyDark />}
                title="sign_in_exp.custom_profile_fields.table.placeholder.title"
                description="sign_in_exp.custom_profile_fields.table.placeholder.description"
                learnMoreLink={{ href: collectUserProfile }}
                action={<CreateButton size="large" />}
                paywall={cond(!isPaidTenant && latestProPlanId)}
              />
            </EmptyPlaceholder>
          )}
          {error && (
            <TableError
              errorMessage={error.body?.message ?? error.message}
              onRetry={async () => mutate(undefined, true)}
            />
          )}
          {data && data.length > 0 && <ProfileFieldList data={data} />}
        </div>
      </SignInExperienceTabWrapper>
      {isCreating && (
        <CreateProfileFieldModal
          existingFieldNames={data?.map(({ name }) => name) ?? []}
          onClose={(field?: CustomProfileField) => {
            if (field) {
              void mutate();
              navigate(`${collectUserProfilePathname}/fields/${field.name}`);
              return;
            }
            navigate(collectUserProfilePathname);
          }}
        />
      )}
    </>
  );
}

export default CollectUserProfile;
