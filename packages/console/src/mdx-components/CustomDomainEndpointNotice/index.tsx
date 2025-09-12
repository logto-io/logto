import { isCloud } from '@/consts/env';
import InlineNotification from '@/ds-components/InlineNotification';
import TextLink from '@/ds-components/TextLink';

type Props = {
  readonly variant?: 'access' | 'replace';
};

function CustomDomainEndpointNotice({ variant = 'access' }: Props) {
  if (!isCloud) {
    return null;
  }

  return (
    <InlineNotification>
      After adding{' '}
      <TextLink href="https://docs.logto.io/logto-cloud/custom-domain" targetBlank="noopener">
        custom domains
      </TextLink>
      {variant === 'replace'
        ? ', you can replace the Logto endpoint with '
        : ', you can access endpoints at '}
      <code>{'https://{{custom_domain}}/'}</code>.
    </InlineNotification>
  );
}

export default CustomDomainEndpointNotice;
