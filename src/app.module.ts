import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AssetsModule } from './modules/assets/assets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 👈 makes .env available everywhere
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI ||
        'mongodb+srv://opcode3:1j0aVry7SIuD2Vh5@cluster-0.6n3mf.mongodb.net/asset-mgt',
      {
        connectionFactory: (connection) => {
          connection.on('connected', () => {
            console.log('✅ Database connected:', connection.name);
          });

          connection.on('error', (err) => {
            console.error('❌ Database connection error:', err);
          });

          connection.on('disconnected', () => {
            console.warn('⚠️ Database disconnected');
          });

          return connection;
        },
      },
    ),
    UsersModule,
    AuthModule,
    AssetsModule,
  ],
})
export class AppModule {}
