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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ResponseDto } from 'src/common/dto/response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import type { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: Request): Promise<ResponseDto<User[]>> {
    // const users = await this.usersService.findAll();
    const currentUserId = req.user?.sub; // 👈 Extract logged-in user ID from token

    const users = await this.usersService.findAll(currentUserId);
    return new ResponseDto(true, 'Users retrieved successfully', users);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseDto<User>> {
    const user = await this.usersService.findOne(id);
    return new ResponseDto(true, 'User retrieved successfully', user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseDto<User>> {
    const updatedUser = await this.usersService.update(id, updateUserDto);
    return new ResponseDto(true, 'User updated successfully', updatedUser);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ResponseDto<null>> {
    await this.usersService.remove(id);
    return new ResponseDto(true, 'User deleted successfully', null);
  }
}
