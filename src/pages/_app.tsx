import '../styles/index.css';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';

import type { User as AuthUser } from 'firebase/auth';
import { appWithTranslation, SSRConfig } from 'next-i18next';

import configuration from '~/configuration';

import FirebaseAppShell from '~/core/firebase/components/FirebaseAppShell';
import FirebaseAuthProvider from '~/core/firebase/components/FirebaseAuthProvider';

import { Organization } from '~/lib/organizations/types/organization';
import { OrganizationContext } from '~/lib/contexts/organization';
import { UserData } from '~/core/session/types/user-data';
import { UserSessionContext } from '~/core/session/contexts/user-session';
import { UserSession } from '~/core/session/types/user-session';
import { loadSelectedTheme } from '~/core/theming';

import { useAnalyticsTracking } from '~/core/firebase/hooks/use-analytics-tracking';
import FirebaseAnalyticsProvider from '~/core/firebase/components/FirebaseAnalyticsProvider';
import { isBrowser } from '~/core/generic';
import FirebaseAppCheckProvider from '~/core/firebase/components/FirebaseAppCheckProvider';

interface DefaultPageProps extends SSRConfig {
  session?: Maybe<AuthUser>;
  user?: Maybe<UserData>;
  organization?: Maybe<WithId<Organization>>;
  refreshClaims?: boolean;
  csrfToken?: string;
}

function App(
  props: AppProps<DefaultPageProps> & { pageProps: DefaultPageProps }
) {
  const { Component } = props;
  const pageProps = props.pageProps as DefaultPageProps;
  const { emulator, firebase } = configuration;

  const userSessionContext: UserSession = useMemo(() => {
    return {
      auth: pageProps.session,
      data: pageProps.user,
    };
  }, [pageProps]);

  const [organization, setOrganization] = useState<
    DefaultPageProps['organization']
  >(pageProps.organization);

  const [userSession, setUserSession] =
    useState<Maybe<UserSession>>(userSessionContext);

  const updateCurrentOrganization = useCallback(() => {
    setOrganization(pageProps.organization);
  }, [pageProps.organization]);

  const refreshClaims = props.pageProps.refreshClaims ?? false;

  useEffect(updateCurrentOrganization, [updateCurrentOrganization]);

  return (
    <FirebaseAppShell config={firebase}>
      <FirebaseAppCheckProvider>
        <FirebaseAuthProvider
          refreshClaims={refreshClaims}
          userSession={userSession}
          setUserSession={setUserSession}
          useEmulator={emulator}
        >
          <FirebaseAnalyticsProvider>
            <UserSessionContext.Provider
              value={{ userSession, setUserSession }}
            >
              <OrganizationContext.Provider
                value={{ organization, setOrganization }}
              >
                <AnalyticsTrackingEventsProvider>
                  <CsrfTokenMetaAttribute csrfToken={pageProps.csrfToken} />
                  <Component {...pageProps} />
                </AnalyticsTrackingEventsProvider>
              </OrganizationContext.Provider>
            </UserSessionContext.Provider>
          </FirebaseAnalyticsProvider>
        </FirebaseAuthProvider>
      </FirebaseAppCheckProvider>
    </FirebaseAppShell>
  );
}

export default appWithTranslation<AppProps & { pageProps: DefaultPageProps }>(
  App
);

function AnalyticsTrackingEventsProvider({
  children,
}: React.PropsWithChildren) {
  function InnerAnalyticsProvider() {
    useAnalyticsTracking();

    return <>{children}</>;
  }

  const shouldUseAnalytics = isBrowser() && !configuration.emulator;

  return shouldUseAnalytics ? <InnerAnalyticsProvider /> : <>{children}</>;
}

function CsrfTokenMetaAttribute({ csrfToken }: { csrfToken: Maybe<string> }) {
  if (!csrfToken) {
    return null;
  }

  return (
    <Head>
      <meta name={'csrf-token'} content={csrfToken} />
    </Head>
  );
}

/**
 * Load selected theme
 * Do not add it as an effect to _app.tsx, the flashing is very visible
 */
if (isBrowser()) {
  loadSelectedTheme();
}
