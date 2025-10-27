import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Asset, AssetSchema } from './schemas/asset.schema';
import { Assignment, AssignmentSchema } from './schemas/assignment.schema';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Asset.name, schema: AssetSchema },
      { name: Assignment.name, schema: AssignmentSchema },
    ]),
  ],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
