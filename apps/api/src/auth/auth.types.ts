export interface AuthContext {
  userId: string;
  accountId: string;
  role: 'owner' | 'member';
}

export interface PublicProfile {
  user: {
    id: string;
    email: string;
    name: string;
    color: string;
  };
  account: {
    id: string;
    name: string;
    plan: string;
  };
}
