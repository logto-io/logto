import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import PageContext from '@/Providers/PageContextProvider/PageContext';
import SingleSignOnContext from '@/Providers/SingleSignOnContextProvider/SingleSignOnContext';
import SocialLinkButton from '@/components/Button/SocialLinkButton';
import { getLogoUrl } from '@/utils/logo';

import * as styles from './index.module.scss';
import useSingleSignOn from './use-single-sign-on';

const SingleSignOnConnectors = () => {
  const { theme } = useContext(PageContext);
  const { email, ssoConnectors } = useContext(SingleSignOnContext);
  const navigate = useNavigate();
  const onSubmit = useSingleSignOn();

  // Return to the previous page if no email and no connectors are available in the context
  if (!email || ssoConnectors.length === 0) {
    navigate('../email');
  }

  return (
    <SecondaryPageLayout
      title="action.single_sign_on"
      description="description.single_sign_on_connectors_list"
      descriptionProps={{ email }}
    >
      <div className={styles.ssoLinkList}>
        {ssoConnectors.map((connector) => {
          const { id, connectorName, logo: logoUrl, darkLogo: darkLogoUrl } = connector;

          return (
            <SocialLinkButton
              key={id}
              className={styles.socialLinkButton}
              name={{ en: connectorName }} // I18n support for connectorName not supported yet, always display the plain text
              logo={getLogoUrl({ theme, logoUrl, darkLogoUrl })}
              target={connectorName}
              onClick={async () => onSubmit(id)}
            />
          );
        })}
      </div>
    </SecondaryPageLayout>
  );
};

export default SingleSignOnConnectors;
