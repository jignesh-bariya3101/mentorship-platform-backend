import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingsQueryDto } from './dto/bookings-query.dto';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles(Role.PARENT)
  @ApiOperation({ summary: 'Book a student into a lesson as the logged-in parent' })
  createBooking(@CurrentUser() user: AuthUser, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(user, dto);
  }

  @Get()
  @ApiOperation({
    summary:
      'Get bookings with pagination and filters. Parents see their students bookings; mentors see bookings for their lessons.',
  })
  getBookings(@CurrentUser() user: AuthUser, @Query() query: BookingsQueryDto) {
    return this.bookingsService.getBookings(user, query);
  }
}
