import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsEnum(['admin', 'assignee'])
  role: string;

  @IsEnum(['active', 'inactive'])
  status: string;
}
