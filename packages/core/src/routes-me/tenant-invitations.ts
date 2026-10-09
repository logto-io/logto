import {
  OrganizationInvitationStatus,
  TenantRole,
  getTenantRole,
  organizationInvitationEntityGuard,
  ossConsolePath,
  ossUserOnboardingDataGuard,
  ossUserOnboardingDataKey,
  type OrganizationInvitationEntity,
} from '@logto/schemas';
import { generateStandardId, generateStandardSecret, getUserDisplayName } from '@logto/shared';
import { addDays } from 'date-fns';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type OrganizationQueries from '#src/queries/organization/index.js';
import type { RouterInitArgs } from '#src/routes/types.js';
import assertThat from '#src/utils/assert-that.js';

import { withTenantMembership } from './tenant-membership.js';
import {
  assertLicenseGrants,
  assertNotCloud,
  createTenantMemberAuthorization,
  tenantOrganizationId,
} from './tenant-organization.js';
import type { AuthedMeRouter } from './types.js';

/** How long an invitation, and the sign-in link it carries, stays valid. */
const invitationTtlDays = 7;

const tenantInvitationGuard = organizationInvitationEntityGuard.extend({
  inviterName: z.string().optional(),
});

const invitationIdGuard = z.object({ invitationId: z.string().min(1) });

/**
 * The invitations to a self-hosted deployment's tenant, and the invitee's side of them.
 *
 * Mirrors the tenant invitation routes of Logto Cloud, so Console can manage either with the same
 * pages. The invitation records live in the admin tenant, next to the tenant organization, but the
 * admin tenant has no email connector: the invitation email is sent through the default tenant's.
 *
 * The link in the email carries a one-time token of the admin tenant, bound to the invitee's email.
 * The admin tenant stops accepting sign-ups once its first admin exists, and a verified one-time
 * token is what lets an invitee create their account anyway; an invitee who already has one simply
 * signs in with it. The Console accept page then accepts the invitation as the signed-in invitee.
 *
 * Inviting someone and accepting an invitation take the `consoleCollaboration` license entitlement,
 * since both add a member; revoking and deleting an invitation do not, so a lapsed license
 * can still be cleaned up after.
 *
 * @see {@link tenantRoutes} for why these routes live on `/me`.
 */
export default function tenantInvitationRoutes<T extends AuthedMeRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const {
    queries: { organizations, users, oneTimeTokens },
    libraries: { organizationInvitations },
    withDefaultTenant,
  } = tenant;
  const { invitations } = organizations;
  const { assertAdmin } = createTenantMemberAuthorization(tenant);

  /** Find an invitation to the tenant, and to nothing else, by its ID. */
  const findTenantInvitation = async (
    invitationId: string,
    queries: Pick<OrganizationQueries, 'invitations'> = organizations
  ) => {
    const invitation = await queries.invitations.findById(invitationId);

    assertThat(
      invitation.organizationId === tenantOrganizationId,
      new RequestError({ code: 'entity.not_found', status: 404 })
    );

    return invitation;
  };

  /** Find an invitation to the tenant addressed to the signed-in user, by its ID. */
  const findOwnInvitation = async (
    invitationId: string,
    userId: string,
    queries?: {
      organizations: Pick<OrganizationQueries, 'invitations'>;
      users: Pick<typeof users, 'findUserById'>;
    }
  ) => {
    const [invitation, { primaryEmail }] = await Promise.all([
      findTenantInvitation(invitationId, queries?.organizations),
      (queries?.users ?? users).findUserById(userId),
    ]);

    // Not `auth.forbidden`, which signs the user out of Console: the accept page offers to switch
    // to the invitee's account instead.
    assertThat(
      primaryEmail?.toLowerCase() === invitation.invitee.toLowerCase(),
      new RequestError({ code: 'auth.expected_role_not_found', status: 403 })
    );

    return invitation;
  };

  /** Build the Console accept link, which signs the invitee in with a fresh one-time token. */
  const buildInvitationLink = async ({ id, invitee, expiresAt }: OrganizationInvitationEntity) => {
    // Invitees are stored lowercased, while an existing account keeps its email as entered. Issue
    // the token for the account's own spelling, which the sign-in compares it with verbatim.
    const existingUser = await users.findUserByEmail(invitee);
    const email = existingUser?.primaryEmail ?? invitee;
    const oneTimeToken = await oneTimeTokens.insertOneTimeToken({
      id: generateStandardId(),
      email,
      token: generateStandardSecret(),
      expiresAt,
    });
    const link = new URL(`${ossConsolePath}/accept/${id}`, EnvSet.values.adminUrlSet.endpoint);
    link.searchParams.set('one_time_token', oneTimeToken.token);
    link.searchParams.set('email', email);

    return { link: link.href, oneTimeTokenId: oneTimeToken.id };
  };

  /**
   * Send the invitation email through the default tenant, since the admin tenant has no email
   * connector. Fails with `connector.not_found` (501) when the default tenant has none either, and
   * with `request.message_rate_limited` (429) when the invitee has been emailed too often.
   *
   * The payload is the usual organization invitation template context, so a template written for
   * organization invitations works here too. Once the email is out, the links sent earlier to the
   * same invitee stop working.
   */
  const sendInvitation = async (
    invitation: OrganizationInvitationEntity,
    inviterId: string,
    locale: string
  ) => {
    const [{ link, oneTimeTokenId }, context] = await Promise.all([
      buildInvitationLink(invitation),
      organizationInvitations.getOrganizationInvitationTemplateContext(
        tenantOrganizationId,
        inviterId
      ),
    ]);

    const payload = { ...context, link, locale };

    try {
      await withDefaultTenant(async ({ libraries }) =>
        libraries.organizationInvitations.sendEmail(invitation.invitee, payload)
      );
    } catch (error: unknown) {
      // The link was not delivered, so its sign-in token must not stay usable.
      await oneTimeTokens.deleteOneTimeTokenById(oneTimeTokenId);
      throw error;
    }

    await oneTimeTokens.revokeActiveOneTimeTokensByEmail(invitation.invitee, oneTimeTokenId);
  };

  /** Refuse an invitee who is already a member or already has a pending invitation. */
  const assertInvitable = async (invitee: string) => {
    const [isMember, existing] = await Promise.all([
      organizations.relations.users.isMember(tenantOrganizationId, invitee),
      invitations.findEntities({ organizationId: tenantOrganizationId, invitee }),
    ]);
    const details = `${invitee} is already a member or has a pending invitation.`;

    assertThat(
      !isMember && existing.every(({ status }) => status !== OrganizationInvitationStatus.Pending),
      new RequestError({ code: 'request.invalid_input', status: 422, details })
    );
  };

  router.get(
    '/tenant/invitations',
    koaGuard({ response: tenantInvitationGuard.array(), status: [200, 403, 501] }),
    async (ctx, next) => {
      assertNotCloud();
      await assertAdmin(ctx.auth.id);

      const entities = await invitations.findEntities({ organizationId: tenantOrganizationId });
      const inviterIds = [
        ...new Set(entities.flatMap(({ inviterId }) => (inviterId ? [inviterId] : []))),
      ];
      const inviterUsers = await users.findUsersByIds(inviterIds);
      const inviters = new Map(inviterUsers.map((user) => [user.id, user]));

      ctx.body = entities.map((entity) => {
        const inviter = entity.inviterId ? inviters.get(entity.inviterId) : undefined;

        return { ...entity, inviterName: inviter && getUserDisplayName(inviter) };
      });

      return next();
    }
  );

  /**
   * Invite people to the tenant by email as admins. Each invitee gets their own
   * invitation and email.
   *
   * Every invitee is checked before anything is created, so an existing member or a pending
   * invitation fails the whole request. A delivery failure can only surface at send time: it stops
   * the rest and drops that invitation, while the ones emailed before it stay.
   */
  router.post(
    '/tenant/invitations',
    koaGuard({
      body: z.object({
        invitee: z.string().email().or(z.string().email().array().nonempty()),
      }),
      response: organizationInvitationEntityGuard.array(),
      status: [201, 403, 422, 429, 501],
    }),
    async (ctx, next) => {
      assertNotCloud();
      await assertAdmin(ctx.auth.id);
      await assertLicenseGrants('consoleCollaboration');

      const { invitee } = ctx.guard.body;
      const invitees = [...new Set([invitee].flat().map((email) => email.toLowerCase()))];
      const expiresAt = addDays(new Date(), invitationTtlDays).getTime();

      await Promise.all(invitees.map(async (email) => assertInvitable(email)));

      const created: OrganizationInvitationEntity[] = [];

      for (const email of invitees) {
        // Sequential on purpose: each invitation opens its own transaction and sends an email.
        // eslint-disable-next-line no-await-in-loop
        const invitation = await organizationInvitations.insert(
          {
            inviterId: ctx.auth.id,
            invitee: email,
            organizationId: tenantOrganizationId,
            expiresAt,
            organizationRoleIds: [getTenantRole(TenantRole.Admin).id],
          },
          false
        );

        try {
          // eslint-disable-next-line no-await-in-loop
          await sendInvitation(invitation, ctx.auth.id, ctx.locale);
        } catch (error: unknown) {
          // An invitation nobody was told about would only block inviting the same email again.
          // eslint-disable-next-line no-await-in-loop
          await invitations.deleteById(invitation.id);
          throw error;
        }

        // eslint-disable-next-line @silverhand/fp/no-mutating-methods
        created.push(invitation);
      }

      ctx.body = created;
      ctx.status = 201;

      return next();
    }
  );

  /** Send the invitation email again, with a new sign-in link, as the current admin. */
  router.post(
    '/tenant/invitations/:invitationId/message',
    koaGuard({ params: invitationIdGuard, status: [204, 403, 404, 422, 429, 501] }),
    async (ctx, next) => {
      assertNotCloud();
      await assertAdmin(ctx.auth.id);
      await assertLicenseGrants('consoleCollaboration');

      const invitation = await findTenantInvitation(ctx.guard.params.invitationId);

      assertThat(
        invitation.status === OrganizationInvitationStatus.Pending,
        new RequestError({
          code: 'request.invalid_input',
          status: 422,
          details: 'Only a pending invitation can be sent again.',
        })
      );

      await sendInvitation(invitation, ctx.auth.id, ctx.locale);

      ctx.status = 204;

      return next();
    }
  );

  router.patch(
    '/tenant/invitations/:invitationId/status',
    koaGuard({
      params: invitationIdGuard,
      body: z.object({ status: z.literal(OrganizationInvitationStatus.Revoked) }),
      response: organizationInvitationEntityGuard,
      status: [200, 403, 404, 422, 501],
    }),
    async (ctx, next) => {
      assertNotCloud();

      const { invitationId } = ctx.guard.params;

      // Serialized with acceptance, so an invitation is never both revoked and accepted.
      ctx.body = await withTenantMembership(tenant, async (membership) => {
        await membership.assertAdmin(ctx.auth.id);
        const { invitee } = await findTenantInvitation(invitationId, membership.organizations);
        // The sign-in link must not outlive the invitation that carried it.
        await membership.oneTimeTokens.revokeActiveOneTimeTokensByEmail(invitee);

        return organizationInvitations.updateStatus(
          invitationId,
          OrganizationInvitationStatus.Revoked,
          undefined,
          membership.connection
        );
      });

      return next();
    }
  );

  router.delete(
    '/tenant/invitations/:invitationId',
    koaGuard({ params: invitationIdGuard, status: [204, 403, 404, 501] }),
    async (ctx, next) => {
      assertNotCloud();

      const { invitationId } = ctx.guard.params;

      // Serialized with acceptance, so an invitation being accepted is not deleted under it.
      await withTenantMembership(tenant, async (membership) => {
        await membership.assertAdmin(ctx.auth.id);
        const invitation = await findTenantInvitation(invitationId, membership.organizations);
        await membership.organizations.invitations.deleteById(invitationId);

        // The sign-in link must not outlive the invitation that carried it. Another pending
        // invitation cannot exist for the same invitee, so no live link is lost.
        if (invitation.status === OrganizationInvitationStatus.Pending) {
          await membership.oneTimeTokens.revokeActiveOneTimeTokensByEmail(invitation.invitee);
        }
      });

      ctx.status = 204;

      return next();
    }
  );

  /** The invitation, to the invitee it is addressed to only. */
  router.get(
    '/invitations/:invitationId',
    koaGuard({
      params: invitationIdGuard,
      response: organizationInvitationEntityGuard,
      status: [200, 403, 404, 501],
    }),
    async (ctx, next) => {
      assertNotCloud();

      ctx.body = await findOwnInvitation(ctx.guard.params.invitationId, ctx.auth.id);

      return next();
    }
  );

  /**
   * Accept the invitation as the invitee it is addressed to: join the tenant as an admin,
   * and get the Console access that comes with it. The invitee joins a deployment someone else has
   * set up, so the onboarding questionnaire about it is skipped for them.
   */
  router.patch(
    '/invitations/:invitationId/status',
    koaGuard({
      params: invitationIdGuard,
      body: z.object({ status: z.literal(OrganizationInvitationStatus.Accepted) }),
      status: [204, 403, 404, 422, 501],
    }),
    async (ctx, next) => {
      assertNotCloud();

      await assertLicenseGrants('consoleCollaboration');

      const { invitationId } = ctx.guard.params;
      const { id: userId } = ctx.auth;

      // One transaction: joining the tenant and getting Console access never happen apart, and a
      // concurrent removal or revocation waits for it, then sees its result.
      await withTenantMembership(tenant, async (membership) => {
        const { invitee } = await findOwnInvitation(invitationId, userId, membership);

        await organizationInvitations.updateStatus(
          invitationId,
          OrganizationInvitationStatus.Accepted,
          userId,
          membership.connection
        );
        // The links of this invitation have served their purpose.
        await membership.oneTimeTokens.revokeActiveOneTimeTokensByEmail(invitee);
        await membership.consoleAccess.grant(userId);

        const { customData } = await membership.users.findUserById(userId);
        const onboarding = ossUserOnboardingDataGuard.safeParse(
          customData[ossUserOnboardingDataKey]
        );
        await membership.users.updateUserById(userId, {
          customData: {
            ...customData,
            [ossUserOnboardingDataKey]: {
              ...(onboarding.success ? onboarding.data : {}),
              isOnboardingDone: true,
            },
          },
        });
      });

      ctx.status = 204;

      return next();
    }
  );
}
