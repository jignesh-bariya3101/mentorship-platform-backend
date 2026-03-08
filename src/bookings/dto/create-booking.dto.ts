import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  studentId!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  lessonId!: number;
}
