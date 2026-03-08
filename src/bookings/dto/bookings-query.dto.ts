import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class BookingsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  studentId?: number;

  @ApiPropertyOptional({ example: 2 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  lessonId?: number;
}
