import classNames from 'classnames';

import * as styles from './index.module.scss';

type BaseProps = {
  className?: string;
};

type Props =
  | (BaseProps & {
      for: 'upsell';
      plan: 'pro' | 'hobby';
    })
  | (BaseProps & {
      for: 'beta';
    });

function FeatureTag(props: Props) {
  const { className, for: forType } = props;

  return (
    <div className={classNames(styles.tag, forType === 'beta' && styles.beta, className)}>
      {/* eslint-disable-next-line unicorn/consistent-destructuring */}
      {props.for === 'upsell' ? props.plan : props.for}
    </div>
  );
}

export default FeatureTag;
