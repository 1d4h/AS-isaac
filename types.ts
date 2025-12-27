
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface CustomerData {
  id: string;
  name: string;
  phone: string;
  address: string;
  memo?: string;
  status: 'pending' | 'active' | 'completed';
  lat?: number;
  lng?: number;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
}
