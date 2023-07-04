import EmailSentIcon from '@/assets/icons/email-sent.svg';
import Tip from '@/assets/icons/tip.svg';
import DynamicT from '@/ds-components/DynamicT';
import IconButton from '@/ds-components/IconButton';
import { ToggleTip } from '@/ds-components/Tip';

import * as styles from './index.module.scss';

type Props = {
  usage: number;
};
function EmailUsage({ usage }: Props) {
  return (
    <div className={styles.container}>
      <EmailSentIcon />
      <DynamicT
        forKey="connector_details.logto_email.total_email_sent"
        interpolation={{ value: usage }}
      />
      <ToggleTip content={<DynamicT forKey="connector_details.logto_email.total_email_sent_tip" />}>
        <IconButton size="small">
          <Tip />
        </IconButton>
      </ToggleTip>
    </div>
  );
}

export default EmailUsage;
