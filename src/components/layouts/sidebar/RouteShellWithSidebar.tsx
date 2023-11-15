import { useEffect } from 'react';

import { isBrowser } from '~/core/generic/is-browser';
import AppSidebar from './AppSidebar';
import { Page, PageBody, PageHeader } from '~/core/ui/Page';
import MobileAppNavigation from '~/components/MobileNavigation';

const RouteShellWithSidebar: React.FCC<{
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
}> = ({ title, description, children }) => {
  useDisableBodyScrolling();

  return (
    <Page sidebar={<AppSidebar />}>
      <PageHeader
        mobileNavigation={<MobileAppNavigation />}
        title={title}
        description={description}
      />

      <PageBody>{children}</PageBody>
    </Page>
  );
};

export default RouteShellWithSidebar;

function useDisableBodyScrolling() {
  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    document.body.style.setProperty('overflow', 'hidden');

    return () => {
      document.body.style.removeProperty('overflow');
    };
  }, []);
}
