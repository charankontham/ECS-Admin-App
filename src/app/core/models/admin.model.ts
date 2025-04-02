export interface Admin {
  id?: number;
  adminUsername: string;
  adminName?: string;
  adminPassword: string;
  adminRole?: { subRole: string; roleName: string };
}
