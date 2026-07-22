import { type AdminConsoleKey } from '@logto/phrases';
import { useTranslation } from 'react-i18next';

import FormField from '@/ds-components/FormField';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import TextInput from '@/ds-components/TextInput';

import styles from './index.module.scss';

enum HearAboutUsSource {
  SearchEngine = 'search_engine',
  AiAssistant = 'ai_assistant',
  GithubOss = 'github_oss',
  FriendColleague = 'friend_colleague',
  PoweredBy = 'powered_by',
  ContentSocial = 'content_social',
  Other = 'other',
}

export type HearAboutUsValue = {
  source?: HearAboutUsSource;
  detail?: string;
};

/** Sources where a free-text follow-up helps pinpoint the exact origin. */
export const sourcesWithDetail: ReadonlySet<HearAboutUsSource> = new Set([
  HearAboutUsSource.ContentSocial,
  HearAboutUsSource.Other,
]);

const optionTitles = Object.freeze({
  [HearAboutUsSource.SearchEngine]: 'cloud.create_tenant.hear_about_us.options.search_engine',
  [HearAboutUsSource.AiAssistant]: 'cloud.create_tenant.hear_about_us.options.ai_assistant',
  [HearAboutUsSource.GithubOss]: 'cloud.create_tenant.hear_about_us.options.github_oss',
  [HearAboutUsSource.FriendColleague]: 'cloud.create_tenant.hear_about_us.options.friend_colleague',
  [HearAboutUsSource.PoweredBy]: 'cloud.create_tenant.hear_about_us.options.powered_by',
  [HearAboutUsSource.ContentSocial]: 'cloud.create_tenant.hear_about_us.options.content_social',
  [HearAboutUsSource.Other]: 'cloud.create_tenant.hear_about_us.options.other',
}) satisfies Record<HearAboutUsSource, AdminConsoleKey>;

const isHearAboutUsSource = (value: string): value is HearAboutUsSource =>
  Object.values<string>(HearAboutUsSource).includes(value);

const shuffle = <T,>(input: readonly T[]): T[] =>
  input
    .map((value) => ({ value, weight: Math.random() }))
    .slice()
    .sort(({ weight: weightA }, { weight: weightB }) => weightA - weightB)
    .map(({ value }) => value);

// Randomize option order once per app load to avoid position bias in answers; keep "Other" last.
const sources = Object.freeze([
  ...shuffle(
    Object.values(HearAboutUsSource).filter((source) => source !== HearAboutUsSource.Other)
  ),
  HearAboutUsSource.Other,
]);

type Props = {
  readonly value: HearAboutUsValue;
  readonly onChange: (value: HearAboutUsValue) => void;
  readonly isDisabled?: boolean;
};

function HearAboutUs({ value, onChange, isDisabled }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const showDetailInput = Boolean(value.source && sourcesWithDetail.has(value.source));

  return (
    <FormField title="cloud.create_tenant.hear_about_us.title">
      <RadioGroup
        name="hearAboutUsSource"
        className={styles.options}
        value={value.source}
        onChange={(next) => {
          if (!isHearAboutUsSource(next)) {
            return;
          }
          onChange({
            source: next,
            detail: sourcesWithDetail.has(next) ? value.detail : undefined,
          });
        }}
      >
        {sources.map((source) => (
          <Radio key={source} title={optionTitles[source]} value={source} isDisabled={isDisabled} />
        ))}
      </RadioGroup>
      {showDetailInput && (
        <TextInput
          className={styles.detailInput}
          placeholder={t('cloud.create_tenant.hear_about_us.detail_placeholder')}
          value={value.detail ?? ''}
          disabled={isDisabled}
          onChange={({ currentTarget: { value: detail } }) => {
            onChange({ ...value, detail });
          }}
        />
      )}
    </FormField>
  );
}

export default HearAboutUs;
