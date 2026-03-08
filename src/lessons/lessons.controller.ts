import { Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { LessonsQueryDto } from './dto/lessons-query.dto';
import { LessonsService } from './lessons.service';

@ApiTags('Lessons')
@ApiBearerAuth()
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @Roles(Role.MENTOR)
  @ApiOperation({ summary: 'Create a lesson as the logged-in mentor' })
  createLesson(@CurrentUser() user: AuthUser, @Body() dto: CreateLessonDto) {
    return this.lessonsService.createLesson(user, dto);
  }

  @Get()
  @ApiOperation({
    summary:
      'Get lessons with pagination and optional search. Mentors only see their own lessons; parents can browse lessons.',
  })
  getLessons(@CurrentUser() user: AuthUser, @Query() query: LessonsQueryDto) {
    return this.lessonsService.getLessons(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single lesson detail' })
  getLessonById(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.lessonsService.getLessonById(user, id);
  }
}
