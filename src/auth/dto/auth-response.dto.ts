import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

class UserInfoDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: Role })
  role!: Role;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ type: UserInfoDto })
  user!: UserInfoDto;
}
