import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from 'firebase-admin/auth';

import { withAuthedUser } from '~/core/middleware/with-authed-user';
import { withPipe } from '~/core/middleware/with-pipe';
import { withMethodsGuard } from '~/core/middleware/with-methods-guard';
import { getCurrentOrganization } from '~/lib/server/organizations/get-current-organization';
import {
  throwForbiddenException,
  throwNotFoundException,
} from '~/core/http-exceptions';
import { withExceptionFilter } from '~/core/middleware/with-exception-filter';

async function organizationTokenHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = req.firebaseUser.uid;
  const organizationId = req.cookies.organizationId;

  if (!userId || !organizationId) {
    return throwForbiddenException(res);
  }

  const organization = await getCurrentOrganization(userId);

  if (!organization) {
    return throwForbiddenException(res);
  }

  const auth = getAuth();
  const user = await auth.getUser(userId);

  if (!user) {
    return throwNotFoundException(res);
  }

  await auth.setCustomUserClaims(userId, {
    ...(user.customClaims ?? {}),
    organizationId,
  });

  return res.send({ success: true });
}

export default function (req: NextApiRequest, res: NextApiResponse) {
  const handler = withPipe(
    withMethodsGuard(['POST']),
    withAuthedUser,
    organizationTokenHandler
  );

  return withExceptionFilter(req, res)(handler);
}
