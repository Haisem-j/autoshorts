'use client';

import Link from 'next/link';

import {
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';

import { Trans } from 'next-i18next';
import { useAuth } from 'reactfire';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/core/ui/Dropdown';

import NAVIGATION_CONFIG from '../navigation.config';
import Modal from '~/core/ui/Modal';
import OrganizationsSelector from '~/components/organizations/OrganizationsSelector';
import Heading from '~/core/ui/Heading';

const MobileAppNavigation = () => {
  const Links = NAVIGATION_CONFIG.items.map((item) => {
    return (
      <DropdownLink
        key={item.path}
        Icon={item.Icon}
        path={item.path}
        label={item.label}
      />
    );
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Bars3Icon className={'h-9'} />
      </DropdownMenuTrigger>

      <DropdownMenuContent sideOffset={10} className={'rounded-none w-screen'}>
        <OrganizationsModal />

        {Links}

        <DropdownMenuSeparator />
        <SignOutDropdownItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MobileAppNavigation;

function SignOutDropdownItem() {
  const auth = useAuth();

  return (
    <DropdownMenuItem
      className={'flex w-full items-center space-x-4 h-12'}
      onClick={() => auth.signOut()}
    >
      <ArrowLeftOnRectangleIcon className={'h-5'} />
      <span>
        <Trans i18nKey={'common:signOut'} defaults={'Sign out'} />
      </span>
    </DropdownMenuItem>
  );
}

function DropdownLink(
  props: React.PropsWithChildren<{
    path: string;
    label: string;
    Icon: React.ElementType;
  }>,
) {
  return (
    <DropdownMenuItem asChild key={props.path}>
      <Link
        href={props.path}
        className={'flex w-full items-center space-x-4 h-12'}
      >
        <props.Icon className={'h-5'} />

        <span>
          <Trans i18nKey={props.label} defaults={props.label} />
        </span>
      </Link>
    </DropdownMenuItem>
  );
}

function OrganizationsModal() {
  return (
    <Modal
      Trigger={
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <button className={'flex items-center space-x-4'}>
            <BuildingLibraryIcon className={'h-5'} />
            <span>
              <Trans i18nKey={'common:yourOrganizations'} />
            </span>
          </button>
        </DropdownMenuItem>
      }
      heading={<Trans i18nKey={'common:yourOrganizations'} />}
    >
      <div className={'flex flex-col space-y-6 py-4'}>
        <Heading type={6}>Select an organization below to switch to it</Heading>

        <OrganizationsSelector displayName />
      </div>
    </Modal>
  );
}
