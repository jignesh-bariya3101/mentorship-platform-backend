import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { buildPagination, getSkip } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentsQueryDto } from './dto/students-query.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createStudent(user: AuthUser, dto: CreateStudentDto) {
    const email = dto.email?.toLowerCase();

    if (email) {
      const existingStudent = await this.prisma.student.findUnique({
        where: { email },
      });

      if (existingStudent) {
        throw new BadRequestException('Student email already exists');
      }
    }

    const student = await this.prisma.student.create({
      data: {
        fullName: dto.fullName,
        email,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        notes: dto.notes,
        parentId: user.sub,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        dateOfBirth: true,
        notes: true,
        parentId: true,
        createdAt: true,
      },
    });

    return {
      message: 'Student created successfully',
      data: student,
    };
  }

  async getStudents(user: AuthUser, query: StudentsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();
    const skip = getSkip(page, limit);

    const where: Prisma.StudentWhereInput = {
      parentId: user.sub,
      ...(search
        ? {
            OR: [
              {
                fullName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          dateOfBirth: true,
          notes: true,
          parentId: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              bookings: true,
              sessionJoins: true,
            },
          },
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      message: 'Students fetched successfully',
      data: {
        items,
        pagination: buildPagination(page, limit, total),
      },
    };
  }

  async getStudentById(user: AuthUser, studentId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        fullName: true,
        email: true,
        dateOfBirth: true,
        notes: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        bookings: {
          select: {
            id: true,
            lessonId: true,
            createdAt: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.parentId !== user.sub) {
      throw new ForbiddenException('You are not allowed to access this student');
    }

    return {
      message: 'Student fetched successfully',
      data: student,
    };
  }
}
