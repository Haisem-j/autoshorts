import React, { useMemo } from 'react';
import { EmailAuthProvider, User } from 'firebase/auth';

import NavigationItem from '~/core/ui/Navigation/NavigationItem';

const links = {
  General: {
    path: '/settings/profile',
    i18n: 'profile:generalTab',
  },
  Email: {
    path: '/settings/profile/email',
    i18n: 'profile:emailTab',
  },
  Password: {
    path: '/settings/profile/password',
    i18n: 'profile:passwordTab',
  },
};

const ProfileSettingsTabs: React.FCC<{
  user: User;
}> = ({ user }) => {
  // user can only edit email and password
  // if they signed up with the EmailAuthProvider provider
  const canEditEmailAndPassword = useMemo(() => {
    const emailProviderId = EmailAuthProvider.PROVIDER_ID;

    return user.providerData.some((item) => {
      return item.providerId === emailProviderId;
    });
  }, [user]);

  const itemClassName = `flex justify-center md:justify-start items-center flex-auto sm:flex-initial`;

  return (
    <div
      className={
        'flex flex-row justify-between space-x-2 md:justify-start' +
        ' sm:flex-col sm:space-x-0 sm:space-y-2'
      }
    >
      <NavigationItem
        className={itemClassName}
        link={links.General}
        depth={0}
      />

      <NavigationItem
        className={itemClassName}
        disabled={!canEditEmailAndPassword}
        link={links.Email}
      />

      <NavigationItem
        className={itemClassName}
        disabled={!canEditEmailAndPassword}
        link={links.Password}
      />
    </div>
  );
};

export default ProfileSettingsTabs;
