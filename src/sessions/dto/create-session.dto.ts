import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  lessonId!: number;

  @ApiProperty({ example: '2026-03-15T10:00:00.000Z' })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: 'Algebra basics and expressions' })
  @IsString()
  @MaxLength(180)
  topic!: string;

  @ApiPropertyOptional({ example: 'Reviewed expressions and assigned revision work.' })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  summary?: string;
}
