import { type SignInExperience } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useContext, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import SubmitFormChangesActionBar from '@/components/SubmitFormChangesActionBar';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import ConfirmModal from '@/ds-components/ConfirmModal';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import useApi from '@/hooks/use-api';
import useConfigs from '@/hooks/use-configs';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { trySubmitSafe } from '@/utils/form';

import Preview from '../components/Preview';
import { SignInExperienceContext } from '../contexts/SignInExperienceContextProvider';
import usePreviewConfigs from '../hooks/use-preview-configs';
import {
  SignInExperienceTab,
  type SignInExperiencePageManagedData,
  type SignInExperienceForm,
} from '../types';

import Branding from './Branding';
import CollectUserProfile from './CollectUserProfile';
import Content from './Content';
import SignUpAndSignIn from './SignUpAndSignIn';
import SignUpAndSignInChangePreview from './SignUpAndSignInChangePreview';
import styles from './index.module.scss';
import {
  getBrandingErrorCount,
  getSignUpAndSignInErrorCount,
  getContentErrorCount,
  hasSignUpAndSignInConfigChanged,
} from './utils/form';
import { sieFormDataParser, signInExperienceToUpdatedDataParser } from './utils/parser';

const PageTab = TabNavItem<`../${SignInExperienceTab}`>;

type Props = {
  readonly data: SignInExperience;
  readonly onSignInExperienceUpdated: (data: SignInExperience) => void;
};

function PageContent({ data, onSignInExperienceUpdated }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { tab } = useParams();
  const [isSaving, setIsSaving] = useState(false);

  const { updateConfigs } = useConfigs();
  const { getPathname } = useTenantPathname();
  const { isUploading, cancelUpload } = useContext(SignInExperienceContext);

  const [dataToCompare, setDataToCompare] = useState<SignInExperiencePageManagedData>();

  const methods = useForm<SignInExperienceForm>({
    defaultValues: sieFormDataParser.fromSignInExperience(data),
  });

  const {
    reset,
    handleSubmit,
    getValues,
    watch,
    formState: { isDirty, errors },
  } = methods;
  const api = useApi();
  const formData = watch();

  const previewConfigs = usePreviewConfigs(formData, isDirty, data);

  const saveData = async () => {
    setIsSaving(true);

    try {
      const updatedData = await api
        .patch('api/sign-in-exp', {
          json: sieFormDataParser.toSignInExperience(getValues()),
        })
        .json<SignInExperience>();

      reset(sieFormDataParser.fromSignInExperience(updatedData));
      onSignInExperienceUpdated(updatedData);
      setDataToCompare(undefined);
      await updateConfigs({ signInExperienceCustomized: true });
      toast.success(t('general.saved'));
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData: SignInExperienceForm) => {
      if (isSaving) {
        return;
      }

      const formatted = sieFormDataParser.toSignInExperience(formData);
      const original = signInExperienceToUpdatedDataParser(data);

      // Sign-in methods changed, need to show confirm modal first.
      if (!hasSignUpAndSignInConfigChanged(original, formatted)) {
        setDataToCompare(formatted);

        return;
      }

      await saveData();
    })
  );

  const onDiscard = useCallback(() => {
    reset();
    if (isUploading && cancelUpload) {
      cancelUpload();
    }
  }, [isUploading, cancelUpload, reset]);

  return (
    <>
      <TabNav className={styles.tabs}>
        <PageTab href="../branding" errorCount={getBrandingErrorCount(errors)}>
          {t('sign_in_exp.tabs.branding')}
        </PageTab>
        <PageTab
          href="../sign-up-and-sign-in"
          errorCount={getSignUpAndSignInErrorCount(errors, formData)}
        >
          {t('sign_in_exp.tabs.sign_up_and_sign_in')}
        </PageTab>
        <PageTab href="../collect-user-profile">
          {t('sign_in_exp.tabs.collect_user_profile')}
        </PageTab>
        <PageTab href="../content" errorCount={getContentErrorCount(errors)}>
          {t('sign_in_exp.tabs.content')}
        </PageTab>
      </TabNav>
      <div className={styles.content}>
        <div className={classNames(styles.contentTop, isDirty && styles.withSubmitActionBar)}>
          <FormProvider {...methods}>
            <form>
              <Branding isActive={tab === SignInExperienceTab.Branding} />
              <SignUpAndSignIn isActive={tab === SignInExperienceTab.SignUpAndSignIn} data={data} />
              <CollectUserProfile isActive={tab === SignInExperienceTab.CollectUserProfile} />
              <Content isActive={tab === SignInExperienceTab.Content} />
            </form>
          </FormProvider>
          {formData.id && tab !== SignInExperienceTab.CollectUserProfile && (
            <Preview
              isLivePreviewDisabled={isDirty}
              signInExperience={previewConfigs}
              isPreviewIframeDisabled={Boolean(data.customUiAssets)}
              className={styles.preview}
            />
          )}
        </div>
        <SubmitFormChangesActionBar
          isOpen={isDirty || isUploading}
          isSubmitDisabled={isUploading}
          isSubmitting={isSaving}
          onDiscard={onDiscard}
          onSubmit={onSubmit}
        />
      </div>
      <ConfirmModal
        isOpen={Boolean(dataToCompare)}
        isLoading={isSaving}
        onCancel={() => {
          setDataToCompare(undefined);
        }}
        onConfirm={async () => {
          await saveData();
        }}
      >
        {dataToCompare && <SignUpAndSignInChangePreview before={data} after={dataToCompare} />}
      </ConfirmModal>
      <UnsavedChangesAlertModal
        hasUnsavedChanges={isDirty || isUploading}
        parentPath={getPathname('/sign-in-experience')}
        onConfirm={onDiscard}
      />
    </>
  );
}

export default PageContent;
