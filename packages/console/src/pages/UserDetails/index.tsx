import { User } from '@logto/schemas';
import React, { useEffect, useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import ActionMenu, { ActionMenuItem } from '@/components/ActionMenu';
import BackLink from '@/components/BackLink';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CodeEditor from '@/components/CodeEditor';
import CopyToClipboard from '@/components/CopyToClipboard';
import FormField from '@/components/FormField';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import TabNav, { TabNavLink } from '@/components/TabNav';
import TextInput from '@/components/TextInput';
import useApi, { RequestError } from '@/hooks/use-api';
import Delete from '@/icons/Delete';
import More from '@/icons/More';
import Reset from '@/icons/Reset';
import * as modalStyles from '@/scss/modal.module.scss';
import { safeParseJson } from '@/utilities/json';

import CreateSuccess from './components/CreateSuccess';
import DeleteForm from './components/DeleteForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import * as styles from './index.module.scss';

type FormData = {
  primaryEmail: string;
  primaryPhone: string;
  username: string;
  name: string;
  avatar: string;
  roles: string;
  customData: string;
};

const UserDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
  const [isResetPasswordFormOpen, setIsResetPasswordFormOpen] = useState(false);

  const { data, error, mutate } = useSWR<User, RequestError>(id && `/api/users/${id}`);
  const isLoading = !data && !error;

  const { handleSubmit, register, control, reset } = useForm<FormData>();
  const [submitting, setSubmitting] = useState(false);
  const {
    field: { onChange, value },
  } = useController({ name: 'customData', control, rules: { required: true } });
  const api = useApi();

  useEffect(() => {
    if (!data) {
      return;
    }
    reset({
      primaryEmail: data.primaryEmail ?? '',
      primaryPhone: data.primaryPhone ?? '',
      username: data.username ?? '',
      name: data.name ?? '',
      avatar: data.avatar ?? '',
      roles: data.roleNames.join(','),
      customData: JSON.stringify(data.customData, null, 2),
    });
  }, [data, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    if (!data || submitting) {
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
      customData,
    };
    setSubmitting(true);

    try {
      const updatedUser = await api.patch(`/api/users/${data.id}`, { json: payload }).json<User>();
      void mutate(updatedUser);
      toast.success(t('user_details.saved'));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className={styles.container}>
      <BackLink to="/users">{t('user_details.back_to_users')}</BackLink>

      {isLoading && <div>loading</div>}
      {error && <div>{`error occurred: ${error.metadata.code}`}</div>}
      {id && data && (
        <>
          <Card className={styles.header}>
            <ImagePlaceholder size={76} borderRadius={16} />
            <div className={styles.metadata}>
              <div className={styles.name}>{data.name ?? '-'}</div>
              <div>
                <div className={styles.username}>{data.username}</div>
                <div className={styles.verticalBar} />
                <div className={styles.text}>User ID</div>
                <CopyToClipboard value={data.id} className={styles.copy} />
              </div>
            </div>
            <div>
              <ActionMenu buttonProps={{ icon: <More /> }} title={t('user_details.more_options')}>
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
          <Card className={styles.body}>
            <TabNav>
              <TabNavLink href={`/users/${id}`}>{t('user_details.tab_settings')}</TabNavLink>
              <TabNavLink href={`/users/${id}/logs`}>{t('user_details.tab_logs')}</TabNavLink>
            </TabNav>
            <form className={styles.form} onSubmit={onSubmit}>
              <div className={styles.fields}>
                <FormField
                  title="admin_console.user_details.field_email"
                  className={styles.textField}
                >
                  <TextInput readOnly {...register('primaryEmail')} />
                </FormField>
                <FormField
                  title="admin_console.user_details.field_phone"
                  className={styles.textField}
                >
                  <TextInput readOnly {...register('primaryPhone')} />
                </FormField>
                <FormField
                  title="admin_console.user_details.field_username"
                  className={styles.textField}
                >
                  <TextInput readOnly {...register('username')} />
                </FormField>
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
                  <TextInput {...register('avatar')} />
                </FormField>
                <FormField
                  title="admin_console.user_details.field_roles"
                  className={styles.textField}
                >
                  <TextInput readOnly {...register('roles')} />
                </FormField>
                <FormField
                  isRequired
                  title="admin_console.user_details.field_custom_data"
                  className={styles.textField}
                >
                  <CodeEditor height="200px" language="json" value={value} onChange={onChange} />
                </FormField>
              </div>
              <div className={styles.submit}>
                <Button
                  disabled={submitting}
                  htmlType="submit"
                  type="primary"
                  title="admin_console.user_details.save_changes"
                  size="large"
                />
              </div>
            </form>
          </Card>
        </>
      )}
      {data && <CreateSuccess username={data.username ?? '-'} />}
    </div>
  );
};

export default UserDetails;
