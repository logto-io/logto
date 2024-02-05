import { Theme } from '@logto/schemas';
import classNames from 'classnames';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import OrganizationFeatureDark from '@/assets/icons/organization-feature-dark.svg';
import OrganizationFeature from '@/assets/icons/organization-feature.svg';
import ActionBar from '@/components/ActionBar';
import { organizationConfigGuideLink } from '@/consts';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import FormField from '@/ds-components/FormField';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import TextInput from '@/ds-components/TextInput';
import TextLink from '@/ds-components/TextLink';
import useApi from '@/hooks/use-api';
import useConfigs from '@/hooks/use-configs';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useTheme from '@/hooks/use-theme';
import { trySubmitSafe } from '@/utils/form';

import { steps, totalStepCount } from '../const';
import * as styles from '../index.module.scss';

type OrganizationForm = {
  name: string;
};

function OrganizationInfo() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.organizations' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const theme = useTheme();
  const Icon = theme === Theme.Light ? OrganizationFeature : OrganizationFeatureDark;
  const { navigate } = useTenantPathname();
  const api = useApi();
  const { updateConfigs } = useConfigs();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationForm>({
    defaultValues: { name: '' },
  });

  const onSubmit = handleSubmit(
    trySubmitSafe(async (json) => {
      await api.post(`api/organizations`, { json });
      void updateConfigs({ organizationCreated: true });
      navigate(`/organizations`);
    })
  );

  const onNavigateBack = () => {
    reset();
    navigate(`../${steps.roles}`);
  };

  return (
    <>
      <OverlayScrollbar className={styles.stepContainer}>
        <div className={classNames(styles.content)}>
          <Card className={styles.card}>
            <Icon className={styles.icon} />
            <div className={styles.section}>
              <div className={styles.title}>{t('guide.step_3')}</div>
              <div className={styles.description}>{t('guide.step_3_description')}</div>
            </div>
            <form>
              <FormField isRequired title="organizations.guide.organization_name">
                <TextInput
                  {...register('name', { required: true })}
                  error={Boolean(errors.name)}
                  placeholder={t('organization_name_placeholder')}
                />
              </FormField>
            </form>
          </Card>
          <Card className={styles.card}>
            <div className={styles.section}>
              <div className={styles.title}>{t('guide.more_next_steps')}</div>
              <div className={styles.subtitle}>{t('guide.add_members')}</div>
              <ul>
                <li>
                  <TextLink
                    href={getDocumentationUrl(organizationConfigGuideLink)}
                    targetBlank="noopener"
                  >
                    {t('guide.config_organization')}
                  </TextLink>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </OverlayScrollbar>
      <ActionBar step={4} totalSteps={totalStepCount}>
        <Button isLoading={isSubmitting} title="general.done" type="primary" onClick={onSubmit} />
        <Button title="general.back" onClick={onNavigateBack} />
      </ActionBar>
    </>
  );
}

export default OrganizationInfo;
