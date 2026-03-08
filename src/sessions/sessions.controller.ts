import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { CreateSessionDto } from './dto/create-session.dto';
import { JoinSessionDto } from './dto/join-session.dto';
import { LessonSessionsQueryDto } from './dto/lesson-sessions-query.dto';
import { SessionsService } from './sessions.service';

@ApiTags('Sessions')
@ApiBearerAuth()
@Controller()
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('sessions')
  @Roles(Role.MENTOR)
  @ApiOperation({ summary: 'Create a session under a lesson as the logged-in mentor' })
  createSession(@CurrentUser() user: AuthUser, @Body() dto: CreateSessionDto) {
    return this.sessionsService.createSession(user, dto);
  }

  @Get('lessons/:id/sessions')
  @ApiOperation({ summary: 'Get sessions for a lesson with pagination' })
  getLessonSessions(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) lessonId: number,
    @Query() query: LessonSessionsQueryDto,
  ) {
    return this.sessionsService.getLessonSessions(user, lessonId, query);
  }

  @Post('sessions/:id/join')
  @ApiOperation({
    summary:
      'Join a student to a session. Parent can join their own student; mentor can join students booked into their own lesson.',
  })
  joinSession(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) sessionId: number,
    @Body() dto: JoinSessionDto,
  ) {
    return this.sessionsService.joinSession(user, sessionId, dto);
  }
}
