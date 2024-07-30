import styles from './Skeleton.module.scss';

type Props = {
  readonly formFieldCount: number;
};

function Skeleton({ formFieldCount }: Props) {
  return (
    <>
      {Array.from({ length: formFieldCount }).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} className={styles.field} />
      ))}
    </>
  );
}

export default Skeleton;
