import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { Role } from '../common/enums/role.enum';
import { buildPagination, getSkip } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { JoinSessionDto } from './dto/join-session.dto';
import { LessonSessionsQueryDto } from './dto/lesson-sessions-query.dto';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(user: AuthUser, dto: CreateSessionDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: dto.lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (lesson.mentorId !== user.sub) {
      throw new ForbiddenException('You can only create sessions for your own lessons');
    }

    const session = await this.prisma.session.create({
      data: {
        lessonId: dto.lessonId,
        date: new Date(dto.date),
        topic: dto.topic,
        summary: dto.summary,
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            mentorId: true,
          },
        },
      },
    });

    return {
      message: 'Session created successfully',
      data: session,
    };
  }

  async getLessonSessions(
    user: AuthUser,
    lessonId: number,
    query: LessonSessionsQueryDto,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        bookings: {
          select: {
            student: {
              select: {
                parentId: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (user.role === Role.MENTOR && lesson.mentorId !== user.sub) {
      throw new ForbiddenException('You are not allowed to view these sessions');
    }

    if (user.role === Role.PARENT) {
      const allowed = lesson.bookings.some(
        (booking) => booking.student.parentId === user.sub,
      );

      if (!allowed) {
        throw new ForbiddenException('You are not allowed to view these sessions');
      }
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = getSkip(page, limit);

    const [items, total] = await Promise.all([
      this.prisma.session.findMany({
        where: { lessonId },
        skip,
        take: limit,
        orderBy: { date: 'asc' },
        include: {
          _count: {
            select: {
              participants: true,
            },
          },
        },
      }),
      this.prisma.session.count({
        where: { lessonId },
      }),
    ]);

    return {
      message: 'Lesson sessions fetched successfully',
      data: {
        items,
        pagination: buildPagination(page, limit, total),
      },
    };
  }

  async joinSession(user: AuthUser, sessionId: number, dto: JoinSessionDto) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        lesson: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (user.role === Role.PARENT && student.parentId !== user.sub) {
      throw new ForbiddenException('You can only join sessions for your own students');
    }

    if (user.role === Role.MENTOR && session.lesson.mentorId !== user.sub) {
      throw new ForbiddenException('You can only join students to your own lesson sessions');
    }

    const booking = await this.prisma.booking.findUnique({
      where: {
        studentId_lessonId: {
          studentId: student.id,
          lessonId: session.lessonId,
        },
      },
    });

    if (!booking) {
      throw new BadRequestException('Student is not booked for the lesson of this session');
    }

    const existingParticipant = await this.prisma.sessionParticipant.findUnique({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId: dto.studentId,
        },
      },
    });

    if (existingParticipant) {
      throw new BadRequestException('Student has already joined this session');
    }

    const participant = await this.prisma.sessionParticipant.create({
      data: {
        sessionId,
        studentId: dto.studentId,
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        session: {
          select: {
            id: true,
            date: true,
            topic: true,
            lessonId: true,
          },
        },
      },
    });

    return {
      message: 'Student joined session successfully',
      data: participant,
    };
  }
}
