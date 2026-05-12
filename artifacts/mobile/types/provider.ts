export type AccountRole = 'provider' | 'user';

export interface Provider {
  id: string;
  name: string;
  email: string;
  password: string;
  role: AccountRole;
  createdAt: number;
}
