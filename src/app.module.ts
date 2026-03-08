import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { HealthModule } from './health/health.module';
import { LessonsModule } from './lessons/lessons.module';
import { LlmModule } from './llm/llm.module';
import { PrismaModule } from './prisma/prisma.module';
import { SessionsModule } from './sessions/sessions.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: Number(configService.get('THROTTLE_TTL_MS', 60000)),
          limit: Number(configService.get('THROTTLE_LIMIT', 20)),
        },
      ],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    StudentsModule,
    LessonsModule,
    BookingsModule,
    SessionsModule,
    LlmModule,
  ],
})
export class AppModule {}
