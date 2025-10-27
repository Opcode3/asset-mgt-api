import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { User } from '../users/entities/user.entity';
import { ResponseDto } from 'src/common/dto/response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { LoginDto } from '../users/dto/login.dto';
import { AuthService } from './auth.service';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: AuthService) {}

  // 🔑 Public endpoint: login
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<ResponseDto<{ access_token: string }>> {
    const result = await this.usersService.login(
      loginDto.email,
      loginDto.password,
    );
    return new ResponseDto(true, 'Login successful', result);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
  ): Promise<ResponseDto<User>> {
    const creatorId = (req.user as any).sub;
    const user = await this.usersService.signup(createUserDto, creatorId);
    return new ResponseDto(true, 'User created successfully', user);
  }

  // 👇 Email verification endpoint
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string): Promise<ResponseDto<User>> {
    const user = await this.usersService.verifyEmail(token);
    return new ResponseDto(true, 'Email verified successfully', user);
  }
}
