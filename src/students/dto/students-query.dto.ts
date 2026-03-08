import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class StudentsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'megh' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
