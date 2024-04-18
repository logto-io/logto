import { type TFuncKey } from 'i18next';
import { useTranslation } from 'react-i18next';

type Props = {
  readonly forKey: TFuncKey<'translation', 'admin_console'>;
  readonly interpolation?: Record<string, unknown>;
};

/**
 * A component to render a dynamic translation key.
 */
export default function DynamicT({ forKey, interpolation }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  /**
   * The default return of `t()` is already string even if the given key is not a leaf key.
   * For example:
   *
   * ```ts
   * const translation = { foo: { bar: 'baz' } };
   *
   * t('foo.bar') // 'baz'
   * t('foo') // 'key 'foo (en)' returned an object instead of string.'
   * ```
   *
   * So actually there's no need to check key validity to make sure `t()` returns a string.
   * But it seems the type definition is not correct for the function in `i18next`. Use this trick to
   * bypass for now.
   */
  return <>{t(forKey, interpolation ?? {})}</>;
}
