import { isLanguageTag } from '@logto/language-kit';
import { conditional } from '@silverhand/essentials';
import i18next from 'i18next';

import useConnectorGroups from '@/hooks/use-connector-groups';

import DiffSegment from './DiffSegment';
import * as styles from './index.module.scss';

type Props = {
  before: string[];
  after: string[];
  isAfter?: boolean;
};

const SocialTargetsDiffSection = ({ before, after, isAfter = false }: Props) => {
  const { data: groups, error } = useConnectorGroups();
  const { language } = i18next;
  const sortedBeforeTargets = before.slice().sort();
  const sortedAfterTargets = after.slice().sort();

  const displayTargets = isAfter ? sortedAfterTargets : sortedBeforeTargets;

  const hasChanged = (target: string) => !(before.includes(target) && after.includes(target));

  if (!groups) {
    return null;
  }

  if (error) {
    return null;
  }

  return (
    <div>
      <div className={styles.title}>Social</div>
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
};

export default SocialTargetsDiffSection;
