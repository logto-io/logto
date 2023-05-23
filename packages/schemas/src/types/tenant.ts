export enum TenantTag {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

export type TenantInfo = {
  id: string;
  indicator: string;
};
