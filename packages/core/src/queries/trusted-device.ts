import { type TrustedDevice, TrustedDevices } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { expandFields } from '#src/database/utils.js';
import { convertToIdentifiers, manyRows } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(TrustedDevices);
const activePredicate = sql`${fields.expiresAt} > now()`;

export type TrustedDeviceMetadata = Readonly<{
  userAgent?: string;
  ip?: string;
  country?: string;
  city?: string;
}>;

type Pagination = Readonly<{
  limit: number;
  offset: number;
}>;

export class TrustedDeviceQueries {
  public readonly insert = buildInsertIntoWithPool(this.pool)(TrustedDevices, {
    returning: true,
  });

  private readonly updateMetadata = buildUpdateWhereWithPool(this.pool)(TrustedDevices, true);

  constructor(public readonly pool: CommonQueryMethods) {}

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
    const shouldReplaceLocation = country !== undefined || city !== undefined;

    return this.updateMetadata({
      set: {
        lastUsedAt: Date.now(),
        userAgent,
        ip,
        ...conditional(shouldReplaceLocation && { country: country ?? null, city: city ?? null }),
      },
      where: { id, userId },
      jsonbMode: 'replace',
    });
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
