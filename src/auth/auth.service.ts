import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role as PrismaRole, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    if (![Role.PARENT, Role.MENTOR].includes(dto.role)) {
      throw new BadRequestException('Only parent and mentor accounts can sign up');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email.toLowerCase(),
        passwordHash,
        role: dto.role as PrismaRole,
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  async me(user: AuthUser) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!dbUser) {
      throw new UnauthorizedException('User not found');
    }

    return {
      message: 'Profile fetched successfully',
      data: dbUser,
    };
  }

  private buildAuthResponse(user: User) {
    const payload: AuthUser = {
      sub: user.id,
      email: user.email,
      role: user.role as Role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Authentication successful',
      data: {
        accessToken,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
    };
  }
}
