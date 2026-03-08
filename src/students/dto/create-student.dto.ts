import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 'Megh Bariya' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName!: string;

  @ApiPropertyOptional({ example: 'megh@gmail.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '2015-08-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'Needs more support in mathematics.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
