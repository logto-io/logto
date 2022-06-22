import { User } from '@logto/schemas';
import { Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useController, useForm } from 'react-hook-form';
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
import { uriValidator } from '@/utilities/validator';

import CreateSuccess from './components/CreateSuccess';
import DeleteForm from './components/DeleteForm';
import ResetPasswordForm from './components/ResetPasswordForm';
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
  const location = useLocation();
  const isLogs = location.pathname.endsWith('/logs');
  const { userId } = useParams();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
  const [isResetPasswordFormOpen, setIsResetPasswordFormOpen] = useState(false);

  const { data, error, mutate } = useSWR<User, RequestError>(userId && `/api/users/${userId}`);
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

  return (
    <div className={detailsStyles.container}>
      <LinkButton
        to="/users"
        icon={<Back />}
        title="admin_console.user_details.back_to_users"
        className={styles.backLink}
      />
      {isLoading && <DetailsSkeleton />}
      {!data && error && <div>{`error occurred: ${error.body?.message ?? error.message}`}</div>}
      {userId && data && (
        <>
          <Card className={styles.header}>
            <img className={styles.avatar} src={data.avatar ?? getAvatarById(userId)} />
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
                  iconClassName={styles.resetIcon}
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
              <TabNavItem href={`/users/${userId}`}>{t('user_details.tab_settings')}</TabNavItem>
              <TabNavItem href={`/users/${userId}/logs`}>{t('user_details.tab_logs')}</TabNavItem>
            </TabNav>
            {isLogs ? (
              <div className={styles.logs}>
                <AuditLogTable userId={data.id} />
              </div>
            ) : (
              <form className={styles.form} onSubmit={onSubmit}>
                <div className={styles.fields}>
                  {getValues('primaryEmail') && (
                    <FormField
                      title="admin_console.user_details.field_email"
                      className={styles.textField}
                    >
                      <TextInput readOnly {...register('primaryEmail')} />
                    </FormField>
                  )}
                  {getValues('primaryPhone') && (
                    <FormField
                      title="admin_console.user_details.field_phone"
                      className={styles.textField}
                    >
                      <TextInput readOnly {...register('primaryPhone')} />
                    </FormField>
                  )}
                  {getValues('username') && (
                    <FormField
                      title="admin_console.user_details.field_username"
                      className={styles.textField}
                    >
                      <TextInput readOnly {...register('username')} />
                    </FormField>
                  )}
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
