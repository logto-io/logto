import { withAppInsights } from '@logto/app-insights/react/AppInsightsReact';

import CardTitle from '@/ds-components/CardTitle';

import * as styles from './index.module.scss';

function JwtClaims() {
  return (
    <div className={styles.container}>
      <CardTitle
        title="jwt_claims.title"
        subtitle="jwt_claims.description"
        className={styles.cardTitle}
      />
      <div>Custom JWT</div>
    </div>
  );
}

export default withAppInsights(JwtClaims);
