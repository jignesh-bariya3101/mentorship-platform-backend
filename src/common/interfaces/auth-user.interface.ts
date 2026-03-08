import { Role } from '../enums/role.enum';

export interface AuthUser {
  sub: number;
  email: string;
  role: Role;
}
