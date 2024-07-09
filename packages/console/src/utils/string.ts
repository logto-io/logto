export const decapitalize = (value: string) => value.charAt(0).toLowerCase() + value.slice(1);

export const removeFalsyValues = (object: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value));
