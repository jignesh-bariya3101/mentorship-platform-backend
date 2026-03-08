import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ example: 'Algebra Foundations' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @ApiProperty({ example: 'Introductory algebra class for students.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description!: string;
}
