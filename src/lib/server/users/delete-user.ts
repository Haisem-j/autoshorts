import { getAuth, DecodedIdToken as User } from 'firebase-admin/auth';

import { deleteOrganization } from '~/lib/server/organizations/delete-organization';
import logger from '~/core/logger';
import { getUserRefById } from '~/lib/server/queries';
import { getOrganizationsForUser } from '~/lib/admin/queries';
import { MembershipRole } from '~/lib/organizations/types/membership-role';
import renderAccountDeleteEmail from '~/lib/emails/account-delete';
import { sendEmail } from '~/core/email/send-email';

import configuration from '~/configuration';

/**
 * Deletes a user and all associated organizations.
 *
 * @param user - The Firebase Auth User instance to delete.
 * @param {object} params - Additional parameters.
 * @param {boolean} params.sendEmail - Whether or not to send an email to the user confirming account deletion.
 **/
export async function deleteUser(
  user: User,
  params: {
    sendEmail?: boolean;
  },
) {
  const userId = user.uid;
  const userOrganizations = await getUserOwnedOrganizations(userId);

  const requests = userOrganizations.map((organization) => {
    const organizationId = organization.id;

    return deleteOrganization({ organizationId, userId });
  });

  const ids = userOrganizations.map(({ id }) => id);

  logger.info(
    {
      userId,
      organizations: ids,
    },
    `Deleting organizations user is Owner of...`,
  );

  await Promise.all(requests);

  logger.info(
    {
      userId,
      organizations: ids,
    },
    `Deleted organizations user is Owner of.`,
  );

  logger.info(
    {
      userId,
    },
    `Deleting user record and auth record...`,
  );

  const userRecord = await getUserRefById(userId);
  const authRecord = getAuth().deleteUser(userId);

  await Promise.all([userRecord.ref.delete(), authRecord]);

  logger.info(
    {
      userId,
    },
    `Successfully deleted user record and auth record.`,
  );

  const shouldSendEmail = params.sendEmail !== false;

  // if user has an email, send them an email confirming account deletion
  const userEmail = user.email;

  if (shouldSendEmail && userEmail) {
    const userDisplayName = user.displayName || userEmail;

    logger.info({ userId }, `Sending account deletion email...`);

    try {
      await sendAccountDeleteEmail({
        email: userEmail,
        userDisplayName,
      });

      logger.info({ userId }, `Successfully sent account deletion email.`);
    } catch (error) {
      console.error(error);
      logger.error(
        {
          userId,
          error,
        },
        `Failed to send account deletion email.`,
      );
    }
  }
}

async function getUserOwnedOrganizations(userId: string) {
  return getOrganizationsForUser(userId).then((organizations) => {
    return organizations.filter(
      (organization) => organization.role === MembershipRole.Owner,
    );
  });
}

async function sendAccountDeleteEmail(params: {
  userDisplayName: string;
  email: string;
}) {
  const productName = configuration.site.siteName;

  const accountDeleteEmail = renderAccountDeleteEmail({
    productName,
    userDisplayName: params.userDisplayName,
  });

  const subject = `Confirmation of Account Deletion on ${productName}`;
  const from = process.env.EMAIL_SENDER;

  if (!from) {
    throw new Error(`Missing EMAIL_SENDER env variable.`);
  }

  return sendEmail({
    to: params.email,
    subject,
    html: accountDeleteEmail,
    from,
  });
}
