import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { buildPagination, getSkip } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { LessonsQueryDto } from './dto/lessons-query.dto';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async createLesson(user: AuthUser, dto: CreateLessonDto) {
    const lesson = await this.prisma.lesson.create({
      data: {
        title: dto.title,
        description: dto.description,
        mentorId: user.sub,
      },
      include: {
        mentor: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return {
      message: 'Lesson created successfully',
      data: lesson,
    };
  }

  async getLessons(user: AuthUser, query: LessonsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();
    const skip = getSkip(page, limit);

    const where: Prisma.LessonWhereInput = {
      ...(user.role === 'MENTOR'
        ? { mentorId: user.sub }
        : {}),
      ...(search
        ? {
            OR: [
              {
                title: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.lesson.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          mentor: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          _count: {
            select: {
              bookings: true,
              sessions: true,
            },
          },
        },
      }),
      this.prisma.lesson.count({ where }),
    ]);

    return {
      message: 'Lessons fetched successfully',
      data: {
        items,
        pagination: buildPagination(page, limit, total),
      },
    };
  }

  async getLessonById(user: AuthUser, lessonId: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        mentor: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            sessions: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (user.role === 'MENTOR' && lesson.mentorId !== user.sub) {
      throw new ForbiddenException('You are not allowed to access this lesson');
    }

    return {
      message: 'Lesson fetched successfully',
      data: lesson,
    };
  }

  async ensureMentorOwnsLesson(mentorId: number, lessonId: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (lesson.mentorId !== mentorId) {
      throw new ForbiddenException('You can only manage your own lessons');
    }

    return lesson;
  }
}
