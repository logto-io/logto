import { isLanguageTag } from '@logto/language-kit';
import { conditional } from '@silverhand/essentials';
import i18next from 'i18next';

import useConnectorGroups from '@/hooks/use-connector-groups';

import DiffSegment from './DiffSegment';
import * as styles from './index.module.scss';
import type { SocialTargetsDiff } from './types';
import { createDiffFilter } from './utilities';

type Props = {
  socialTargetsDiff: SocialTargetsDiff;
  isAfter?: boolean;
};

const SocialTargetsDiffSection = ({ socialTargetsDiff, isAfter = false }: Props) => {
  const { data: groups, error } = useConnectorGroups();
  const { language } = i18next;

  const diffFilter = createDiffFilter(isAfter);
  const displayTargets = socialTargetsDiff.filter(({ mutation }) => diffFilter(mutation));

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
        {displayTargets.map(({ mutation, value: target }) => {
          const connectorDetail = groups.find(
            ({ target: connectorTarget }) => connectorTarget === target
          );

          if (!connectorDetail) {
            return null;
          }

          return (
            <li key={target}>
              <DiffSegment mutation={mutation}>
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
