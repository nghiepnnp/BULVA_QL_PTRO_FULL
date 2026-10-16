import { UserStatus } from '../../../common/enums/enum.js';

export interface RequestAuthenticated {
  user: User;
}

export interface User {
  id: string;
  username: string;
  email: string;
  status: UserStatus;
}
