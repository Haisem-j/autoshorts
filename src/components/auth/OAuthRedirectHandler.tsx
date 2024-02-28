import { useLayoutEffect, useState } from 'react';
import { useAuth } from 'reactfire';

import {
  browserPopupRedirectResolver,
  getRedirectResult,
  User,
} from 'firebase/auth';

import type { FirebaseError } from 'firebase/app';

let didCheckRedirect = false;
let didSignIn = false;

export default function OAuthRedirectHandler({
  onSignIn,
  onError,
  children,
}: React.PropsWithChildren<{
  onSignIn: (user: User) => unknown;
  onError: (error: FirebaseError) => unknown;
}>) {
  const auth = useAuth();
  const [checkingRedirect, setCheckingRedirecting] = useState(true);

  useLayoutEffect(() => {
    if (didCheckRedirect) {
      if (!didSignIn) {
        setCheckingRedirecting(false);
      }

      return;
    }
  }, []);

  useLayoutEffect(() => {
    async function checkRedirectSignIn() {
      // prevent multiple calls
      didCheckRedirect = true;

      try {
        const credential = await getRedirectResult(
          auth,
          browserPopupRedirectResolver,
        );

        if (credential) {
          didSignIn = true;
          await onSignIn(credential.user);
        } else {
          setCheckingRedirecting(false);
        }
      } catch (error) {
        setCheckingRedirecting(false);

        onError(error as FirebaseError);
      }
    }

    void checkRedirectSignIn();
  }, [auth, onSignIn, checkingRedirect, onError]);

  if (checkingRedirect) {
    return children;
  }

  return null;
}
