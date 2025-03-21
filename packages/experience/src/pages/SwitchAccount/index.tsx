import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import StaticPageLayout from '@/Layout/StaticPageLayout';
import PageContext from '@/Providers/PageContextProvider/PageContext';
import Button from '@/components/Button';
import DynamicT from '@/components/DynamicT';
import NavBar from '@/components/NavBar';
import PageMeta from '@/components/PageMeta';
import { getBrandingLogoUrl } from '@/utils/logo';

import SupportInfo from '../ErrorPage/SupportInfo';

import styles from './index.module.scss';

type Props = {
  readonly account?: string;
};

const SwitchAccount = ({ account }: Props) => {
  const navigate = useNavigate();
  const { experienceSettings, theme } = useContext(PageContext);
  const searchParams = new URLSearchParams(window.location.search);
  const currentAccountName = searchParams.get('account') ?? account;

  if (!experienceSettings) {
    return null;
  }

  const {
    color: { isDarkModeEnabled },
    branding,
  } = experienceSettings;
  const logoUrl = getBrandingLogoUrl({ theme, branding, isDarkModeEnabled });

  return (
    <StaticPageLayout>
      <PageMeta titleKey="description.switch_account" />
      {history.length > 1 && <NavBar />}
      <div className={styles.container}>
        {logoUrl && <img className={styles.logo} src={logoUrl} alt="app logo" />}
        <div className={styles.title}>
          <DynamicT
            forKey="description.account_mismatch_title"
            interpolation={{ account: currentAccountName }}
          />
        </div>
        <div className={styles.message}>
          <DynamicT forKey="description.account_mismatch_description" />
        </div>
        <SupportInfo />
        <Button
          className={styles.button}
          type="primary"
          size="large"
          title="description.switch_account"
          onClick={() => {
            navigate('/sign-in');
          }}
        />
      </div>
    </StaticPageLayout>
  );
};

export default SwitchAccount;
