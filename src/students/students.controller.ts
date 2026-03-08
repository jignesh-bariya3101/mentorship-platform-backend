import { Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentsQueryDto } from './dto/students-query.dto';
import { StudentsService } from './students.service';
import { Body } from '@nestjs/common';

@ApiTags('Students')
@ApiBearerAuth()
@Roles(Role.PARENT)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a student under the logged-in parent account' })
  createStudent(@CurrentUser() user: AuthUser, @Body() dto: CreateStudentDto) {
    return this.studentsService.createStudent(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get students with pagination and optional search' })
  getStudents(@CurrentUser() user: AuthUser, @Query() query: StudentsQueryDto) {
    return this.studentsService.getStudents(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single student belonging to the logged-in parent' })
  getStudentById(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.studentsService.getStudentById(user, id);
  }
}
