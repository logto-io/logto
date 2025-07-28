import { Theme, type CustomProfileField } from '@logto/schemas';
import classNames from 'classnames';
import { type ReactNode, useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR, { mutate } from 'swr';

import Draggable from '@/assets/icons/draggable.svg?react';
import Plus from '@/assets/icons/plus.svg?react';
import CollectUserProfileEmptyDark from '@/assets/images/collect-user-profile-empty-dark.svg?react';
import CollectUserProfileEmpty from '@/assets/images/collect-user-profile-empty.svg?react';
import RequestErrorDarkImage from '@/assets/images/request-error-dark.svg?react';
import RequestErrorImage from '@/assets/images/request-error.svg?react';
import PageMeta from '@/components/PageMeta';
import { collectUserProfile } from '@/consts';
import Button from '@/ds-components/Button';
import { DraggableItem } from '@/ds-components/DragDrop';
import DragDropProvider from '@/ds-components/DragDrop/DragDropProvider';
import TablePlaceholder from '@/ds-components/Table/TablePlaceholder';
import Tag from '@/ds-components/Tag';
import useApi, { type RequestError } from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useTheme from '@/hooks/use-theme';
import { onKeyDownHandler } from '@/utils/a11y';
import { trySubmitSafe } from '@/utils/form';

import SignInExperienceTabWrapper from '../components/SignInExperienceTabWrapper';

import CreateProfileFieldModal from './CreateProfileFieldModal';
import { useDataParser } from './ProfileFieldDetails/hooks';
import styles from './index.module.scss';

type Props = {
  readonly isActive: boolean;
};

type CreateButtonProps = {
  readonly className?: string;
  readonly size: 'large' | 'small';
};

type CustomProfileFieldsForm = {
  readonly fields: CustomProfileField[];
};

const collectUserProfilePathname = '/sign-in-experience/collect-user-profile';
const createCollectUserProfilePathname = `${collectUserProfilePathname}/create`;
const collectUserProfileDetailsPathname = `${collectUserProfilePathname}/fields/:fieldName`;

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
        navigate(createCollectUserProfilePathname);
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
  const api = useApi();

  const isCreating = match(createCollectUserProfilePathname);

  const {
    data: customProfileFields,
    error,
    isLoading,
  } = useSWR<CustomProfileField[], RequestError>('api/custom-profile-fields');

  const { control, handleSubmit, reset } = useForm<CustomProfileFieldsForm>();
  const { fields, swap } = useFieldArray({ control, name: 'fields' });

  const { getDefaultLabel } = useDataParser();

  useEffect(() => {
    if (customProfileFields) {
      reset({ fields: customProfileFields });
    }
  }, [customProfileFields, reset]);

  const updateSortingOrders = handleSubmit(
    trySubmitSafe(async ({ fields }) => {
      const result = await api
        .post('api/custom-profile-fields/properties/sie-order', {
          json: { order: fields.map(({ name }, index) => ({ name, sieOrder: index + 1 })) },
        })
        .json<CustomProfileField[]>();

      reset({ fields: result });
      toast.success(t('general.saved'));
    })
  );

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
            <CreateButton size="small" />
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
          {!isLoading && !customProfileFields?.length && (
            <EmptyPlaceholder>
              <TablePlaceholder
                image={<CollectUserProfileEmpty />}
                imageDark={<CollectUserProfileEmptyDark />}
                title="sign_in_exp.custom_profile_fields.table.placeholder.title"
                description="sign_in_exp.custom_profile_fields.table.placeholder.description"
                learnMoreLink={{ href: collectUserProfile }}
                action={<CreateButton size="large" />}
              />
            </EmptyPlaceholder>
          )}
          {error && (
            <TableError
              errorMessage={error.body?.message ?? error.message}
              onRetry={async () => mutate(undefined, true)}
            />
          )}
          {!isLoading && fields.length > 0 && (
            <DragDropProvider>
              {fields.map(({ id, name, label, type, config }, index) => (
                <DraggableItem
                  key={id}
                  id={id}
                  sortIndex={index}
                  moveItem={swap}
                  dropItem={async () => updateSortingOrders()}
                  className={styles.draggleItemContainer}
                >
                  <div
                    className={styles.row}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      navigate(collectUserProfileDetailsPathname.replace(':fieldName', name));
                    }}
                    onKeyDown={onKeyDownHandler(() => {
                      navigate(collectUserProfileDetailsPathname.replace(':fieldName', name));
                    })}
                  >
                    <div className={styles.cell}>
                      <Draggable className={styles.draggableIcon} />
                      <span className={styles.fieldName}>{label || getDefaultLabel(name)}</span>
                    </div>
                    <div className={styles.cell}>
                      {t(`sign_in_exp.custom_profile_fields.type.${type}`)}
                    </div>
                    <div className={styles.cell}>
                      <div className={styles.tags}>
                        {(
                          config.parts
                            ?.filter(({ enabled }) => Boolean(enabled))
                            .map((part) => part.name) ?? [name]
                        ).map((key) => (
                          <Tag key={key} variant="cell">
                            {key}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  </div>
                </DraggableItem>
              ))}
            </DragDropProvider>
          )}
        </div>
      </SignInExperienceTabWrapper>
      {isCreating && (
        <CreateProfileFieldModal
          existingFieldNames={customProfileFields?.map(({ name }) => name) ?? []}
          onClose={(fieldName?: string) => {
            if (fieldName) {
              navigate(`${createCollectUserProfilePathname}/${fieldName}`);
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
