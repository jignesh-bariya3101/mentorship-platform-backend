import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class LessonsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'algebra' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  search?: string;
}
