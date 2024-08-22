import { type AgreeToTermsPolicy } from '@logto/schemas';
import { type TFuncKey } from 'i18next';
import { useMemo, type ReactNode } from 'react';

import DynamicT from '@/components/DynamicT';
import type { Props as PageMetaProps } from '@/components/PageMeta';
import type { Props as TextLinkProps } from '@/components/TextLink';
import TextLink from '@/components/TextLink';
import TermsAndPrivacyLinks from '@/containers/TermsAndPrivacyLinks';
import useTerms from '@/hooks/use-terms';

import FirstScreenLayout from '../FirstScreenLayout';

import styles from './index.module.scss';

type Props = {
  readonly children: ReactNode;
  readonly pageMeta: PageMetaProps;
  readonly title: TFuncKey;
  readonly description: string;
  readonly footerTermsDisplayPolicies?: AgreeToTermsPolicy[];
  readonly authOptionsLink: TextLinkProps;
};

/**
 * FocusedAuthPageLayout Component
 *
 * This layout component is designed for focused authentication pages that serve as the first screen
 * for specific auth methods, such as identifier sign-in, identifier-register, and single sign-on landing pages.
 */
const FocusedAuthPageLayout = ({
  children,
  pageMeta,
  title,
  description,
  footerTermsDisplayPolicies = [],
  authOptionsLink,
}: Props) => {
  const { agreeToTermsPolicy } = useTerms();

  const shouldDisplayFooterTerms = useMemo(
    () => agreeToTermsPolicy && footerTermsDisplayPolicies.includes(agreeToTermsPolicy),
    [agreeToTermsPolicy, footerTermsDisplayPolicies]
  );

  return (
    <FirstScreenLayout pageMeta={pageMeta}>
      <div className={styles.header}>
        <div className={styles.title}>
          <DynamicT forKey={title} />
        </div>
        <div className={styles.description}>{description}</div>
      </div>
      {children}
      {shouldDisplayFooterTerms && <TermsAndPrivacyLinks className={styles.terms} />}
      <TextLink {...authOptionsLink} className={styles.link} />
    </FirstScreenLayout>
  );
};

export default FocusedAuthPageLayout;
