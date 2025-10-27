import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { MailModule } from 'src/mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/common/guards/jwt.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UsersModule,
    MailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'superSecretKey', // ⚡ keep this in .env
      signOptions: {
        expiresIn: '1h',
        issuer: 'issuer.asset-mgt.com',
        audience: 'web-client',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
