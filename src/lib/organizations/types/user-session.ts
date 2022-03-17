import { User as AuthUser } from 'firebase/auth';
import { UserData } from '~/lib/organizations/types/user-data';

/**
 * This interface combines the user's metadata from
 * Firebase Auth and the user's record in Firestore
 */
export interface UserSession {
  auth: AuthUser | undefined;
  data: UserData | undefined;
}
