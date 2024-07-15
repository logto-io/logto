import { type CSSResult, unsafeCSS } from 'lit';

type Unit = {
  /**
   * @example unit(1) // '4px'
   */
  (value: number): CSSResult;
  /**
   * @example unit(1, 2) // '4px 8px'
   */
  (value1: number, value2: number): CSSResult;
  /**
   * @example unit(1, 2, 3) // '4px 8px 12px'
   */
  // eslint-disable-next-line @typescript-eslint/unified-signatures -- for better readability
  (value1: number, value2: number, value3: number): CSSResult;
  /**
   * @example unit(1, 2, 3, 4) // '4px 8px 12px 16px'
   */
  // eslint-disable-next-line @typescript-eslint/unified-signatures -- for better readability
  (value1: number, value2: number, value3: number, value4: number): CSSResult;
};

/**
 * Returns a `CSSResult` that represents the given values in pixels. The values are multiplied by 4.
 */
export const unit: Unit = (...values: number[]) => {
  if (values.length === 0 || values.length > 4) {
    throw new Error('unit() accepts 1 to 4 arguments');
  }

  if (values.some((value) => typeof value !== 'number')) {
    throw new Error('unit() accepts only numbers');
  }

  return unsafeCSS(values.map((value) => `${value * 4}px`).join(' '));
};
