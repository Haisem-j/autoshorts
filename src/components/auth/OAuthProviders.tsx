import { useCallback, useEffect, useRef, useState } from 'react';

import { Trans } from 'next-i18next';
import { useAuth } from 'reactfire';

import {
  MultiFactorError,
  UserCredential,
  User,
  getRedirectResult,
  browserPopupRedirectResolver,
} from 'firebase/auth';

import AuthProviderButton from '~/core/ui/AuthProviderButton';
import { useSignInWithProvider } from '~/core/firebase/hooks';
import { getFirebaseErrorCode } from '~/core/firebase/utils/get-firebase-error-code';

import If from '~/core/ui/If';
import LoadingOverlay from '~/core/ui/LoadingOverlay';

import AuthErrorMessage from './AuthErrorMessage';
import MultiFactorAuthChallengeModal from '~/components/auth/MultiFactorAuthChallengeModal';
import { isMultiFactorError } from '~/core/firebase/utils/is-multi-factor-error';

import useCreateServerSideSession from '~/core/hooks/use-create-server-side-session';
import configuration from '~/configuration';

const OAUTH_PROVIDERS = configuration.auth.providers.oAuth;

const OAuthProviders: React.FCC<{
  onSignIn: () => unknown;
}> = ({ onSignIn }) => {
  const auth = useAuth();

  const {
    signInWithProvider,
    state: signInWithProviderState,
    resetState,
  } = useSignInWithProvider();

  const [sessionRequest, sessionRequestState] = useCreateServerSideSession();
  const [checkingRedirect, setCheckingRedirect] = useState(true);
  const didCheckRedirect = useRef(false);
  const isSigningIn = useRef(false);

  // we make the UI "busy" until the next page is fully loaded
  const loading =
    signInWithProviderState.loading ||
    sessionRequestState.isMutating ||
    sessionRequestState.data ||
    isSigningIn.current;

  const shouldDisplayLoading = loading || checkingRedirect;

  const [multiFactorAuthError, setMultiFactorAuthError] =
    useState<Maybe<MultiFactorError>>();

  const createSession = useCallback(
    async (user: User) => {
      if (loading || isSigningIn.current) {
        return;
      }

      isSigningIn.current = true;

      try {
        await sessionRequest(user);

        onSignIn();
      } finally {
        isSigningIn.current = false;
      }
    },
    [sessionRequest, loading, onSignIn],
  );

  const onSignInWithProvider = useCallback(
    async (signInRequest: () => Promise<UserCredential | undefined>) => {
      try {
        const credential = await signInRequest();

        if (!credential) {
          return Promise.reject();
        }

        if (!configuration.auth.useRedirectStrategy) {
          await createSession(credential.user);
        }
      } catch (error) {
        if (isMultiFactorError(error)) {
          setMultiFactorAuthError(error as MultiFactorError);
        } else {
          throw getFirebaseErrorCode(error);
        }
      }
    },
    [createSession],
  );

  useEffect(() => {
    async function checkRedirectSignIn() {
      if (loading || didCheckRedirect.current) {
        return;
      }

      return getRedirectResult(auth, browserPopupRedirectResolver).then(
        async (result) => {
          if (result) {
            setCheckingRedirect(true);

            return createSession(result.user);
          }

          setCheckingRedirect(false);
        },
      );
    }

    void checkRedirectSignIn();
  }, [auth, loading, createSession]);

  if (!OAUTH_PROVIDERS || !OAUTH_PROVIDERS.length) {
    return null;
  }

  return (
    <>
      <If condition={shouldDisplayLoading}>
        <LoadingOverlay
          displayLogo={false}
          className={'m-0 !h-full !w-full rounded-xl'}
        >
          <Trans i18nKey={'auth:signingIn'} />
        </LoadingOverlay>
      </If>

      <div className={'flex w-full flex-1 flex-col space-y-3'}>
        <div className={'flex-col space-y-2'}>
          {OAUTH_PROVIDERS.map((OAuthProviderClass) => {
            const providerInstance = new OAuthProviderClass();
            const providerId = providerInstance.providerId;

            return (
              <AuthProviderButton
                key={providerId}
                providerId={providerId}
                onClick={() => {
                  return onSignInWithProvider(() =>
                    signInWithProvider(providerInstance),
                  );
                }}
              >
                <Trans
                  i18nKey={'auth:signInWithProvider'}
                  values={{
                    provider: getProviderName(providerId),
                  }}
                />
              </AuthProviderButton>
            );
          })}
        </div>

        <If
          condition={signInWithProviderState.error || sessionRequestState.error}
        >
          {(error) => <AuthErrorMessage error={getFirebaseErrorCode(error)} />}
        </If>
      </div>

      <If condition={multiFactorAuthError}>
        {(error) => (
          <MultiFactorAuthChallengeModal
            error={error}
            isOpen={true}
            setIsOpen={(isOpen: boolean) => {
              setMultiFactorAuthError(undefined);

              // when the MFA modal gets closed without verification
              // we reset the state
              if (!isOpen) {
                resetState();
              }
            }}
            onSuccess={async (credential) => {
              return createSession(credential.user);
            }}
          />
        )}
      </If>
    </>
  );
};

function getProviderName(providerId: string) {
  const capitalize = (value: string) =>
    value.slice(0, 1).toUpperCase() + value.slice(1);

  if (providerId.endsWith('.com')) {
    return capitalize(providerId.split('.com')[0]);
  }

  return capitalize(providerId);
}

export default OAuthProviders;
