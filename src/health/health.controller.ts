import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  getHealth() {
    return {
      message: 'Health check successful',
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
