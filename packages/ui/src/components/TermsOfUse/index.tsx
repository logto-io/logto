import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import Checkbox from '@/components/Checkbox';
import TextLink from '@/components/TextLink';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './index.module.scss';

type Props = {
  name: string;
  className?: string;
  termsUrl: string;
  isChecked?: boolean;
  onChange: (checked: boolean) => void;
  onTermsClick?: () => void;
};

const TermsOfUse = ({ name, className, termsUrl, isChecked, onChange, onTermsClick }: Props) => {
  const { t } = useTranslation();

  const prefix = t('description.agree_with_terms');

  const toggle = () => {
    onChange(!isChecked);
  };

  return (
    <div
      role="radio"
      aria-checked={isChecked}
      tabIndex={0}
      className={classNames(styles.terms, className)}
      onClick={toggle}
      onKeyDown={onKeyDownHandler({
        Escape: () => {
          onChange(false);
        },
        Enter: toggle,
        ' ': toggle,
      })}
    >
      <Checkbox name={name} checked={isChecked} className={styles.checkBox} />
      <div className={styles.content}>
        {prefix}
        <TextLink
          className={styles.link}
          text="description.terms_of_use"
          href={onTermsClick ? undefined : termsUrl} // Do not open link if onTermsClick is provided
          target="_blank"
          type="secondary"
          onClick={(event) => {
            // Prevent above parent onClick event being triggered
            event.stopPropagation();
            onTermsClick?.();
          }}
        />
      </div>
    </div>
  );
};

export default TermsOfUse;
