import { type AdminConsoleKey } from '@logto/phrases';
import { SsoProviderName, type SsoConnectorWithProviderConfig } from '@logto/schemas';
import cleanDeep from 'clean-deep';
import type { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Modal from 'react-modal';

import Close from '@/assets/icons/close.svg';
import Markdown from '@/components/Markdown';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import DangerousRaw from '@/ds-components/DangerousRaw';
import DynamicT from '@/ds-components/DynamicT';
import IconButton from '@/ds-components/IconButton';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import useApi from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

import { splitMarkdownByTitle } from '../../Connectors/utils.js';
import { type GuideFormType, type SsoConnectorWithProviderConfigWithGeneric } from '../types.js';

import BasicInfo from './BasicInfo';
import OidcMetadataForm from './OidcMetadataForm';
import SamlAttributeMapping from './SamlAttributeMapping';
import SamlMetadataForm from './SamlMetadataForm';
import * as styles from './index.module.scss';

type Props<T extends SsoProviderName> = {
  isOpen: boolean;
  connector: SsoConnectorWithProviderConfigWithGeneric<T>;
  onClose: (ssoConnectorId?: string) => void;
  isReadOnly?: boolean;
};

type GuideCardProps = {
  cardOrder: number;
  children: ReactNode;
  title: AdminConsoleKey;
  description: AdminConsoleKey;
  className?: string;
};

function GuideCard({ cardOrder, title, description, children, className }: GuideCardProps) {
  return (
    <div className={styles.block}>
      <div className={styles.blockTitle}>
        <div className={styles.numberedTitle}>
          <div className={styles.number}>{cardOrder}</div>
          <DynamicT forKey={title} />
        </div>
        <div className={styles.blockSubtitle}>
          <DynamicT forKey={description} />
        </div>
      </div>
      <div className={className}>{children}</div>
    </div>
  );
}

function Guide<T extends SsoProviderName>({ isOpen, connector, onClose, isReadOnly }: Props<T>) {
  const {
    id: ssoConnectorId,
    connectorName: ssoConnectorName,
    providerName,
    providerConfig,
  } = connector;

  const api = useApi();

  const methods = useForm<GuideFormType<T>>();

  const {
    formState: { isSubmitting },
    handleSubmit,
  } = methods;

  // TODO: @darcyYe Add SSO connector README.
  const { title, content } = splitMarkdownByTitle(
    '# SSO connector guide\n\nThis is a guide for Logto Enterprise SSO connector.'
  );

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      if (isSubmitting) {
        return;
      }

      await api
        .patch(`api/sso-connectors/${ssoConnectorId}/config`, {
          json: cleanDeep(formData),
          // Do not check whether the config is complete on guide page.
          searchParams: new URLSearchParams({ partialValidateConfig: 'true' }),
        })
        .json<SsoConnectorWithProviderConfig>();

      onClose(ssoConnectorId);
    })
  );

  return (
    <Modal
      shouldCloseOnEsc
      isOpen={isOpen}
      className={modalStyles.fullScreen}
      onRequestClose={() => {
        onClose();
      }}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <IconButton
            size="large"
            onClick={() => {
              onClose(ssoConnectorId);
            }}
          >
            <Close className={styles.closeIcon} />
          </IconButton>
          <div className={styles.separator} />
          <CardTitle
            size="small"
            title={<DangerousRaw>{ssoConnectorName}</DangerousRaw>}
            subtitle="enterprise_sso.guide.subtitle"
          />
        </div>
        <div className={styles.content}>
          <OverlayScrollbar className={styles.readme}>
            <div className={styles.readmeTitle}>README: {title}</div>
            <Markdown className={styles.readmeContent}>{content}</Markdown>
          </OverlayScrollbar>
          <div className={styles.setup}>
            <FormProvider {...methods}>
              <form autoComplete="off" onSubmit={onSubmit}>
                <GuideCard
                  cardOrder={1}
                  title="enterprise_sso.basic_info.title"
                  description="enterprise_sso.basic_info.description"
                >
                  <BasicInfo
                    ssoConnectorId={ssoConnectorId}
                    providerName={providerName}
                    providerConfig={providerConfig}
                  />
                </GuideCard>
                {providerName === SsoProviderName.OIDC ? (
                  <GuideCard
                    cardOrder={2}
                    title="enterprise_sso.metadata.title"
                    description="enterprise_sso.metadata.description"
                  >
                    <OidcMetadataForm isGuidePage />
                  </GuideCard>
                ) : (
                  <>
                    <GuideCard
                      cardOrder={2}
                      title="enterprise_sso.attribute_mapping.title"
                      description="enterprise_sso.attribute_mapping.description"
                    >
                      <SamlAttributeMapping isReadOnly={isReadOnly} />
                    </GuideCard>
                    <GuideCard
                      cardOrder={3}
                      title="enterprise_sso.metadata.title"
                      description="enterprise_sso.metadata.description"
                      className={styles.samlMetadataForm}
                    >
                      <SamlMetadataForm isGuidePage />
                    </GuideCard>
                  </>
                )}
                <div className={styles.footer}>
                  <Button
                    title="enterprise_sso.guide.finish_button_text"
                    type="primary"
                    htmlType="submit"
                    isLoading={isSubmitting}
                  />
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default Guide;
