import { type Application } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import ApplicationIcon from '@/components/ApplicationIcon';
import { isDevFeaturesEnabled } from '@/consts/env';
import { applicationTypeI18nKey } from '@/types/applications';

import ItemPreview from '.';
import styles from './index.module.scss';

const applicationsPathname = '/applications';
const buildDetailsPathname = (id: string) => `${applicationsPathname}/${id}`;

type Props = {
  readonly data: Pick<Application, 'id' | 'name' | 'isThirdParty' | 'type'>;
};

function ApplicationPreview({ data: { id, name, isThirdParty, type } }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <ItemPreview
      title={name}
      subtitle={
        // TODO: @xiaoyijun Remove dev feature guard when third-party SPA and Native apps are ready for production
        isThirdParty && !isDevFeaturesEnabled
          ? t(`${applicationTypeI18nKey.thirdParty}.title`)
          : t(`${applicationTypeI18nKey[type]}.title`)
      }
      icon={<ApplicationIcon className={styles.icon} type={type} isThirdParty={isThirdParty} />}
      to={buildDetailsPathname(id)}
    />
  );
}
export default ApplicationPreview;
