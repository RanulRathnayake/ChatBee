import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../user/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwt: JwtService,
  ) {}

  async validateUser(username: string, pass: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) return null;

    const valid = await bcrypt.compare(pass, user.passwordHash);
    if (!valid) return null;

    const { passwordHash, ...rest } = user;
    return rest;
  }

  async login(user: { id: string; username: string; email: string }) {
    const payload = { sub: user.id, username: user.username };
    return {
      accessToken: await this.jwt.signAsync(payload),
      user,
    };
  }

  async signup(email: string, username: string, password: string) {
    const created = await this.usersService.createUser(
      email,
      username,
      password,
    );
    return this.login(created);
  }
}
