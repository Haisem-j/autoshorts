import { useCallback, useContext } from 'react';
import { GetServerSidePropsContext } from 'next';
import { Trans } from 'next-i18next';
import { UserInfo } from 'firebase/auth';
import { useUser } from 'reactfire';

import FirebaseStorageProvider from '~/core/firebase/components/FirebaseStorageProvider';

import { withAppProps } from '~/lib/props/with-app-props';
import { UserSessionContext } from '~/core/session/contexts/user-session';

import UpdateProfileForm from '~/components/profile/UpdateProfileForm';
import ProfileSettingsTabs from '~/components/profile/ProfileSettingsTabs';
import SettingsPageContainer from '~/components/settings/SettingsPageContainer';
import SettingsContentContainer from '~/components/settings/SettingsContentContainer';
import SettingsTile from '~/components/settings/SettingsTile';

type ProfileData = Partial<UserInfo>;

const Profile = () => {
  const { userSession, setUserSession } = useContext(UserSessionContext);
  const { data: user } = useUser();

  const onUpdate = useCallback(
    (data: ProfileData) => {
      const authData = userSession?.auth;

      if (authData) {
        setUserSession({
          auth: {
            ...authData,
            ...data,
          },
          data: userSession.data,
        });
      }
    },
    [setUserSession, userSession]
  );

  if (!user) {
    return null;
  }

  return (
    <FirebaseStorageProvider>
      <SettingsPageContainer title={'Settings'}>
        <ProfileSettingsTabs />

        <SettingsContentContainer>
          <SettingsTile heading={<Trans i18nKey={'profile:generalTab'} />}>
            <UpdateProfileForm user={user} onUpdate={onUpdate} />
          </SettingsTile>
        </SettingsContentContainer>
      </SettingsPageContainer>
    </FirebaseStorageProvider>
  );
};

export default Profile;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await withAppProps(ctx);
}
