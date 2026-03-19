import { type Application } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import ApplicationIcon from '@/components/ApplicationIcon';
import { applicationTypeI18nKey } from '@/types/applications';

import ItemPreview from '.';
import styles from './index.module.scss';

const applicationsPathname = '/applications';
const buildDetailsPathname = (id: string) => `${applicationsPathname}/${id}`;

type Props = {
  readonly data: Pick<
    Application,
    'id' | 'name' | 'isThirdParty' | 'type' | 'customClientMetadata'
  >;
};

function ApplicationPreview({
  data: { id, name, isThirdParty, type, customClientMetadata },
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { isDeviceFlow } = customClientMetadata;
  const subtitle = [
    t(`${applicationTypeI18nKey[type]}.title`),
    isDeviceFlow && t('application_details.device_flow_tag'),
  ]
    .filter(Boolean)
    .join(' | ');

  return (
    <ItemPreview
      title={name}
      subtitle={subtitle}
      icon={
        <ApplicationIcon
          className={styles.icon}
          type={type}
          isThirdParty={isThirdParty}
          isDeviceFlow={customClientMetadata.isDeviceFlow}
        />
      }
      to={buildDetailsPathname(id)}
    />
  );
}
export default ApplicationPreview;
