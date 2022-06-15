import { I18nKey } from '@logto/phrases';
import { User } from '@logto/schemas';
import { conditionalString, Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Controller, FieldPath, useController, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useLocation, useParams } from 'react-router-dom';
import useSWR from 'swr';

import ActionMenu, { ActionMenuItem } from '@/components/ActionMenu';
import AuditLogTable from '@/components/AuditLogTable';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CodeEditor from '@/components/CodeEditor';
import CopyToClipboard from '@/components/CopyToClipboard';
import DetailsSkeleton from '@/components/DetailsSkeleton';
import FormField from '@/components/FormField';
import LinkButton from '@/components/LinkButton';
import TabNav, { TabNavItem } from '@/components/TabNav';
import TextInput from '@/components/TextInput';
import { getAvatarById } from '@/consts/avatars';
import useApi, { RequestError } from '@/hooks/use-api';
import Back from '@/icons/Back';
import Delete from '@/icons/Delete';
import More from '@/icons/More';
import Reset from '@/icons/Reset';
import * as detailsStyles from '@/scss/details.module.scss';
import * as modalStyles from '@/scss/modal.module.scss';
import { safeParseJson } from '@/utilities/json';
import { queryStringify } from '@/utilities/query-stringify';
import { uriValidator } from '@/utilities/validator';

import CreateSuccess from './components/CreateSuccess';
import DeleteForm from './components/DeleteForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import RoleSelect from './components/RoleSelect';
import UserConnectors from './components/UserConnectors';
import * as styles from './index.module.scss';

type FormData = {
  primaryEmail: Nullable<string>;
  primaryPhone: Nullable<string>;
  username: Nullable<string>;
  name: Nullable<string>;
  avatar: Nullable<string>;
  roleNames: string[];
  customData: string;
};

const UserDetails = () => {
  const { pathname, state: locationState } = useLocation();
  const isLogs = pathname.endsWith('/logs');
  const { id } = useParams();
  const backLink = `/users${conditionalString(
    locationState && `?${queryStringify(locationState as Record<string, string>)}`
  )}`;
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
  const [isResetPasswordFormOpen, setIsResetPasswordFormOpen] = useState(false);
  const { data, error, mutate } = useSWR<User, RequestError>(id && `/api/users/${id}`);
  const isLoading = !data && !error;

  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { isSubmitting, errors },
    getValues,
  } = useForm<FormData>();

  const {
    field: { onChange, value },
  } = useController({ name: 'customData', control, rules: { required: true } });
  const api = useApi();

  useEffect(() => {
    if (!data) {
      return;
    }
    reset({
      ...data,
      customData: JSON.stringify(data.customData, null, 2),
    });
  }, [data, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    if (!data || isSubmitting) {
      return;
    }

    const customData = safeParseJson(formData.customData);

    if (!customData) {
      toast.error(t('user_details.custom_data_invalid'));

      return;
    }

    const payload: Partial<User> = {
      name: formData.name,
      avatar: formData.avatar,
      roleNames: formData.roleNames,
      customData,
    };

    const updatedUser = await api.patch(`/api/users/${data.id}`, { json: payload }).json<User>();
    void mutate(updatedUser);
    toast.success(t('user_details.saved'));
  });

  const renderReadOnlyField = (field: FieldPath<FormData>, title: I18nKey) =>
    getValues(field) && (
      <FormField title={title} className={styles.textField}>
        <TextInput readOnly {...register(field)} />
      </FormField>
    );

  return (
    <div className={detailsStyles.container}>
      <LinkButton
        to={backLink}
        icon={<Back />}
        title="admin_console.user_details.back_to_users"
        className={styles.backLink}
      />
      {isLoading && <DetailsSkeleton />}
      {!data && error && <div>{`error occurred: ${error.body?.message ?? error.message}`}</div>}
      {id && data && (
        <>
          <Card className={styles.header}>
            <img className={styles.avatar} src={data.avatar ?? getAvatarById(id)} />
            <div className={styles.metadata}>
              <div className={styles.name}>{data.name ?? '-'}</div>
              <div>
                {data.username && (
                  <>
                    <div className={styles.username}>{data.username}</div>
                    <div className={styles.verticalBar} />
                  </>
                )}
                <div className={styles.text}>User ID</div>
                <CopyToClipboard value={data.id} />
              </div>
            </div>
            <div>
              <ActionMenu
                buttonProps={{ icon: <More className={styles.moreIcon} />, size: 'large' }}
                title={t('user_details.more_options')}
              >
                <ActionMenuItem
                  icon={<Reset />}
                  onClick={() => {
                    setIsResetPasswordFormOpen(true);
                  }}
                >
                  {t('user_details.reset_password.reset_password')}
                </ActionMenuItem>
                <ActionMenuItem
                  icon={<Delete />}
                  type="danger"
                  onClick={() => {
                    setIsDeleteFormOpen(true);
                  }}
                >
                  {t('user_details.menu_delete')}
                </ActionMenuItem>
              </ActionMenu>
              <ReactModal
                isOpen={isResetPasswordFormOpen}
                className={modalStyles.content}
                overlayClassName={modalStyles.overlay}
              >
                <ResetPasswordForm
                  userId={data.id}
                  onClose={() => {
                    setIsResetPasswordFormOpen(false);
                  }}
                />
              </ReactModal>
              <ReactModal
                isOpen={isDeleteFormOpen}
                className={modalStyles.content}
                overlayClassName={modalStyles.overlay}
              >
                <DeleteForm
                  id={data.id}
                  onClose={() => {
                    setIsDeleteFormOpen(false);
                  }}
                />
              </ReactModal>
            </div>
          </Card>
          <Card className={classNames(styles.body, detailsStyles.body)}>
            <TabNav>
              <TabNavItem href={`/users/${id}`} locationState={locationState}>
                {t('user_details.tab_settings')}
              </TabNavItem>
              <TabNavItem href={`/users/${id}/logs`} locationState={locationState}>
                {t('user_details.tab_logs')}
              </TabNavItem>
            </TabNav>
            {isLogs ? (
              <div className={styles.logs}>
                <AuditLogTable userId={data.id} />
              </div>
            ) : (
              <form className={styles.form} onSubmit={onSubmit}>
                <div className={styles.fields}>
                  {renderReadOnlyField('primaryEmail', 'admin_console.user_details.field_email')}
                  {renderReadOnlyField('primaryPhone', 'admin_console.user_details.field_phone')}
                  {renderReadOnlyField('username', 'admin_console.user_details.field_username')}
                  <FormField
                    title="admin_console.user_details.field_name"
                    className={styles.textField}
                  >
                    <TextInput {...register('name')} />
                  </FormField>
                  <FormField
                    title="admin_console.user_details.field_avatar"
                    className={styles.textField}
                  >
                    <TextInput
                      {...register('avatar', {
                        validate: (value) =>
                          !value || uriValidator(value) || t('errors.invalid_uri_format'),
                      })}
                      hasError={Boolean(errors.avatar)}
                      errorMessage={errors.avatar?.message}
                    />
                  </FormField>
                  <FormField
                    title="admin_console.user_details.field_roles"
                    className={styles.textField}
                  >
                    <Controller
                      name="roleNames"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <RoleSelect value={value} onChange={onChange} />
                      )}
                    />
                  </FormField>
                  <FormField
                    title="admin_console.user_details.field_connectors"
                    className={styles.textField}
                  >
                    <UserConnectors
                      userId={data.id}
                      connectors={data.identities}
                      onDelete={() => {
                        void mutate();
                      }}
                    />
                  </FormField>
                  <FormField
                    isRequired
                    title="admin_console.user_details.field_custom_data"
                    className={styles.textField}
                  >
                    <CodeEditor language="json" value={value} onChange={onChange} />
                  </FormField>
                </div>
                <div className={detailsStyles.footer}>
                  <div className={detailsStyles.footerMain}>
                    <Button
                      isLoading={isSubmitting}
                      htmlType="submit"
                      type="primary"
                      title="admin_console.user_details.save_changes"
                      size="large"
                    />
                  </div>
                </div>
              </form>
            )}
          </Card>
        </>
      )}
      {data && <CreateSuccess username={data.username ?? '-'} />}
    </div>
  );
};

export default UserDetails;
