import Head from 'next/head';
import dynamic from 'next/dynamic';

import { useSigninCheck } from 'reactfire';

import configuration from '~/configuration';
import { LayoutStyle } from '~/core/layout-style';
import Layout from '~/core/ui/Layout';
import { isBrowser } from '~/core/generic/is-browser';

const FirebaseFirestoreProvider = dynamic(
  () => import('~/core/firebase/components/FirebaseFirestoreProvider'),
);

const SentryProvider = dynamic(() => import('~/components/SentryProvider'));

const GuardedPage = dynamic(
  () => import('~/core/firebase/components/GuardedPage'),
);

const RouteShellWithSidebar = dynamic(
  () => import('./layouts/sidebar/RouteShellWithSidebar'),
);

const RouteShellWithTopNavigation = dynamic(
  () => import('./layouts/header/RouteShellWithTopNavigation'),
);

const Sonner = getSonner();

const RouteShell: React.FCC<{
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  style?: LayoutStyle;
}> = ({ title, style, description, children }) => {
  const layout = style ?? configuration.navigation.style;
  const redirectPath = useRedirectPathWhenSignedOut();

  return (
    <FirebaseFirestoreProvider>
      <Head>
        <title key="title">{title}</title>
      </Head>

      <GuardedPage whenSignedOut={redirectPath}>
        <SentryProvider>
          <Layout>
            <Sonner richColors position={'top-center'} />

            <LayoutRenderer
              style={layout}
              title={title}
              description={description}
            >
              <OnAuthReady>{children}</OnAuthReady>
            </LayoutRenderer>
          </Layout>
        </SentryProvider>
      </GuardedPage>
    </FirebaseFirestoreProvider>
  );
};

function LayoutRenderer(
  props: React.PropsWithChildren<{
    title: string | React.ReactNode;
    description?: string | React.ReactNode;
    style: LayoutStyle;
  }>,
) {
  switch (props.style) {
    case LayoutStyle.Sidebar: {
      return (
        <RouteShellWithSidebar
          description={props.description}
          title={props.title}
        >
          {props.children}
        </RouteShellWithSidebar>
      );
    }

    case LayoutStyle.TopHeader: {
      return (
        <RouteShellWithTopNavigation title={props.title}>
          {props.children}
        </RouteShellWithTopNavigation>
      );
    }

    case LayoutStyle.Custom:
      return <>{props.children}</>;
  }
}

export default RouteShell;

function OnAuthReady(props: React.PropsWithChildren) {
  const signIn = useSigninCheck();

  if (signIn.status === 'loading') {
    return null;
  }

  if (signIn.status === 'error') {
    return null;
  }

  if (signIn.data.signedIn) {
    return props.children;
  }

  return null;
}

function getSonner() {
  return dynamic(
    async () => {
      const { Toaster } = await import('sonner');

      return Toaster;
    },
    {
      ssr: false,
    },
  );
}

function useRedirectPathWhenSignedOut() {
  const paths = configuration.paths;

  const queryParam = new URLSearchParams({
    signOut: 'true',
    returnUrl: isBrowser() ? window.location.pathname : paths.appHome,
  });

  return `${paths.signIn}?${queryParam.toString()}`;
}
