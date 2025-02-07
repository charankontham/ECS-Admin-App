export interface User {
  id: number;
  username: string;
  role: 'inventory-admin' | 'logistics-admin' | 'marketing-admin';
  token: string;
}
