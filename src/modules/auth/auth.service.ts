import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailService } from 'src/mail/mail.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async signup(createUserDto: any, creatorId: string): Promise<User> {
    // const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // const token = crypto.randomBytes(32).toString('hex');

    const user = await this.usersService.create({
      ...createUserDto,
      // password: hashedPassword,
      // verificationToken: token,
      // verificationTokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 2),
      createdBy: creatorId,
    });

    // await this.mailService.sendVerificationEmail(
    //   user.email,
    //   token,
    //   createUserDto.password,
    // );

    return user;
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; user: User }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in.',
      );
    }

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };

    console.log({ payload });
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
      issuer: 'issuer.asset-mgt.com',
      audience: 'web-client',
    });

    return { access_token: token, user };
  }

  async verifyEmail(token: string): Promise<User> {
    const user = await this.usersService['userModel'].findOne({
      verificationToken: token,
    });
    if (!user)
      throw new NotFoundException('Invalid or expired verification token.');

    if (
      user.verificationTokenExpires &&
      user.verificationTokenExpires < new Date()
    ) {
      throw new BadRequestException('Verification token has expired.');
    }

    user.isEmailVerified = true;
    user.status = 'active';
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    return await user.save();
  }
}
