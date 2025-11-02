import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Asset, AssetSchema } from './schemas/asset.schema';
import { Assignment, AssignmentSchema } from './schemas/assignment.schema';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { MailModule } from 'src/mail/mail.module';
import { PublicAssetsController } from './publicassets.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Asset.name, schema: AssetSchema },
      { name: Assignment.name, schema: AssignmentSchema },
    ]),
    MailModule, // 👈 register MailModule so UsersService can use MailService
  ],
  controllers: [AssetsController, PublicAssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
