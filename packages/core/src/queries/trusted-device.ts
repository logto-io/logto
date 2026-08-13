import { type TrustedDevice, TrustedDevices } from '@logto/schemas';
import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import { expandFields } from '#src/database/utils.js';
import {
  conditionalSql,
  convertToIdentifiers,
  convertToPrimitiveOrSql,
  manyRows,
} from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(TrustedDevices);
const activePredicate = sql`${fields.expiresAt} > now()`;

export type TrustedDeviceMetadata = Readonly<{
  userAgent?: string;
  ip?: string;
  country?: string;
  city?: string;
}>;

type TrustedDeviceCreation = TrustedDeviceMetadata &
  Readonly<Pick<TrustedDevice, 'id' | 'userId' | 'secretHash' | 'expiresAt'>>;

type Pagination = Readonly<{
  limit: number;
  offset: number;
}>;

export class TrustedDeviceQueries {
  constructor(public readonly pool: CommonQueryMethods) {}

  public async insertIfNotExists({
    id,
    userId,
    secretHash,
    userAgent,
    ip,
    country,
    city,
    expiresAt,
  }: TrustedDeviceCreation) {
    return this.pool.maybeOne<TrustedDevice>(sql`
      insert into ${table} (
        ${fields.id},
        ${fields.userId},
        ${fields.secretHash},
        ${fields.userAgent},
        ${fields.ip},
        ${fields.country},
        ${fields.city},
        ${fields.expiresAt}
      ) values (
        ${id},
        ${userId},
        ${convertToPrimitiveOrSql('secretHash', secretHash)},
        ${userAgent ?? null},
        ${ip ?? null},
        ${country ?? null},
        ${city ?? null},
        ${convertToPrimitiveOrSql('expiresAt', expiresAt)}
      )
      on conflict (${fields.id}) do nothing
      returning ${expandFields(TrustedDevices)}
    `);
  }

  public async findActiveByUserId(
    userId: string,
    { limit, offset }: Pagination
  ): Promise<[totalNumber: number, rows: readonly TrustedDevice[]]> {
    return Promise.all([
      this.countActiveByUserId(userId),
      manyRows(
        this.pool.query<TrustedDevice>(sql`
          select ${expandFields(TrustedDevices)}
          from ${table}
          where ${fields.userId} = ${userId}
            and ${activePredicate}
          order by ${fields.createdAt} desc
          limit ${limit} offset ${offset}
        `)
      ),
    ]);
  }

  public async findActiveByIdAndUserId(id: string, userId: string) {
    return this.pool.maybeOne<TrustedDevice>(sql`
      select ${expandFields(TrustedDevices)}
      from ${table}
      where ${fields.id} = ${id}
        and ${fields.userId} = ${userId}
        and ${activePredicate}
    `);
  }

  public async updateMetadataByIdAndUserId(
    id: string,
    userId: string,
    { userAgent, ip, country, city }: TrustedDeviceMetadata
  ) {
    const metadataUpdates = [
      sql`${fields.lastUsedAt}=to_timestamp(${Date.now()}::double precision / 1000)`,
      conditionalSql(userAgent !== undefined, () => sql`${fields.userAgent}=${userAgent ?? null}`),
      conditionalSql(ip !== undefined, () => sql`${fields.ip}=${ip ?? null}`),
      sql`${fields.country}=${country ?? null}`,
      sql`${fields.city}=${city ?? null}`,
    ].filter(({ sql }) => sql.trim() !== '');

    return this.pool.maybeOne<TrustedDevice>(sql`
      update ${table}
      set ${sql.join(metadataUpdates, sql`, `)}
      where ${fields.id} = ${id}
        and ${fields.userId} = ${userId}
        and ${activePredicate}
      returning ${expandFields(TrustedDevices)}
    `);
  }

  public async deleteExpiredByIdAndUserId(id: string, userId: string) {
    const { rowCount } = await this.pool.query<TrustedDevice>(sql`
      delete from ${table}
      where ${fields.id} = ${id}
        and ${fields.userId} = ${userId}
        and ${fields.expiresAt} <= now()
    `);

    return rowCount;
  }

  public async deleteByIdAndUserId(id: string, userId: string) {
    return this.pool.maybeOne<TrustedDevice>(sql`
      delete from ${table}
      where ${fields.id} = ${id}
        and ${fields.userId} = ${userId}
      returning ${expandFields(TrustedDevices)}
    `);
  }

  public async deleteAllByTenant() {
    // Tenant isolation is enforced by RLS through the tenant-scoped pool.
    const { rowCount } = await this.pool.query<TrustedDevice>(sql`
      delete from ${table}
    `);

    return rowCount;
  }

  public async deleteExpiredByTenant() {
    // Tenant isolation is enforced by RLS through the tenant-scoped pool.
    const { rowCount } = await this.pool.query<TrustedDevice>(sql`
      delete from ${table}
      where ${fields.expiresAt} <= now()
    `);

    return rowCount;
  }

  private async countActiveByUserId(userId: string) {
    return Number(
      await this.pool.oneFirst<string>(sql`
        select count(*)
        from ${table}
        where ${fields.userId} = ${userId}
          and ${activePredicate}
      `)
    );
  }
}
