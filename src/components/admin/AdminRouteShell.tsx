import AdminProviders from '~/components/admin/AdminProviders';
import AdminSidebar from '~/components/admin/AdminSidebar';
import { Page } from '~/core/ui/Page';

function AdminRouteShell(props: React.PropsWithChildren) {
  return (
    <AdminProviders>
      <Page sidebar={<AdminSidebar />}>{props.children}</Page>
    </AdminProviders>
  );
}

export default AdminRouteShell;
