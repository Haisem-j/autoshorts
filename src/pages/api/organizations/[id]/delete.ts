import { NextApiRequest, NextApiResponse } from 'next';

import { withPipe } from '~/core/middleware/with-pipe';
import withCsrf from '~/core/middleware/with-csrf';
import { withMethodsGuard } from '~/core/middleware/with-methods-guard';
import { withAuthedUser } from '~/core/middleware/with-authed-user';
import getRestFirestore from '~/core/firebase/admin/get-rest-firestore';

import {
  throwForbiddenException,
  throwNotFoundException,
} from '~/core/http-exceptions';

import { getStripeInstance } from '~/core/stripe/get-stripe';
import logger from '~/core/logger';

import { ORGANIZATIONS_COLLECTION } from '~/lib/firestore-collections';
import { getUserRoleByOrganization } from '~/lib/server/organizations/memberships';
import { MembershipRole } from '~/lib/organizations/types/membership-role';
import { Organization } from '~/lib/organizations/types/organization';

async function deleteOrganizationHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const organizationId = req.query.id as string;
  const userId = req.firebaseUser.uid;

  const firestore = getRestFirestore();

  const role = await getUserRoleByOrganization({
    userId,
    organizationId,
  });

  // check if user is in organization
  if (!role) {
    return throwNotFoundException(`User ${userId} not found in organization`);
  }

  // check if user is owner
  if (role !== MembershipRole.Owner) {
    return throwForbiddenException(`Only owner can delete organization`);
  }

  const organizationRef = firestore
    .collection(ORGANIZATIONS_COLLECTION)
    .doc(organizationId);

  const data = await organizationRef
    .get()
    .then((doc) => doc.data() as Organization);

  // we need to check if organization exists
  if (!data) {
    return throwNotFoundException(`Organization ${organizationId} not found`);
  }

  // if organization has a subscription, cancel it
  if (data.subscription) {
    await cancelStripeSubscription(data.subscription.id);
  }

  // delete organization from database
  await organizationRef.delete();

  return res.status(200).json({
    success: true,
  });
}

export default withPipe(
  withCsrf(),
  withMethodsGuard(['POST']),
  withAuthedUser,
  deleteOrganizationHandler,
);

/**
 * Cancels a Stripe subscription when an organization is deleted.
 *
 * @param {string} subscriptionId - The ID of the subscription to be cancelled.
 * @return {Promise<void>} - A promise that resolves when the subscription is cancelled or rejects with an error.
 */
async function cancelStripeSubscription(subscriptionId: string) {
  const stripe = await getStripeInstance();

  try {
    await stripe.subscriptions.cancel(subscriptionId, {
      invoice_now: true,
    });
  } catch (e) {
    logger.error(
      {
        e,
      },
      'Failed to cancel stripe subscription',
    );

    throw e;
  }
}
