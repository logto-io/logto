import { Application } from '@logto/schemas';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import useSWR from 'swr';

import BackLink from '@/components/BackLink';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CopyToClipboard from '@/components/CopyToClipboard';
import FormField from '@/components/FormField';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import TabNav, { TabNavLink } from '@/components/TabNav';
import TextInput from '@/components/TextInput';
import { RequestError } from '@/hooks/use-api';
import { applicationTypeI18nKey } from '@/types/applications';

import * as styles from './index.module.scss';

type OidcConfig = {
  authorization_endpoint: string;
  userinfo_endpoint: string;
  token_endpoint: string;
};

const ApplicationDetails = () => {
  const { id } = useParams();
  const location = useLocation();

  const { data, error } = useSWR<Application, RequestError>(id && `/api/applications/${id}`);
  const { data: oidcConfig, error: fetchOidcConfigError } = useSWR<OidcConfig, RequestError>(
    '/oidc/.well-known/openid-configuration'
  );
  const isLoading = !data && !error && !fetchOidcConfigError;
  const dataFetched = data && oidcConfig;

  const { handleSubmit, register, reset } = useForm<Application>({
    defaultValues: data,
  });

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const isAdvancedSettings = location.pathname.includes('advanced-settings');

  useEffect(() => {
    if (!data) {
      return;
    }
    reset(data);
  }, [data, reset]);

  const onSubmit = handleSubmit((formData) => {
    console.log(formData);
  });

  return (
    <div className={styles.container}>
      <BackLink to="/applications">{t('application_details.back_to_applications')}</BackLink>
      {isLoading && <div>loading</div>}
      {error && <div>{`error occurred: ${error.metadata.code}`}</div>}
      {dataFetched && (
        <>
          <Card className={styles.header}>
            <ImagePlaceholder size={76} borderRadius={16} />
            <div className={styles.metadata}>
              <div className={styles.name}>{data.name}</div>
              <div>
                <div className={styles.type}>{t(`${applicationTypeI18nKey[data.type]}.title`)}</div>
                <div className={styles.verticalBar} />
                <div className={styles.text}>App ID</div>
                <CopyToClipboard value={data.id} className={styles.copy} />
              </div>
            </div>
            <div>
              <Button title="admin_console.application_details.check_help_guide" />
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
            <div className={styles.tabContent}>
              <form onSubmit={onSubmit}>
                <div className={styles.fields}>
                  {!isAdvancedSettings && (
                    <>
                      <FormField
                        isRequired
                        title="admin_console.application_details.application_name"
                      >
                        <TextInput {...register('name', { required: true })} />
                      </FormField>
                      <FormField title="admin_console.application_details.description">
                        <TextInput {...register('description')} />
                      </FormField>
                      <FormField title="admin_console.application_details.authorization_endpoint">
                        <CopyToClipboard
                          className={styles.copy}
                          value={oidcConfig.authorization_endpoint}
                        />
                      </FormField>
                    </>
                  )}
                  {isAdvancedSettings && (
                    <>
                      <FormField title="admin_console.application_details.token_endpoint">
                        <CopyToClipboard
                          className={styles.copy}
                          value={oidcConfig.token_endpoint}
                        />
                      </FormField>
                      <FormField title="admin_console.application_details.user_info_endpoint">
                        <CopyToClipboard
                          className={styles.copy}
                          value={oidcConfig.userinfo_endpoint}
                        />
                      </FormField>
                    </>
                  )}
                </div>
                <div className={styles.submit}>
                  <Button
                    htmlType="submit"
                    type="primary"
                    title="admin_console.application_details.save_changes"
                  />
                </div>
              </form>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default ApplicationDetails;
