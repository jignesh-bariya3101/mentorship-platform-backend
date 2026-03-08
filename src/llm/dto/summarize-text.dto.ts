import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SummarizeTextDto {
  @ApiProperty({
    example:
      'During the lesson the mentor reviewed algebra basics. The parent asked for additional homework so the student can practice more at home. The student may also need some revision before the next session.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  @MaxLength(12000)
  text!: string;
}
