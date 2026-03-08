import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'Jignesh Bariya' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName!: string;

  @ApiProperty({ example: 'jignesh@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Hello@123',
    description: 'Minimum 8 characters with at least one uppercase, one lowercase, one number, and one special character.',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
    message:
      'Password must include uppercase, lowercase, number, and special character',
  })
  password!: string;

  @ApiProperty({ enum: Role, example: Role.PARENT })
  @IsEnum(Role)
  role!: Role;
}
