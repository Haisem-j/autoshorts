import { NextApiRequest, NextApiResponse } from 'next';
import { destroyCookie } from 'nookies';

import { withPipe } from '~/core/middleware/with-pipe';
import withCsrf from '~/core/middleware/with-csrf';
import { withMethodsGuard } from '~/core/middleware/with-methods-guard';
import { withAuthedUser } from '~/core/middleware/with-authed-user';
import { deleteOrganization } from '~/lib/server/organizations/delete-organization';
import logger from '~/core/logger';

async function deleteOrganizationHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const organizationId = req.query.id as string;
  const userId = req.firebaseUser.uid;

  logger.info(
    {
      organizationId,
      userId,
    },
    `User requested to delete organization. Deleting...`,
  );

  await deleteOrganization({
    organizationId,
    userId,
  });

  destroyCookie({ res }, 'organizationId');
  destroyCookie({ res }, 'sessionId');

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
