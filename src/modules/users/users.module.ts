import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './entities/user.entity';
import { MailModule } from 'src/mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/common/guards/jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MailModule, // 👈 register MailModule so UsersService can use MailService
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'superSecretKey', // ⚡ keep this in .env
      signOptions: {
        expiresIn: '1h',
        issuer: 'issuer.asset-mgt.com',
        audience: 'web-client',
      },
    }),
  ],

  controllers: [UsersController],
  providers: [UsersService, JwtStrategy],
  exports: [UsersService],
})
export class UsersModule {}
