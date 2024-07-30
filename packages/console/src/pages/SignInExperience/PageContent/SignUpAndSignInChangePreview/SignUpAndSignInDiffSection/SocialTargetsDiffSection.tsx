import { isLanguageTag } from '@logto/language-kit';
import { conditional } from '@silverhand/essentials';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

import useConnectorGroups from '@/hooks/use-connector-groups';

import DiffSegment from './DiffSegment';
import styles from './index.module.scss';

type Props = {
  readonly before: string[];
  readonly after: string[];
  readonly isAfter?: boolean;
};

function SocialTargetsDiffSection({ before, after, isAfter = false }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data: groups, error } = useConnectorGroups();
  const { language } = i18next;
  const sortedBeforeTargets = before.slice().sort();
  const sortedAfterTargets = after.slice().sort();

  const displayTargets = isAfter ? sortedAfterTargets : sortedBeforeTargets;

  const hasChanged = (target: string) => !(before.includes(target) && after.includes(target));

  if (!groups || displayTargets.length === 0 || error) {
    return null;
  }

  return (
    <div>
      <div className={styles.title}>{t('sign_in_exp.save_alert.social')}</div>
      <ul className={styles.list}>
        {displayTargets.map((target) => {
          const connectorDetail = groups.find(
            ({ target: connectorTarget }) => connectorTarget === target
          );

          if (!connectorDetail) {
            return null;
          }

          return (
            <li key={target}>
              <DiffSegment hasChanged={hasChanged(target)} isAfter={isAfter}>
                {conditional(isLanguageTag(language) && connectorDetail.name[language]) ??
                  connectorDetail.name.en}
              </DiffSegment>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default SocialTargetsDiffSection;
