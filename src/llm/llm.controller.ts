import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LlmService } from './llm.service';
import { SummarizeTextDto } from './dto/summarize-text.dto';

@ApiTags('LLM')
@ApiBearerAuth()
@Controller('llm')
@UseGuards(ThrottlerGuard)
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Post('summarize')
  @ApiOperation({
    summary: 'Summarize input text using an LLM with validation and rate limiting',
  })
  summarize(@Body() dto: SummarizeTextDto) {
    return this.llmService.summarize(dto);
  }
}
