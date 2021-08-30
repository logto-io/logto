// https://github.com/facebook/jest/issues/7547

export type AssertFunction = <E extends Error>(
  value: unknown,
  buildError: () => E
) => asserts value;

const assert: AssertFunction = (value, buildError): asserts value => {
  if (!value) {
    // https://github.com/typescript-eslint/typescript-eslint/issues/3814
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw buildError();
  }
};

export default assert;
