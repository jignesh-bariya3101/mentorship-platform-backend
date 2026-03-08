import {
  BadGatewayException,
  Injectable,
  PayloadTooLargeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SummarizeTextDto } from './dto/summarize-text.dto';

@Injectable()
export class LlmService {
  private readonly model: string;
  private readonly maxInputChars: number;
  private readonly client: OpenAI | null;

  constructor(private readonly configService: ConfigService) {
    this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4.1-mini');
    this.maxInputChars = Number(
      this.configService.get('LLM_MAX_INPUT_CHARS', 8000),
    );

    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.client = apiKey ? new OpenAI({ apiKey }) : null;
  }

  async summarize(dto: SummarizeTextDto) {
    if (dto.text.length > this.maxInputChars) {
      throw new PayloadTooLargeException(
        `Text exceeds maximum allowed length of ${this.maxInputChars} characters`,
      );
    }

    if (!this.client) {
      throw new BadGatewayException(
        'LLM provider is not configured. Please set OPENAI_API_KEY',
      );
    }

    try {
      const prompt = [
        'Summarize the following mentoring text in exactly 3 to 6 concise bullet points.',
        'Keep the response within 120 words.',
        'Return bullet points only. Do not add a heading.',
        '',
        dto.text,
      ].join('\n');

      const response = await this.client.responses.create({
        model: this.model,
        input: prompt,
        max_output_tokens: 180,
      });

      const summary = response.output_text?.trim();

      if (!summary) {
        throw new Error('Empty summary returned by provider');
      }

      return {
        message: 'Text summarized successfully',
        data: {
          summary,
          model: this.model,
        },
      };
    } catch (error) {
      if (error instanceof PayloadTooLargeException) {
        throw error;
      }

      throw new BadGatewayException('LLM provider request failed');
    }
  }
}
