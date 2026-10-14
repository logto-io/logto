/**
 * The pattern of Management API resource indicators, e.g. `https://default.logto.app/api`. It is
 * valid in both JavaScript and PostgreSQL regular expressions.
 */
export const managementApiIndicatorPattern = String.raw`^https://[^.]+\.logto\.app/api$`;

const managementApiIndicatorRegExp = new RegExp(managementApiIndicatorPattern);

export const isManagementApi = (indicator: string) => managementApiIndicatorRegExp.test(indicator);
