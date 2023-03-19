export const isManagementApi = (indicator: string) =>
  /https:\/\/[^.]+\.logto\.app\/api/.test(indicator);
