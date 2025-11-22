import { Controller, Get, UseGuards, Request, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get(':id')
  async me(@Param('id') id: string) {
    return this.users.findById(id);
  }

  @Get()
  async list(@Request() req) {
    return this.users.listUsers(req.user.userId);
  }
}
