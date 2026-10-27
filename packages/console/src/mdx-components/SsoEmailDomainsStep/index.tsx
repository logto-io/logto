import { type ReactNode, useContext } from 'react';

import ConsoleSsoEmailDomains from '@/assets/docs/fragments/_console-sso-email-domains.mdx';
import { SsoConnectorContext } from '@/contexts/SsoConnectorContextProvider';
import Step from '@/mdx-components/Step';

type Props = {
  readonly index: number;
  readonly title: string;
  readonly children: ReactNode;
};

/**
 * The final step of an SSO connector guide. Console SSO replaces it with the domain ownership
 * verification flow, since its email domains must be verified before binding.
 */
function SsoEmailDomainsStep({ index, title, children }: Props) {
  const { consoleSsoConnector } = useContext(SsoConnectorContext);

  if (consoleSsoConnector) {
    return <ConsoleSsoEmailDomains index={index} />;
  }

  return (
    <Step index={index} title={title}>
      {children}
    </Step>
  );
}

export default SsoEmailDomainsStep;
