import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { Role } from '../common/enums/role.enum';
import { buildPagination, getSkip } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingsQueryDto } from './dto/bookings-query.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(user: AuthUser, dto: CreateBookingDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.parentId !== user.sub) {
      throw new ForbiddenException('You can only book lessons for your own students');
    }

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: dto.lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const existingBooking = await this.prisma.booking.findUnique({
      where: {
        studentId_lessonId: {
          studentId: dto.studentId,
          lessonId: dto.lessonId,
        },
      },
    });

    if (existingBooking) {
      throw new BadRequestException('This student is already booked for the lesson');
    }

    const booking = await this.prisma.booking.create({
      data: {
        studentId: dto.studentId,
        lessonId: dto.lessonId,
      },
      include: {
        student: true,
        lesson: {
          include: {
            mentor: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return {
      message: 'Booking created successfully',
      data: booking,
    };
  }

  async getBookings(user: AuthUser, query: BookingsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = getSkip(page, limit);

    const where: Prisma.BookingWhereInput = {
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.lessonId ? { lessonId: query.lessonId } : {}),
    };

    if (user.role === Role.PARENT) {
      where.student = {
        parentId: user.sub,
      };
    }

    if (user.role === Role.MENTOR) {
      where.lesson = {
        mentorId: user.sub,
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              parentId: true,
            },
          },
          lesson: {
            select: {
              id: true,
              title: true,
              description: true,
              mentorId: true,
              mentor: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      message: 'Bookings fetched successfully',
      data: {
        items,
        pagination: buildPagination(page, limit, total),
      },
    };
  }
}
