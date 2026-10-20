import TextLink from '@/components/TextLink';

import ZerveLogo from './ZerveLogo';
import styles from './index.module.scss';

export type AuthMarketingVariant = 'sign-in' | 'sign-up';

type Props = {
  readonly variant: AuthMarketingVariant;
  readonly termsOfUseUrl?: string;
  readonly privacyPolicyUrl?: string;
};

const websiteUrl = 'https://zerve.ai';

const copy = {
  'sign-in': {
    headline: 'A whole team of agents',
    body: 'A Superagent staffs as many parallel workers as the objective demands. Work that would run one thread at a time runs all at once, on your compute, bound by your guardrails, on your own model keys.',
  },
  'sign-up': {
    headline: 'Research at institutional scale',
    body: 'Zerve Superagents turn an objective into dozens of workers running in parallel on your compute, fully inspectable down to the code. Used by quant researchers, analysts, PMs, and risk teams, inside your perimeter.',
  },
} as const;

const MarketingPanel = ({ variant, termsOfUseUrl, privacyPolicyUrl }: Props) => {
  const content = copy[variant];
  const year = new Date().getFullYear();

  return (
    <aside className={styles.panel}>
      <ZerveLogo />
      <div className={styles.middle}>
        <div>
          {(privacyPolicyUrl ?? termsOfUseUrl) && (
            <div className={styles.legalRow}>
              {privacyPolicyUrl && (
                <TextLink href={privacyPolicyUrl} target="_blank" type="secondary">
                  Privacy Policy
                </TextLink>
              )}
              {termsOfUseUrl && (
                <TextLink href={termsOfUseUrl} target="_blank" type="secondary">
                  Terms of Service
                </TextLink>
              )}
            </div>
          )}
          <h1 className={styles.headline}>{content.headline}</h1>
          <p className={styles.body}>{content.body}</p>
        </div>
      </div>
      <div className={styles.bottom}>
        <a className={styles.backLink} href={websiteUrl} rel="noopener noreferrer">
          Back to website
        </a>
        <p className={styles.copyright}>© Copyright {year} Zerve. All rights reserved.</p>
      </div>
    </aside>
  );
};

export default MarketingPanel;
