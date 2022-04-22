import { Application, SnakeCaseOidcConfig } from '@logto/schemas';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import { useLocation, useParams } from 'react-router-dom';
import useSWR from 'swr';

import ActionMenu, { ActionMenuItem } from '@/components/ActionMenu';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CopyToClipboard from '@/components/CopyToClipboard';
import Drawer from '@/components/Drawer';
import FormField from '@/components/FormField';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import LinkButton from '@/components/LinkButton';
import MultiTextInput from '@/components/MultiTextInput';
import { convertRhfErrorMessage, createValidatorForRhf } from '@/components/MultiTextInput/utils';
import TabNav, { TabNavLink } from '@/components/TabNav';
import TextInput from '@/components/TextInput';
import useApi, { RequestError } from '@/hooks/use-api';
import Back from '@/icons/Back';
import Delete from '@/icons/Delete';
import More from '@/icons/More';
import * as detailsStyles from '@/scss/details.module.scss';
import * as modalStyles from '@/scss/modal.module.scss';
import { applicationTypeI18nKey } from '@/types/applications';
import { noSpaceRegex } from '@/utilities/regex';

import DeleteForm from './components/DeleteForm';
import * as styles from './index.module.scss';

const ApplicationDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { data, error, mutate } = useSWR<Application, RequestError>(
    id && `/api/applications/${id}`
  );

  const { data: oidcConfig, error: fetchOidcConfigError } = useSWR<
    SnakeCaseOidcConfig,
    RequestError
  >('/oidc/.well-known/openid-configuration');
  const isLoading = !data && !error && !oidcConfig && !fetchOidcConfigError;

  const [isReadmeOpen, setIsReadmeOpen] = useState(false);

  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
  const api = useApi();

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { isSubmitting },
  } = useForm<Application>();

  useEffect(() => {
    if (!data) {
      return;
    }

    reset(data);
  }, [data, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    if (!data || isSubmitting) {
      return;
    }

    const updatedApplication = await api
      .patch(`/api/applications/${data.id}`, {
        json: {
          ...formData,
          oidcClientMetadata: {
            ...formData.oidcClientMetadata,
            redirectUris: formData.oidcClientMetadata.redirectUris.filter(Boolean),
            postLogoutRedirectUris:
              formData.oidcClientMetadata.postLogoutRedirectUris.filter(Boolean),
          },
        },
      })
      .json<Application>();
    void mutate(updatedApplication);
    toast.success(t('application_details.save_success'));
  });

  const isAdvancedSettings = location.pathname.includes('advanced-settings');

  const SettingsPage = oidcConfig && (
    <>
      <FormField
        isRequired
        title="admin_console.application_details.application_name"
        className={styles.textField}
      >
        <TextInput {...register('name', { required: true })} />
      </FormField>
      <FormField title="admin_console.application_details.description" className={styles.textField}>
        <TextInput {...register('description')} />
      </FormField>
      <FormField
        title="admin_console.application_details.authorization_endpoint"
        className={styles.textField}
      >
        <CopyToClipboard className={styles.textField} value={oidcConfig.authorization_endpoint} />
      </FormField>
      <FormField
        isRequired
        title="admin_console.application_details.redirect_uri"
        className={styles.textField}
      >
        <Controller
          name="oidcClientMetadata.redirectUris"
          control={control}
          defaultValue={[]}
          rules={{
            validate: createValidatorForRhf({
              required: t('application_details.redirect_uri_required'),
              pattern: {
                regex: noSpaceRegex,
                message: t('errors.no_space_in_uri'),
              },
            }),
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <MultiTextInput
              value={value}
              error={convertRhfErrorMessage(error?.message)}
              onChange={onChange}
            />
          )}
        />
      </FormField>
      <FormField
        title="admin_console.application_details.post_sign_out_redirect_uri"
        className={styles.textField}
      >
        <Controller
          name="oidcClientMetadata.postLogoutRedirectUris"
          control={control}
          defaultValue={[]}
          rules={{
            validate: createValidatorForRhf({
              pattern: {
                regex: noSpaceRegex,
                message: t('errors.no_space_in_uri'),
              },
            }),
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <MultiTextInput
              value={value}
              error={convertRhfErrorMessage(error?.message)}
              onChange={onChange}
            />
          )}
        />
      </FormField>
    </>
  );

  const AdvancedSettingsPage = oidcConfig && (
    <>
      <FormField title="admin_console.application_details.token_endpoint">
        <CopyToClipboard className={styles.textField} value={oidcConfig.token_endpoint} />
      </FormField>
      <FormField title="admin_console.application_details.user_info_endpoint">
        <CopyToClipboard className={styles.textField} value={oidcConfig.userinfo_endpoint} />
      </FormField>
    </>
  );

  return (
    <div className={detailsStyles.container}>
      <LinkButton
        to="/applications"
        icon={<Back />}
        title="admin_console.application_details.back_to_applications"
        className={styles.backLink}
      />
      {isLoading && <div>loading</div>}
      {error && <div>{`error occurred: ${error.body.message}`}</div>}
      {data && oidcConfig && (
        <>
          <Card className={styles.header}>
            <div className={styles.imagePlaceholder}>
              <ImagePlaceholder size={60} borderRadius={16} />
            </div>
            <div className={styles.metadata}>
              <div className={styles.name}>{data.name}</div>
              <div className={styles.details}>
                <div className={styles.type}>{t(`${applicationTypeI18nKey[data.type]}.title`)}</div>
                <div className={styles.verticalBar} />
                <div className={styles.text}>App ID</div>
                <CopyToClipboard value={data.id} className={styles.copy} />
              </div>
            </div>
            <div className={styles.operations}>
              <Button
                title="admin_console.application_details.check_help_guide"
                onClick={() => {
                  setIsReadmeOpen(true);
                }}
              />
              <Drawer
                isOpen={isReadmeOpen}
                onClose={() => {
                  setIsReadmeOpen(false);
                }}
              >
                {/* TODO - Implement the content when the documentation website is ready. */}
                <div>TBD</div>
              </Drawer>
              <ActionMenu
                buttonProps={{ icon: <More /> }}
                title={t('application_details.more_options')}
              >
                <ActionMenuItem
                  icon={<Delete />}
                  type="danger"
                  onClick={() => {
                    setIsDeleteFormOpen(true);
                  }}
                >
                  {t('application_details.options_delete')}
                </ActionMenuItem>
              </ActionMenu>
              <Modal
                isOpen={isDeleteFormOpen}
                className={modalStyles.content}
                overlayClassName={modalStyles.overlay}
              >
                <DeleteForm
                  id={data.id}
                  name={data.name}
                  onClose={() => {
                    setIsDeleteFormOpen(false);
                  }}
                />
              </Modal>
            </div>
          </Card>
          <Card className={styles.body}>
            <TabNav>
              <TabNavLink href={`/applications/${data.id}/settings`}>
                {t('application_details.settings')}
              </TabNavLink>
              <TabNavLink href={`/applications/${data.id}/advanced-settings`}>
                {t('application_details.advanced_settings')}
              </TabNavLink>
            </TabNav>
            <form className={styles.form} onSubmit={onSubmit}>
              <div className={styles.fields}>
                {isAdvancedSettings ? AdvancedSettingsPage : SettingsPage}
              </div>
              <div className={detailsStyles.footer}>
                <Button
                  isLoading={isSubmitting}
                  htmlType="submit"
                  type="primary"
                  size="large"
                  title="admin_console.application_details.save_changes"
                />
              </div>
            </form>
          </Card>
        </>
      )}
    </div>
  );
};

export default ApplicationDetails;
