import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService) {}

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createUser(email: string, username: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { 
        email, 
        username, 
        passwordHash 
    },
      select: { 
        id: true,
        email: true,
        username: true, 
        createdAt: true 
    },
    });
  }

  async listUsers(excludeUserId?: string) {
    return this.prisma.user.findMany({
      where: excludeUserId ? { id: { not: excludeUserId } } : undefined,
      select: { 
        id: true, 
        username: true, 
        email: true 
    },
    });
  }
}
